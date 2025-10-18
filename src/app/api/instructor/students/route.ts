import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

// GET /api/instructor/students - Get instructor's students across all courses
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
    const limit = parseInt(searchParams.get('limit') || '20')
    const courseId = searchParams.get('courseId') || ''
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    // Get all enrollments for instructor's courses
    const coursesWhere = { instructorId: user.id }
    if (courseId) {
      coursesWhere.id = courseId
    }

    const courses = await db.course.findMany({
      where: coursesWhere,
      select: { id: true }
    })

    const courseIds = courses.map(c => c.id)

    // Build enrollment query
    const where: any = {
      courseId: { in: courseIds }
    }

    if (search) {
      where.user = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      }
    }

    const [enrollments, total] = await Promise.all([
      db.courseEnrollment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
              bio: true,
              businessStage: true,
              industry: true
            }
          },
          course: {
            select: {
              id: true,
              title: true,
              thumbnail: true,
              category: true,
              level: true
            }
          },
          lessonProgress: {
            select: {
              isCompleted: true,
              progress: true,
              timeSpent: true,
              completedAt: true
            }
          },
          certificate: {
            select: {
              id: true,
              issuedAt: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { enrolledAt: 'desc' }
      }),
      db.courseEnrollment.count({ where })
    ])

    // Group by student and calculate statistics
    const studentMap = new Map()

    enrollments.forEach(enrollment => {
      const studentId = enrollment.userId
      if (!studentMap.has(studentId)) {
        studentMap.set(studentId, {
          user: enrollment.user,
          enrollments: [],
          stats: {
            totalEnrollments: 0,
            completedCourses: 0,
            inProgressCourses: 0,
            totalTimeSpent: 0,
            totalCertificates: 0,
            averageProgress: 0
          }
        })
      }

      const student = studentMap.get(studentId)
      student.enrollments.push(enrollment)
      
      // Update statistics
      student.stats.totalEnrollments++
      student.stats.totalTimeSpent += enrollment.lessonProgress.reduce((sum, p) => sum + p.timeSpent, 0)
      
      if (enrollment.progress === 100) {
        student.stats.completedCourses++
      } else if (enrollment.progress > 0) {
        student.stats.inProgressCourses++
      }

      if (enrollment.certificate) {
        student.stats.totalCertificates++
      }
    })

    // Calculate average progress for each student
    studentMap.forEach(student => {
      const totalProgress = student.enrollments.reduce((sum, e) => sum + e.progress, 0)
      student.stats.averageProgress = student.stats.totalEnrollments > 0 
        ? totalProgress / student.stats.totalEnrollments 
        : 0
    })

    // Convert to array and sort by various criteria
    const students = Array.from(studentMap.values())
    
    // Sort by most recent activity
    students.sort((a, b) => {
      const aLatest = a.enrollments.reduce((latest, e) => 
        new Date(e.updatedAt).getTime() > latest ? new Date(e.updatedAt).getTime() : latest, 0
      )
      const bLatest = b.enrollments.reduce((latest, e) => 
        new Date(e.updatedAt).getTime() > latest ? new Date(e.updatedAt).getTime() : latest, 0
      )
      return bLatest - aLatest
    })

    // Get course filter options
    const courseOptions = await db.course.findMany({
      where: { instructorId: user.id },
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            enrollments: true
          }
        }
      },
      orderBy: { title: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: {
        students: students.slice(skip, skip + limit),
        pagination: {
          page,
          limit,
          total: students.length,
          pages: Math.ceil(students.length / limit)
        },
        filters: {
          courses: courseOptions
        }
      }
    })
  } catch (error) {
    console.error('Error fetching instructor students:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch students' },
      { status: 500 }
    )
  }
}