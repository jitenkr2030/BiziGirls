import { NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { ApiUtils } from '@/lib/api-utils'
import { paymentService } from '@/lib/payments'
import { rateLimiters } from '@/lib/security-middleware'
import { db } from '@/lib/db'

// POST /api/payments/intent - Create payment intent
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
    if (!data.amount || data.amount <= 0) {
      return ApiUtils.badRequest('Valid amount is required')
    }

    // Get or create Stripe customer
    const customerId = await paymentService.createCustomer(
      user.id,
      user.email,
      `${user.firstName} ${user.lastName}`
    )

    // Create payment intent
    const result = await paymentService.createPaymentIntent({
      amount: data.amount,
      currency: data.currency || 'usd',
      description: data.description,
      metadata: {
        userId: user.id,
        ...data.metadata,
      },
      customerId,
      paymentMethodId: data.paymentMethodId,
    })

    // Store payment record
    await db.payment.create({
      data: {
        paymentId: result.paymentIntentId,
        amount: result.amount,
        currency: result.currency,
        description: data.description,
        status: 'pending',
        provider: 'Stripe',
        metadata: JSON.stringify({
          userId: user.id,
          ...data.metadata,
        }),
        customerId: user.id,
      },
    })

    return ApiUtils.success({
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId,
      amount: result.amount,
      currency: result.currency,
    }, 'Payment intent created successfully')
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return ApiUtils.error('Failed to create payment intent')
  }
}