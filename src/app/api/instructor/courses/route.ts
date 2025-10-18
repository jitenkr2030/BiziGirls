import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { validateBody, handleValidationError } from '@/lib/validation-middleware'

// GET /api/instructor/courses - Get instructor's courses with detailed analytics
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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || 'all' // all, published, draft

    const skip = (page - 1) * limit

    const where: any = { instructorId: user.id }
    if (status === 'published') {
      where.isPublished = true
    } else if (status === 'draft') {
      where.isPublished = false
    }

    const [courses, total] = await Promise.all([
      db.course.findMany({
        where,
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
            select: {
              id: true,
              title: true,
              duration: true,
              order: true,
              isPreview: true,
              quizzes: {
                select: {
                  id: true,
                  title: true,
                  isRequired: true
                }
              }
            },
            orderBy: { order: 'asc' }
          },
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
              lessonProgress: {
                select: {
                  isCompleted: true,
                  timeSpent: true
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
          },
          certificates: {
            select: {
              id: true,
              issuedAt: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      db.course.count({ where })
    ])

    // Calculate analytics for each course
    const coursesWithAnalytics = courses.map(course => {
      const totalEnrollments = course.enrollments.length
      const completedEnrollments = course.enrollments.filter(e => e.progress === 100).length
      const inProgressEnrollments = course.enrollments.filter(e => e.progress > 0 && e.progress < 100).length
      
      const averageProgress = totalEnrollments > 0 
        ? course.enrollments.reduce((sum, e) => sum + e.progress, 0) / totalEnrollments 
        : 0

      const averageRating = course.reviews.length > 0 
        ? course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length 
        : 0

      const totalRevenue = course.price ? totalEnrollments * course.price : 0
      const totalLessons = course.lessons.length
      const totalQuizzes = course.lessons.reduce((sum, lesson) => sum + lesson.quizzes.length, 0)
      
      const totalTimeSpent = course.enrollments.reduce((sum, e) => 
        sum + e.lessonProgress.reduce((lessonSum, p) => lessonSum + p.timeSpent, 0), 0
      )

      const averageTimeSpent = totalEnrollments > 0 ? totalTimeSpent / totalEnrollments : 0

      // Calculate engagement metrics
      const recentActivity = course.enrollments
        .filter(e => e.updatedAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // Last 7 days
        .length

      return {
        ...course,
        analytics: {
          totalEnrollments,
          completedEnrollments,
          inProgressEnrollments,
          completionRate: totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0,
          averageProgress,
          averageRating: Math.round(averageRating * 100) / 100,
          totalRevenue,
          totalLessons,
          totalQuizzes,
          totalTimeSpent,
          averageTimeSpent,
          recentActivity,
          certificatesIssued: course.certificates.length
        },
        recentEnrollments: course.enrollments
          .sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime())
          .slice(0, 5)
          .map(e => ({
            user: e.user,
            enrolledAt: e.enrolledAt,
            progress: e.progress
          })),
        recentReviews: course.reviews
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
      }
    })

    return NextResponse.json({
      success: true,
      data: coursesWithAnalytics,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching instructor courses:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch instructor courses' },
      { status: 500 }
    )
  }
}

// POST /api/instructor/courses - Create a new course
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let data
    try {
      data = await validateBody('course', 'create')(request)
    } catch (error) {
      const validationError = handleValidationError(error)
      return NextResponse.json(validationError, { status: 400 })
    }

    const course = await db.course.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        level: data.level,
        duration: data.duration,
        price: data.price,
        thumbnail: data.thumbnail,
        instructorId: user.id,
        isPublished: false,
        isFeatured: false
      },
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
          orderBy: { order: 'asc' }
        },
        enrollments: true,
        reviews: true
      }
    })

    return NextResponse.json({
      success: true,
      data: course,
      message: 'Course created successfully'
    })
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create course' },
      { status: 500 }
    )
  }
}