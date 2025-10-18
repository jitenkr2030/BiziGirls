import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const type = searchParams.get('type') || ''
    const industry = searchParams.get('industry') || ''
    const region = searchParams.get('region') || ''
    const featured = searchParams.get('featured') === 'true'
    
    const skip = (page - 1) * limit
    
    // Build where clause
    const where: any = {
      isActive: true
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { organization: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (category) {
      where.category = { equals: category, mode: 'insensitive' }
    }
    
    if (type) {
      where.type = { equals: type, mode: 'insensitive' }
    }
    
    if (industry) {
      where.industry = { equals: industry, mode: 'insensitive' }
    }
    
    if (region) {
      where.region = { equals: region, mode: 'insensitive' }
    }
    
    if (featured) {
      where.isFeatured = true
    }
    
    // Get opportunities with pagination
    const [opportunities, total] = await Promise.all([
      db.fundingOpportunity.findMany({
        where,
        orderBy: [
          { isFeatured: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              applications: true
            }
          }
        }
      }),
      db.fundingOpportunity.count({ where })
    ])
    
    // Get user's applications if authenticated
    let userApplications: any[] = []
    if (session?.user?.id) {
      userApplications = await db.grantApplication.findMany({
        where: {
          userId: session.user.id
        },
        select: {
          opportunityId: true,
          status: true,
          progress: true
        }
      })
    }
    
    // Format response
    const formattedOpportunities = opportunities.map(opp => {
      const userApplication = userApplications.find(app => app.opportunityId === opp.id)
      return {
        ...opp,
        eligibility: opp.eligibility ? JSON.parse(opp.eligibility) : [],
        requirements: opp.requirements ? JSON.parse(opp.requirements) : [],
        applicationCount: opp._count.applications,
        userApplication: userApplication || null
      }
    })
    
    return NextResponse.json({
      opportunities: formattedOpportunities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching funding opportunities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch funding opportunities' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const {
      title,
      organization,
      description,
      amount,
      type,
      category,
      industry,
      region,
      deadline,
      difficulty,
      eligibility,
      requirements,
      applicationUrl,
      contactInfo,
      isFeatured
    } = body
    
    // Validate required fields
    if (!title || !organization || !description || !amount || !type || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const opportunity = await db.fundingOpportunity.create({
      data: {
        title,
        organization,
        description,
        amount: parseFloat(amount),
        type,
        category,
        industry,
        region,
        deadline: deadline ? new Date(deadline) : null,
        difficulty: difficulty || 'medium',
        eligibility: eligibility ? JSON.stringify(eligibility) : null,
        requirements: requirements ? JSON.stringify(requirements) : null,
        applicationUrl,
        contactInfo,
        isFeatured: isFeatured || false
      }
    })
    
    return NextResponse.json({
      opportunity: {
        ...opportunity,
        eligibility: opportunity.eligibility ? JSON.parse(opportunity.eligibility) : [],
        requirements: opportunity.requirements ? JSON.parse(opportunity.requirements) : []
      }
    })
  } catch (error) {
    console.error('Error creating funding opportunity:', error)
    return NextResponse.json(
      { error: 'Failed to create funding opportunity' },
      { status: 500 }
    )
  }
}