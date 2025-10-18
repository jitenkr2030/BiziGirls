import { db } from '@/lib/db'

export interface PaymentProvider {
  name: string
  createPayment: (options: PaymentOptions) => Promise<PaymentResult>
  processPayment: (paymentId: string, paymentMethod: PaymentMethod) => Promise<PaymentResult>
  refundPayment: (paymentId: string, amount?: number) => Promise<RefundResult>
  getPaymentStatus: (paymentId: string) => Promise<PaymentStatus>
}

export interface PaymentOptions {
  amount: number
  currency: string
  description: string
  metadata?: Record<string, any>
  customerId?: string
  returnUrl?: string
  cancelUrl?: string
}

export interface PaymentMethod {
  type: 'card' | 'bank_transfer' | 'wallet'
  card?: {
    number: string
    expiry: string
    cvv: string
    name: string
  }
  bankAccount?: {
    accountNumber: string
    routingNumber: string
    accountHolder: string
  }
}

export interface PaymentResult {
  success: boolean
  paymentId?: string
  paymentUrl?: string
  error?: string
  status?: 'pending' | 'succeeded' | 'failed' | 'cancelled'
}

export interface RefundResult {
  success: boolean
  refundId?: string
  error?: string
}

export interface PaymentStatus {
  id: string
  status: 'pending' | 'succeeded' | 'failed' | 'cancelled' | 'refunded'
  amount: number
  currency: string
  description: string
  createdAt: Date
  processedAt?: Date
  refundedAt?: Date
  refundAmount?: number
}

// Mock payment provider (in production, integrate with Stripe, PayPal, etc.)
class MockPaymentProvider implements PaymentProvider {
  name = 'MockPayment'

  async createPayment(options: PaymentOptions): Promise<PaymentResult> {
    try {
      // Generate a unique payment ID
      const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const paymentUrl = `https://pay.example.com/${paymentId}`

      // Store payment details in database
      await db.payment.create({
        data: {
          paymentId,
          amount: options.amount,
          currency: options.currency,
          description: options.description,
          status: 'pending',
          provider: this.name,
          metadata: options.metadata ? JSON.stringify(options.metadata) : null,
          customerId: options.customerId,
          createdAt: new Date()
        }
      })

      return {
        success: true,
        paymentId,
        paymentUrl,
        status: 'pending'
      }
    } catch (error) {
      console.error('Error creating payment:', error)
      return {
        success: false,
        error: 'Failed to create payment'
      }
    }
  }

  async processPayment(paymentId: string, paymentMethod: PaymentMethod): Promise<PaymentResult> {
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Get payment from database
      const payment = await db.payment.findUnique({
        where: { paymentId }
      })

      if (!payment) {
        return {
          success: false,
          error: 'Payment not found'
        }
      }

      if (payment.status !== 'pending') {
        return {
          success: false,
          error: 'Payment already processed'
        }
      }

      // Simulate payment success/failure (90% success rate)
      const isSuccess = Math.random() > 0.1

      const status = isSuccess ? 'succeeded' : 'failed'

      // Update payment status
      await db.payment.update({
        where: { paymentId },
        data: {
          status,
          processedAt: new Date(),
          paymentMethod: JSON.stringify(paymentMethod)
        }
      })

      return {
        success: isSuccess,
        paymentId,
        status
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      return {
        success: false,
        error: 'Failed to process payment'
      }
    }
  }

  async refundPayment(paymentId: string, amount?: number): Promise<RefundResult> {
    try {
      // Get payment from database
      const payment = await db.payment.findUnique({
        where: { paymentId }
      })

      if (!payment) {
        return {
          success: false,
          error: 'Payment not found'
        }
      }

      if (payment.status !== 'succeeded') {
        return {
          success: false,
          error: 'Payment cannot be refunded'
        }
      }

      const refundAmount = amount || payment.amount
      const refundId = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Update payment status
      await db.payment.update({
        where: { paymentId },
        data: {
          status: 'refunded',
          refundedAt: new Date(),
          refundAmount
        }
      })

      return {
        success: true,
        refundId
      }
    } catch (error) {
      console.error('Error refunding payment:', error)
      return {
        success: false,
        error: 'Failed to refund payment'
      }
    }
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    try {
      const payment = await db.payment.findUnique({
        where: { paymentId }
      })

      if (!payment) {
        throw new Error('Payment not found')
      }

      return {
        id: payment.paymentId,
        status: payment.status as any,
        amount: payment.amount,
        currency: payment.currency,
        description: payment.description,
        createdAt: payment.createdAt,
        processedAt: payment.processedAt,
        refundedAt: payment.refundedAt,
        refundAmount: payment.refundAmount
      }
    } catch (error) {
      console.error('Error getting payment status:', error)
      throw error
    }
  }
}

// Payment service
export class PaymentService {
  private provider: PaymentProvider

  constructor(provider?: PaymentProvider) {
    this.provider = provider || new MockPaymentProvider()
  }

  async createMentorshipPayment(
    mentorshipId: string,
    amount: number,
    options: PaymentOptions = {}
  ): Promise<PaymentResult> {
    try {
      // Get mentorship details
      const mentorship = await db.mentorship.findUnique({
        where: { id: mentorshipId },
        include: {
          mentor: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          mentee: {
            select: {
              firstName: true,
              lastName: true,
              id: true
            }
          }
        }
      })

      if (!mentorship) {
        throw new Error('Mentorship not found')
      }

      // Set default options
      const paymentOptions: PaymentOptions = {
        amount,
        currency: 'USD',
        description: `Mentorship with ${mentorship.mentor.firstName} ${mentorship.mentor.lastName}`,
        metadata: {
          mentorshipId,
          mentorId: mentorship.mentorId,
          menteeId: mentorship.menteeId,
          type: 'mentorship'
        },
        customerId: mentorship.menteeId,
        ...options
      }

      // Create payment with provider
      const paymentResult = await this.provider.createPayment(paymentOptions)

      if (paymentResult.success && paymentResult.paymentId) {
        // Update mentorship with payment info
        await db.mentorship.update({
          where: { id: mentorshipId },
          data: {
            paymentId: paymentResult.paymentId,
            paymentStatus: paymentResult.status
          }
        })
      }

      return paymentResult
    } catch (error) {
      console.error('Error creating mentorship payment:', error)
      throw error
    }
  }

  async createSessionPayment(
    sessionId: string,
    amount: number,
    options: PaymentOptions = {}
  ): Promise<PaymentResult> {
    try {
      // Get session details
      const session = await db.mentorshipSession.findUnique({
        where: { id: sessionId },
        include: {
          mentorship: {
            include: {
              mentor: {
                select: {
                  firstName: true,
                  lastName: true
                }
              },
              mentee: {
                select: {
                  firstName: true,
                  lastName: true,
                  id: true
                }
              }
            }
          }
        }
      })

      if (!session) {
        throw new Error('Session not found')
      }

      // Set default options
      const paymentOptions: PaymentOptions = {
        amount,
        currency: 'USD',
        description: `Session with ${session.mentorship.mentor.firstName} ${session.mentorship.mentor.lastName}`,
        metadata: {
          sessionId,
          mentorshipId: session.mentorshipId,
          mentorId: session.mentorship.mentorId,
          menteeId: session.mentorship.menteeId,
          type: 'session'
        },
        customerId: session.mentorship.menteeId,
        ...options
      }

      // Create payment with provider
      const paymentResult = await this.provider.createPayment(paymentOptions)

      if (paymentResult.success && paymentResult.paymentId) {
        // Update session with payment info
        await db.mentorshipSession.update({
          where: { id: sessionId },
          data: {
            paymentId: paymentResult.paymentId,
            paymentStatus: paymentResult.status
          }
        })
      }

      return paymentResult
    } catch (error) {
      console.error('Error creating session payment:', error)
      throw error
    }
  }

  async processPayment(paymentId: string, paymentMethod: PaymentMethod): Promise<PaymentResult> {
    try {
      const result = await this.provider.processPayment(paymentId, paymentMethod)

      if (result.success) {
        // Update related records based on payment metadata
        const payment = await db.payment.findUnique({
          where: { paymentId }
        })

        if (payment && payment.metadata) {
          const metadata = JSON.parse(payment.metadata)

          if (metadata.type === 'mentorship' && metadata.mentorshipId) {
            await db.mentorship.update({
              where: { id: metadata.mentorshipId },
              data: { paymentStatus: result.status }
            })
          } else if (metadata.type === 'session' && metadata.sessionId) {
            await db.mentorshipSession.update({
              where: { id: metadata.sessionId },
              data: { paymentStatus: result.status }
            })
          }
        }
      }

      return result
    } catch (error) {
      console.error('Error processing payment:', error)
      throw error
    }
  }

  async refundPayment(paymentId: string, amount?: number): Promise<RefundResult> {
    try {
      return await this.provider.refundPayment(paymentId, amount)
    } catch (error) {
      console.error('Error refunding payment:', error)
      throw error
    }
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    try {
      return await this.provider.getPaymentStatus(paymentId)
    } catch (error) {
      console.error('Error getting payment status:', error)
      throw error
    }
  }
}

// Export singleton instance
export const paymentService = new PaymentService()