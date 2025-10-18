import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const createCustomerAnalyticsSchema = z.object({
  customerId: z.string().optional(),
  customerEmail: z.string().email().optional(),
  totalSpent: z.number().min(0),
  orderCount: z.number().min(0),
  averageOrderValue: z.number().min(0),
  firstOrderDate: z.string().datetime().optional(),
  lastOrderDate: z.string().datetime().optional(),
  customerSegment: z.enum(['new', 'returning', 'vip', 'at-risk', 'churned']).optional(),
  acquisitionSource: z.string().optional(),
  lifetimeValue: z.number().min(0),
  churnRisk: z.number().min(0).max(1).optional(),
  preferences: z.string().optional(),
  behavior: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const segment = searchParams.get('segment')
    const source = searchParams.get('source')
    const sortBy = searchParams.get('sortBy') || 'totalSpent'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {
      userId: session.user.id,
    }

    if (segment) {
      where.customerSegment = segment
    }
    if (source) {
      where.acquisitionSource = source
    }

    const [customers, total] = await Promise.all([
      db.customerAnalytics.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.customerAnalytics.count({ where }),
    ])

    // Calculate aggregate statistics
    const stats = await db.customerAnalytics.aggregate({
      where,
      _sum: {
        totalSpent: true,
        orderCount: true,
        lifetimeValue: true,
      },
      _avg: {
        averageOrderValue: true,
        churnRisk: true,
      },
      _count: {
        _all: true,
      },
    })

    return NextResponse.json({
      customers,
      stats: {
        totalCustomers: stats._count._all,
        totalRevenue: stats._sum.totalSpent || 0,
        totalOrders: stats._sum.orderCount || 0,
        averageOrderValue: stats._avg.averageOrderValue || 0,
        averageLifetimeValue: stats._avg.lifetimeValue || 0,
        averageChurnRisk: stats._avg.churnRisk || 0,
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching customer analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer analytics' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createCustomerAnalyticsSchema.parse(body)

    // Calculate customer segment if not provided
    let customerSegment = validatedData.customerSegment
    if (!customerSegment) {
      if (validatedData.orderCount === 0) {
        customerSegment = 'new'
      } else if (validatedData.totalSpent > 1000) {
        customerSegment = 'vip'
      } else if (validatedData.lastOrderDate) {
        const lastOrder = new Date(validatedData.lastOrderDate)
        const daysSinceLastOrder = Math.floor((Date.now() - lastOrder.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysSinceLastOrder > 90) {
          customerSegment = 'churned'
        } else if (daysSinceLastOrder > 30) {
          customerSegment = 'at-risk'
        } else {
          customerSegment = 'returning'
        }
      } else {
        customerSegment = 'new'
      }
    }

    // Calculate churn risk if not provided
    let churnRisk = validatedData.churnRisk
    if (!churnRisk && validatedData.lastOrderDate) {
      const lastOrder = new Date(validatedData.lastOrderDate)
      const daysSinceLastOrder = Math.floor((Date.now() - lastOrder.getTime()) / (1000 * 60 * 60 * 24))
      
      // Simple churn risk calculation based on days since last order
      if (daysSinceLastOrder > 90) {
        churnRisk = 0.8
      } else if (daysSinceLastOrder > 60) {
        churnRisk = 0.6
      } else if (daysSinceLastOrder > 30) {
        churnRisk = 0.4
      } else if (daysSinceLastOrder > 14) {
        churnRisk = 0.2
      } else {
        churnRisk = 0.1
      }
    }

    const customerAnalytics = await db.customerAnalytics.create({
      data: {
        ...validatedData,
        userId: session.user.id,
        customerSegment,
        churnRisk,
        firstOrderDate: validatedData.firstOrderDate ? new Date(validatedData.firstOrderDate) : null,
        lastOrderDate: validatedData.lastOrderDate ? new Date(validatedData.lastOrderDate) : null,
      },
    })

    return NextResponse.json({ customerAnalytics }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating customer analytics:', error)
    return NextResponse.json(
      { error: 'Failed to create customer analytics' },
      { status: 500 }
    )
  }
}