import { NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { ApiUtils } from '@/lib/api-utils'
import { notificationService } from '@/lib/notifications'
import { rateLimiters } from '@/lib/security-middleware'

// PATCH /api/notifications/[id] - Update notification (mark as read, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimiters.general.check(request)
    if (!rateLimitResult.success && rateLimitResult.response) {
      return rateLimitResult.response
    }

    const user = await getAuthUser(request)
    if (!user) {
      return ApiUtils.unauthorized()
    }

    const data = await request.json()

    // Check if notification exists and belongs to user
    const notification = await notificationService['db'].notification.findUnique({
      where: { id: params.id }
    })

    if (!notification) {
      return ApiUtils.notFound('Notification not found')
    }

    if (notification.userId !== user.id && user.role !== 'admin') {
      return ApiUtils.forbidden()
    }

    // Handle different update actions
    if (data.action === 'mark_read') {
      await notificationService.markAsRead(params.id)
      return ApiUtils.success(null, 'Notification marked as read')
    } else if (data.action === 'mark_unread') {
      await notificationService['db'].notification.update({
        where: { id: params.id },
        data: { isRead: false }
      })
      return ApiUtils.success(null, 'Notification marked as unread')
    } else {
      return ApiUtils.badRequest('Invalid action')
    }
  } catch (error) {
    console.error('Error updating notification:', error)
    return ApiUtils.error('Failed to update notification')
  }
}

// DELETE /api/notifications/[id] - Delete notification
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimiters.general.check(request)
    if (!rateLimitResult.success && rateLimitResult.response) {
      return rateLimitResult.response
    }

    const user = await getAuthUser(request)
    if (!user) {
      return ApiUtils.unauthorized()
    }

    // Check if notification exists and belongs to user
    const notification = await notificationService['db'].notification.findUnique({
      where: { id: params.id }
    })

    if (!notification) {
      return ApiUtils.notFound('Notification not found')
    }

    if (notification.userId !== user.id && user.role !== 'admin') {
      return ApiUtils.forbidden()
    }

    await notificationService.delete(params.id, user.id)

    return ApiUtils.noContent('Notification deleted successfully')
  } catch (error) {
    console.error('Error deleting notification:', error)
    return ApiUtils.error('Failed to delete notification')
  }
}