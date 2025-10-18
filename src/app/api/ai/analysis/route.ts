import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { AIAssistantService } from '@/lib/services/ai-assistant'

// POST /api/ai/analysis - Perform business analysis
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { type, businessData, additionalContext } = await request.json()

    if (!type || !businessData) {
      return NextResponse.json(
        { success: false, error: 'Analysis type and business data are required' },
        { status: 400 }
      )
    }

    const validTypes = ['swot', 'market', 'competitor', 'financial', 'strategy']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: `Invalid analysis type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Get AI assistant service instance
    const aiService = await AIAssistantService.getInstance()

    // Get user's business context
    const businessProfile = await db.businessProfile.findUnique({
      where: { userId: user.id }
    })

    // Enhance business data with user profile
    const enhancedBusinessData = {
      ...businessData,
      userProfile: {
        industry: user.industry,
        businessStage: user.businessStage,
        businessProfile: businessProfile
      }
    }

    // Perform analysis
    const analysisResult = await aiService.performBusinessAnalysis({
      type,
      businessData: enhancedBusinessData,
      additionalContext
    })

    // Save analysis result
    const savedAnalysis = await db.aIConversation.create({
      data: {
        userId: user.id,
        title: `${type.toUpperCase()} Analysis - ${new Date().toLocaleDateString()}`,
        context: JSON.stringify({
          type,
          businessData: enhancedBusinessData,
          additionalContext
        }),
        messages: [
          {
            role: 'system',
            content: `Business Analysis Request: ${type.toUpperCase()} analysis performed`,
            timestamp: new Date()
          },
          {
            role: 'assistant',
            content: JSON.stringify(analysisResult),
            timestamp: new Date()
          }
        ]
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        analysis: analysisResult,
        analysisId: savedAnalysis.id,
        type,
        timestamp: new Date()
      }
    })
  } catch (error) {
    console.error('Error performing business analysis:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to perform business analysis' },
      { status: 500 }
    )
  }
}

// GET /api/ai/analysis/types - Get available analysis types
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const analysisTypes = [
      {
        type: 'swot',
        name: 'SWOT Analysis',
        description: 'Analyze Strengths, Weaknesses, Opportunities, and Threats',
        icon: '📊'
      },
      {
        type: 'market',
        name: 'Market Analysis',
        description: 'Analyze target market, size, and opportunities',
        icon: '🎯'
      },
      {
        type: 'competitor',
        name: 'Competitor Analysis',
        description: 'Analyze competitors and market positioning',
        icon: '🏆'
      },
      {
        type: 'financial',
        name: 'Financial Analysis',
        description: 'Analyze financial projections and requirements',
        icon: '💰'
      },
      {
        type: 'strategy',
        name: 'Business Strategy',
        description: 'Develop comprehensive business strategy',
        icon: '🚀'
      }
    ]

    return NextResponse.json({
      success: true,
      data: analysisTypes
    })
  } catch (error) {
    console.error('Error fetching analysis types:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analysis types' },
      { status: 500 }
    )
  }
}