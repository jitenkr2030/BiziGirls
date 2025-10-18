import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { validateBody, handleValidationError } from '@/lib/validation-middleware'

// GET /api/mentor-availability - Get mentor's availability
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const mentorId = searchParams.get('mentorId') || user.id

    // Check if user has permission to view this mentor's availability
    if (mentorId !== user.id) {
      const mentor = await db.user.findUnique({
        where: { id: mentorId },
        select: { role: true, isActive: true }
      })

      if (!mentor || mentor.role !== 'mentor' || !mentor.isActive) {
        return NextResponse.json(
          { success: false, error: 'Mentor not found or unavailable' },
          { status: 404 }
        )
      }
    }

    const availability = await db.mentorAvailability.findMany({
      where: { mentorId },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: availability
    })
  } catch (error) {
    console.error('Error fetching mentor availability:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch mentor availability' },
      { status: 500 }
    )
  }
}

// POST /api/mentor-availability - Create or update mentor availability
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is a mentor
    if (user.role !== 'mentor') {
      return NextResponse.json(
        { success: false, error: 'Only mentors can set availability' },
        { status: 403 }
      )
    }

    let data
    try {
      data = await validateBody('mentor-availability', 'create')(request)
    } catch (error) {
      const validationError = handleValidationError(error)
      return NextResponse.json(validationError, { status: 400 })
    }

    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(data.startTime) || !timeRegex.test(data.endTime)) {
      return NextResponse.json(
        { success: false, error: 'Time must be in HH:mm format' },
        { status: 400 }
      )
    }

    // Validate day of week
    if (data.dayOfWeek < 0 || data.dayOfWeek > 6) {
      return NextResponse.json(
        { success: false, error: 'Day of week must be between 0 (Sunday) and 6 (Saturday)' },
        { status: 400 }
      )
    }

    // Check if start time is before end time
    if (data.startTime >= data.endTime) {
      return NextResponse.json(
        { success: false, error: 'Start time must be before end time' },
        { status: 400 }
      )
    }

    // Check for overlapping availability slots
    const existingAvailability = await db.mentorAvailability.findMany({
      where: {
        mentorId: user.id,
        dayOfWeek: data.dayOfWeek,
        OR: [
          {
            AND: [
              { startTime: { lte: data.startTime } },
              { endTime: { gt: data.startTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: data.endTime } },
              { endTime: { gte: data.endTime } }
            ]
          },
          {
            AND: [
              { startTime: { gte: data.startTime } },
              { endTime: { lte: data.endTime } }
            ]
          }
        ]
      }
    })

    if (existingAvailability.length > 0) {
      return NextResponse.json(
        { success: false, error: 'This time slot overlaps with existing availability' },
        { status: 400 }
      )
    }

    // Create availability
    const availability = await db.mentorAvailability.create({
      data: {
        mentorId: user.id,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        timezone: data.timezone || 'UTC',
        isRecurring: data.isRecurring ?? true,
        recurringUntil: data.recurringUntil ? new Date(data.recurringUntil) : null
      }
    })

    return NextResponse.json({
      success: true,
      data: availability,
      message: 'Availability set successfully'
    })
  } catch (error) {
    console.error('Error creating mentor availability:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to set availability' },
      { status: 500 }
    )
  }
}