import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const createGrowthTrackingSchema = z.object({
  kpiName: z.string().min(1),
  kpiCategory: z.enum(['financial', 'customer', 'operational', 'marketing']),
  currentValue: z.number(),
  targetValue: z.number(),
  period: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']),
  growthRate: z.number().optional(),
  variance: z.number().optional(),
  baselineValue: z.number().optional(),
  achievement: z.enum(['on_track', 'ahead', 'behind', 'achieved']).optional(),
  milestones: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const period = searchParams.get('period')
    const achievement = searchParams.get('achievement')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {
      userId: session.user.id,
    }

    if (category) {
      where.kpiCategory = category
    }
    if (period) {
      where.period = period
    }
    if (achievement) {
      where.achievement = achievement
    }

    const [growthTracking, total] = await Promise.all([
      db.growthTracking.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.growthTracking.count({ where }),
    ])

    // Calculate aggregate statistics
    const stats = await db.growthTracking.aggregate({
      where,
      _sum: {
        currentValue: true,
        targetValue: true,
      },
      _avg: {
        growthRate: true,
        variance: true,
      },
      _count: {
        _all: true,
      },
      _groupBy: {
        kpiCategory: true,
        achievement: true,
      },
    })

    // Group by achievement status
    const achievementCounts = await db.growthTracking.groupBy({
      by: ['achievement'],
      where,
      _count: {
        achievement: true,
      },
    })

    return NextResponse.json({
      growthTracking,
      stats: {
        totalKPIs: stats._count._all,
        totalCurrentValue: stats._sum.currentValue || 0,
        totalTargetValue: stats._sum.targetValue || 0,
        averageGrowthRate: stats._avg.growthRate || 0,
        averageVariance: stats._avg.variance || 0,
        achievementCounts: achievementCounts.reduce((acc, item) => {
          acc[item.achievement || 'unknown'] = item._count.achievement
          return acc
        }, {} as Record<string, number>),
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching growth tracking:', error)
    return NextResponse.json(
      { error: 'Failed to fetch growth tracking' },
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
    const validatedData = createGrowthTrackingSchema.parse(body)

    // Calculate variance
    const variance = validatedData.currentValue - validatedData.targetValue

    // Calculate growth rate if baseline value is provided
    let growthRate = validatedData.growthRate
    if (!growthRate && validatedData.baselineValue && validatedData.baselineValue > 0) {
      growthRate = ((validatedData.currentValue - validatedData.baselineValue) / validatedData.baselineValue) * 100
    }

    // Determine achievement status
    let achievement = validatedData.achievement
    if (!achievement) {
      const percentage = (validatedData.currentValue / validatedData.targetValue) * 100
      
      if (percentage >= 100) {
        achievement = 'achieved'
      } else if (percentage >= 90) {
        achievement = 'ahead'
      } else if (percentage >= 70) {
        achievement = 'on_track'
      } else {
        achievement = 'behind'
      }
    }

    const growthTracking = await db.growthTracking.create({
      data: {
        ...validatedData,
        userId: session.user.id,
        variance,
        growthRate,
        achievement,
      },
    })

    return NextResponse.json({ growthTracking }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating growth tracking:', error)
    return NextResponse.json(
      { error: 'Failed to create growth tracking' },
      { status: 500 }
    )
  }
}

// Update KPI progress
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, currentValue, notes } = body

    if (!id || currentValue === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: id, currentValue' },
        { status: 400 }
      )
    }

    const existingKPI = await db.growthTracking.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingKPI) {
      return NextResponse.json(
        { error: 'KPI not found' },
        { status: 404 }
      )
    }

    // Calculate new variance and achievement
    const variance = currentValue - existingKPI.targetValue
    const percentage = (currentValue / existingKPI.targetValue) * 100
    
    let achievement: string
    if (percentage >= 100) {
      achievement = 'achieved'
    } else if (percentage >= 90) {
      achievement = 'ahead'
    } else if (percentage >= 70) {
      achievement = 'on_track'
    } else {
      achievement = 'behind'
    }

    // Calculate growth rate
    let growthRate = existingKPI.growthRate
    if (existingKPI.baselineValue && existingKPI.baselineValue > 0) {
      growthRate = ((currentValue - existingKPI.baselineValue) / existingKPI.baselineValue) * 100
    }

    const updatedKPI = await db.growthTracking.update({
      where: { id },
      data: {
        currentValue,
        variance,
        growthRate,
        achievement,
        notes: notes || existingKPI.notes,
      },
    })

    return NextResponse.json({ growthTracking: updatedKPI })
  } catch (error) {
    console.error('Error updating growth tracking:', error)
    return NextResponse.json(
      { error: 'Failed to update growth tracking' },
      { status: 500 }
    )
  }
}