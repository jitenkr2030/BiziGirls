import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { validateBody, handleValidationError } from '@/lib/validation-middleware'

// GET /api/mentor-profiles - Get all mentor profiles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const expertise = searchParams.get('expertise') || ''
    const minRating = parseFloat(searchParams.get('minRating') || '0')
    const availability = searchParams.get('availability') || ''

    const skip = (page - 1) * limit

    const where: any = {}
    if (search) {
      where.OR = [
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { bio: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } }
      ]
    }
    if (expertise) {
      where.expertise = { contains: expertise, mode: 'insensitive' }
    }
    if (minRating > 0) {
      where.rating = { gte: minRating }
    }
    if (availability) {
      where.availability = availability
    }

    const [profiles, total] = await Promise.all([
      db.mentorProfile.findMany({
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
              location: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { rating: 'desc' }
      }),
      db.mentorProfile.count({ where })
    ])

    // Parse JSON fields
    const profilesWithParsedFields = profiles.map(profile => ({
      ...profile,
      expertise: profile.expertise ? JSON.parse(profile.expertise) : [],
      mentorshipType: profile.mentorshipType ? JSON.parse(profile.mentorshipType) : [],
      certifications: profile.certifications ? JSON.parse(profile.certifications) : []
    }))

    return NextResponse.json({
      success: true,
      data: profilesWithParsedFields,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching mentor profiles:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch mentor profiles' },
      { status: 500 }
    )
  }
}

// POST /api/mentor-profiles - Create mentor profile
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
      data = await validateBody('mentorProfile', 'create')(request)
    } catch (error) {
      const validationError = handleValidationError(error)
      return NextResponse.json(validationError, { status: 400 })
    }

    // Check if user already has a mentor profile
    const existingProfile = await db.mentorProfile.findUnique({
      where: { userId: user.id }
    })

    if (existingProfile) {
      return NextResponse.json(
        { success: false, error: 'Mentor profile already exists' },
        { status: 400 }
      )
    }

    // Update user role to mentor
    await db.user.update({
      where: { id: user.id },
      data: { role: 'mentor' }
    })

    const profile = await db.mentorProfile.create({
      data: {
        userId: user.id,
        expertise: data.expertise ? JSON.stringify(data.expertise) : null,
        experience: data.experience,
        company: data.company,
        position: data.position,
        education: data.education,
        certifications: data.certifications ? JSON.stringify(data.certifications) : null,
        bio: data.bio,
        hourlyRate: data.hourlyRate,
        availability: data.availability || 'available',
        mentorshipType: data.mentorshipType ? JSON.stringify(data.mentorshipType) : null,
        isVerified: false, // Admin verification required
        rating: 0,
        reviewCount: 0
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            bio: true,
            location: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...profile,
        expertise: profile.expertise ? JSON.parse(profile.expertise) : [],
        mentorshipType: profile.mentorshipType ? JSON.parse(profile.mentorshipType) : [],
        certifications: profile.certifications ? JSON.parse(profile.certifications) : []
      },
      message: 'Mentor profile created successfully. Pending admin verification.'
    })
  } catch (error) {
    console.error('Error creating mentor profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create mentor profile' },
      { status: 500 }
    )
  }
}