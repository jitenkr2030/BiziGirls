import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { paymentService } from '@/lib/services/payment'

// POST /api/payments/[paymentId]/refund - Refund a payment
export async function POST(
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

    const { amount } = await request.json()

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

    if (payment.status !== 'succeeded') {
      return NextResponse.json(
        { success: false, error: 'Payment cannot be refunded' },
        { status: 400 }
      )
    }

    if (payment.status === 'refunded') {
      return NextResponse.json(
        { success: false, error: 'Payment already refunded' },
        { status: 400 }
      )
    }

    // Process refund
    const result = await paymentService.refundPayment(params.paymentId, amount)

    return NextResponse.json({
      success: result.success,
      data: result,
      message: result.success ? 'Refund processed successfully' : 'Failed to process refund'
    })
  } catch (error) {
    console.error('Error processing refund:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process refund' },
      { status: 500 }
    )
  }
}