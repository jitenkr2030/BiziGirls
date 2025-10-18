import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const createConnectionSchema = z.object({
  recipientId: z.string(),
  message: z.string().optional(),
})

const updateConnectionSchema = z.object({
  status: z.enum(['accepted', 'rejected', 'blocked']),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type') // 'sent', 'received', 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {
      OR: [
        { requesterId: session.user.id },
        { recipientId: session.user.id }
      ]
    }

    if (status) {
      where.status = status
    }

    if (type === 'sent') {
      where.requesterId = session.user.id
    } else if (type === 'received') {
      where.recipientId = session.user.id
    }

    const [connections, total] = await Promise.all([
      db.connection.findMany({
        where,
        include: {
          requester: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            }
          },
          recipient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.connection.count({ where }),
    ])

    // Transform connections to include current user's perspective
    const transformedConnections = connections.map(connection => ({
      ...connection,
      isCurrentUserRequester: connection.requesterId === session.user.id,
      otherUser: connection.requesterId === session.user.id ? connection.recipient : connection.requester,
    }))

    // Get connection statistics
    const stats = await db.connection.groupBy({
      by: ['status'],
      where: {
        OR: [
          { requesterId: session.user.id },
          { recipientId: session.user.id }
        ]
      },
      _count: {
        status: true,
      },
    })

    const connectionStats = stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      connections: transformedConnections,
      stats: connectionStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    console.error('Error fetching connections:', error)
    return NextResponse.json(
      { error: 'Failed to fetch connections' },
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
    const validatedData = createConnectionSchema.parse(body)

    // Check if connection already exists
    const existingConnection = await db.connection.findFirst({
      where: {
        OR: [
          { requesterId: session.user.id, recipientId: validatedData.recipientId },
          { requesterId: validatedData.recipientId, recipientId: session.user.id }
        ]
      }
    })

    if (existingConnection) {
      return NextResponse.json(
        { error: 'Connection already exists' },
        { status: 400 }
      )
    }

    // Check if user is trying to connect to themselves
    if (validatedData.recipientId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot connect to yourself' },
        { status: 400 }
      )
    }

    const connection = await db.connection.create({
      data: {
        requesterId: session.user.id,
        recipientId: validatedData.recipientId,
        message: validatedData.message,
      },
      include: {
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          }
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          }
        }
      }
    })

    return NextResponse.json({ connection }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating connection:', error)
    return NextResponse.json(
      { error: 'Failed to create connection' },
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
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Connection ID is required' },
        { status: 400 }
      )
    }

    const validatedData = updateConnectionSchema.parse(updateData)

    // Check if user has permission to update this connection
    const connection = await db.connection.findFirst({
      where: {
        id,
        OR: [
          { requesterId: session.user.id },
          { recipientId: session.user.id }
        ]
      }
    })

    if (!connection) {
      return NextResponse.json(
        { error: 'Connection not found' },
        { status: 404 }
      )
    }

    // Only recipient can accept/reject connections (except for requester blocking)
    if (connection.recipientId !== session.user.id && validatedData.status !== 'blocked') {
      return NextResponse.json(
        { error: 'Only recipient can accept or reject connections' },
        { status: 403 }
      )
    }

    const updatePayload: any = {
      status: validatedData.status,
    }

    if (validatedData.status === 'accepted') {
      updatePayload.connectedAt = new Date()
    }

    const updatedConnection = await db.connection.update({
      where: { id },
      data: updatePayload,
      include: {
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          }
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          }
        }
      }
    })

    return NextResponse.json({ connection: updatedConnection })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating connection:', error)
    return NextResponse.json(
      { error: 'Failed to update connection' },
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
    const connectionId = searchParams.get('id')

    if (!connectionId) {
      return NextResponse.json(
        { error: 'Connection ID is required' },
        { status: 400 }
      )
    }

    // Check if user has permission to delete this connection
    const connection = await db.connection.findFirst({
      where: {
        id: connectionId,
        OR: [
          { requesterId: session.user.id },
          { recipientId: session.user.id }
        ]
      }
    })

    if (!connection) {
      return NextResponse.json(
        { error: 'Connection not found' },
        { status: 404 }
      )
    }

    await db.connection.delete({
      where: { id: connectionId }
    })

    return NextResponse.json({ message: 'Connection deleted successfully' })
  } catch (error) {
    console.error('Error deleting connection:', error)
    return NextResponse.json(
      { error: 'Failed to delete connection' },
      { status: 500 }
    )
  }
}