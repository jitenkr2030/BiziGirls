import { NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { ApiUtils } from '@/lib/api-utils'
import { securityMiddleware, rateLimiters } from '@/lib/security-middleware'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// File upload configuration
const UPLOAD_CONFIG = {
  // Maximum file size (10MB)
  maxSize: 10 * 1024 * 1024,
  
  // Allowed file types
  allowedTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ],
  
  // Allowed file extensions
  allowedExtensions: [
    'jpg', 'jpeg', 'png', 'gif', 'webp',
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'
  ],
  
  // Upload directory
  uploadDir: join(process.cwd(), 'public', 'uploads'),
  
  // Maximum files per request
  maxFiles: 5
}

// Ensure upload directory exists
async function ensureUploadDirectory(): Promise<void> {
  if (!existsSync(UPLOAD_CONFIG.uploadDir)) {
    await mkdir(UPLOAD_CONFIG.uploadDir, { recursive: true })
  }
}

// Generate unique filename
function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  const extension = originalName.split('.').pop()
  return `${timestamp}-${random}.${extension}`
}

// Validate file
function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > UPLOAD_CONFIG.maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${UPLOAD_CONFIG.maxSize / 1024 / 1024}MB`
    }
  }

  // Check file type
  if (!UPLOAD_CONFIG.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`
    }
  }

  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (!extension || !UPLOAD_CONFIG.allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `File extension .${extension} is not allowed`
    }
  }

  return { valid: true }
}

// POST /api/upload - Upload files
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimiters.upload.check(request)
    if (!rateLimitResult.success && rateLimitResult.response) {
      return rateLimitResult.response
    }

    // Apply security middleware
    const securityResult = await securityMiddleware.applySecurityMiddleware(request)
    if (securityResult.response) {
      return securityResult.response
    }

    // Check authentication
    const user = await getAuthUser(request)
    if (!user) {
      return ApiUtils.unauthorized()
    }

    // Parse form data
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const type = formData.get('type') as string || 'general'

    // Validate number of files
    if (files.length === 0) {
      return ApiUtils.badRequest('No files provided')
    }

    if (files.length > UPLOAD_CONFIG.maxFiles) {
      return ApiUtils.badRequest(`Maximum ${UPLOAD_CONFIG.maxFiles} files allowed per request`)
    }

    // Ensure upload directory exists
    await ensureUploadDirectory()

    const uploadedFiles = []
    const errors = []

    // Process each file
    for (const file of files) {
      try {
        // Validate file
        const validation = validateFile(file)
        if (!validation.valid) {
          errors.push({
            filename: file.name,
            error: validation.error
          })
          continue
        }

        // Generate unique filename
        const filename = generateUniqueFilename(file.name)
        
        // Create type-specific directory
        const typeDir = join(UPLOAD_CONFIG.uploadDir, type)
        if (!existsSync(typeDir)) {
          await mkdir(typeDir, { recursive: true })
        }

        // Full file path
        const filepath = join(typeDir, filename)

        // Convert file to buffer and save
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filepath, buffer)

        // File URL for accessing the file
        const fileUrl = `/uploads/${type}/${filename}`

        uploadedFiles.push({
          originalName: file.name,
          filename,
          url: fileUrl,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString()
        })

      } catch (error) {
        console.error('Error uploading file:', error)
        errors.push({
          filename: file.name,
          error: 'Failed to upload file'
        })
      }
    }

    // Log security event
    securityMiddleware.logSecurityEvent({
      type: 'file_upload',
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || undefined,
      userId: user.id,
      details: {
        filesUploaded: uploadedFiles.length,
        errors: errors.length,
        type
      }
    })

    // Increment rate limiter
    await rateLimiters.upload.increment(request, uploadedFiles.length > 0)

    return ApiUtils.success({
      uploadedFiles,
      errors,
      totalFiles: files.length,
      successfulUploads: uploadedFiles.length
    }, uploadedFiles.length > 0 ? 'Files uploaded successfully' : 'No files were uploaded')

  } catch (error) {
    console.error('Error in file upload:', error)
    return ApiUtils.error('Failed to upload files')
  }
}

// GET /api/upload - Get upload configuration and user's uploaded files
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthUser(request)
    if (!user) {
      return ApiUtils.unauthorized()
    }

    // Return upload configuration
    return ApiUtils.success({
      config: {
        maxSize: UPLOAD_CONFIG.maxSize,
        allowedTypes: UPLOAD_CONFIG.allowedTypes,
        allowedExtensions: UPLOAD_CONFIG.allowedExtensions,
        maxFiles: UPLOAD_CONFIG.maxFiles
      },
      message: 'Upload configuration retrieved successfully'
    })

  } catch (error) {
    console.error('Error fetching upload config:', error)
    return ApiUtils.error('Failed to fetch upload configuration')
  }
}