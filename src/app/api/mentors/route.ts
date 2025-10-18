import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

// GET /api/mentors - Search and discover mentors
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
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || ''
    const expertise = searchParams.get('expertise') || ''
    const industry = searchParams.get('industry') || ''
    const minExperience = parseInt(searchParams.get('minExperience') || '0')
    const maxHourlyRate = parseInt(searchParams.get('maxHourlyRate') || '1000')
    const availability = searchParams.get('availability') || ''
    const mentorshipType = searchParams.get('mentorshipType') || ''
    const sortBy = searchParams.get('sortBy') || 'rating' // rating, experience, price, newest

    const skip = (page - 1) * limit

    // Build where clause for mentor search
    const where: any = {
      user: {
        isActive: true,
        role: 'mentor'
      },
      isVerified: true
    }

    // Search functionality
    if (search) {
      where.user.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Expertise filter
    if (expertise) {
      where.expertise = {
        contains: expertise,
        mode: 'insensitive'
      }
    }

    // Industry filter
    if (industry) {
      where.user.industry = {
        contains: industry,
        mode: 'insensitive'
      }
    }

    // Experience filter
    if (minExperience > 0) {
      where.experience = {
        gte: minExperience
      }
    }

    // Hourly rate filter
    if (maxHourlyRate < 1000) {
      where.hourlyRate = {
        lte: maxHourlyRate
      }
    }

    // Availability filter
    if (availability && availability !== 'all') {
      where.availability = availability
    }

    // Mentorship type filter
    if (mentorshipType) {
      where.mentorshipType = {
        contains: mentorshipType,
        mode: 'insensitive'
      }
    }

    // Build order by clause
    let orderBy: any = {}
    switch (sortBy) {
      case 'rating':
        orderBy = { rating: 'desc' }
        break
      case 'experience':
        orderBy = { experience: 'desc' }
        break
      case 'price':
        orderBy = { hourlyRate: 'asc' }
        break
      case 'newest':
        orderBy = { createdAt: 'desc' }
        break
      default:
        orderBy = { rating: 'desc' }
    }

    const [mentors, total] = await Promise.all([
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
              industry: true,
              businessStage: true,
              location: true
            }
          },
          mentorshipsAsMentor: {
            where: {
              status: {
                in: ['accepted', 'completed']
              }
            },
            select: {
              id: true,
              status: true,
              type: true,
              createdAt: true
            }
          },
          _count: {
            select: {
              mentorshipsAsMentor: {
                where: {
                  status: {
                    in: ['accepted', 'completed']
                  }
                }
              }
            }
          }
        },
        skip,
        take: limit,
        orderBy
      }),
      db.mentorProfile.count({ where })
    ])

    // Calculate additional stats for each mentor
    const mentorsWithStats = mentors.map(mentor => {
      const activeMentorships = mentor.mentorshipsAsMentor.filter(m => m.status === 'accepted').length
      const completedMentorships = mentor.mentorshipsAsMentor.filter(m => m.status === 'completed').length
      const totalMentorships = mentor._count.mentorshipsAsMentor

      return {
        ...mentor,
        stats: {
          activeMentorships,
          completedMentorships,
          totalMentorships,
          completionRate: totalMentorships > 0 ? (completedMentorships / totalMentorships) * 100 : 0
        },
        expertise: mentor.expertise ? JSON.parse(mentor.expertise) : [],
        mentorshipTypes: mentor.mentorshipType ? JSON.parse(mentor.mentorshipType) : []
      }
    })

    // Get available filters for search
    const filters = await getMentorFilters()

    return NextResponse.json({
      success: true,
      data: mentorsWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      filters
    })
  } catch (error) {
    console.error('Error fetching mentors:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch mentors' },
      { status: 500 }
    )
  }
}

// Helper function to get available filters
async function getMentorFilters() {
  try {
    // Get unique expertise areas
    const expertiseData = await db.mentorProfile.findMany({
      where: {
        expertise: {
          not: null
        },
        isVerified: true
      },
      select: {
        expertise: true
      }
    })

    const allExpertise = expertiseData
      .map(m => m.expertise ? JSON.parse(m.expertise) : [])
      .flat()
      .filter(Boolean)

    const uniqueExpertise = [...new Set(allExpertise)].sort()

    // Get unique industries
    const industries = await db.user.findMany({
      where: {
        industry: {
          not: null
        },
        role: 'mentor',
        isActive: true
      },
      select: {
        industry: true
      },
      distinct: ['industry']
    })

    const uniqueIndustries = industries
      .map(u => u.industry)
      .filter(Boolean)
      .sort()

    // Get experience range
    const experienceStats = await db.mentorProfile.aggregate({
      where: { isVerified: true },
      _min: { experience: true },
      _max: { experience: true }
    })

    // Get hourly rate range
    const rateStats = await db.mentorProfile.aggregate({
      where: { 
        isVerified: true,
        hourlyRate: { not: null }
      },
      _min: { hourlyRate: true },
      _max: { hourlyRate: true }
    })

    return {
      expertise: uniqueExpertise,
      industries: uniqueIndustries,
      experienceRange: {
        min: experienceStats._min.experience || 0,
        max: experienceStats._max.experience || 20
      },
      hourlyRateRange: {
        min: rateStats._min.hourlyRate || 0,
        max: rateStats._max.hourlyRate || 500
      },
      availability: ['available', 'busy', 'unavailable'],
      mentorshipTypes: ['one-on-one', 'group', 'coaching'],
      sortByOptions: [
        { value: 'rating', label: 'Highest Rated' },
        { value: 'experience', label: 'Most Experienced' },
        { value: 'price', label: 'Lowest Price' },
        { value: 'newest', label: 'Newest Mentors' }
      ]
    }
  } catch (error) {
    console.error('Error getting mentor filters:', error)
    return {
      expertise: [],
      industries: [],
      experienceRange: { min: 0, max: 20 },
      hourlyRateRange: { min: 0, max: 500 },
      availability: ['available', 'busy', 'unavailable'],
      mentorshipTypes: ['one-on-one', 'group', 'coaching'],
      sortByOptions: [
        { value: 'rating', label: 'Highest Rated' },
        { value: 'experience', label: 'Most Experienced' },
        { value: 'price', label: 'Lowest Price' },
        { value: 'newest', label: 'Newest Mentors' }
      ]
    }
  }
}