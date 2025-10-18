import { db } from '@/lib/db'
import { Server as NetServer } from 'http'
import { NextApiRequest } from 'next'
import { Server as ServerIO } from 'socket.io'
import { Server as NetServerIO } from 'socket.io'

export interface NotificationData {
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  data?: any
  priority?: 'low' | 'medium' | 'high'
  actionUrl?: string
  actionText?: string
  expiresAt?: Date
}

export interface NotificationSubscription {
  userId: string
  socketId: string
}

export class NotificationService {
  private io: ServerIO | null = null
  private subscriptions: Map<string, string[]> = new Map() // userId -> socketIds[]

  constructor(server?: NetServer) {
    if (server) {
      this.initializeSocket(server)
    }
  }

  private initializeSocket(server: NetServer): void {
    this.io = new ServerIO(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:3000'],
        methods: ['GET', 'POST']
      }
    })

    this.io.on('connection', (socket) => {
      console.log('User connected to notifications:', socket.id)

      // Handle user authentication for notifications
      socket.on('authenticate', (userId: string) => {
        if (userId) {
          this.subscribe(userId, socket.id)
          socket.emit('authenticated', { success: true })
        }
      })

      // Handle disconnection
      socket.on('disconnect', () => {
        this.unsubscribe(socket.id)
        console.log('User disconnected from notifications:', socket.id)
      })

      // Handle marking notifications as read
      socket.on('mark_read', async (notificationId: string) => {
        try {
          await this.markAsRead(notificationId)
          socket.emit('notification_read', { notificationId, success: true })
        } catch (error) {
          socket.emit('notification_read', { notificationId, success: false, error: error.message })
        }
      })

      // Handle marking all notifications as read
      socket.on('mark_all_read', async (userId: string) => {
        try {
          await this.markAllAsRead(userId)
          socket.emit('all_notifications_read', { success: true })
        } catch (error) {
          socket.emit('all_notifications_read', { success: false, error: error.message })
        }
      })
    })
  }

  // Subscribe user to notifications
  subscribe(userId: string, socketId: string): void {
    if (!this.subscriptions.has(userId)) {
      this.subscriptions.set(userId, [])
    }
    this.subscriptions.get(userId)!.push(socketId)
    console.log(`User ${userId} subscribed to notifications with socket ${socketId}`)
  }

  // Unsubscribe socket from notifications
  unsubscribe(socketId: string): void {
    for (const [userId, sockets] of this.subscriptions.entries()) {
      const index = sockets.indexOf(socketId)
      if (index > -1) {
        sockets.splice(index, 1)
        if (sockets.length === 0) {
          this.subscriptions.delete(userId)
        }
      }
    }
  }

  // Create and send notification
  async create(
    userId: string,
    data: NotificationData
  ): Promise<{ notification: any; sent: boolean }> {
    try {
      // Create notification in database
      const notification = await db.notification.create({
        data: {
          userId,
          type: data.type,
          title: data.title,
          message: data.message,
          data: data.data ? JSON.stringify(data.data) : null,
          priority: data.priority || 'medium',
          actionUrl: data.actionUrl,
          actionText: data.actionText,
          expiresAt: data.expiresAt
        }
      })

      // Send real-time notification if user is connected
      let sent = false
      if (this.io && this.subscriptions.has(userId)) {
        const socketIds = this.subscriptions.get(userId)!
        for (const socketId of socketIds) {
          this.io!.to(socketId).emit('notification', {
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            data: notification.data ? JSON.parse(notification.data) : null,
            priority: notification.priority,
            actionUrl: notification.actionUrl,
            actionText: notification.actionText,
            createdAt: notification.createdAt,
            isRead: notification.isRead
          })
          sent = true
        }
      }

      return { notification, sent }
    } catch (error) {
      console.error('Error creating notification:', error)
      throw error
    }
  }

  // Send notification to multiple users
  async createBulk(
    userIds: string[],
    data: NotificationData
  ): Promise<{ notifications: any[]; sentCount: number }> {
    const results = await Promise.all(
      userIds.map(userId => this.create(userId, data))
    )

    return {
      notifications: results.map(r => r.notification),
      sentCount: results.filter(r => r.sent).length
    }
  }

  // Send notification to all users (admin only)
  async createBroadcast(
    data: NotificationData,
    excludeUserIds: string[] = []
  ): Promise<{ notifications: any[]; sentCount: number }> {
    // Get all users except excluded ones
    const users = await db.user.findMany({
      where: {
        id: { notIn: excludeUserIds },
        isActive: true
      },
      select: { id: true }
    })

    const userIds = users.map(u => u.id)
    return await this.createBulk(userIds, data)
  }

  // Get user notifications
  async getUserNotifications(
    userId: string,
    options: {
      page?: number
      limit?: number
      unreadOnly?: boolean
      type?: string
      priority?: string
    } = {}
  ): Promise<{ notifications: any[]; pagination: any }> {
    const { page = 1, limit = 20, unreadOnly = false, type, priority } = options
    const skip = (page - 1) * limit

    const where: any = {
      userId,
      ...(unreadOnly && { isRead: false }),
      ...(type && { type }),
      ...(priority && { priority })
    }

    const [notifications, total] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      }),
      db.notification.count({ where })
    ])

    // Parse JSON data for each notification
    const processedNotifications = notifications.map(notification => ({
      ...notification,
      data: notification.data ? JSON.parse(notification.data) : null
    }))

    return {
      notifications: processedNotifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    await db.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    })
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string): Promise<void> {
    await db.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    })
  }

  // Delete notification
  async delete(notificationId: string, userId?: string): Promise<void> {
    const where: any = { id: notificationId }
    if (userId) {
      where.userId = userId
    }

    await db.notification.delete({ where })
  }

  // Delete expired notifications
  async cleanupExpired(): Promise<void> {
    await db.notification.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    })
  }

  // Get unread count for user
  async getUnreadCount(userId: string): Promise<number> {
    return await db.notification.count({
      where: {
        userId,
        isRead: false
      }
    })
  }

  // Create system notification
  async createSystemNotification(
    data: NotificationData & { userIds?: string[] }
  ): Promise<{ notifications: any[]; sentCount: number }> {
    if (data.userIds && data.userIds.length > 0) {
      return await this.createBulk(data.userIds, data)
    } else {
      return await this.createBroadcast(data)
    }
  }

  // Helper methods for common notification types
  async sendWelcomeNotification(userId: string, userName: string): Promise<void> {
    await this.create(userId, {
      type: 'success',
      title: 'Welcome to GirlsPreneur!',
      message: `Hi ${userName}! Welcome to our community of women entrepreneurs.`,
      priority: 'high',
      actionUrl: '/dashboard',
      actionText: 'Get Started'
    })
  }

  async sendCourseEnrollmentNotification(
    userId: string,
    courseName: string,
    instructorName: string
  ): Promise<void> {
    await this.create(userId, {
      type: 'success',
      title: 'Course Enrollment Confirmed',
      message: `You have successfully enrolled in "${courseName}" by ${instructorName}.`,
      priority: 'medium',
      actionUrl: '/courses',
      actionText: 'View Courses'
    })
  }

  async sendMentorshipRequestNotification(
    mentorId: string,
    menteeName: string,
    mentorshipType: string
  ): Promise<void> {
    await this.create(mentorId, {
      type: 'info',
      title: 'New Mentorship Request',
      message: `${menteeName} has requested ${mentorshipType} mentorship.`,
      priority: 'medium',
      actionUrl: '/mentorship',
      actionText: 'View Request'
    })
  }

  async sendPaymentSuccessNotification(
    userId: string,
    amount: number,
    description: string
  ): Promise<void> {
    await this.create(userId, {
      type: 'success',
      title: 'Payment Successful',
      message: `Your payment of $${amount} for ${description} has been processed successfully.`,
      priority: 'high',
      actionUrl: '/orders',
      actionText: 'View Orders'
    })
  }

  async sendEventReminderNotification(
    userId: string,
    eventTitle: string,
    eventDate: Date
  ): Promise<void> {
    await this.create(userId, {
      type: 'info',
      title: 'Event Reminder',
      message: `Reminder: "${eventTitle}" is starting soon.`,
      priority: 'medium',
      actionUrl: '/events',
      actionText: 'View Event'
    })
  }

  async sendSecurityAlertNotification(
    userId: string,
    alertType: string,
    message: string
  ): Promise<void> {
    await this.create(userId, {
      type: 'warning',
      title: `Security Alert: ${alertType}`,
      message,
      priority: 'high',
      actionUrl: '/profile/security',
      actionText: 'Review Security'
    })
  }
}

// Global notification service instance
export let notificationService: NotificationService

// Initialize notification service
export function initializeNotifications(server: NetServer): void {
  notificationService = new NotificationService(server)
  
  // Clean up expired notifications every hour
  setInterval(async () => {
    try {
      await notificationService.cleanupExpired()
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error)
    }
  }, 60 * 60 * 1000)
}