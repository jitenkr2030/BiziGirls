import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { validateBody, handleValidationError } from '@/lib/validation-middleware'

// GET /api/courses/[courseId]/lessons - Get all lessons for a course
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

    const lessons = await db.lesson.findMany({
      where: { courseId: params.courseId },
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
        _count: {
          select: {
            quizzes: true
          }
        }
      },
      orderBy: { order: 'asc' }
    })

    // If user is enrolled, include progress data
    let progressData = []
    const enrollment = await db.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: params.courseId
        }
      }
    })

    if (enrollment) {
      progressData = await db.lessonProgress.findMany({
        where: {
          userId: user.id,
          lessonId: {
            in: lessons.map(l => l.id)
          }
        }
      })
    }

    const lessonsWithProgress = lessons.map(lesson => {
      const progress = progressData.find(p => p.lessonId === lesson.id)
      return {
        ...lesson,
        progress: progress || null
      }
    })

    return NextResponse.json({
      success: true,
      data: lessonsWithProgress
    })
  } catch (error) {
    console.error('Error fetching lessons:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch lessons' },
      { status: 500 }
    )
  }
}

// POST /api/courses/[courseId]/lessons - Create a new lesson
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

    let data
    try {
      data = await validateBody('course', 'lesson')(request)
    } catch (error) {
      const validationError = handleValidationError(error)
      return NextResponse.json(validationError, { status: 400 })
    }

    const lesson = await db.lesson.create({
      data: {
        courseId: params.courseId,
        title: data.title,
        content: data.content,
        videoUrl: data.videoUrl,
        duration: data.duration,
        order: data.order,
        isPreview: data.isPreview || false
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
    console.error('Error creating lesson:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create lesson' },
      { status: 500 }
    )
  }
}