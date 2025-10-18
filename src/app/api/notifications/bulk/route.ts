import { NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { ApiUtils } from '@/lib/api-utils'
import { notificationService } from '@/lib/notifications'
import { rateLimiters } from '@/lib/security-middleware'

// POST /api/notifications/bulk - Bulk notification actions
export async function POST(request: NextRequest) {
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
    const { action, notificationIds } = data

    if (!action || !Array.isArray(notificationIds)) {
      return ApiUtils.badRequest('Action and notificationIds are required')
    }

    let result

    switch (action) {
      case 'mark_all_read':
        // Mark all notifications as read for the user
        await notificationService.markAllAsRead(user.id)
        result = { message: 'All notifications marked as read' }
        break

      case 'mark_read':
        // Mark specific notifications as read
        await Promise.all(
          notificationIds.map((id: string) => notificationService.markAsRead(id))
        )
        result = { message: `${notificationIds.length} notifications marked as read` }
        break

      case 'delete':
        // Delete specific notifications
        await Promise.all(
          notificationIds.map((id: string) => notificationService.delete(id, user.id))
        )
        result = { message: `${notificationIds.length} notifications deleted` }
        break

      default:
        return ApiUtils.badRequest('Invalid action')
    }

    return ApiUtils.success(result)
  } catch (error) {
    console.error('Error performing bulk notification action:', error)
    return ApiUtils.error('Failed to perform bulk action')
  }
}

// GET /api/notifications/bulk/unread-count - Get unread notification count
export async function GET(request: NextRequest) {
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

    const unreadCount = await notificationService.getUnreadCount(user.id)

    return ApiUtils.success({
      unreadCount,
      userId: user.id
    })
  } catch (error) {
    console.error('Error getting unread count:', error)
    return ApiUtils.error('Failed to get unread count')
  }
}