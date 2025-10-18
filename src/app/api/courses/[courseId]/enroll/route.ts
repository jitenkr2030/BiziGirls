import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

// POST /api/courses/[courseId]/enroll - Enroll in a course
export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if course exists
    const course = await db.course.findUnique({
      where: { id: params.courseId },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      )
    }

    // Check if user is already enrolled
    const existingEnrollment = await db.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: params.courseId
        }
      }
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { success: false, error: 'Already enrolled in this course' },
        { status: 400 }
      )
    }

    // Check if course is published
    if (!course.isPublished) {
      return NextResponse.json(
        { success: false, error: 'Course is not available for enrollment' },
        { status: 400 }
      )
    }

    // For paid courses, you would integrate with payment processing here
    // For now, we'll assume all courses are free
    if (course.price && course.price > 0) {
      return NextResponse.json(
        { success: false, error: 'Payment required for this course' },
        { status: 402 }
      )
    }

    // Create enrollment
    const enrollment = await db.courseEnrollment.create({
      data: {
        userId: user.id,
        courseId: params.courseId,
        progress: 0
      },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            },
            lessons: {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                title: true,
                duration: true,
                order: true
              }
            }
          }
        }
      }
    })

    // Update course enrollment count
    await db.course.update({
      where: { id: params.courseId },
      data: {
        enrollmentCount: {
          increment: 1
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: enrollment,
      message: 'Successfully enrolled in course'
    })
  } catch (error) {
    console.error('Error enrolling in course:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to enroll in course' },
      { status: 500 }
    )
  }
}

// GET /api/courses/[courseId]/enroll - Check enrollment status
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const enrollment = await db.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: params.courseId
        }
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            thumbnail: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        isEnrolled: !!enrollment,
        enrollment
      }
    })
  } catch (error) {
    console.error('Error checking enrollment status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check enrollment status' },
      { status: 500 }
    )
  }
}

// DELETE /api/courses/[courseId]/enroll - Unenroll from course
export async function DELETE(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const enrollment = await db.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: params.courseId
        }
      }
    })

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: 'Not enrolled in this course' },
        { status: 404 }
      )
    }

    await db.courseEnrollment.delete({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: params.courseId
        }
      }
    })

    // Update course enrollment count
    await db.course.update({
      where: { id: params.courseId },
      data: {
        enrollmentCount: {
          decrement: 1
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Successfully unenrolled from course'
    })
  } catch (error) {
    console.error('Error unenrolling from course:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to unenroll from course' },
      { status: 500 }
    )
  }
}