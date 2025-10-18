import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { AIAssistantService } from '@/lib/services/ai-assistant'

// POST /api/ai/document - Analyze uploaded document
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const analysisType = formData.get('analysisType') as string
    const additionalContext = formData.get('additionalContext') as string

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File is required' },
        { status: 400 }
      )
    }

    if (!analysisType) {
      return NextResponse.json(
        { success: false, error: 'Analysis type is required' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Unsupported file type. Please upload a text file, PDF, or Word document.' },
        { status: 400 }
      )
    }

    // Get AI assistant service instance
    const aiService = await AIAssistantService.getInstance()

    // Read file content
    let documentContent: string
    try {
      if (file.type === 'text/plain') {
        documentContent = await file.text()
      } else {
        // For PDF and Word files, we'll extract text (simplified for demo)
        // In a real implementation, you would use libraries like pdf-parse or mammoth
        documentContent = `Document content from ${file.name}\n\nThis is a placeholder for the extracted text content. In a production environment, this would contain the actual text extracted from the ${file.type} file.`
      }
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to read file content' },
        { status: 400 }
      )
    }

    // Analyze document
    const analysisResult = await aiService.analyzeDocument(documentContent, analysisType)

    return NextResponse.json({
      success: true,
      data: {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        analysisType,
        analysis: analysisResult,
        timestamp: new Date()
      }
    })
  } catch (error) {
    console.error('Error analyzing document:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to analyze document' },
      { status: 500 }
    )
  }
}

// GET /api/ai/document/types - Get supported document types and analysis options
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supportedTypes = [
      {
        type: 'business-plan',
        name: 'Business Plan Analysis',
        description: 'Analyze business plans for strengths, weaknesses, and recommendations',
        supportedFormats: ['.txt', '.pdf', '.doc', '.docx']
      },
      {
        type: 'financial-statement',
        name: 'Financial Statement Analysis',
        description: 'Analyze financial statements and provide insights',
        supportedFormats: ['.txt', '.pdf', '.doc', '.docx']
      },
      {
        type: 'market-research',
        name: 'Market Research Analysis',
        description: 'Analyze market research reports and extract key insights',
        supportedFormats: ['.txt', '.pdf', '.doc', '.docx']
      },
      {
        type: 'legal-document',
        name: 'Legal Document Review',
        description: 'Review legal documents and identify key clauses and risks',
        supportedFormats: ['.txt', '.pdf', '.doc', '.docx']
      },
      {
        type: 'contract',
        name: 'Contract Analysis',
        description: 'Analyze contracts and identify important terms and conditions',
        supportedFormats: ['.txt', '.pdf', '.doc', '.docx']
      },
      {
        type: 'general',
        name: 'General Document Analysis',
        description: 'General analysis of any business document',
        supportedFormats: ['.txt', '.pdf', '.doc', '.docx']
      }
    ]

    return NextResponse.json({
      success: true,
      data: {
        supportedTypes,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        supportedFormats: ['.txt', '.pdf', '.doc', '.docx']
      }
    })
  } catch (error) {
    console.error('Error fetching document analysis types:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analysis types' },
      { status: 500 }
    )
  }
}