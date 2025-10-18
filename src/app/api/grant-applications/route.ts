import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    const skip = (page - 1) * limit
    
    const where: any = {
      userId: session.user.id
    }
    
    if (status) {
      where.status = status
    }
    
    const [applications, total] = await Promise.all([
      db.grantApplication.findMany({
        where,
        include: {
          opportunity: {
            select: {
              id: true,
              title: true,
              organization: true,
              amount: true,
              type: true,
              category: true,
              deadline: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.grantApplication.count({ where })
    ])
    
    return NextResponse.json({
      applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching grant applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch grant applications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { opportunityId, businessPlan, pitchDeck, financialStatements, supportingDocuments } = body
    
    if (!opportunityId) {
      return NextResponse.json(
        { error: 'Opportunity ID is required' },
        { status: 400 }
      )
    }
    
    // Check if opportunity exists
    const opportunity = await db.fundingOpportunity.findUnique({
      where: { id: opportunityId }
    })
    
    if (!opportunity) {
      return NextResponse.json(
        { error: 'Funding opportunity not found' },
        { status: 404 }
      )
    }
    
    // Check if user already has an application for this opportunity
    const existingApplication = await db.grantApplication.findUnique({
      where: {
        userId_opportunityId: {
          userId: session.user.id,
          opportunityId
        }
      }
    })
    
    if (existingApplication) {
      return NextResponse.json(
        { error: 'You already have an application for this opportunity' },
        { status: 400 }
      )
    }
    
    const application = await db.grantApplication.create({
      data: {
        userId: session.user.id,
        opportunityId,
        businessPlan,
        pitchDeck,
        financialStatements,
        supportingDocuments: supportingDocuments ? JSON.stringify(supportingDocuments) : null
      }
    })
    
    return NextResponse.json({
      application: {
        ...application,
        supportingDocuments: application.supportingDocuments ? JSON.parse(application.supportingDocuments) : []
      }
    })
  } catch (error) {
    console.error('Error creating grant application:', error)
    return NextResponse.json(
      { error: 'Failed to create grant application' },
      { status: 500 }
    )
  }
}