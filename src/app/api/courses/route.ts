import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { validateBody, handleValidationError } from '@/lib/validation-middleware'

// GET /api/courses - Get all courses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const level = searchParams.get('level') || ''
    const instructorId = searchParams.get('instructorId') || ''
    const isPublished = searchParams.get('published') === 'true'
    const isFeatured = searchParams.get('featured') === 'true'

    const skip = (page - 1) * limit

    const where: any = {}
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    if (category) {
      where.category = category
    }
    if (level) {
      where.level = level
    }
    if (instructorId) {
      where.instructorId = instructorId
    }
    if (searchParams.has('published')) {
      where.isPublished = isPublished
    }
    if (searchParams.has('featured')) {
      where.isFeatured = isFeatured
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
          _count: {
            select: {
              enrollments: true,
              reviews: true,
              lessons: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      db.course.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: courses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}

// POST /api/courses - Create course
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
        lessons: true,
        enrollments: true,
        reviews: true
      }
    })

    return NextResponse.json({
      success: true,
      data: course
    })
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create course' },
      { status: 500 }
    )
  }
}