import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

// GET /api/investors - Get all investors with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const industry = searchParams.get('industry') || ''
    const minInvestment = parseFloat(searchParams.get('minInvestment') || '0')
    const maxInvestment = parseFloat(searchParams.get('maxInvestment') || '0')
    const fundingType = searchParams.get('fundingType') || ''
    const region = searchParams.get('region') || ''
    const searchTerm = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    const where: any = {
      role: 'investor',
      isActive: true
    }

    if (industry) {
      where.industry = { contains: industry, mode: 'insensitive' }
    }

    if (searchTerm) {
      where.OR = [
        { firstName: { contains: searchTerm, mode: 'insensitive' } },
        { lastName: { contains: searchTerm, mode: 'insensitive' } },
        { bio: { contains: searchTerm, mode: 'insensitive' } },
        { businessProfile: { 
          OR: [
            { businessName: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } }
          ]
        }}
      ]
    }

    const [investors, total] = await Promise.all([
      db.user.findMany({
        where,
        include: {
          businessProfile: true,
          investments: {
            include: {
              fundingRequest: {
                select: {
                  id: true,
                  businessName: true,
                  industry: true,
                  amount: true,
                  status: true
                }
              }
            }
          },
          _count: {
            select: {
              investments: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      db.user.count({ where })
    ])

    // Filter investors based on investment criteria
    const filteredInvestors = investors.filter(investor => {
      if (minInvestment > 0 || maxInvestment > 0) {
        const totalInvested = investor.investments.reduce((sum, inv) => sum + inv.amount, 0)
        if (minInvestment > 0 && totalInvested < minInvestment) return false
        if (maxInvestment > 0 && totalInvested > maxInvestment) return false
      }

      if (fundingType) {
        const hasInvestedInType = investor.investments.some(inv => 
          inv.fundingRequest.fundingType === fundingType
        )
        if (!hasInvestedInType) return false
      }

      if (region && investor.businessProfile?.businessAddress) {
        if (!investor.businessProfile.businessAddress.toLowerCase().includes(region.toLowerCase())) {
          return false
        }
      }

      return true
    })

    return NextResponse.json({
      success: true,
      investors: filteredInvestors,
      pagination: {
        page,
        limit,
        total: filteredInvestors.length,
        pages: Math.ceil(filteredInvestors.length / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching investors:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch investors' },
      { status: 500 }
    )
  }
}

// POST /api/investors - Create investor profile
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()

    // Update user role to investor
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        role: 'investor',
        industry: data.industry || user.industry,
        bio: data.bio || user.bio
      },
      include: {
        businessProfile: true
      }
    })

    // Create or update business profile
    let businessProfile
    if (updatedUser.businessProfile) {
      businessProfile = await db.businessProfile.update({
        where: { userId: user.id },
        data: {
          businessName: data.businessName || updatedUser.businessProfile.businessName,
          industry: data.industry || updatedUser.businessProfile.industry,
          description: data.description || updatedUser.businessProfile.description,
          businessWebsite: data.businessWebsite || updatedUser.businessProfile.businessWebsite
        }
      })
    } else {
      businessProfile = await db.businessProfile.create({
        data: {
          userId: user.id,
          businessName: data.businessName || `${updatedUser.firstName} ${updatedUser.lastName} Investments`,
          industry: data.industry || 'Investment',
          description: data.description || 'Active investor supporting women entrepreneurs',
          businessWebsite: data.businessWebsite
        }
      })
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
      businessProfile
    })
  } catch (error) {
    console.error('Error creating investor profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create investor profile' },
      { status: 500 }
    )
  }
}