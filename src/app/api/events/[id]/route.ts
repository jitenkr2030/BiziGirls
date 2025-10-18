import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { ApiUtils } from '@/lib/api-utils'

// GET /api/events/[id] - Get event by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request)
    
    const event = await db.event.findUnique({
      where: { id: params.id },
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            bio: true
          }
        },
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        },
        _count: {
          select: {
            attendees: true
          }
        }
      }
    })

    if (!event) {
      return ApiUtils.notFound('Event not found')
    }

    // Check if user has permission to view this event
    if (!event.isPublished && event.organizerId !== user?.id && user?.role !== 'admin') {
      return ApiUtils.forbidden()
    }

    // Check if user is attending
    let isAttending = false
    if (user) {
      const attendance = await db.eventAttendance.findUnique({
        where: {
          userId_eventId: {
            userId: user.id,
            eventId: event.id
          }
        }
      })
      isAttending = !!attendance
    }

    return ApiUtils.success({
      ...event,
      isAttending,
      isOrganizer: event.organizerId === user?.id
    })
  } catch (error) {
    console.error('Error fetching event:', error)
    return ApiUtils.error('Failed to fetch event')
  }
}

// PUT /api/events/[id] - Update event
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return ApiUtils.unauthorized()
    }

    const data = await request.json()

    // Check if event exists and user has permission
    const existingEvent = await db.event.findUnique({
      where: { id: params.id }
    })

    if (!existingEvent) {
      return ApiUtils.notFound('Event not found')
    }

    if (existingEvent.organizerId !== user.id && user.role !== 'admin') {
      return ApiUtils.forbidden()
    }

    const updatedEvent = await db.event.update({
      where: { id: params.id },
      data: {
        title: data.title || existingEvent.title,
        description: data.description || existingEvent.description,
        type: data.type || existingEvent.type,
        category: data.category || existingEvent.category,
        location: data.location || existingEvent.location,
        isOnline: data.isOnline !== undefined ? data.isOnline : existingEvent.isOnline,
        maxAttendees: data.maxAttendees || existingEvent.maxAttendees,
        price: data.price !== undefined ? data.price : existingEvent.price,
        thumbnail: data.thumbnail || existingEvent.thumbnail,
        startDate: data.startDate ? new Date(data.startDate) : existingEvent.startDate,
        endDate: data.endDate ? new Date(data.endDate) : existingEvent.endDate,
        isPublished: data.isPublished !== undefined ? data.isPublished : existingEvent.isPublished
      },
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    })

    return ApiUtils.success(updatedEvent, 'Event updated successfully')
  } catch (error) {
    console.error('Error updating event:', error)
    return ApiUtils.error('Failed to update event')
  }
}

// DELETE /api/events/[id] - Delete event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return ApiUtils.unauthorized()
    }

    // Check if event exists and user has permission
    const existingEvent = await db.event.findUnique({
      where: { id: params.id }
    })

    if (!existingEvent) {
      return ApiUtils.notFound('Event not found')
    }

    if (existingEvent.organizerId !== user.id && user.role !== 'admin') {
      return ApiUtils.forbidden()
    }

    await db.event.delete({
      where: { id: params.id }
    })

    return ApiUtils.noContent('Event deleted successfully')
  } catch (error) {
    console.error('Error deleting event:', error)
    return ApiUtils.error('Failed to delete event')
  }
}