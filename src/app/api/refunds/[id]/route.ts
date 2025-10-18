import { NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { ApiUtils } from '@/lib/api-utils'
import { refundService } from '@/lib/refund-service'
import { rateLimiters } from '@/lib/security-middleware'

// PATCH /api/refunds/[id] - Update refund (approve/reject/process)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Only admins can manage refunds
    if (user.role !== 'admin') {
      return ApiUtils.forbidden()
    }

    const data = await request.json()
    const { action } = data

    if (!action) {
      return ApiUtils.badRequest('Action is required')
    }

    let result

    switch (action) {
      case 'approve':
        await refundService.approveRefund(params.id, user.id)
        result = { message: 'Refund approved successfully' }
        break

      case 'reject':
        if (!data.reason) {
          return ApiUtils.badRequest('Rejection reason is required')
        }
        await refundService.rejectRefund(params.id, user.id, data.reason)
        result = { message: 'Refund rejected successfully' }
        break

      case 'process':
        const refund = await refundService.processRefund(params.id)
        result = { refund, message: 'Refund processed successfully' }
        break

      default:
        return ApiUtils.badRequest('Invalid action')
    }

    return ApiUtils.success(result)
  } catch (error) {
    console.error('Error updating refund:', error)
    return ApiUtils.error('Failed to update refund')
  }
}

// GET /api/refunds/[id] - Get refund details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const refund = await db.refund.findUnique({
      where: { id: params.id },
      include: {
        payment: {
          select: {
            id: true,
            amount: true,
            currency: true,
            description: true,
            status: true,
            createdAt: true,
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        approver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        rejector: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    if (!refund) {
      return ApiUtils.notFound('Refund not found')
    }

    // Check if user has permission to view this refund
    if (refund.requestedBy !== user.id && user.role !== 'admin') {
      return ApiUtils.forbidden()
    }

    return ApiUtils.success(refund)
  } catch (error) {
    console.error('Error fetching refund:', error)
    return ApiUtils.error('Failed to fetch refund')
  }
}