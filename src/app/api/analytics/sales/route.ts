import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const createSalesReportSchema = z.object({
  reportName: z.string().min(1),
  reportType: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  totalRevenue: z.number().min(0),
  totalOrders: z.number().min(0),
  averageOrderValue: z.number().min(0),
  newCustomers: z.number().min(0),
  returningCustomers: z.number().min(0),
  topProducts: z.string().optional(),
  salesByCategory: z.string().optional(),
  conversionRate: z.number().min(0).max(1).optional(),
  customerAcquisitionCost: z.number().min(0).optional(),
  reportData: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {
      userId: session.user.id,
    }

    if (reportType) {
      where.reportType = reportType
    }
    if (startDate && endDate) {
      where.startDate = {
        gte: new Date(startDate),
      }
      where.endDate = {
        lte: new Date(endDate),
      }
    }

    const [reports, total] = await Promise.all([
      db.salesReport.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.salesReport.count({ where }),
    ])

    // Calculate aggregate statistics
    const stats = await db.salesReport.aggregate({
      where,
      _sum: {
        totalRevenue: true,
        totalOrders: true,
        newCustomers: true,
        returningCustomers: true,
      },
      _avg: {
        averageOrderValue: true,
        conversionRate: true,
        customerAcquisitionCost: true,
      },
      _count: {
        _all: true,
      },
    })

    return NextResponse.json({
      reports,
      stats: {
        totalReports: stats._count._all,
        totalRevenue: stats._sum.totalRevenue || 0,
        totalOrders: stats._sum.totalOrders || 0,
        totalNewCustomers: stats._sum.newCustomers || 0,
        totalReturningCustomers: stats._sum.returningCustomers || 0,
        averageOrderValue: stats._avg.averageOrderValue || 0,
        averageConversionRate: stats._avg.conversionRate || 0,
        averageCustomerAcquisitionCost: stats._avg.customerAcquisitionCost || 0,
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching sales reports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sales reports' },
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
    const validatedData = createSalesReportSchema.parse(body)

    // Calculate average order value if not provided
    const averageOrderValue = validatedData.averageOrderValue || 
      (validatedData.totalOrders > 0 ? validatedData.totalRevenue / validatedData.totalOrders : 0)

    const salesReport = await db.salesReport.create({
      data: {
        ...validatedData,
        userId: session.user.id,
        averageOrderValue,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
      },
    })

    return NextResponse.json({ salesReport }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating sales report:', error)
    return NextResponse.json(
      { error: 'Failed to create sales report' },
      { status: 500 }
    )
  }
}

// Generate a new sales report based on existing data
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { reportName, reportType, startDate, endDate } = body

    if (!reportName || !reportType || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields: reportName, reportType, startDate, endDate' },
        { status: 400 }
      )
    }

    // Generate report data based on existing business metrics and customer analytics
    const start = new Date(startDate)
    const end = new Date(endDate)

    // Get business metrics for the period
    const businessMetrics = await db.businessMetric.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: start,
          lte: end,
        },
      },
    })

    // Get customer analytics for the period
    const customerAnalytics = await db.customerAnalytics.findMany({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    })

    // Calculate report metrics
    const revenueMetrics = businessMetrics.filter(m => m.metricType === 'revenue')
    const totalRevenue = revenueMetrics.reduce((sum, m) => sum + m.value, 0)
    
    const orderMetrics = businessMetrics.filter(m => m.metricType === 'orders')
    const totalOrders = orderMetrics.reduce((sum, m) => sum + m.value, 0)
    
    const newCustomers = customerAnalytics.filter(c => c.customerSegment === 'new').length
    const returningCustomers = customerAnalytics.filter(c => c.customerSegment === 'returning').length
    
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Generate report data
    const reportData = {
      revenueTrend: revenueMetrics.map(m => ({
        date: m.date,
        value: m.value,
        trend: m.trend,
      })),
      orderTrend: orderMetrics.map(m => ({
        date: m.date,
        value: m.value,
        trend: m.trend,
      })),
      customerSegments: {
        new: newCustomers,
        returning: returningCustomers,
        vip: customerAnalytics.filter(c => c.customerSegment === 'vip').length,
        atRisk: customerAnalytics.filter(c => c.customerSegment === 'at-risk').length,
        churned: customerAnalytics.filter(c => c.customerSegment === 'churned').length,
      },
    }

    const salesReport = await db.salesReport.create({
      data: {
        userId: session.user.id,
        reportName,
        reportType,
        startDate: start,
        endDate: end,
        totalRevenue,
        totalOrders,
        averageOrderValue,
        newCustomers,
        returningCustomers,
        reportData: JSON.stringify(reportData),
      },
    })

    return NextResponse.json({ salesReport }, { status: 201 })
  } catch (error) {
    console.error('Error generating sales report:', error)
    return NextResponse.json(
      { error: 'Failed to generate sales report' },
      { status: 500 }
    )
  }
}