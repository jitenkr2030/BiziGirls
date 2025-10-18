import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { paymentService } from '@/lib/services/payment'

// GET /api/payments/[paymentId]/status - Get payment status
export async function GET(
  request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if payment exists and user has permission
    const payment = await db.payment.findUnique({
      where: { paymentId: params.paymentId }
    })

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      )
    }

    if (payment.customerId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    // Get payment status
    const status = await paymentService.getPaymentStatus(params.paymentId)

    return NextResponse.json({
      success: true,
      data: status
    })
  } catch (error) {
    console.error('Error getting payment status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get payment status' },
      { status: 500 }
    )
  }
}