import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

// POST /api/investors/match - Get investor matches for a funding request
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { fundingRequestId, preferences } = await request.json()

    // Get the funding request
    const fundingRequest = await db.fundingRequest.findUnique({
      where: { id: fundingRequestId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            industry: true
          }
        }
      }
    })

    if (!fundingRequest) {
      return NextResponse.json(
        { success: false, error: 'Funding request not found' },
        { status: 404 }
      )
    }

    if (fundingRequest.userId !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    // Get all active investors
    const investors = await db.user.findMany({
      where: {
        role: 'investor',
        isActive: true,
        id: { not: user.id } // Exclude the user themselves
      },
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
                fundingType: true,
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
      }
    })

    // Calculate match scores for each investor
    const matchedInvestors = investors.map(investor => {
      let score = 0
      const reasons = []

      // Industry match (highest weight)
      if (investor.industry && fundingRequest.industry) {
        if (investor.industry.toLowerCase() === fundingRequest.industry.toLowerCase()) {
          score += 40
          reasons.push('Industry match')
        }
      }

      // Investment amount compatibility
      const totalInvested = investor.investments.reduce((sum, inv) => sum + inv.amount, 0)
      const avgInvestment = investor.investments.length > 0 ? totalInvested / investor.investments.length : 0
      
      if (avgInvestment > 0) {
        const amountRatio = Math.min(fundingRequest.amount / avgInvestment, avgInvestment / fundingRequest.amount)
        if (amountRatio > 0.5) {
          score += 25
          reasons.push('Investment amount compatible')
        }
      }

      // Funding type preference
      const hasInvestedInType = investor.investments.some(inv => 
        inv.fundingRequest.fundingType === fundingRequest.fundingType
      )
      if (hasInvestedInType) {
        score += 20
        reasons.push('Funding type preference')
      }

      // Investment activity (more active investors get higher scores)
      if (investor._count.investments > 5) {
        score += 10
        reasons.push('Active investor')
      } else if (investor._count.investments > 2) {
        score += 5
        reasons.push('Experienced investor')
      }

      // Success rate
      const successfulInvestments = investor.investments.filter(inv => 
        inv.fundingRequest.status === 'funded'
      ).length
      if (investor._count.investments > 0) {
        const successRate = successfulInvestments / investor._count.investments
        if (successRate > 0.7) {
          score += 5
          reasons.push('High success rate')
        }
      }

      return {
        investor,
        score,
        reasons,
        totalInvested,
        investmentCount: investor._count.investments,
        successRate: investor._count.investments > 0 ? successfulInvestments / investor._count.investments : 0
      }
    })

    // Sort by score and filter out low matches
    const filteredMatches = matchedInvestors
      .filter(match => match.score > 20) // Only show matches with score > 20
      .sort((a, b) => b.score - a.score)
      .slice(0, 10) // Top 10 matches

    return NextResponse.json({
      success: true,
      matches: filteredMatches,
      fundingRequest: {
        id: fundingRequest.id,
        businessName: fundingRequest.businessName,
        amount: fundingRequest.amount,
        industry: fundingRequest.industry,
        fundingType: fundingRequest.fundingType
      }
    })
  } catch (error) {
    console.error('Error matching investors:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to match investors' },
      { status: 500 }
    )
  }
}