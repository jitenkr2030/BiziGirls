import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const createTemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(['business-formation', 'contracts', 'compliance', 'employment', 'intellectual-property']),
  type: z.enum(['template', 'guide', 'checklist', 'form']),
  content: z.string().min(1),
  variables: z.array(z.string()).optional(),
  instructions: z.string().optional(),
  isPublic: z.boolean().default(true),
  isPremium: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    const isPremium = searchParams.get('premium') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {
      isPublic: true,
    }

    // Only show premium templates to premium users or all templates if not filtering by premium
    if (isPremium) {
      where.isPremium = true
    }

    if (category) {
      where.category = category
    }

    if (type) {
      where.type = type
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [templates, total] = await Promise.all([
      db.documentTemplate.findMany({
        where,
        orderBy: [
          { isPremium: 'desc' },
          { downloadCount: 'desc' },
          { viewCount: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.documentTemplate.count({ where }),
    ])

    // Get template statistics
    const stats = await db.documentTemplate.groupBy({
      by: ['category', 'type'],
      where: { isPublic: true },
      _count: {
        _all: true,
      },
    })

    const templateStats = stats.reduce((acc, stat) => {
      if (!acc.categories) acc.categories = {}
      if (!acc.types) acc.types = {}
      
      acc.categories[stat.category] = (acc.categories[stat.category] || 0) + stat._count._all
      acc.types[stat.type] = (acc.types[stat.type] || 0) + stat._count._all
      
      return acc
    }, {} as any)

    return NextResponse.json({
      templates,
      stats: templateStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    console.error('Error fetching document templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch document templates' },
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
    const validatedData = createTemplateSchema.parse(body)

    const template = await db.documentTemplate.create({
      data: {
        ...validatedData,
        variables: validatedData.variables ? JSON.stringify(validatedData.variables) : undefined,
        tags: validatedData.tags ? JSON.stringify(validatedData.tags) : undefined,
        metadata: validatedData.metadata ? JSON.stringify(validatedData.metadata) : undefined,
      },
    })

    return NextResponse.json({ template }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating document template:', error)
    return NextResponse.json(
      { error: 'Failed to create document template' },
      { status: 500 }
    )
  }
}

// Download template (increment download count)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { templateId } = body

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      )
    }

    const template = await db.documentTemplate.update({
      where: { id: templateId },
      data: {
        downloadCount: {
          increment: 1,
        }
      }
    })

    return NextResponse.json({ template })
  } catch (error) {
    console.error('Error downloading template:', error)
    return NextResponse.json(
      { error: 'Failed to download template' },
      { status: 500 }
    )
  }
}