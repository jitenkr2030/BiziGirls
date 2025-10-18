import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { PaymentService } from '@/lib/services/payment'

// POST /api/courses/[courseId]/payment - Process course payment
export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const paymentData = await request.json()

    // Validate required fields
    const requiredFields = ['amount', 'currency', 'paymentMethod']
    for (const field of requiredFields) {
      if (!paymentData[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Check if course exists and is paid
    const courseResponse = await fetch(`${request.nextUrl.origin}/api/courses/${params.courseId}`)
    if (!courseResponse.ok) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      )
    }

    const courseData = await courseResponse.json()
    const course = courseData.data

    if (!course.price || course.price <= 0) {
      return NextResponse.json(
        { success: false, error: 'Course is free' },
        { status: 400 }
      )
    }

    // Validate payment amount
    if (paymentData.amount !== course.price) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment amount' },
        { status: 400 }
      )
    }

    // Apply promo code if provided
    let finalAmount = paymentData.amount
    if (paymentData.promoCode) {
      const promoResult = await PaymentService.validatePromoCode(paymentData.promoCode, params.courseId)
      if (promoResult.valid && promoResult.discount) {
        finalAmount = course.price * (1 - promoResult.discount)
      } else if (promoResult.error) {
        return NextResponse.json(
          { success: false, error: promoResult.error },
          { status: 400 }
        )
      }
    }

    // Process payment
    const paymentResult = await PaymentService.processPayment({
      courseId: params.courseId,
      userId: user.id,
      amount: finalAmount,
      currency: paymentData.currency,
      paymentMethod: paymentData.paymentMethod,
      paymentMethodId: paymentData.paymentMethodId
    })

    if (paymentResult.success) {
      return NextResponse.json({
        success: true,
        data: {
          transactionId: paymentResult.transactionId,
          amount: finalAmount,
          currency: paymentData.currency,
          paymentMethod: paymentData.paymentMethod,
          courseId: params.courseId,
          enrolledAt: new Date().toISOString()
        },
        message: 'Payment successful and enrollment confirmed'
      })
    } else {
      return NextResponse.json(
        { success: false, error: paymentResult.error || 'Payment failed' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error processing payment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process payment' },
      { status: 500 }
    )
  }
}

// GET /api/courses/[courseId]/payment/methods - Get available payment methods
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if course exists and is paid
    const courseResponse = await fetch(`${request.nextUrl.origin}/api/courses/${params.courseId}`)
    if (!courseResponse.ok) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      )
    }

    const courseData = await courseResponse.json()
    const course = courseData.data

    if (!course.price || course.price <= 0) {
      return NextResponse.json(
        { success: false, error: 'Course is free' },
        { status: 400 }
      )
    }

    const paymentMethods = await PaymentService.getPaymentMethods()

    return NextResponse.json({
      success: true,
      data: {
        course: {
          id: course.id,
          title: course.title,
          price: course.price,
          currency: 'USD' // Default currency
        },
        paymentMethods: paymentMethods.filter(method => method.enabled)
      }
    })
  } catch (error) {
    console.error('Error fetching payment methods:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payment methods' },
      { status: 500 }
    )
  }
}