import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { validateBody, handleValidationError } from '@/lib/validation-middleware'

// GET /api/courses/[courseId]/lessons/[lessonId]/quizzes - Get all quizzes for a lesson
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

    const quizzes = await db.quiz.findMany({
      where: { lessonId: params.lessonId },
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
    })

    // Get user's quiz attempts
    const attempts = await db.quizAttempt.findMany({
      where: {
        userId: user.id,
        quizId: {
          in: quizzes.map(q => q.id)
        }
      },
      include: {
        answers: true
      }
    })

    const quizzesWithAttempts = quizzes.map(quiz => {
      const attempt = attempts.find(a => a.quizId === quiz.id)
      return {
        ...quiz,
        userAttempt: attempt || null
      }
    })

    return NextResponse.json({
      success: true,
      data: quizzesWithAttempts
    })
  } catch (error) {
    console.error('Error fetching quizzes:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quizzes' },
      { status: 500 }
    )
  }
}

// POST /api/courses/[courseId]/lessons/[lessonId]/quizzes - Create a new quiz
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
      data = await validateBody('course', 'quiz')(request)
    } catch (error) {
      const validationError = handleValidationError(error)
      return NextResponse.json(validationError, { status: 400 })
    }

    const quiz = await db.quiz.create({
      data: {
        lessonId: params.lessonId,
        title: data.title,
        description: data.description,
        timeLimit: data.timeLimit,
        passingScore: data.passingScore,
        isRequired: data.isRequired || false,
        order: data.order
      },
      include: {
        questions: {
          orderBy: { order: 'asc' }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: quiz
    })
  } catch (error) {
    console.error('Error creating quiz:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create quiz' },
      { status: 500 }
    )
  }
}