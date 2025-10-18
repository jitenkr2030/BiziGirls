import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const createCustomReportSchema = z.object({
  reportName: z.string().min(1),
  description: z.string().optional(),
  reportConfig: z.string(),
  reportType: z.enum(['chart', 'table', 'dashboard', 'export']),
  dataSource: z.enum(['metrics', 'sales', 'customers', 'products', 'combined']),
  schedule: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'manual']).optional(),
  isPublic: z.boolean().default(false),
  isTemplate: z.boolean().default(false),
  sharedWith: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type')
    const dataSource = searchParams.get('source')
    const isPublic = searchParams.get('public') === 'true'
    const isTemplate = searchParams.get('template') === 'true'
    const schedule = searchParams.get('schedule')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {
      userId: session.user.id,
    }

    // Include public reports from other users
    if (isPublic) {
      where.OR = [
        { userId: session.user.id },
        { isPublic: true },
      ]
    }

    if (reportType) {
      where.reportType = reportType
    }
    if (dataSource) {
      where.dataSource = dataSource
    }
    if (schedule) {
      where.schedule = schedule
    }
    if (isTemplate) {
      where.isTemplate = true
    }

    const [reports, total] = await Promise.all([
      db.customReport.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.customReport.count({ where }),
    ])

    // Calculate aggregate statistics
    const stats = await db.customReport.aggregate({
      where,
      _count: {
        _all: true,
      },
      _groupBy: {
        reportType: true,
        dataSource: true,
        schedule: true,
      },
    })

    return NextResponse.json({
      reports,
      stats: {
        totalReports: stats._count._all,
        reportTypes: stats._groupBy.reduce((acc, item) => {
          if (!acc.reportTypes) acc.reportTypes = {}
          acc.reportTypes[item.reportType] = (acc.reportTypes[item.reportType] || 0) + 1
          return acc
        }, {} as any),
        dataSources: stats._groupBy.reduce((acc, item) => {
          if (!acc.dataSources) acc.dataSources = {}
          acc.dataSources[item.dataSource] = (acc.dataSources[item.dataSource] || 0) + 1
          return acc
        }, {} as any),
        schedules: stats._groupBy.reduce((acc, item) => {
          if (!acc.schedules) acc.schedules = {}
          acc.schedules[item.schedule || 'manual'] = (acc.schedules[item.schedule || 'manual'] || 0) + 1
          return acc
        }, {} as any),
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching custom reports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch custom reports' },
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
    const validatedData = createCustomReportSchema.parse(body)

    // Calculate next scheduled date if schedule is provided
    let nextScheduled: Date | null = null
    if (validatedData.schedule && validatedData.schedule !== 'manual') {
      const now = new Date()
      switch (validatedData.schedule) {
        case 'daily':
          nextScheduled = new Date(now.getTime() + 24 * 60 * 60 * 1000)
          break
        case 'weekly':
          nextScheduled = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
          break
        case 'monthly':
          nextScheduled = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
          break
        case 'quarterly':
          nextScheduled = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
          break
        case 'yearly':
          nextScheduled = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
          break
      }
    }

    const customReport = await db.customReport.create({
      data: {
        ...validatedData,
        userId: session.user.id,
        nextScheduled,
      },
    })

    return NextResponse.json({ customReport }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating custom report:', error)
    return NextResponse.json(
      { error: 'Failed to create custom report' },
      { status: 500 }
    )
  }
}

// Generate a custom report
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      )
    }

    const report = await db.customReport.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    // Parse report configuration
    const config = JSON.parse(report.reportConfig)
    
    // Generate report data based on configuration and data source
    let reportData: any = {}

    switch (report.dataSource) {
      case 'metrics':
        const metrics = await db.businessMetric.findMany({
          where: {
            userId: session.user.id,
            ...(config.filters || {}),
          },
          orderBy: {
            date: 'desc',
          },
          take: config.limit || 100,
        })
        reportData = { metrics, summary: calculateMetricsSummary(metrics) }
        break

      case 'sales':
        const salesReports = await db.salesReport.findMany({
          where: {
            userId: session.user.id,
            ...(config.filters || {}),
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: config.limit || 20,
        })
        reportData = { salesReports, summary: calculateSalesSummary(salesReports) }
        break

      case 'customers':
        const customers = await db.customerAnalytics.findMany({
          where: {
            userId: session.user.id,
            ...(config.filters || {}),
          },
          orderBy: {
            [config.sortBy || 'totalSpent']: config.sortOrder || 'desc',
          },
          take: config.limit || 100,
        })
        reportData = { customers, summary: calculateCustomerSummary(customers) }
        break

      case 'combined':
        const [combinedMetrics, combinedSales, combinedCustomers] = await Promise.all([
          db.businessMetric.findMany({
            where: {
              userId: session.user.id,
              ...(config.filters?.metrics || {}),
            },
            take: 50,
          }),
          db.salesReport.findMany({
            where: {
              userId: session.user.id,
              ...(config.filters?.sales || {}),
            },
            take: 10,
          }),
          db.customerAnalytics.findMany({
            where: {
              userId: session.user.id,
              ...(config.filters?.customers || {}),
            },
            take: 50,
          }),
        ])
        reportData = {
          metrics: combinedMetrics,
          sales: combinedSales,
          customers: combinedCustomers,
          summary: {
            metrics: calculateMetricsSummary(combinedMetrics),
            sales: calculateSalesSummary(combinedSales),
            customers: calculateCustomerSummary(combinedCustomers),
          },
        }
        break
    }

    // Update report with generation timestamp and next scheduled date
    const updatedReport = await db.customReport.update({
      where: { id },
      data: {
        lastGenerated: new Date(),
        nextScheduled: calculateNextScheduledDate(report.schedule),
      },
    })

    return NextResponse.json({
      report: updatedReport,
      data: reportData,
      generatedAt: new Date(),
    })
  } catch (error) {
    console.error('Error generating custom report:', error)
    return NextResponse.json(
      { error: 'Failed to generate custom report' },
      { status: 500 }
    )
  }
}

// Helper functions
function calculateMetricsSummary(metrics: any[]) {
  const summary = {
    total: metrics.length,
    byType: {} as Record<string, number>,
    byCategory: {} as Record<string, number>,
    averageValue: 0,
    totalValue: 0,
  }

  metrics.forEach(metric => {
    summary.totalValue += metric.value
    summary.byType[metric.metricType] = (summary.byType[metric.metricType] || 0) + 1
    if (metric.category) {
      summary.byCategory[metric.category] = (summary.byCategory[metric.category] || 0) + 1
    }
  })

  summary.averageValue = summary.total > 0 ? summary.totalValue / summary.total : 0

  return summary
}

function calculateSalesSummary(salesReports: any[]) {
  const summary = {
    total: salesReports.length,
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    totalNewCustomers: 0,
    totalReturningCustomers: 0,
  }

  salesReports.forEach(report => {
    summary.totalRevenue += report.totalRevenue
    summary.totalOrders += report.totalOrders
    summary.totalNewCustomers += report.newCustomers
    summary.totalReturningCustomers += report.returningCustomers
  })

  summary.averageOrderValue = summary.totalOrders > 0 ? summary.totalRevenue / summary.totalOrders : 0

  return summary
}

function calculateCustomerSummary(customers: any[]) {
  const summary = {
    total: customers.length,
    totalSpent: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    averageLifetimeValue: 0,
    bySegment: {} as Record<string, number>,
    bySource: {} as Record<string, number>,
  }

  customers.forEach(customer => {
    summary.totalSpent += customer.totalSpent
    summary.totalOrders += customer.orderCount
    summary.bySegment[customer.customerSegment || 'unknown'] = (summary.bySegment[customer.customerSegment || 'unknown'] || 0) + 1
    if (customer.acquisitionSource) {
      summary.bySource[customer.acquisitionSource] = (summary.bySource[customer.acquisitionSource] || 0) + 1
    }
  })

  summary.averageOrderValue = summary.totalOrders > 0 ? summary.totalSpent / summary.totalOrders : 0
  summary.averageLifetimeValue = summary.total > 0 ? summary.totalSpent / summary.total : 0

  return summary
}

function calculateNextScheduledDate(schedule: string | null): Date | null {
  if (!schedule || schedule === 'manual') return null

  const now = new Date()
  switch (schedule) {
    case 'daily':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000)
    case 'weekly':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    case 'monthly':
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    case 'quarterly':
      return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
    case 'yearly':
      return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
    default:
      return null
  }
}