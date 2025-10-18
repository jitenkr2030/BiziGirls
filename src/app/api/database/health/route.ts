import { NextRequest, NextResponse } from 'next/server'
import { db, checkDatabaseHealth, getConnectionPoolStats } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

// GET /api/database/health - Database health check
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const health = await checkDatabaseHealth()
    const stats = getConnectionPoolStats()

    // Get additional database metrics
    const metrics = await getDatabaseMetrics()

    return NextResponse.json({
      success: true,
      data: {
        health,
        stats,
        metrics,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error checking database health:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check database health' },
      { status: 500 }
    )
  }
}

async function getDatabaseMetrics() {
  try {
    // Get user count
    const userCount = await db.user.count()
    
    // Get business profile count
    const businessProfileCount = await db.businessProfile.count()
    
    // Get course count
    const courseCount = await db.course.count()
    
    // Get mentorship count
    const mentorshipCount = await db.mentorship.count()
    
    // Get funding request count
    const fundingRequestCount = await db.fundingRequest.count()
    
    // Get community post count
    const communityPostCount = await db.communityPost.count()
    
    // Get product count
    const productCount = await db.product.count()
    
    // Get task count
    const taskCount = await db.task.count()
    
    // Get most recent activity
    const recentActivity = await db.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        lastLoginAt: true,
        createdAt: true
      },
      orderBy: { lastLoginAt: 'desc' },
      take: 5
    })

    return {
      counts: {
        users: userCount,
        businessProfiles: businessProfileCount,
        courses: courseCount,
        mentorships: mentorshipCount,
        fundingRequests: fundingRequestCount,
        communityPosts: communityPostCount,
        products: productCount,
        tasks: taskCount
      },
      recentActivity: recentActivity.map(user => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt
      }))
    }
  } catch (error) {
    console.error('Error getting database metrics:', error)
    return {
      counts: {},
      recentActivity: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}