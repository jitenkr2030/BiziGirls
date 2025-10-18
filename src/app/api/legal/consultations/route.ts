import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const createConsultationSchema = z.object({
  consultationType: z.enum(['business-formation', 'contract-review', 'compliance', 'intellectual-property', 'employment']),
  title: z.string().min(1),
  description: z.string().min(1),
  urgency: z.enum(['low', 'medium', 'high', 'urgent']),
  preferredDate: z.string().datetime().optional(),
  preferredTime: z.string().optional(),
  duration: z.number().min(15).max(240).default(60),
  documents: z.array(z.string()).optional(),
  notes: z.string().optional(),
})

const updateConsultationSchema = z.object({
  id: z.string(),
  status: z.enum(['pending', 'scheduled', 'in-progress', 'completed', 'cancelled']).optional(),
  assignedTo: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
  notes: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const urgency = searchParams.get('urgency')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {
      userId: session.user.id,
    }

    if (status) {
      where.status = status
    }

    if (type) {
      where.consultationType = type
    }

    if (urgency) {
      where.urgency = urgency
    }

    const [consultations, total] = await Promise.all([
      db.legalConsultation.findMany({
        where,
        orderBy: [
          { urgency: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.legalConsultation.count({ where }),
    ])

    // Get consultation statistics
    const stats = await db.legalConsultation.groupBy({
      by: ['status', 'consultationType'],
      where: { userId: session.user.id },
      _count: {
        _all: true,
      },
    })

    const consultationStats = stats.reduce((acc, stat) => {
      if (!acc.byStatus) acc.byStatus = {}
      if (!acc.byType) acc.byType = {}
      
      acc.byStatus[stat.status] = (acc.byStatus[stat.status] || 0) + stat._count._all
      acc.byType[stat.consultationType] = (acc.byType[stat.consultationType] || 0) + stat._count._all
      
      return acc
    }, {} as any)

    return NextResponse.json({
      consultations,
      stats: consultationStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    console.error('Error fetching legal consultations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch legal consultations' },
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
    const validatedData = createConsultationSchema.parse(body)

    const consultation = await db.legalConsultation.create({
      data: {
        ...validatedData,
        userId: session.user.id,
        preferredDate: validatedData.preferredDate ? new Date(validatedData.preferredDate) : null,
        documents: validatedData.documents ? JSON.stringify(validatedData.documents) : undefined,
      },
    })

    return NextResponse.json({ consultation }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating legal consultation:', error)
    return NextResponse.json(
      { error: 'Failed to create legal consultation' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateConsultationSchema.parse(body)

    if (!validatedData.id) {
      return NextResponse.json(
        { error: 'Consultation ID is required' },
        { status: 400 }
      )
    }

    // Check if consultation exists and belongs to user
    const existingConsultation = await db.legalConsultation.findFirst({
      where: {
        id: validatedData.id,
        userId: session.user.id,
      }
    })

    if (!existingConsultation) {
      return NextResponse.json(
        { error: 'Consultation not found' },
        { status: 404 }
      )
    }

    const updatePayload: any = {}
    
    if (validatedData.status !== undefined) {
      updatePayload.status = validatedData.status
      
      // Set completed timestamp if status is completed
      if (validatedData.status === 'completed') {
        updatePayload.completedAt = new Date()
      }
    }
    
    if (validatedData.assignedTo !== undefined) {
      updatePayload.assignedTo = validatedData.assignedTo
    }
    
    if (validatedData.scheduledAt !== undefined) {
      updatePayload.scheduledAt = validatedData.scheduledAt ? new Date(validatedData.scheduledAt) : null
    }
    
    if (validatedData.notes !== undefined) {
      updatePayload.notes = validatedData.notes
    }

    const consultation = await db.legalConsultation.update({
      where: { id: validatedData.id },
      data: updatePayload,
    })

    return NextResponse.json({ consultation })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating legal consultation:', error)
    return NextResponse.json(
      { error: 'Failed to update legal consultation' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const consultationId = searchParams.get('id')

    if (!consultationId) {
      return NextResponse.json(
        { error: 'Consultation ID is required' },
        { status: 400 }
      )
    }

    // Check if consultation exists and belongs to user
    const consultation = await db.legalConsultation.findFirst({
      where: {
        id: consultationId,
        userId: session.user.id,
      }
    })

    if (!consultation) {
      return NextResponse.json(
        { error: 'Consultation not found' },
        { status: 404 }
      )
    }

    // Only allow deletion of pending consultations
    if (consultation.status !== 'pending') {
      return NextResponse.json(
        { error: 'Only pending consultations can be deleted' },
        { status: 400 }
      )
    }

    await db.legalConsultation.delete({
      where: { id: consultationId }
    })

    return NextResponse.json({ message: 'Consultation deleted successfully' })
  } catch (error) {
    console.error('Error deleting legal consultation:', error)
    return NextResponse.json(
      { error: 'Failed to delete legal consultation' },
      { status: 500 }
    )
  }
}