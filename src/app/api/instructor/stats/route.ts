import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { CourseCompletionService } from '@/lib/services/course-completion'

// GET /api/instructor/stats - Get instructor dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get instructor's courses
    const courses = await db.course.findMany({
      where: { instructorId: user.id },
      include: {
        enrollments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            },
            lessonProgress: true
          }
        },
        lessons: {
          include: {
            quizzes: {
              include: {
                attempts: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        firstName: true,
                        lastName: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        reviews: {
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
        }
      }
    })

    // Calculate overall statistics
    const totalCourses = courses.length
    const totalEnrollments = courses.reduce((sum, course) => sum + course.enrollments.length, 0)
    const totalStudents = new Set(courses.flatMap(course => course.enrollments.map(e => e.user.id))).size
    const totalCompleted = courses.reduce((sum, course) => 
      sum + course.enrollments.filter(e => e.progress === 100).length, 0
    )

    // Calculate average rating
    const allReviews = courses.flatMap(course => course.reviews)
    const averageRating = allReviews.length > 0 
      ? allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length 
      : 0

    // Calculate total revenue (for paid courses)
    const totalRevenue = courses.reduce((sum, course) => {
      const paidEnrollments = course.enrollments.filter(e => course.price && course.price > 0)
      return sum + paidEnrollments.reduce((courseSum, e) => courseSum + (course.price || 0), 0)
    }, 0)

    // Get course-specific statistics
    const courseStats = await Promise.all(
      courses.map(async (course) => {
        const completionStats = await CourseCompletionService.getCourseCompletionStats(course.id)
        
        const totalLessons = course.lessons.length
        const totalQuizzes = course.lessons.reduce((sum, lesson) => sum + lesson.quizzes.length, 0)
        const totalQuizAttempts = course.lessons.reduce((sum, lesson) => 
          sum + lesson.quizzes.reduce((quizSum, quiz) => quizSum + quiz.attempts.length, 0), 0
        )

        const averageQuizScore = totalQuizAttempts > 0
          ? course.lessons.reduce((sum, lesson) => 
              sum + lesson.quizzes.reduce((quizSum, quiz) => 
                quizSum + quiz.attempts.reduce((attemptSum, attempt) => attemptSum + attempt.score, 0), 0), 0) / totalQuizAttempts
          : 0

        return {
          id: course.id,
          title: course.title,
          thumbnail: course.thumbnail,
          category: course.category,
          level: course.level,
          price: course.price,
          isPublished: course.isPublished,
          stats: {
            enrollments: course.enrollments.length,
            completionRate: completionStats.completionRate,
            averageProgress: completionStats.averageProgress,
            averageRating: course.reviews.length > 0 
              ? course.reviews.reduce((sum, review) => sum + review.rating, 0) / course.reviews.length 
              : 0,
            totalLessons,
            totalQuizzes,
            totalQuizAttempts,
            averageQuizScore: Math.round(averageQuizScore * 100),
            revenue: course.enrollments.filter(e => course.price && course.price > 0).length * (course.price || 0)
          },
          recentActivity: {
            recentEnrollments: course.enrollments
              .sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime())
              .slice(0, 5)
              .map(e => ({
                user: e.user,
                enrolledAt: e.enrolledAt,
                progress: e.progress
              })),
            recentCompletions: course.enrollments
              .filter(e => e.progress === 100)
              .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())
              .slice(0, 5)
              .map(e => ({
                user: e.user,
                completedAt: e.completedAt
              })),
            recentReviews: course.reviews
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 5)
          }
        }
      })
    )

    // Get recent activity across all courses
    const recentEnrollments = courses
      .flatMap(course => course.enrollments)
      .sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime())
      .slice(0, 10)
      .map(e => ({
        user: e.user,
        courseTitle: courses.find(c => c.id === e.courseId)?.title || '',
        enrolledAt: e.enrolledAt,
        progress: e.progress
      }))

    const recentCompletions = courses
      .flatMap(course => course.enrollments.filter(e => e.progress === 100))
      .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())
      .slice(0, 10)
      .map(e => ({
        user: e.user,
        courseTitle: courses.find(c => c.id === e.courseId)?.title || '',
        completedAt: e.completedAt
      }))

    const recentReviews = courses
      .flatMap(course => course.reviews)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map(r => ({
        user: r.user,
        courseTitle: courses.find(c => c.id === r.courseId)?.title || '',
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt
      }))

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalCourses,
          totalEnrollments,
          totalStudents,
          totalCompleted,
          averageRating: Math.round(averageRating * 100) / 100,
          totalRevenue
        },
        courses: courseStats,
        recentActivity: {
          enrollments: recentEnrollments,
          completions: recentCompletions,
          reviews: recentReviews
        }
      }
    })
  } catch (error) {
    console.error('Error fetching instructor stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch instructor statistics' },
      { status: 500 }
    )
  }
}