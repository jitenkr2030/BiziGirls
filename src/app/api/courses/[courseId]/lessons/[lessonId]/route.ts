import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { validateBody, handleValidationError } from '@/lib/validation-middleware'

// GET /api/courses/[courseId]/lessons/[lessonId] - Get single lesson
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string; lessonId: string } }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const lesson = await db.lesson.findUnique({
      where: { id: params.lessonId },
      include: {
        quizzes: {
          include: {
            questions: {
              orderBy: { order: 'asc' }
            },
            _count: {
              select: {
                attempts: true
              }
            }
          },
          orderBy: { order: 'asc' }
        },
        course: {
          select: {
            id: true,
            title: true,
            instructorId: true
          }
        }
      }
    })

    if (!lesson) {
      return NextResponse.json(
        { success: false, error: 'Lesson not found' },
        { status: 404 }
      )
    }

    // Check if user has access to this lesson
    const hasAccess = lesson.course.instructorId === user.id || lesson.isPreview

    if (!hasAccess) {
      // Check if user is enrolled in the course
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
          { success: false, error: 'Access denied' },
          { status: 403 }
        )
      }
    }

    // Get user progress for this lesson
    const progress = await db.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId: params.lessonId
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...lesson,
        progress
      }
    })
  } catch (error) {
    console.error('Error fetching lesson:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch lesson' },
      { status: 500 }
    )
  }
}

// PUT /api/courses/[courseId]/lessons/[lessonId] - Update lesson
export async function PUT(
  request: NextRequest,
  { params }: { params: { courseId: string; lessonId: string } }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is the course instructor
    const course = await db.course.findUnique({
      where: { id: params.courseId }
    })

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      )
    }

    if (course.instructorId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    const data = await request.json()

    const lesson = await db.lesson.update({
      where: { id: params.lessonId },
      data: {
        title: data.title,
        content: data.content,
        videoUrl: data.videoUrl,
        duration: data.duration,
        order: data.order,
        isPreview: data.isPreview
      },
      include: {
        quizzes: {
          include: {
            questions: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: lesson
    })
  } catch (error) {
    console.error('Error updating lesson:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update lesson' },
      { status: 500 }
    )
  }
}

// DELETE /api/courses/[courseId]/lessons/[lessonId] - Delete lesson
export async function DELETE(
  request: NextRequest,
  { params }: { params: { courseId: string; lessonId: string } }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is the course instructor
    const course = await db.course.findUnique({
      where: { id: params.courseId }
    })

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      )
    }

    if (course.instructorId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    await db.lesson.delete({
      where: { id: params.lessonId }
    })

    return NextResponse.json({
      success: true,
      message: 'Lesson deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting lesson:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete lesson' },
      { status: 500 }
    )
  }
}

// POST /api/courses/[courseId]/lessons/[lessonId]/progress - Update lesson progress
export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string; lessonId: string } }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()

    // Check if user is enrolled in the course
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
        { success: false, error: 'Not enrolled in course' },
        { status: 403 }
      )
    }

    // Update or create lesson progress
    const progress = await db.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId: params.lessonId
        }
      },
      update: {
        progress: data.progress || 0,
        timeSpent: data.timeSpent || 0,
        lastWatchedPosition: data.lastWatchedPosition || 0,
        isCompleted: data.isCompleted || false,
        completedAt: data.isCompleted ? new Date() : null
      },
      create: {
        userId: user.id,
        lessonId: params.lessonId,
        enrollmentId: enrollment.id,
        progress: data.progress || 0,
        timeSpent: data.timeSpent || 0,
        lastWatchedPosition: data.lastWatchedPosition || 0,
        isCompleted: data.isCompleted || false,
        completedAt: data.isCompleted ? new Date() : null
      }
    })

    // Update overall course progress
    const allLessons = await db.lesson.findMany({
      where: { courseId: params.courseId }
    })

    const allProgress = await db.lessonProgress.findMany({
      where: {
        userId: user.id,
        lessonId: {
          in: allLessons.map(l => l.id)
        }
      }
    })

    const completedLessons = allProgress.filter(p => p.isCompleted).length
    const totalProgress = allLessons.length > 0 ? (completedLessons / allLessons.length) * 100 : 0

    await db.courseEnrollment.update({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: params.courseId
        }
      },
      data: {
        progress: totalProgress,
        completedAt: totalProgress === 100 ? new Date() : null
      }
    })

    return NextResponse.json({
      success: true,
      data: progress
    })
  } catch (error) {
    console.error('Error updating lesson progress:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update lesson progress' },
      { status: 500 }
    )
  }
}