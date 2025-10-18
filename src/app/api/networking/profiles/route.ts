import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateProfileSchema = z.object({
  headline: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  linkedin: z.string().url().optional().or(z.literal('')),
  twitter: z.string().optional().or(z.literal('')),
  instagram: z.string().optional().or(z.literal('')),
  skills: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  goals: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
  isMentor: z.boolean().optional(),
  isInvestor: z.boolean().optional(),
  availability: z.enum(['available', 'busy', 'unavailable']).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || session.user.id
    const search = searchParams.get('search')
    const skills = searchParams.get('skills')
    const location = searchParams.get('location')
    const isMentor = searchParams.get('mentor') === 'true'
    const isInvestor = searchParams.get('investor') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // If searching for other users
    if (userId !== session.user.id || search || skills || location || isMentor || isInvestor) {
      const where: any = {
        isPublic: true,
      }

      if (search) {
        where.OR = [
          { bio: { contains: search, mode: 'insensitive' } },
          { headline: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } },
          { user: { 
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } }
            ]
          }}
        ]
      }

      if (skills) {
        where.skills = {
          contains: skills,
          mode: 'insensitive'
        }
      }

      if (location) {
        where.location = {
          contains: location,
          mode: 'insensitive'
        }
      }

      if (isMentor) {
        where.isMentor = true
      }

      if (isInvestor) {
        where.isInvestor = true
      }

      if (userId !== session.user.id) {
        where.userId = userId
      }

      const [profiles, total] = await Promise.all([
        db.userProfile.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
                businessStage: true,
                industry: true,
              }
            }
          },
          orderBy: {
            viewCount: 'desc'
          },
          skip: (page - 1) * limit,
          take: limit,
        }),
        db.userProfile.count({ where }),
      ])

      return NextResponse.json({
        profiles,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        }
      })
    }

    // Get current user's profile
    const profile = await db.userProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            businessStage: true,
            industry: true,
          }
        }
      }
    })

    if (!profile) {
      // Create default profile if it doesn't exist
      const newProfile = await db.userProfile.create({
        data: {
          userId: session.user.id,
          headline: `${session.user.firstName} ${session.user.lastName}`,
          bio: 'Entrepreneur passionate about building impactful businesses.',
          location: 'Remote',
          skills: JSON.stringify(['entrepreneurship', 'leadership']),
          interests: JSON.stringify(['business', 'innovation', 'networking']),
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
              businessStage: true,
              industry: true,
            }
          }
        }
      })

      return NextResponse.json({ profile: newProfile })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error fetching user profiles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user profiles' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)

    // Convert arrays to JSON strings
    const data = {
      ...validatedData,
      skills: validatedData.skills ? JSON.stringify(validatedData.skills) : undefined,
      interests: validatedData.interests ? JSON.stringify(validatedData.interests) : undefined,
      goals: validatedData.goals ? JSON.stringify(validatedData.goals) : undefined,
    }

    const profile = await db.userProfile.upsert({
      where: { userId: session.user.id },
      update: data,
      create: {
        userId: session.user.id,
        headline: data.headline || `${session.user.firstName} ${session.user.lastName}`,
        bio: data.bio || 'Entrepreneur passionate about building impactful businesses.',
        location: data.location || 'Remote',
        skills: data.skills || JSON.stringify(['entrepreneurship', 'leadership']),
        interests: data.interests || JSON.stringify(['business', 'innovation', 'networking']),
        ...data,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            businessStage: true,
            industry: true,
          }
        }
      }
    })

    return NextResponse.json({ profile }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating/updating user profile:', error)
    return NextResponse.json(
      { error: 'Failed to create/update user profile' },
      { status: 500 }
    )
  }
}