import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const createChecklistSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(['business-registration', 'tax-compliance', 'employment-law', 'data-privacy', 'industry-specific']),
  items: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    required: z.boolean().default(true),
    category: z.string().optional(),
  })),
  requirements: z.array(z.string()).optional(),
  isPublic: z.boolean().default(true),
  isIndustrySpecific: z.boolean().default(false),
  industry: z.string().optional(),
  jurisdiction: z.string().optional(),
})

const updateProgressSchema = z.object({
  checklistId: z.string(),
  progress: z.array(z.object({
    itemId: z.string(),
    completed: z.boolean(),
    completedAt: z.string().optional(),
    notes: z.string().optional(),
  })),
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
    const industry = searchParams.get('industry')
    const jurisdiction = searchParams.get('jurisdiction')
    const includeProgress = searchParams.get('progress') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {
      isPublic: true,
    }

    if (category) {
      where.category = category
    }

    if (industry) {
      where.OR = [
        { industry: industry },
        { isIndustrySpecific: false }
      ]
    }

    if (jurisdiction) {
      where.jurisdiction = jurisdiction
    }

    const [checklists, total] = await Promise.all([
      db.complianceChecklist.findMany({
        where,
        orderBy: [
          { isIndustrySpecific: 'desc' },
          { usageCount: 'desc' },
          { lastUpdated: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.complianceChecklist.count({ where }),
    ])

    let checklistsWithProgress = checklists

    if (includeProgress) {
      // Get user progress for each checklist
      const userProgress = await db.userChecklistProgress.findMany({
        where: {
          userId: session.user.id,
          checklistId: { in: checklists.map(c => c.id) }
        }
      })

      const progressMap = userProgress.reduce((acc, progress) => {
        acc[progress.checklistId] = progress
        return acc
      }, {} as Record<string, any>)

      checklistsWithProgress = checklists.map(checklist => ({
        ...checklist,
        userProgress: progressMap[checklist.id] || null
      }))
    }

    // Get compliance statistics
    const stats = await db.complianceChecklist.groupBy({
      by: ['category'],
      where: { isPublic: true },
      _count: {
        _all: true,
      },
    })

    const categoryStats = stats.reduce((acc, stat) => {
      acc[stat.category] = stat._count._all
      return acc
    }, {} as Record<string, number>)

    // Get user's overall compliance progress
    const userStats = await db.userChecklistProgress.groupBy({
      by: ['isCompleted'],
      where: { userId: session.user.id },
      _count: {
        _all: true,
      },
    })

    const userProgressStats = userStats.reduce((acc, stat) => {
      acc[stat.isCompleted ? 'completed' : 'pending'] = stat._count._all
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      checklists: checklistsWithProgress,
      stats: {
        categories: categoryStats,
        userProgress: userProgressStats,
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    console.error('Error fetching compliance checklists:', error)
    return NextResponse.json(
      { error: 'Failed to fetch compliance checklists' },
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
    const validatedData = createChecklistSchema.parse(body)

    const checklist = await db.complianceChecklist.create({
      data: {
        ...validatedData,
        items: JSON.stringify(validatedData.items),
        requirements: validatedData.requirements ? JSON.stringify(validatedData.requirements) : undefined,
        lastUpdated: new Date(),
      },
    })

    return NextResponse.json({ checklist }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating compliance checklist:', error)
    return NextResponse.json(
      { error: 'Failed to create compliance checklist' },
      { status: 500 }
    )
  }
}

// Update user progress on a checklist
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateProgressSchema.parse(body)

    // Check if checklist exists
    const checklist = await db.complianceChecklist.findUnique({
      where: { id: validatedData.checklistId }
    })

    if (!checklist) {
      return NextResponse.json(
        { error: 'Checklist not found' },
        { status: 404 }
      )
    }

    // Calculate completion percentage
    const completedItems = validatedData.progress.filter(item => item.completed).length
    const totalItems = validatedData.progress.length
    const isCompleted = completedItems === totalItems

    const progress = await db.userChecklistProgress.upsert({
      where: {
        userId_checklistId: {
          userId: session.user.id,
          checklistId: validatedData.checklistId
        }
      },
      update: {
        progress: JSON.stringify(validatedData.progress),
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
        notes: validatedData.notes,
      },
      create: {
        userId: session.user.id,
        checklistId: validatedData.checklistId,
        progress: JSON.stringify(validatedData.progress),
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
        notes: validatedData.notes,
      },
    })

    // Update checklist usage count
    await db.complianceChecklist.update({
      where: { id: validatedData.checklistId },
      data: {
        usageCount: {
          increment: 1,
        }
      }
    })

    return NextResponse.json({ 
      progress,
      completionPercentage: Math.round((completedItems / totalItems) * 100),
      isCompleted
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating checklist progress:', error)
    return NextResponse.json(
      { error: 'Failed to update checklist progress' },
      { status: 500 }
    )
  }
}