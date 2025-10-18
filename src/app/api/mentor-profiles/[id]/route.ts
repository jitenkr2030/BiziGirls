import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { ApiUtils } from '@/lib/api-utils'

// GET /api/mentor-profiles/[id] - Get mentor profile by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request)
    
    const mentorProfile = await db.mentorProfile.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            bio: true,
            industry: true,
            location: true
          }
        },
        mentorshipsAsMentor: {
          include: {
            mentee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        },
        sessionReviewsAsReviewee: {
          include: {
            reviewer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        },
        _count: {
          select: {
            mentorshipsAsMentor: true,
            sessionReviewsAsReviewee: true,
            mentorAvailability: true
          }
        }
      }
    })

    if (!mentorProfile) {
      return ApiUtils.notFound('Mentor profile not found')
    }

    // Check if user has permission to view this profile
    if (mentorProfile.userId !== user?.id && user?.role !== 'admin') {
      return ApiUtils.forbidden()
    }

    return ApiUtils.success(mentorProfile)
  } catch (error) {
    console.error('Error fetching mentor profile:', error)
    return ApiUtils.error('Failed to fetch mentor profile')
  }
}

// PUT /api/mentor-profiles/[id] - Update mentor profile
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return ApiUtils.unauthorized()
    }

    const data = await request.json()

    // Check if mentor profile exists and user has permission
    const existingProfile = await db.mentorProfile.findUnique({
      where: { id: params.id }
    })

    if (!existingProfile) {
      return ApiUtils.notFound('Mentor profile not found')
    }

    if (existingProfile.userId !== user.id && user.role !== 'admin') {
      return ApiUtils.forbidden()
    }

    const updatedProfile = await db.mentorProfile.update({
      where: { id: params.id },
      data: {
        expertise: data.expertise || existingProfile.expertise,
        experience: data.experience || existingProfile.experience,
        company: data.company || existingProfile.company,
        position: data.position || existingProfile.position,
        education: data.education || existingProfile.education,
        certifications: data.certifications || existingProfile.certifications,
        bio: data.bio || existingProfile.bio,
        hourlyRate: data.hourlyRate !== undefined ? data.hourlyRate : existingProfile.hourlyRate,
        availability: data.availability || existingProfile.availability,
        mentorshipType: data.mentorshipType || existingProfile.mentorshipType,
        isVerified: data.isVerified !== undefined ? data.isVerified : existingProfile.isVerified
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        }
      }
    })

    return ApiUtils.success(updatedProfile, 'Mentor profile updated successfully')
  } catch (error) {
    console.error('Error updating mentor profile:', error)
    return ApiUtils.error('Failed to update mentor profile')
  }
}

// DELETE /api/mentor-profiles/[id] - Delete mentor profile
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return ApiUtils.unauthorized()
    }

    // Check if mentor profile exists and user has permission
    const existingProfile = await db.mentorProfile.findUnique({
      where: { id: params.id }
    })

    if (!existingProfile) {
      return ApiUtils.notFound('Mentor profile not found')
    }

    if (existingProfile.userId !== user.id && user.role !== 'admin') {
      return ApiUtils.forbidden()
    }

    await db.mentorProfile.delete({
      where: { id: params.id }
    })

    return ApiUtils.noContent('Mentor profile deleted successfully')
  } catch (error) {
    console.error('Error deleting mentor profile:', error)
    return ApiUtils.error('Failed to delete mentor profile')
  }
}