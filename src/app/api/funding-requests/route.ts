import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

// GET /api/funding-requests - Get all funding requests
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
    const status = searchParams.get('status') || ''
    const industry = searchParams.get('industry') || ''
    const fundingType = searchParams.get('fundingType') || ''
    const minAmount = parseFloat(searchParams.get('minAmount') || '0')
    const maxAmount = parseFloat(searchParams.get('maxAmount') || '0')
    const userId = searchParams.get('userId') || ''

    const skip = (page - 1) * limit

    const where: any = {}
    if (status) {
      where.status = status
    }
    if (industry) {
      where.industry = industry
    }
    if (fundingType) {
      where.fundingType = fundingType
    }
    if (minAmount > 0) {
      where.amount = { gte: minAmount }
    }
    if (maxAmount > 0) {
      where.amount = { ...where.amount, lte: maxAmount }
    }
    if (userId) {
      where.userId = userId
    } else if (user.role !== 'admin') {
      // Non-admin users can only see their own requests
      where.userId = user.id
    }

    const [fundingRequests, total] = await Promise.all([
      db.fundingRequest.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              email: true
            }
          },
          investments: {
            include: {
              investor: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true
                }
              }
            }
          },
          _count: {
            select: {
              investments: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      db.fundingRequest.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: fundingRequests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching funding requests:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch funding requests' },
      { status: 500 }
    )
  }
}

// POST /api/funding-requests - Create funding request
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()

    const fundingRequest = await db.fundingRequest.create({
      data: {
        userId: user.id,
        businessName: data.businessName,
        description: data.description,
        industry: data.industry,
        fundingType: data.fundingType,
        amount: data.amount,
        valuation: data.valuation,
        equityOffered: data.equityOffered,
        useOfFunds: data.useOfFunds,
        businessPlan: data.businessPlan,
        pitchDeck: data.pitchDeck,
        status: data.status || 'draft',
        deadline: data.deadline ? new Date(data.deadline) : null
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            email: true
          }
        },
        investments: {
          include: {
            investor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: fundingRequest
    })
  } catch (error) {
    console.error('Error creating funding request:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create funding request' },
      { status: 500 }
    )
  }
}