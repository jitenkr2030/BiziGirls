import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { AIAssistantService } from '@/lib/services/ai-assistant'

// POST /api/ai/business-plan - Generate business plan
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { requirements, businessIdea, targetMarket, financialGoals } = await request.json()

    if (!requirements || !businessIdea) {
      return NextResponse.json(
        { success: false, error: 'Business idea and requirements are required' },
        { status: 400 }
      )
    }

    // Get AI assistant service instance
    const aiService = await AIAssistantService.getInstance()

    // Get user's business context
    const businessProfile = await db.businessProfile.findUnique({
      where: { userId: user.id }
    })

    // Build context for business plan generation
    const context = {
      userId: user.id,
      businessProfile,
      userGoals: [businessIdea, ...(financialGoals || [])],
      industry: user.industry,
      businessStage: user.businessStage || 'idea'
    }

    // Prepare requirements for business plan
    const planRequirements = {
      businessIdea,
      targetMarket,
      financialGoals,
      ...requirements
    }

    // Generate business plan
    const businessPlan = await aiService.generateBusinessPlan(context, planRequirements)

    // Save business plan
    const savedPlan = await db.aIConversation.create({
      data: {
        userId: user.id,
        title: `Business Plan - ${businessIdea.slice(0, 30)}${businessIdea.length > 30 ? '...' : ''}`,
        context: JSON.stringify({
          type: 'business-plan',
          requirements: planRequirements,
          context
        }),
        messages: [
          {
            role: 'system',
            content: 'Business Plan Generation Request',
            timestamp: new Date()
          },
          {
            role: 'assistant',
            content: businessPlan,
            timestamp: new Date()
          }
        ]
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        businessPlan,
        planId: savedPlan.id,
        businessIdea,
        timestamp: new Date()
      }
    })
  } catch (error) {
    console.error('Error generating business plan:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate business plan' },
      { status: 500 }
    )
  }
}

// GET /api/ai/business-plan/templates - Get business plan templates
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const templates = [
      {
        id: 'startup',
        name: 'Startup Business Plan',
        description: 'Comprehensive plan for new startups seeking funding',
        sections: [
          'Executive Summary',
          'Company Description',
          'Market Analysis',
          'Organization & Management',
          'Service or Product Line',
          'Marketing & Sales',
          'Funding Request',
          'Financial Projections',
          'Appendix'
        ]
      },
      {
        id: 'small-business',
        name: 'Small Business Plan',
        description: 'Simplified plan for small businesses and local services',
        sections: [
          'Business Overview',
          'Market Analysis',
          'Products & Services',
          'Marketing Strategy',
          'Operations Plan',
          'Financial Plan'
        ]
      },
      {
        id: 'nonprofit',
        name: 'Nonprofit Business Plan',
        description: 'Plan focused on mission, impact, and sustainability',
        sections: [
          'Executive Summary',
          'Organizational Structure',
          'Mission & Vision',
          'Programs & Services',
          'Market Analysis',
          'Marketing & Outreach',
          'Financial Plan',
          'Impact Measurement'
        ]
      },
      {
        id: 'expansion',
        name: 'Business Expansion Plan',
        description: 'Plan for growing existing businesses',
        sections: [
          'Current Business Overview',
          'Expansion Goals',
          'Market Opportunity',
          'Growth Strategy',
          'Resource Requirements',
          'Financial Projections',
          'Implementation Timeline',
          'Risk Assessment'
        ]
      }
    ]

    return NextResponse.json({
      success: true,
      data: templates
    })
  } catch (error) {
    console.error('Error fetching business plan templates:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}