import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { ApiUtils } from '@/lib/api-utils'

// GET /api/business-profiles/[id] - Get business profile by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return ApiUtils.unauthorized()
    }

    const businessProfile = await db.businessProfile.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            industry: true
          }
        }
      }
    })

    if (!businessProfile) {
      return ApiUtils.notFound('Business profile not found')
    }

    // Check if user has permission to view this profile
    if (businessProfile.userId !== user.id && user.role !== 'admin') {
      return ApiUtils.forbidden()
    }

    return ApiUtils.success(businessProfile)
  } catch (error) {
    console.error('Error fetching business profile:', error)
    return ApiUtils.error('Failed to fetch business profile')
  }
}

// PUT /api/business-profiles/[id] - Update business profile
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

    // Check if business profile exists and user has permission
    const existingProfile = await db.businessProfile.findUnique({
      where: { id: params.id }
    })

    if (!existingProfile) {
      return ApiUtils.notFound('Business profile not found')
    }

    if (existingProfile.userId !== user.id && user.role !== 'admin') {
      return ApiUtils.forbidden()
    }

    const updatedProfile = await db.businessProfile.update({
      where: { id: params.id },
      data: {
        businessName: data.businessName || existingProfile.businessName,
        businessEmail: data.businessEmail || existingProfile.businessEmail,
        businessPhone: data.businessPhone || existingProfile.businessPhone,
        businessAddress: data.businessAddress || existingProfile.businessAddress,
        businessWebsite: data.businessWebsite || existingProfile.businessWebsite,
        businessLogo: data.businessLogo || existingProfile.businessLogo,
        businessType: data.businessType || existingProfile.businessType,
        industry: data.industry || existingProfile.industry,
        description: data.description || existingProfile.description,
        mission: data.mission || existingProfile.mission,
        vision: data.vision || existingProfile.vision,
        foundedDate: data.foundedDate ? new Date(data.foundedDate) : existingProfile.foundedDate,
        employeeCount: data.employeeCount || existingProfile.employeeCount,
        annualRevenue: data.annualRevenue || existingProfile.annualRevenue,
        targetMarket: data.targetMarket || existingProfile.targetMarket,
        businessPlan: data.businessPlan || existingProfile.businessPlan,
        isRegistered: data.isRegistered !== undefined ? data.isRegistered : existingProfile.isRegistered,
        registrationDate: data.registrationDate ? new Date(data.registrationDate) : existingProfile.registrationDate
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            industry: true
          }
        }
      }
    })

    return ApiUtils.success(updatedProfile, 'Business profile updated successfully')
  } catch (error) {
    console.error('Error updating business profile:', error)
    return ApiUtils.error('Failed to update business profile')
  }
}

// DELETE /api/business-profiles/[id] - Delete business profile
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return ApiUtils.unauthorized()
    }

    // Check if business profile exists and user has permission
    const existingProfile = await db.businessProfile.findUnique({
      where: { id: params.id }
    })

    if (!existingProfile) {
      return ApiUtils.notFound('Business profile not found')
    }

    if (existingProfile.userId !== user.id && user.role !== 'admin') {
      return ApiUtils.forbidden()
    }

    await db.businessProfile.delete({
      where: { id: params.id }
    })

    return ApiUtils.noContent('Business profile deleted successfully')
  } catch (error) {
    console.error('Error deleting business profile:', error)
    return ApiUtils.error('Failed to delete business profile')
  }
}