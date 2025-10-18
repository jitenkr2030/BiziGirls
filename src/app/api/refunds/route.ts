import { NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { ApiUtils } from '@/lib/api-utils'
import { refundService } from '@/lib/refund-service'
import { rateLimiters } from '@/lib/security-middleware'

// GET /api/refunds - Get refunds
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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') || undefined
    const userId = searchParams.get('userId') || undefined

    // Admin can view all refunds, users can only view their own
    if (user.role === 'admin') {
      const result = await refundService.getAllRefunds({
        page,
        limit,
        status,
        userId: userId || undefined
      })
      return ApiUtils.success(result.refunds, undefined, result.pagination)
    } else {
      const result = await refundService.getUserRefunds(user.id, {
        page,
        limit,
        status
      })
      return ApiUtils.success(result.refunds, undefined, result.pagination)
    }
  } catch (error) {
    console.error('Error fetching refunds:', error)
    return ApiUtils.error('Failed to fetch refunds')
  }
}

// POST /api/refunds - Create refund request
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
    if (!data.paymentId) {
      return ApiUtils.badRequest('Payment ID is required')
    }

    // Check refund eligibility
    const eligibility = await refundService.checkRefundEligibility(
      data.paymentId,
      user.role !== 'admin' ? user.id : undefined
    )

    if (!eligibility.eligible) {
      return ApiUtils.badRequest(eligibility.reason || 'Refund not eligible')
    }

    // Create refund
    const result = await refundService.createRefund(user.id, data, user.role === 'admin')

    return ApiUtils.created({
      refund: result.refund,
      requiresApproval: result.requiresApproval,
      status: result.status
    }, 'Refund request created successfully')
  } catch (error) {
    console.error('Error creating refund:', error)
    return ApiUtils.error('Failed to create refund')
  }
}