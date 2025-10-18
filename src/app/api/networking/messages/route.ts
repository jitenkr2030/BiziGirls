import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const createMessageSchema = z.object({
  recipientId: z.string(),
  content: z.string().min(1),
  type: z.enum(['text', 'image', 'file', 'system']).default('text'),
  parentId: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') // Get conversation with specific user
    const unreadOnly = searchParams.get('unread') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {
      OR: [
        { senderId: session.user.id },
        { recipientId: session.user.id }
      ]
    }

    if (userId) {
      where.OR = [
        { senderId: session.user.id, recipientId: userId },
        { senderId: userId, recipientId: session.user.id }
      ]
    }

    if (unreadOnly) {
      where.recipientId = session.user.id
      where.isRead = false
    }

    const [messages, total] = await Promise.all([
      db.message.findMany({
        where,
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            }
          },
          recipient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            }
          },
          replies: {
            include: {
              sender: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                }
              },
              recipient: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.message.count({ where }),
    ])

    // Get unread count
    const unreadCount = await db.message.count({
      where: {
        recipientId: session.user.id,
        isRead: false,
      }
    })

    // Get conversation list (last message with each user)
    const conversations = await db.message.findMany({
      where: {
        OR: [
          { senderId: session.user.id },
          { recipientId: session.user.id }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          }
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      distinct: ['senderId', 'recipientId'],
    })

    // Transform conversations to get unique conversation partners
    const uniqueConversations = conversations.reduce((acc, message) => {
      const otherUserId = message.senderId === session.user.id ? message.recipientId : message.senderId
      const otherUser = message.senderId === session.user.id ? message.recipient : message.sender
      
      if (!acc.find(c => c.otherUser.id === otherUserId)) {
        acc.push({
          otherUser,
          lastMessage: message,
          unreadCount: messages.filter(m => 
            m.senderId === otherUserId && 
            m.recipientId === session.user.id && 
            !m.isRead
          ).length
        })
      }
      return acc
    }, [] as any[])

    return NextResponse.json({
      messages,
      conversations: uniqueConversations,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
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
    const validatedData = createMessageSchema.parse(body)

    // Check if users are connected (for non-system messages)
    if (validatedData.type !== 'system') {
      const connection = await db.connection.findFirst({
        where: {
          OR: [
            { requesterId: session.user.id, recipientId: validatedData.recipientId, status: 'accepted' },
            { requesterId: validatedData.recipientId, recipientId: session.user.id, status: 'accepted' }
          ]
        }
      })

      if (!connection) {
        return NextResponse.json(
          { error: 'You can only message users you are connected with' },
          { status: 403 }
        )
      }
    }

    // Check if user is trying to message themselves
    if (validatedData.recipientId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot message yourself' },
        { status: 400 }
      )
    }

    const message = await db.message.create({
      data: {
        senderId: session.user.id,
        recipientId: validatedData.recipientId,
        content: validatedData.content,
        type: validatedData.type,
        parentId: validatedData.parentId,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          }
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          }
        },
        parent: {
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              }
            }
          }
        }
      }
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    )
  }
}

// Mark messages as read
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { messageIds, userId } = body

    if (!messageIds && !userId) {
      return NextResponse.json(
        { error: 'Either messageIds or userId is required' },
        { status: 400 }
      )
    }

    const where: any = {
      recipientId: session.user.id,
      isRead: false,
    }

    if (messageIds) {
      where.id = { in: messageIds }
    }

    if (userId) {
      where.senderId = userId
    }

    const updatedMessages = await db.message.updateMany({
      where,
      data: {
        isRead: true,
        readAt: new Date(),
      }
    })

    return NextResponse.json({ 
      message: `Marked ${updatedMessages.count} messages as read`,
      count: updatedMessages.count
    })
  } catch (error) {
    console.error('Error marking messages as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark messages as read' },
      { status: 500 }
    )
  }
}