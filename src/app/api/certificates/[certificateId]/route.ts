import { NextRequest, NextResponse } from 'next/server'
import { CertificateService } from '@/lib/services/certificate'

// GET /api/certificates/[certificateId] - Verify and get certificate details
export async function GET(
  request: NextRequest,
  { params }: { params: { certificateId: string } }
) {
  try {
    const certificate = await CertificateService.getCertificateDetails(params.certificateId)

    if (!certificate) {
      return NextResponse.json(
        { success: false, error: 'Certificate not found' },
        { status: 404 }
      )
    }

    // Check if certificate is expired
    if (certificate.expiresAt && certificate.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Certificate has expired' },
        { status: 410 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        isValid: true,
        certificate: {
          id: certificate.id,
          userName: `${certificate.user.firstName} ${certificate.user.lastName}`,
          courseName: certificate.course.title,
          courseDescription: certificate.course.description,
          instructorName: `${certificate.course.instructor.firstName} ${certificate.course.instructor.lastName}`,
          issuedAt: certificate.issuedAt,
          expiresAt: certificate.expiresAt,
          certificateUrl: certificate.certificateUrl
        }
      }
    })
  } catch (error) {
    console.error('Error verifying certificate:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to verify certificate' },
      { status: 500 }
    )
  }
}

// POST /api/certificates/[certificateId]/verify - Verify certificate validity
export async function POST(
  request: NextRequest,
  { params }: { params: { certificateId: string } }
) {
  try {
    const isValid = await CertificateService.verifyCertificate(params.certificateId)

    return NextResponse.json({
      success: true,
      data: {
        isValid,
        certificateId: params.certificateId
      }
    })
  } catch (error) {
    console.error('Error verifying certificate:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to verify certificate' },
      { status: 500 }
    )
  }
}