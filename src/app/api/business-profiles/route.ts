import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { validateBody, handleValidationError } from '@/lib/validation-middleware'

// GET /api/business-profiles - Get all business profiles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const industry = searchParams.get('industry') || ''

    const skip = (page - 1) * limit

    const where: any = {}
    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { mission: { contains: search, mode: 'insensitive' } }
      ]
    }
    if (industry) {
      where.industry = industry
    }

    const [profiles, total] = await Promise.all([
      db.businessProfile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      db.businessProfile.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: profiles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching business profiles:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch business profiles' },
      { status: 500 }
    )
  }
}

// POST /api/business-profiles - Create business profile
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
      data = await validateBody('businessProfile', 'create')(request)
    } catch (error) {
      const validationError = handleValidationError(error)
      return NextResponse.json(validationError, { status: 400 })
    }

    // Check if user already has a business profile
    const existingProfile = await db.businessProfile.findUnique({
      where: { userId: user.id }
    })

    if (existingProfile) {
      return NextResponse.json(
        { success: false, error: 'Business profile already exists' },
        { status: 400 }
      )
    }

    const profile = await db.businessProfile.create({
      data: {
        userId: user.id,
        businessName: data.businessName,
        businessEmail: data.businessEmail,
        businessPhone: data.businessPhone,
        businessAddress: data.businessAddress,
        businessWebsite: data.businessWebsite,
        businessType: data.businessType,
        industry: data.industry,
        description: data.description,
        mission: data.mission,
        vision: data.vision,
        foundedDate: data.foundedDate,
        employeeCount: data.employeeCount,
        annualRevenue: data.annualRevenue,
        targetMarket: data.targetMarket,
        businessPlan: data.businessPlan,
        isRegistered: data.isRegistered || false,
        registrationDate: data.registrationDate
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: profile
    })
  } catch (error) {
    console.error('Error creating business profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create business profile' },
      { status: 500 }
    )
  }
}