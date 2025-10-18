import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const createMetricSchema = z.object({
  metricType: z.enum(['revenue', 'expenses', 'profit', 'customers', 'orders', 'conversion_rate', 'acquisition_cost', 'retention_rate']),
  metricName: z.string().min(1),
  value: z.number(),
  unit: z.string().optional(),
  period: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']),
  date: z.string().datetime(),
  targetValue: z.number().optional(),
  variance: z.number().optional(),
  trend: z.enum(['up', 'down', 'stable']).optional(),
  category: z.enum(['financial', 'operational', 'marketing', 'customer']).optional(),
  subcategory: z.string().optional(),
  metadata: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const metricType = searchParams.get('type')
    const period = searchParams.get('period')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const category = searchParams.get('category')

    const where: any = {
      userId: session.user.id,
    }

    if (metricType) {
      where.metricType = metricType
    }
    if (period) {
      where.period = period
    }
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }
    if (category) {
      where.category = category
    }

    const metrics = await db.businessMetric.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
      take: 100, // Limit to last 100 metrics
    })

    return NextResponse.json({ metrics })
  } catch (error) {
    console.error('Error fetching business metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch business metrics' },
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
    const validatedData = createMetricSchema.parse(body)

    // Calculate variance if target value is provided
    const variance = validatedData.targetValue 
      ? validatedData.value - validatedData.targetValue
      : null

    // Determine trend based on previous metric of same type
    let trend = validatedData.trend
    if (!trend) {
      const previousMetric = await db.businessMetric.findFirst({
        where: {
          userId: session.user.id,
          metricType: validatedData.metricType,
          date: {
            lt: new Date(validatedData.date),
          },
        },
        orderBy: {
          date: 'desc',
        },
      })

      if (previousMetric) {
        if (validatedData.value > previousMetric.value) {
          trend = 'up'
        } else if (validatedData.value < previousMetric.value) {
          trend = 'down'
        } else {
          trend = 'stable'
        }
      }
    }

    const metric = await db.businessMetric.create({
      data: {
        ...validatedData,
        userId: session.user.id,
        variance,
        trend,
        date: new Date(validatedData.date),
      },
    })

    return NextResponse.json({ metric }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating business metric:', error)
    return NextResponse.json(
      { error: 'Failed to create business metric' },
      { status: 500 }
    )
  }
}