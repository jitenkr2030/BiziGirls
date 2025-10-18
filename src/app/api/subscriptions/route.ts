import { NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { ApiUtils } from '@/lib/api-utils'
import { paymentService } from '@/lib/payments'
import { rateLimiters } from '@/lib/security-middleware'
import { db } from '@/lib/db'

// GET /api/subscriptions - Get user subscriptions
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimiters.general.check(request)
    if (!rateLimitResult.success && rateLimitResult.response) {
      return rateLimitResult.response
    }

    const user = await getAuthUser(request)
    if (!user) {
      return ApiUtils.unauthorized()
    }

    const subscriptions = await db.subscription.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    return ApiUtils.success(subscriptions)
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return ApiUtils.error('Failed to fetch subscriptions')
  }
}

// POST /api/subscriptions - Create subscription
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimiters.payment.check(request)
    if (!rateLimitResult.success && rateLimitResult.response) {
      return rateLimitResult.response
    }

    const user = await getAuthUser(request)
    if (!user) {
      return ApiUtils.unauthorized()
    }

    const data = await request.json()

    // Validate required fields
    if (!data.priceId) {
      return ApiUtils.badRequest('Price ID is required')
    }

    // Create subscription
    const result = await paymentService.createSubscription(user.id, {
      priceId: data.priceId,
      paymentMethodId: data.paymentMethodId,
      trialPeriodDays: data.trialPeriodDays,
      metadata: {
        userId: user.id,
        ...data.metadata,
      },
    })

    return ApiUtils.success({
      subscriptionId: result.subscriptionId,
      clientSecret: result.clientSecret,
      status: result.status,
      currentPeriodStart: result.currentPeriodStart,
      currentPeriodEnd: result.currentPeriodEnd,
    }, 'Subscription created successfully')
  } catch (error) {
    console.error('Error creating subscription:', error)
    return ApiUtils.error('Failed to create subscription')
  }
}