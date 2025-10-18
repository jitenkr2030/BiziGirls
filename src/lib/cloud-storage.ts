import { getUploadConfig } from './config'
import { cacheService } from './caching-service'

export interface StorageFile {
  key: string
  name: string
  size: number
  contentType: string
  lastModified: Date
  url: string
  metadata?: Record<string, any>
}

export interface UploadOptions {
  contentType?: string
  metadata?: Record<string, any>
  publicAccess?: boolean
  cacheControl?: string
  expires?: Date
  tags?: string[]
}

export interface DownloadOptions {
  range?: { start: number; end: number }
  versionId?: string
}

export interface StorageProvider {
  name: string
  upload(file: Buffer | File, key: string, options?: UploadOptions): Promise<StorageFile>
  download(key: string, options?: DownloadOptions): Promise<Buffer>
  delete(key: string): Promise<boolean>
  exists(key: string): Promise<boolean>
  getMetadata(key: string): Promise<StorageFile | null>
  listFiles(prefix?: string, maxKeys?: number): Promise<StorageFile[]>
  generateSignedUrl(key: string, expiresInSeconds?: number): Promise<string>
  copy(sourceKey: string, destinationKey: string): Promise<StorageFile>
}

export interface StorageStats {
  totalFiles: number
  totalSize: number
  usedQuota: number
  availableQuota: number
  lastUpload?: Date
  lastDownload?: Date
}

export class CloudStorageService {
  private providers: Map<string, StorageProvider> = new Map()
  private defaultProvider: string = 'local'
  private config: typeof getUploadConfig.return

  constructor() {
    this.config = getUploadConfig()
    this.initializeProviders()
  }

  /**
   * Initialize storage providers
   */
  private initializeProviders(): void {
    // Initialize S3 provider
    if (this.config.s3?.bucket && this.config.s3?.accessKeyId) {
      this.providers.set('s3', new S3Provider(this.config.s3))
    }

    // Initialize Cloudinary provider
    if (this.config.cloudinary?.cloudName && this.config.cloudinary?.apiKey) {
      this.providers.set('cloudinary', new CloudinaryProvider(this.config.cloudinary))
    }

    // Initialize local provider as fallback
    this.providers.set('local', new LocalStorageProvider())
  }

  /**
   * Upload file to cloud storage
   */
  async upload(
    file: Buffer | File,
    key: string,
    options: UploadOptions = {}
  ): Promise<StorageFile> {
    const provider = this.providers.get(this.defaultProvider)
    
    if (!provider) {
      throw new Error(`Storage provider ${this.defaultProvider} not found`)
    }

    try {
      // Validate file
      if (file instanceof File) {
        this.validateFile(file)
      }

      // Generate unique key if not provided
      const finalKey = key || this.generateUniqueKey(file instanceof File ? file.name : 'upload')

      // Upload file
      const storageFile = await provider.upload(file, finalKey, options)

      // Cache file metadata
      await this.cacheFileMetadata(storageFile)

      return storageFile
    } catch (error) {
      console.error('File upload error:', error)
      throw error
    }
  }

  /**
   * Download file from cloud storage
   */
  async download(key: string, options: DownloadOptions = {}): Promise<Buffer> {
    const provider = this.providers.get(this.defaultProvider)
    
    if (!provider) {
      throw new Error(`Storage provider ${this.defaultProvider} not found`)
    }

    try {
      // Check cache first
      const cached = await this.getCachedFile(key)
      if (cached) {
        return cached
      }

      // Download file
      const buffer = await provider.download(key, options)

      // Cache the file
      await this.cacheFile(key, buffer)

      return buffer
    } catch (error) {
      console.error('File download error:', error)
      throw error
    }
  }

  /**
   * Delete file from cloud storage
   */
  async delete(key: string): Promise<boolean> {
    const provider = this.providers.get(this.defaultProvider)
    
    if (!provider) {
      throw new Error(`Storage provider ${this.defaultProvider} not found`)
    }

    try {
      const result = await provider.delete(key)
      
      // Clear cache
      await this.clearFileCache(key)
      
      return result
    } catch (error) {
      console.error('File deletion error:', error)
      throw error
    }
  }

  /**
   * Check if file exists
   */
  async exists(key: string): Promise<boolean> {
    const provider = this.providers.get(this.defaultProvider)
    
    if (!provider) {
      throw new Error(`Storage provider ${this.defaultProvider} not found`)
    }

    return provider.exists(key)
  }

  /**
   * Get file metadata
   */
  async getMetadata(key: string): Promise<StorageFile | null> {
    const provider = this.providers.get(this.defaultProvider)
    
    if (!provider) {
      throw new Error(`Storage provider ${this.defaultProvider} not found`)
    }

    // Try cache first
    const cached = await this.getCachedMetadata(key)
    if (cached) {
      return cached
    }

    // Get from provider
    const metadata = await provider.getMetadata(key)
    if (metadata) {
      await this.cacheFileMetadata(metadata)
    }

    return metadata
  }

  /**
   * List files
   */
  async listFiles(prefix?: string, maxKeys?: number): Promise<StorageFile[]> {
    const provider = this.providers.get(this.defaultProvider)
    
    if (!provider) {
      throw new Error(`Storage provider ${this.defaultProvider} not found`)
    }

    return provider.listFiles(prefix, maxKeys)
  }

  /**
   * Generate signed URL for temporary access
   */
  async generateSignedUrl(key: string, expiresInSeconds?: number): Promise<string> {
    const provider = this.providers.get(this.defaultProvider)
    
    if (!provider) {
      throw new Error(`Storage provider ${this.defaultProvider} not found`)
    }

    return provider.generateSignedUrl(key, expiresInSeconds)
  }

  /**
   * Copy file
   */
  async copy(sourceKey: string, destinationKey: string): Promise<StorageFile> {
    const provider = this.providers.get(this.defaultProvider)
    
    if (!provider) {
      throw new Error(`Storage provider ${this.defaultProvider} not found`)
    }

    try {
      const result = await provider.copy(sourceKey, destinationKey)
      
      // Cache new file metadata
      await this.cacheFileMetadata(result)
      
      return result
    } catch (error) {
      console.error('File copy error:', error)
      throw error
    }
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<StorageStats> {
    // This would typically query the storage provider's API
    // For now, return mock data
    return {
      totalFiles: 1000,
      totalSize: 1024 * 1024 * 1024 * 50, // 50GB
      usedQuota: 1024 * 1024 * 1024 * 25, // 25GB
      availableQuota: 1024 * 1024 * 1024 * 25, // 25GB
      lastUpload: new Date(),
      lastDownload: new Date()
    }
  }

  /**
   * Validate file
   */
  private validateFile(file: File): void {
    const { allowedTypes, allowedExtensions, maxFileSize } = this.config

    // Check file size
    if (file.size > maxFileSize) {
      throw new Error(`File size exceeds maximum allowed size of ${maxFileSize / 1024 / 1024}MB`)
    }

    // Check file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed`)
    }

    // Check file extension
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (extension && allowedExtensions.length > 0 && !allowedExtensions.includes(extension)) {
      throw new Error(`File extension .${extension} is not allowed`)
    }
  }

  /**
   * Generate unique key for file
   */
  private generateUniqueKey(fileName: string): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 9)
    const extension = fileName.split('.').pop()
    const name = fileName.replace(/\.[^/.]+$/, '')
    
    return `${name}-${timestamp}-${random}.${extension}`
  }

  /**
   * Cache file metadata
   */
  private async cacheFileMetadata(file: StorageFile): Promise<void> {
    const cacheKey = `storage-metadata-${file.key}`
    await cacheService.set(cacheKey, file, { 
      ttl: 3600000, // Cache for 1 hour
      tags: ['storage-metadata']
    })
  }

  /**
   * Get cached metadata
   */
  private async getCachedMetadata(key: string): Promise<StorageFile | null> {
    const cacheKey = `storage-metadata-${key}`
    return cacheService.get<StorageFile>(cacheKey)
  }

  /**
   * Cache file content
   */
  private async cacheFile(key: string, buffer: Buffer): Promise<void> {
    const cacheKey = `storage-file-${key}`
    await cacheService.set(cacheKey, buffer, { 
      ttl: 1800000, // Cache for 30 minutes
      tags: ['storage-files']
    })
  }

  /**
   * Get cached file
   */
  private async getCachedFile(key: string): Promise<Buffer | null> {
    const cacheKey = `storage-file-${key}`
    return cacheService.get<Buffer>(cacheKey)
  }

  /**
   * Clear file cache
   */
  private async clearFileCache(key: string): Promise<void> {
    await cacheService.clearByTags(['storage-metadata', 'storage-files'])
  }

  /**
   * Set default provider
   */
  setDefaultProvider(provider: string): void {
    if (this.providers.has(provider)) {
      this.defaultProvider = provider
    } else {
      throw new Error(`Provider ${provider} not found`)
    }
  }

  /**
   * Get available providers
   */
  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys())
  }
}

/**
 * AWS S3 storage provider
 */
class S3Provider implements StorageProvider {
  name = 'AWS S3'
  private config: typeof getUploadConfig.return.s3

  constructor(config: typeof getUploadConfig.return.s3) {
    this.config = config
  }

  async upload(file: Buffer | File, key: string, options: UploadOptions = {}): Promise<StorageFile> {
    // This is a simplified implementation
    // In production, you would use the AWS SDK
    console.log('Uploading to S3:', key)
    
    const buffer = file instanceof Buffer ? file : Buffer.from(await file.arrayBuffer())
    
    return {
      key,
      name: key.split('/').pop() || key,
      size: buffer.length,
      contentType: options.contentType || 'application/octet-stream',
      lastModified: new Date(),
      url: `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${key}`,
      metadata: options.metadata
    }
  }

  async download(key: string, options: DownloadOptions = {}): Promise<Buffer> {
    console.log('Downloading from S3:', key)
    // Mock implementation
    return Buffer.from('Mock file content')
  }

  async delete(key: string): Promise<boolean> {
    console.log('Deleting from S3:', key)
    return true
  }

  async exists(key: string): Promise<boolean> {
    console.log('Checking existence in S3:', key)
    return true
  }

  async getMetadata(key: string): Promise<StorageFile | null> {
    console.log('Getting metadata from S3:', key)
    return {
      key,
      name: key.split('/').pop() || key,
      size: 1024,
      contentType: 'application/octet-stream',
      lastModified: new Date(),
      url: `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${key}`
    }
  }

  async listFiles(prefix?: string, maxKeys?: number): Promise<StorageFile[]> {
    console.log('Listing files in S3:', { prefix, maxKeys })
    // Mock implementation
    return []
  }

  async generateSignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    return `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${key}?X-Amz-Expires=${expiresInSeconds}`
  }

  async copy(sourceKey: string, destinationKey: string): Promise<StorageFile> {
    console.log('Copying in S3:', { sourceKey, destinationKey })
    return {
      key: destinationKey,
      name: destinationKey.split('/').pop() || destinationKey,
      size: 1024,
      contentType: 'application/octet-stream',
      lastModified: new Date(),
      url: `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${destinationKey}`
    }
  }
}

/**
 * Cloudinary storage provider
 */
class CloudinaryProvider implements StorageProvider {
  name = 'Cloudinary'
  private config: typeof getUploadConfig.return.cloudinary

  constructor(config: typeof getUploadConfig.return.cloudinary) {
    this.config = config
  }

  async upload(file: Buffer | File, key: string, options: UploadOptions = {}): Promise<StorageFile> {
    console.log('Uploading to Cloudinary:', key)
    
    const buffer = file instanceof Buffer ? file : Buffer.from(await file.arrayBuffer())
    
    return {
      key,
      name: key.split('/').pop() || key,
      size: buffer.length,
      contentType: options.contentType || 'image/jpeg',
      lastModified: new Date(),
      url: `https://res.cloudinary.com/${this.config.cloudName}/image/upload/${key}`,
      metadata: options.metadata
    }
  }

  async download(key: string, options: DownloadOptions = {}): Promise<Buffer> {
    console.log('Downloading from Cloudinary:', key)
    return Buffer.from('Mock Cloudinary file content')
  }

  async delete(key: string): Promise<boolean> {
    console.log('Deleting from Cloudinary:', key)
    return true
  }

  async exists(key: string): Promise<boolean> {
    console.log('Checking existence in Cloudinary:', key)
    return true
  }

  async getMetadata(key: string): Promise<StorageFile | null> {
    console.log('Getting metadata from Cloudinary:', key)
    return {
      key,
      name: key.split('/').pop() || key,
      size: 1024,
      contentType: 'image/jpeg',
      lastModified: new Date(),
      url: `https://res.cloudinary.com/${this.config.cloudName}/image/upload/${key}`
    }
  }

  async listFiles(prefix?: string, maxKeys?: number): Promise<StorageFile[]> {
    console.log('Listing files in Cloudinary:', { prefix, maxKeys })
    return []
  }

  async generateSignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    return `https://res.cloudinary.com/${this.config.cloudName}/image/upload/${key}`
  }

  async copy(sourceKey: string, destinationKey: string): Promise<StorageFile> {
    console.log('Copying in Cloudinary:', { sourceKey, destinationKey })
    return {
      key: destinationKey,
      name: destinationKey.split('/').pop() || destinationKey,
      size: 1024,
      contentType: 'image/jpeg',
      lastModified: new Date(),
      url: `https://res.cloudinary.com/${this.config.cloudName}/image/upload/${destinationKey}`
    }
  }
}

/**
 * Local storage provider (for development)
 */
class LocalStorageProvider implements StorageProvider {
  name = 'Local Storage'
  private storage: Map<string, { data: Buffer; metadata: StorageFile }> = new Map()

  async upload(file: Buffer | File, key: string, options: UploadOptions = {}): Promise<StorageFile> {
    const buffer = file instanceof Buffer ? file : Buffer.from(await file.arrayBuffer())
    
    const metadata: StorageFile = {
      key,
      name: key.split('/').pop() || key,
      size: buffer.length,
      contentType: options.contentType || 'application/octet-stream',
      lastModified: new Date(),
      url: `/uploads/${key}`,
      metadata: options.metadata
    }

    this.storage.set(key, { data: buffer, metadata })
    
    return metadata
  }

  async download(key: string, options: DownloadOptions = {}): Promise<Buffer> {
    const entry = this.storage.get(key)
    if (!entry) {
      throw new Error(`File not found: ${key}`)
    }
    
    if (options.range) {
      return entry.data.slice(options.range.start, options.range.end)
    }
    
    return entry.data
  }

  async delete(key: string): Promise<boolean> {
    return this.storage.delete(key)
  }

  async exists(key: string): Promise<boolean> {
    return this.storage.has(key)
  }

  async getMetadata(key: string): Promise<StorageFile | null> {
    const entry = this.storage.get(key)
    return entry ? entry.metadata : null
  }

  async listFiles(prefix?: string, maxKeys?: number): Promise<StorageFile[]> {
    const files: StorageFile[] = []
    
    for (const [key, entry] of this.storage.entries()) {
      if (!prefix || key.startsWith(prefix)) {
        files.push(entry.metadata)
        if (maxKeys && files.length >= maxKeys) {
          break
        }
      }
    }
    
    return files
  }

  async generateSignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    return `/uploads/${key}?expires=${Date.now() + expiresInSeconds * 1000}`
  }

  async copy(sourceKey: string, destinationKey: string): Promise<StorageFile> {
    const sourceEntry = this.storage.get(sourceKey)
    if (!sourceEntry) {
      throw new Error(`Source file not found: ${sourceKey}`)
    }
    
    const metadata: StorageFile = {
      ...sourceEntry.metadata,
      key: destinationKey,
      name: destinationKey.split('/').pop() || destinationKey,
      url: `/uploads/${destinationKey}`
    }
    
    this.storage.set(destinationKey, { data: sourceEntry.data, metadata })
    
    return metadata
  }
}

// Default cloud storage service instance
export const cloudStorageService = new CloudStorageService()

/**
 * Storage utility functions
 */
export class StorageUtils {
  /**
   * Generate file key with organized structure
   */
  static generateFileKey(
    category: string,
    fileName: string,
    options: {
      includeDate?: boolean
      includeRandom?: boolean
      userId?: string
    } = {}
  ): string {
    const { includeDate = true, includeRandom = true, userId } = options
    
    const parts = [category]
    
    if (userId) {
      parts.push(userId)
    }
    
    if (includeDate) {
      const date = new Date().toISOString().split('T')[0] // YYYY-MM-DD
      parts.push(date)
    }
    
    let baseName = fileName.replace(/\.[^/.]+$/, '') // Remove extension
    const extension = fileName.split('.').pop()
    
    if (includeRandom) {
      const random = Math.random().toString(36).substr(2, 9)
      baseName = `${baseName}-${random}`
    }
    
    parts.push(`${baseName}.${extension}`)
    
    return parts.join('/')
  }

  /**
   * Get file extension
   */
  static getFileExtension(fileName: string): string {
    return fileName.split('.').pop()?.toLowerCase() || ''
  }

  /**
   * Get MIME type from file extension
   */
  static getMimeType(fileName: string): string {
    const extension = this.getFileExtension(fileName)
    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'txt': 'text/plain',
      'csv': 'text/csv',
      'json': 'application/json',
      'xml': 'application/xml',
      'zip': 'application/zip',
      'mp4': 'video/mp4',
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav'
    }
    
    return mimeTypes[extension] || 'application/octet-stream'
  }

  /**
   * Format file size
   */
  static formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 Bytes'
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  /**
   * Validate file type
   */
  static isValidFileType(fileName: string, allowedTypes: string[]): boolean {
    const extension = this.getFileExtension(fileName)
    return allowedTypes.includes(extension)
  }

  /**
   * Create optimized image transformation URL
   */
  static createImageTransformUrl(
    baseUrl: string,
    options: {
      width?: number
      height?: number
      quality?: number
      format?: 'webp' | 'jpg' | 'png'
      crop?: 'fill' | 'fit' | 'crop'
    } = {}
  ): string {
    const params = new URLSearchParams()
    
    if (options.width) params.set('w', options.width.toString())
    if (options.height) params.set('h', options.height.toString())
    if (options.quality) params.set('q', options.quality.toString())
    if (options.format) params.set('f', options.format)
    if (options.crop) params.set('c', options.crop)
    
    const queryString = params.toString()
    return queryString ? `${baseUrl}?${queryString}` : baseUrl
  }
}