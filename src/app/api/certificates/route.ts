import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { CertificateService } from '@/lib/services/certificate'

// GET /api/certificates - Get user's certificates
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const certificates = await CertificateService.getUserCertificates(user.id)

    return NextResponse.json({
      success: true,
      data: certificates
    })
  } catch (error) {
    console.error('Error fetching certificates:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch certificates' },
      { status: 500 }
    )
  }
}

// POST /api/certificates - Generate certificate for completed course
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { courseId } = await request.json()

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: 'Course ID is required' },
        { status: 400 }
      )
    }

    const certificateUrl = await CertificateService.generateCertificate(user.id, courseId)

    return NextResponse.json({
      success: true,
      data: {
        certificateUrl,
        message: 'Certificate generated successfully'
      }
    })
  } catch (error) {
    console.error('Error generating certificate:', error)
    
    if (error instanceof Error && error.message === 'Course not completed') {
      return NextResponse.json(
        { success: false, error: 'Course must be completed to generate certificate' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to generate certificate' },
      { status: 500 }
    )
  }
}