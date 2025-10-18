import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { paymentService } from '@/lib/services/payment'
import { validateBody, handleValidationError } from '@/lib/validation-middleware'

// POST /api/payments/create - Create a new payment
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
      data = await validateBody('payment', 'create')(request)
    } catch (error) {
      const validationError = handleValidationError(error)
      return NextResponse.json(validationError, { status: 400 })
    }

    let paymentResult

    if (data.type === 'mentorship' && data.mentorshipId) {
      // Check if mentorship exists and user has permission
      const mentorship = await db.mentorship.findUnique({
        where: { id: data.mentorshipId }
      })

      if (!mentorship) {
        return NextResponse.json(
          { success: false, error: 'Mentorship not found' },
          { status: 404 }
        )
      }

      if (mentorship.menteeId !== user.id) {
        return NextResponse.json(
          { success: false, error: 'Access denied' },
          { status: 403 }
        )
      }

      if (mentorship.paymentStatus === 'succeeded') {
        return NextResponse.json(
          { success: false, error: 'Mentorship already paid for' },
          { status: 400 }
        )
      }

      paymentResult = await paymentService.createMentorshipPayment(
        data.mentorshipId,
        data.amount,
        {
          currency: data.currency || 'USD',
          description: data.description,
          returnUrl: data.returnUrl,
          cancelUrl: data.cancelUrl
        }
      )
    } else if (data.type === 'session' && data.sessionId) {
      // Check if session exists and user has permission
      const session = await db.mentorshipSession.findUnique({
        where: { id: data.sessionId },
        include: {
          mentorship: true
        }
      })

      if (!session) {
        return NextResponse.json(
          { success: false, error: 'Session not found' },
          { status: 404 }
        )
      }

      if (session.mentorship.menteeId !== user.id) {
        return NextResponse.json(
          { success: false, error: 'Access denied' },
          { status: 403 }
        )
      }

      if (session.paymentStatus === 'succeeded') {
        return NextResponse.json(
          { success: false, error: 'Session already paid for' },
          { status: 400 }
        )
      }

      paymentResult = await paymentService.createSessionPayment(
        data.sessionId,
        data.amount,
        {
          currency: data.currency || 'USD',
          description: data.description,
          returnUrl: data.returnUrl,
          cancelUrl: data.cancelUrl
        }
      )
    } else if (data.type === 'marketplace') {
      // Handle marketplace payments
      paymentResult = await paymentService.provider.createPayment({
        amount: data.amount,
        currency: data.currency || 'USD',
        description: data.description,
        metadata: data.metadata,
        customerId: user.id,
        returnUrl: data.returnUrl,
        cancelUrl: data.cancelUrl
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid payment type. Must be mentorship, session, or marketplace' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: paymentResult.success,
      data: paymentResult,
      message: paymentResult.success ? 'Payment created successfully' : 'Failed to create payment'
    })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}