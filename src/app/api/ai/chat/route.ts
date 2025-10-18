import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { AIAssistantService } from '@/lib/services/ai-assistant'

// POST /api/ai/chat - Send message to AI assistant
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { message, conversationId, context } = await request.json()

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      )
    }

    // Get AI assistant service instance
    const aiService = await AIAssistantService.getInstance()

    // Build user context
    let userContext: any = {
      userId: user.id,
      userGoals: [],
      industry: user.industry,
      businessStage: user.businessStage
    }

    // Get business profile if available
    const businessProfile = await db.businessProfile.findUnique({
      where: { userId: user.id }
    })

    if (businessProfile) {
      userContext.businessProfile = businessProfile
    }

    // Get previous conversation history if conversationId provided
    let previousConversations = []
    if (conversationId) {
      const conversation = await db.aIConversation.findUnique({
        where: { id: conversationId },
        select: { messages: true }
      })

      if (conversation) {
        previousConversations = conversation.messages || []
      }
    }

    userContext.previousConversations = previousConversations

    // Add any additional context from the request
    if (context) {
      userContext = { ...userContext, ...context }
    }

    // Generate AI response
    const aiResponse = await aiService.generateBusinessInsights(userContext, message)

    // Save conversation to database
    let conversation
    if (conversationId) {
      // Update existing conversation
      conversation = await db.aIConversation.update({
        where: { id: conversationId },
        data: {
          messages: {
            push: [
              { role: 'user', content: message, timestamp: new Date() },
              { role: 'assistant', content: aiResponse, timestamp: new Date() }
            ]
          },
          updatedAt: new Date()
        }
      })
    } else {
      // Create new conversation
      conversation = await db.aIConversation.create({
        data: {
          userId: user.id,
          title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
          messages: [
            { role: 'user', content: message, timestamp: new Date() },
            { role: 'assistant', content: aiResponse, timestamp: new Date() }
          ],
          context: JSON.stringify(userContext)
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        message: aiResponse,
        conversationId: conversation.id,
        timestamp: new Date()
      }
    })
  } catch (error) {
    console.error('Error processing AI chat request:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process AI request' },
      { status: 500 }
    )
  }
}

// GET /api/ai/chat - Get user's conversation history
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const skip = (page - 1) * limit

    const [conversations, total] = await Promise.all([
      db.aIConversation.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          title: true,
          messages: true,
          context: true,
          createdAt: true,
          updatedAt: true
        },
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' }
      }),
      db.aIConversation.count({ where: { userId: user.id } })
    ])

    return NextResponse.json({
      success: true,
      data: conversations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching AI conversations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}