import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

// GET /api/user/enrollments - Get user's course enrollments
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
    const status = searchParams.get('status') || 'all' // all, in-progress, completed

    const skip = (page - 1) * limit

    const where: any = { userId: user.id }
    
    if (status === 'in-progress') {
      where.progress = { gt: 0, lt: 100 }
    } else if (status === 'completed') {
      where.progress = 100
    }

    const [enrollments, total] = await Promise.all([
      db.courseEnrollment.findMany({
        where,
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
                select: {
                  id: true,
                  title: true,
                  duration: true,
                  order: true
                },
                orderBy: { order: 'asc' }
              },
              _count: {
                select: {
                  lessons: true,
                  enrollments: true,
                  reviews: true
                }
              }
            }
          },
          lessonProgress: {
            select: {
              id: true,
              lessonId: true,
              isCompleted: true,
              progress: true,
              completedAt: true
            }
          },
          certificate: {
            select: {
              id: true,
              certificateUrl: true,
              issuedAt: true,
              expiresAt: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { enrolledAt: 'desc' }
      }),
      db.courseEnrollment.count({ where })
    ])

    // Calculate additional stats for each enrollment
    const enrollmentsWithStats = enrollments.map(enrollment => {
      const completedLessons = enrollment.lessonProgress.filter(p => p.isCompleted).length
      const totalLessons = enrollment.course.lessons.length
      const totalTimeSpent = enrollment.lessonProgress.reduce((sum, p) => sum + p.timeSpent, 0)
      
      return {
        ...enrollment,
        stats: {
          completedLessons,
          totalLessons,
          totalTimeSpent,
          completionPercentage: totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: enrollmentsWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching user enrollments:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch enrollments' },
      { status: 500 }
    )
  }
}