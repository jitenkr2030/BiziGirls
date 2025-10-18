import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

// GET /api/user/progress - Get user's overall learning progress
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all enrollments with progress data
    const enrollments = await db.courseEnrollment.findMany({
      where: { userId: user.id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            thumbnail: true,
            category: true,
            level: true,
            duration: true
          }
        },
        lessonProgress: {
          select: {
            id: true,
            lessonId: true,
            isCompleted: true,
            progress: true,
            timeSpent: true,
            completedAt: true
          }
        }
      }
    })

    // Calculate overall statistics
    const totalEnrollments = enrollments.length
    const completedCourses = enrollments.filter(e => e.progress === 100).length
    const inProgressCourses = enrollments.filter(e => e.progress > 0 && e.progress < 100).length
    const totalTimeSpent = enrollments.reduce((sum, e) => 
      sum + e.lessonProgress.reduce((lessonSum, p) => lessonSum + p.timeSpent, 0), 0
    )

    // Get recent activity
    const recentProgress = await db.lessonProgress.findMany({
      where: { userId: user.id },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            course: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 10
    })

    // Get quiz performance
    const quizAttempts = await db.quizAttempt.findMany({
      where: { userId: user.id },
      include: {
        quiz: {
          include: {
            lesson: {
              select: {
                id: true,
                title: true,
                course: {
                  select: {
                    id: true,
                    title: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { completedAt: 'desc' },
      take: 10
    })

    // Calculate quiz statistics
    const totalQuizzes = quizAttempts.length
    const passedQuizzes = quizAttempts.filter(a => a.isPassed).length
    const averageQuizScore = totalQuizzes > 0 
      ? quizAttempts.reduce((sum, a) => sum + a.score, 0) / totalQuizzes 
      : 0

    // Group progress by category
    const categoryProgress = {}
    enrollments.forEach(enrollment => {
      const category = enrollment.course.category
      if (!categoryProgress[category]) {
        categoryProgress[category] = {
          totalCourses: 0,
          completedCourses: 0,
          totalProgress: 0
        }
      }
      categoryProgress[category].totalCourses++
      if (enrollment.progress === 100) {
        categoryProgress[category].completedCourses++
      }
      categoryProgress[category].totalProgress += enrollment.progress
    })

    // Calculate average progress per category
    Object.keys(categoryProgress).forEach(category => {
      const data = categoryProgress[category]
      data.averageProgress = data.totalCourses > 0 ? data.totalProgress / data.totalCourses : 0
    })

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalEnrollments,
          completedCourses,
          inProgressCourses,
          totalTimeSpent,
          averageProgress: totalEnrollments > 0 
            ? enrollments.reduce((sum, e) => sum + e.progress, 0) / totalEnrollments 
            : 0
        },
        quizPerformance: {
          totalQuizzes,
          passedQuizzes,
          averageQuizScore: Math.round(averageQuizScore * 100),
          passRate: totalQuizzes > 0 ? (passedQuizzes / totalQuizzes) * 100 : 0
        },
        recentActivity: {
          lessonProgress: recentProgress,
          quizAttempts: quizAttempts
        },
        categoryProgress,
        enrollments: enrollments.map(e => ({
          id: e.id,
          course: e.course,
          progress: e.progress,
          enrolledAt: e.enrolledAt,
          completedAt: e.completedAt,
          stats: {
            completedLessons: e.lessonProgress.filter(p => p.isCompleted).length,
            totalLessons: e.lessonProgress.length,
            timeSpent: e.lessonProgress.reduce((sum, p) => sum + p.timeSpent, 0)
          }
        }))
      }
    })
  } catch (error) {
    console.error('Error fetching user progress:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch progress' },
      { status: 500 }
    )
  }
}