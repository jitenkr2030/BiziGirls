import { NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { ApiUtils } from '@/lib/api-utils'
import { notificationService } from '@/lib/notifications'
import { rateLimiters } from '@/lib/security-middleware'

// GET /api/notifications - Get user notifications
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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const type = searchParams.get('type') || undefined
    const priority = searchParams.get('priority') || undefined

    const result = await notificationService.getUserNotifications(user.id, {
      page,
      limit,
      unreadOnly,
      type,
      priority
    })

    return ApiUtils.success(result.notifications, undefined, result.pagination)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return ApiUtils.error('Failed to fetch notifications')
  }
}

// POST /api/notifications - Create notification (admin only)
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

    // Only admins can create notifications
    if (user.role !== 'admin') {
      return ApiUtils.forbidden()
    }

    const data = await request.json()

    // Validate required fields
    if (!data.title || !data.message) {
      return ApiUtils.badRequest('Title and message are required')
    }

    let result
    if (data.broadcast) {
      // Broadcast to all users
      result = await notificationService.createBroadcast({
        type: data.type || 'info',
        title: data.title,
        message: data.message,
        data: data.data,
        priority: data.priority || 'medium',
        actionUrl: data.actionUrl,
        actionText: data.actionText,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined
      }, data.excludeUserIds || [])
    } else if (data.userIds && Array.isArray(data.userIds)) {
      // Send to specific users
      result = await notificationService.createBulk(data.userIds, {
        type: data.type || 'info',
        title: data.title,
        message: data.message,
        data: data.data,
        priority: data.priority || 'medium',
        actionUrl: data.actionUrl,
        actionText: data.actionText,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined
      })
    } else if (data.userId) {
      // Send to single user
      result = await notificationService.create(data.userId, {
        type: data.type || 'info',
        title: data.title,
        message: data.message,
        data: data.data,
        priority: data.priority || 'medium',
        actionUrl: data.actionUrl,
        actionText: data.actionText,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined
      })
    } else {
      return ApiUtils.badRequest('Either userId, userIds, or broadcast must be specified')
    }

    return ApiUtils.created({
      notifications: result.notifications,
      sentCount: result.sentCount
    }, 'Notifications created successfully')
  } catch (error) {
    console.error('Error creating notifications:', error)
    return ApiUtils.error('Failed to create notifications')
  }
}