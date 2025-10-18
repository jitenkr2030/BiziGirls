import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { PaymentService } from '@/lib/services/payment'

// POST /api/courses/[courseId]/promo/validate - Validate promo code
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

    const { promoCode } = await request.json()

    if (!promoCode) {
      return NextResponse.json(
        { success: false, error: 'Promo code is required' },
        { status: 400 }
      )
    }

    // Check if course exists
    const courseResponse = await fetch(`${request.nextUrl.origin}/api/courses/${params.courseId}`)
    if (!courseResponse.ok) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      )
    }

    const courseData = await courseResponse.json()
    const course = courseData.data

    // Validate promo code
    const promoResult = await PaymentService.validatePromoCode(promoCode, params.courseId)

    if (promoResult.valid) {
      const discountedPrice = course.price ? course.price * (1 - (promoResult.discount || 0)) : 0
      const savings = course.price ? course.price - discountedPrice : 0

      return NextResponse.json({
        success: true,
        data: {
          valid: true,
          promoCode,
          discount: promoResult.discount || 0,
          originalPrice: course.price,
          discountedPrice,
          savings,
          currency: 'USD'
        }
      })
    } else {
      return NextResponse.json(
        { success: false, error: promoResult.error || 'Invalid promo code' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error validating promo code:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to validate promo code' },
      { status: 500 }
    )
  }
}