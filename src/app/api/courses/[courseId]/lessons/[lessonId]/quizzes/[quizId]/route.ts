import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { validateBody, handleValidationError } from '@/lib/validation-middleware'

// GET /api/courses/[courseId]/lessons/[lessonId]/quizzes/[quizId] - Get single quiz
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string; lessonId: string; quizId: string } }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const quiz = await db.quiz.findUnique({
      where: { id: params.quizId },
      include: {
        questions: {
          orderBy: { order: 'asc' }
        },
        lesson: {
          select: {
            id: true,
            title: true,
            courseId: true,
            course: {
              select: {
                instructorId: true
              }
            }
          }
        }
      }
    })

    if (!quiz) {
      return NextResponse.json(
        { success: false, error: 'Quiz not found' },
        { status: 404 }
      )
    }

    // Check if user has access to this quiz
    const hasAccess = quiz.lesson.course.instructorId === user.id

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

    // Get user's previous attempt
    const attempt = await db.quizAttempt.findUnique({
      where: {
        quizId_userId: {
          quizId: params.quizId,
          userId: user.id
        }
      },
      include: {
        answers: true
      }
    })

    // For students, don't show correct answers
    const questionsForUser = quiz.lesson.course.instructorId === user.id 
      ? quiz.questions 
      : quiz.questions.map(q => ({
          ...q,
          correctAnswer: undefined
        }))

    return NextResponse.json({
      success: true,
      data: {
        ...quiz,
        questions: questionsForUser,
        userAttempt: attempt
      }
    })
  } catch (error) {
    console.error('Error fetching quiz:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quiz' },
      { status: 500 }
    )
  }
}

// PUT /api/courses/[courseId]/lessons/[lessonId]/quizzes/[quizId] - Update quiz
export async function PUT(
  request: NextRequest,
  { params }: { params: { courseId: string; lessonId: string; quizId: string } }
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

    const quiz = await db.quiz.update({
      where: { id: params.quizId },
      data: {
        title: data.title,
        description: data.description,
        timeLimit: data.timeLimit,
        passingScore: data.passingScore,
        isRequired: data.isRequired,
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
    console.error('Error updating quiz:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update quiz' },
      { status: 500 }
    )
  }
}

// DELETE /api/courses/[courseId]/lessons/[lessonId]/quizzes/[quizId] - Delete quiz
export async function DELETE(
  request: NextRequest,
  { params }: { params: { courseId: string; lessonId: string; quizId: string } }
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

    await db.quiz.delete({
      where: { id: params.quizId }
    })

    return NextResponse.json({
      success: true,
      message: 'Quiz deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting quiz:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete quiz' },
      { status: 500 }
    )
  }
}

// POST /api/courses/[courseId]/lessons/[lessonId]/quizzes/[quizId]/attempt - Submit quiz attempt
export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string; lessonId: string; quizId: string } }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

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

    let data
    try {
      data = await validateBody('course', 'quizAttempt')(request)
    } catch (error) {
      const validationError = handleValidationError(error)
      return NextResponse.json(validationError, { status: 400 })
    }

    // Get quiz with questions
    const quiz = await db.quiz.findUnique({
      where: { id: params.quizId },
      include: {
        questions: {
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!quiz) {
      return NextResponse.json(
        { success: false, error: 'Quiz not found' },
        { status: 404 }
      )
    }

    // Calculate score
    let totalScore = 0
    let maxScore = 0
    const answers = []

    for (const question of quiz.questions) {
      maxScore += question.points
      const userAnswer = data.answers.find(a => a.questionId === question.id)
      
      if (userAnswer) {
        const isCorrect = userAnswer.answer === question.correctAnswer
        if (isCorrect) {
          totalScore += question.points
        }

        answers.push({
          questionId: question.id,
          answer: userAnswer.answer,
          isCorrect
        })
      }
    }

    const score = maxScore > 0 ? totalScore / maxScore : 0
    const isPassed = score >= quiz.passingScore

    // Create or update quiz attempt
    const attempt = await db.quizAttempt.upsert({
      where: {
        quizId_userId: {
          quizId: params.quizId,
          userId: user.id
        }
      },
      update: {
        score,
        maxScore,
        isPassed,
        timeSpent: data.timeSpent,
        completedAt: new Date()
      },
      create: {
        quizId: params.quizId,
        userId: user.id,
        score,
        maxScore,
        isPassed,
        timeSpent: data.timeSpent,
        completedAt: new Date()
      }
    })

    // Delete old answers and create new ones
    await db.answer.deleteMany({
      where: {
        attemptId: attempt.id
      }
    })

    for (const answer of answers) {
      await db.answer.create({
        data: {
          questionId: answer.questionId,
          attemptId: attempt.id,
          answer: answer.answer,
          isCorrect: answer.isCorrect
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        ...attempt,
        answers,
        percentage: Math.round(score * 100)
      }
    })
  } catch (error) {
    console.error('Error submitting quiz attempt:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit quiz attempt' },
      { status: 500 }
    )
  }
}