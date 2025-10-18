import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const generateMatchesSchema = z.object({
  limit: z.number().min(1).max(50).default(10),
  skills: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  location: z.string().optional(),
  industry: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {
      userId: session.user.id,
    }

    if (status) {
      where.status = status
    }

    const [matches, total] = await Promise.all([
      db.networkingMatch.findMany({
        where,
        include: {
          matchedUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
              businessStage: true,
              industry: true,
              userProfile: {
                select: {
                  headline: true,
                  bio: true,
                  location: true,
                  skills: true,
                  interests: true,
                  isMentor: true,
                  isInvestor: true,
                }
              }
            }
          }
        },
        orderBy: {
          matchScore: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.networkingMatch.count({ where }),
    ])

    // Get match statistics
    const stats = await db.networkingMatch.groupBy({
      by: ['status'],
      where: { userId: session.user.id },
      _count: {
        status: true,
      },
    })

    const matchStats = stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      matches,
      stats: matchStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    console.error('Error fetching networking matches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch networking matches' },
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
    const validatedData = generateMatchesSchema.parse(body)

    // Get current user's profile
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        userProfile: true
      }
    })

    if (!currentUser || !currentUser.userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Get potential matches
    const where: any = {
      id: { not: session.user.id },
      userProfile: {
        isPublic: true,
      }
    }

    // Apply filters if provided
    if (validatedData.location) {
      where.userProfile.location = {
        contains: validatedData.location,
        mode: 'insensitive'
      }
    }

    if (validatedData.industry) {
      where.industry = validatedData.industry
    }

    const potentialMatches = await db.user.findMany({
      where,
      include: {
        userProfile: true
      },
      take: 100, // Limit potential matches for performance
    })

    // Calculate match scores
    const scoredMatches = potentialMatches.map(user => {
      let score = 0
      const reasons: string[] = []

      const currentUserProfile = currentUser.userProfile!
      const userProfile = user.userProfile!

      // Skills match
      if (currentUserProfile.skills && userProfile.skills) {
        const currentUserSkills = JSON.parse(currentUserProfile.skills) as string[]
        const userSkills = JSON.parse(userProfile.skills) as string[]
        
        const commonSkills = currentUserSkills.filter(skill => userSkills.includes(skill))
        const skillsScore = commonSkills.length / Math.max(currentUserSkills.length, userSkills.length)
        
        if (skillsScore > 0) {
          score += skillsScore * 0.3
          reasons.push(`Skills match: ${commonSkills.join(', ')}`)
        }
      }

      // Interests match
      if (currentUserProfile.interests && userProfile.interests) {
        const currentUserInterests = JSON.parse(currentUserProfile.interests) as string[]
        const userInterests = JSON.parse(userProfile.interests) as string[]
        
        const commonInterests = currentUserInterests.filter(interest => userInterests.includes(interest))
        const interestsScore = commonInterests.length / Math.max(currentUserInterests.length, userInterests.length)
        
        if (interestsScore > 0) {
          score += interestsScore * 0.2
          reasons.push(`Interests match: ${commonInterests.join(', ')}`)
        }
      }

      // Industry match
      if (currentUser.industry && user.industry && currentUser.industry === user.industry) {
        score += 0.2
        reasons.push('Same industry')
      }

      // Business stage match
      if (currentUser.businessStage && user.businessStage && currentUser.businessStage === user.businessStage) {
        score += 0.1
        reasons.push('Same business stage')
      }

      // Location match
      if (currentUserProfile.location && userProfile.location && 
          currentUserProfile.location.toLowerCase() === userProfile.location.toLowerCase()) {
        score += 0.1
        reasons.push('Same location')
      }

      // Mentor/Investor match
      if (currentUserProfile.isMentor && userProfile.isMentor) {
        score += 0.05
        reasons.push('Both are mentors')
      }

      if (currentUserProfile.isInvestor && userProfile.isInvestor) {
        score += 0.05
        reasons.push('Both are investors')
      }

      // Mentor-mentee match
      if (currentUserProfile.isMentor && !userProfile.isMentor) {
        score += 0.1
        reasons.push('Potential mentor-mentee match')
      }

      if (!currentUserProfile.isMentor && userProfile.isMentor) {
        score += 0.1
        reasons.push('Potential mentor-mentee match')
      }

      // Investor-founder match
      if (currentUserProfile.isInvestor && !userProfile.isInvestor) {
        score += 0.1
        reasons.push('Potential investor-founder match')
      }

      if (!currentUserProfile.isInvestor && userProfile.isInvestor) {
        score += 0.1
        reasons.push('Potential investor-founder match')
      }

      return {
        userId: user.id,
        matchScore: Math.min(score, 1), // Cap at 1.0
        matchReason: reasons,
      }
    })

    // Sort by score and take top matches
    const topMatches = scoredMatches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, validatedData.limit)
      .filter(match => match.matchScore > 0.1) // Only show matches with score > 10%

    // Create or update matches in database
    const matches = await Promise.all(
      topMatches.map(async (match) => {
        const existingMatch = await db.networkingMatch.findFirst({
          where: {
            userId: session.user.id,
            matchedUserId: match.userId,
          }
        })

        if (existingMatch) {
          return db.networkingMatch.update({
            where: { id: existingMatch.id },
            data: {
              matchScore: match.matchScore,
              matchReason: JSON.stringify(match.matchReason),
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days expiry
            }
          })
        } else {
          return db.networkingMatch.create({
            data: {
              userId: session.user.id,
              matchedUserId: match.userId,
              matchScore: match.matchScore,
              matchReason: JSON.stringify(match.matchReason),
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days expiry
            }
          })
        }
      })
    )

    // Include matched user details in response
    const matchesWithDetails = await db.networkingMatch.findMany({
      where: {
        id: { in: matches.map(m => m.id) }
      },
      include: {
        matchedUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            businessStage: true,
            industry: true,
            userProfile: {
              select: {
                headline: true,
                bio: true,
                location: true,
                skills: true,
                interests: true,
                isMentor: true,
                isInvestor: true,
              }
            }
          }
        }
      }
    })

    return NextResponse.json({ 
      matches: matchesWithDetails,
      totalGenerated: topMatches.length,
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error generating networking matches:', error)
    return NextResponse.json(
      { error: 'Failed to generate networking matches' },
      { status: 500 }
    )
  }
}

// Update match status (accept/reject)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Match ID and status are required' },
        { status: 400 }
      )
    }

    if (!['accepted', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be either "accepted" or "rejected"' },
        { status: 400 }
      )
    }

    const match = await db.networkingMatch.findFirst({
      where: {
        id,
        userId: session.user.id,
      }
    })

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      )
    }

    const updatedMatch = await db.networkingMatch.update({
      where: { id },
      data: { status }
    })

    // If accepted, create a connection request
    if (status === 'accepted') {
      const existingConnection = await db.connection.findFirst({
        where: {
          OR: [
            { requesterId: session.user.id, recipientId: match.matchedUserId },
            { requesterId: match.matchedUserId, recipientId: session.user.id }
          ]
        }
      })

      if (!existingConnection) {
        await db.connection.create({
          data: {
            requesterId: session.user.id,
            recipientId: match.matchedUserId,
            message: 'Hi! I found you through networking matches and would love to connect.',
          }
        })
      }
    }

    return NextResponse.json({ match: updatedMatch })
  } catch (error) {
    console.error('Error updating networking match:', error)
    return NextResponse.json(
      { error: 'Failed to update networking match' },
      { status: 500 }
    )
  }
}