import { db } from '@/lib/db'
import { paymentService } from './payments'

export interface RefundData {
  paymentId: string
  amount?: number
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer' | 'expired_uncaptured_charge'
  notes?: string
}

export interface RefundPolicy {
  maxRefundPeriod: number // in days
  autoApprovalThreshold: number // amount below which refunds are auto-approved
  requireApproval: boolean
  allowedReasons: string[]
}

export class RefundService {
  private defaultPolicy: RefundPolicy = {
    maxRefundPeriod: 30, // 30 days
    autoApprovalThreshold: 100, // $100
    requireApproval: true,
    allowedReasons: [
      'duplicate',
      'fraudulent', 
      'requested_by_customer',
      'expired_uncaptured_charge',
      'product_not_as_described',
      'service_not_rendered',
      'other'
    ]
  }

  // Create refund request
  async createRefund(
    userId: string,
    data: RefundData,
    isAdmin = false
  ): Promise<{
    refund: any
    requiresApproval: boolean
    status: string
  }> {
    // Get payment details
    const payment = await db.payment.findFirst({
      where: {
        paymentId: data.paymentId,
        ...(isAdmin ? {} : { customerId: userId })
      }
    })

    if (!payment) {
      throw new Error('Payment not found')
    }

    if (payment.status !== 'succeeded') {
      throw new Error('Payment must be successful to process refund')
    }

    // Check if refund is within allowed period
    const paymentDate = new Date(payment.processedAt || payment.createdAt)
    const now = new Date()
    const daysSincePayment = Math.floor((now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysSincePayment > this.defaultPolicy.maxRefundPeriod) {
      throw new Error(`Refund period expired. Maximum refund period is ${this.defaultPolicy.maxRefundPeriod} days`)
    }

    // Check if refund already exists for this payment
    const existingRefund = await db.refund.findFirst({
      where: { paymentId: data.paymentId }
    })

    if (existingRefund) {
      throw new Error('Refund already exists for this payment')
    }

    // Determine if approval is required
    const requiresApproval = this.defaultPolicy.requireApproval && 
      (data.amount || payment.amount) > this.defaultPolicy.autoApprovalThreshold

    // Create refund record
    const refund = await db.refund.create({
      data: {
        paymentId: data.paymentId,
        amount: data.amount || payment.amount,
        currency: payment.currency,
        reason: data.reason || 'requested_by_customer',
        notes: data.notes,
        status: requiresApproval ? 'pending' : 'approved',
        requestedBy: userId,
        requiresApproval,
        processedAt: requiresApproval ? null : new Date()
      }
    })

    // Process refund if auto-approved
    let processedRefund = null
    if (!requiresApproval) {
      try {
        processedRefund = await this.processRefund(refund.id)
      } catch (error) {
        console.error('Error processing auto-approved refund:', error)
        // Update refund status to failed
        await db.refund.update({
          where: { id: refund.id },
          data: { status: 'failed' }
        })
      }
    }

    return {
      refund: processedRefund || refund,
      requiresApproval,
      status: refund.status
    }
  }

  // Process refund (admin only)
  async processRefund(refundId: string): Promise<any> {
    const refund = await db.refund.findUnique({
      where: { id: refundId },
      include: {
        payment: true
      }
    })

    if (!refund) {
      throw new Error('Refund not found')
    }

    if (refund.status !== 'pending' && refund.status !== 'approved') {
      throw new Error('Refund must be pending or approved to process')
    }

    try {
      // Process refund with Stripe
      const stripeRefund = await paymentService.createRefund(
        refund.paymentId,
        refund.amount,
        refund.reason
      )

      // Update refund record
      const updatedRefund = await db.refund.update({
        where: { id: refundId },
        data: {
          status: stripeRefund.status,
          stripeRefundId: stripeRefund.refundId,
          processedAt: new Date()
        }
      })

      // Update payment record
      await db.payment.update({
        where: { paymentId: refund.paymentId },
        data: {
          status: 'refunded',
          refundedAt: new Date(),
          refundAmount: refund.amount
        }
      })

      // Update invoice if applicable
      const invoice = await db.invoice.findFirst({
        where: { stripePaymentIntentId: refund.paymentId }
      })

      if (invoice) {
        await db.invoice.update({
          where: { id: invoice.id },
          data: {
            status: 'refunded',
            refundedAt: new Date()
          }
        })
      }

      return updatedRefund
    } catch (error) {
      console.error('Error processing refund:', error)
      
      // Update refund status to failed
      await db.refund.update({
        where: { id: refundId },
        data: {
          status: 'failed',
          processedAt: new Date()
        }
      })

      throw error
    }
  }

  // Approve refund (admin only)
  async approveRefund(refundId: string, adminId: string): Promise<void> {
    const refund = await db.refund.findUnique({
      where: { id: refundId }
    })

    if (!refund) {
      throw new Error('Refund not found')
    }

    if (refund.status !== 'pending') {
      throw new Error('Refund must be pending to approve')
    }

    await db.refund.update({
      where: { id: refundId },
      data: {
        status: 'approved',
        approvedBy: adminId,
        approvedAt: new Date()
      }
    })
  }

  // Reject refund (admin only)
  async rejectRefund(refundId: string, adminId: string, reason: string): Promise<void> {
    const refund = await db.refund.findUnique({
      where: { id: refundId }
    })

    if (!refund) {
      throw new Error('Refund not found')
    }

    if (refund.status !== 'pending') {
      throw new Error('Refund must be pending to reject')
    }

    await db.refund.update({
      where: { id: refundId },
      data: {
        status: 'rejected',
        rejectedBy: adminId,
        rejectedAt: new Date(),
        rejectionReason: reason
      }
    })
  }

  // Get user refunds
  async getUserRefunds(
    userId: string,
    options: {
      page?: number
      limit?: number
      status?: string
    } = {}
  ): Promise<{
    refunds: any[]
    pagination: any
  }> {
    const { page = 1, limit = 20, status } = options
    const skip = (page - 1) * limit

    const where: any = { requestedBy: userId }
    if (status) {
      where.status = status
    }

    const [refunds, total] = await Promise.all([
      db.refund.findMany({
        where,
        include: {
          payment: {
            select: {
              id: true,
              amount: true,
              currency: true,
              description: true,
              createdAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.refund.count({ where })
    ])

    return {
      refunds,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  // Get all refunds (admin only)
  async getAllRefunds(
    options: {
      page?: number
      limit?: number
      status?: string
      userId?: string
    } = {}
  ): Promise<{
    refunds: any[]
    pagination: any
  }> {
    const { page = 1, limit = 20, status, userId } = options
    const skip = (page - 1) * limit

    const where: any = {}
    if (status) where.status = status
    if (userId) where.requestedBy = userId

    const [refunds, total] = await Promise.all([
      db.refund.findMany({
        where,
        include: {
          payment: {
            select: {
              id: true,
              amount: true,
              currency: true,
              description: true,
              createdAt: true,
              customer: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          },
          requester: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          approver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.refund.count({ where })
    ])

    return {
      refunds,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  // Get refund statistics
  async getRefundStatistics(userId?: string): Promise<{
    totalRefunds: number
    pendingRefunds: number
    approvedRefunds: number
    rejectedRefunds: number
    totalRefundedAmount: number
    averageRefundAmount: number
  }> {
    const where = userId ? { requestedBy: userId } : {}

    const [
      totalRefunds,
      pendingRefunds,
      approvedRefunds,
      rejectedRefunds,
      refunds
    ] = await Promise.all([
      db.refund.count({ where }),
      db.refund.count({ where: { ...where, status: 'pending' } }),
      db.refund.count({ where: { ...where, status: 'approved' } }),
      db.refund.count({ where: { ...where, status: 'rejected' } }),
      db.refund.findMany({ 
        where: { ...where, status: 'succeeded' },
        select: { amount: true }
      })
    ])

    const totalRefundedAmount = refunds.reduce((sum, refund) => sum + refund.amount, 0)
    const averageRefundAmount = refunds.length > 0 ? totalRefundedAmount / refunds.length : 0

    return {
      totalRefunds,
      pendingRefunds,
      approvedRefunds,
      rejectedRefunds,
      totalRefundedAmount,
      averageRefundAmount
    }
  }

  // Get refund policy
  getRefundPolicy(): RefundPolicy {
    return { ...this.defaultPolicy }
  }

  // Update refund policy (admin only)
  async updateRefundPolicy(policy: Partial<RefundPolicy>): Promise<void> {
    // In a real implementation, this would be stored in the database
    // For now, we'll update the in-memory policy
    Object.assign(this.defaultPolicy, policy)
  }

  // Check if refund is eligible
  async checkRefundEligibility(paymentId: string, userId?: string): Promise<{
    eligible: boolean
    reason?: string
    daysRemaining?: number
    maxRefundAmount?: number
  }> {
    const payment = await db.payment.findFirst({
      where: {
        paymentId,
        ...(userId ? { customerId: userId } : {})
      }
    })

    if (!payment) {
      return { eligible: false, reason: 'Payment not found' }
    }

    if (payment.status !== 'succeeded') {
      return { eligible: false, reason: 'Payment must be successful to refund' }
    }

    // Check if refund already exists
    const existingRefund = await db.refund.findFirst({
      where: { paymentId }
    })

    if (existingRefund) {
      return { eligible: false, reason: 'Refund already exists for this payment' }
    }

    // Check refund period
    const paymentDate = new Date(payment.processedAt || payment.createdAt)
    const now = new Date()
    const daysSincePayment = Math.floor((now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24))
    const daysRemaining = Math.max(0, this.defaultPolicy.maxRefundPeriod - daysSincePayment)

    if (daysRemaining <= 0) {
      return { eligible: false, reason: 'Refund period expired' }
    }

    return {
      eligible: true,
      daysRemaining,
      maxRefundAmount: payment.amount
    }
  }
}

// Export singleton instance
export const refundService = new RefundService()