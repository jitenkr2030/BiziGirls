import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { paymentService } from '@/lib/services/payment'

// POST /api/payments/process - Process a payment
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { paymentId, paymentMethod } = await request.json()

    if (!paymentId || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: 'Payment ID and payment method are required' },
        { status: 400 }
      )
    }

    // Check if payment exists and user has permission
    const payment = await db.payment.findUnique({
      where: { paymentId }
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

    if (payment.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Payment already processed' },
        { status: 400 }
      )
    }

    // Process payment
    const result = await paymentService.processPayment(paymentId, paymentMethod)

    return NextResponse.json({
      success: result.success,
      data: result,
      message: result.success ? 'Payment processed successfully' : 'Failed to process payment'
    })
  } catch (error) {
    console.error('Error processing payment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process payment' },
      { status: 500 }
    )
  }
}