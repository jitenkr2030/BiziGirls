import { db } from '@/lib/db'
import { paymentService } from './payments'

export interface InvoiceItem {
  description: string
  amount: number
  quantity?: number
  currency?: string
}

export interface InvoiceOptions {
  dueDate?: Date
  notes?: string
  metadata?: Record<string, string>
  autoSend?: boolean
}

export class InvoiceGenerator {
  // Generate invoice number
  private generateInvoiceNumber(): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 8)
    return `INV-${timestamp}-${random}`.toUpperCase()
  }

  // Create invoice from subscription
  async createSubscriptionInvoice(
    subscriptionId: string,
    options: InvoiceOptions = {}
  ): Promise<{
    invoice: any
    invoiceUrl?: string
  }> {
    const subscription = await db.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        user: true
      }
    })

    if (!subscription) {
      throw new Error('Subscription not found')
    }

    // Get or create Stripe customer
    const customerId = await paymentService.createCustomer(
      subscription.userId,
      subscription.user.email,
      `${subscription.user.firstName} ${subscription.user.lastName}`
    )

    // Create invoice items
    const items: InvoiceItem[] = [{
      description: `${subscription.planName} - ${subscription.interval}ly subscription`,
      amount: subscription.price,
      currency: subscription.currency
    }]

    // Create invoice in Stripe
    const stripeInvoice = await paymentService.createInvoice({
      customerId,
      items,
      dueDate: options.dueDate,
      metadata: {
        subscriptionId,
        userId: subscription.userId,
        ...options.metadata
      }
    })

    // Store invoice in database
    const invoice = await db.invoice.create({
      data: {
        userId: subscription.userId,
        invoiceNumber: this.generateInvoiceNumber(),
        subscriptionId: subscription.id,
        amount: stripeInvoice.amount,
        currency: stripeInvoice.currency,
        status: stripeInvoice.status,
        dueDate: options.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        items: JSON.stringify(items),
        notes: options.notes,
        stripeInvoiceId: stripeInvoice.invoiceId,
        stripePaymentIntentId: (stripeInvoice as any).payment_intent?.id,
        metadata: JSON.stringify({
          subscriptionId,
          userId: subscription.userId,
          ...options.metadata
        })
      }
    })

    return {
      invoice,
      invoiceUrl: stripeInvoice.invoiceUrl
    }
  }

  // Create custom invoice
  async createCustomInvoice(
    userId: string,
    items: InvoiceItem[],
    options: InvoiceOptions = {}
  ): Promise<{
    invoice: any
    invoiceUrl?: string
  }> {
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Get or create Stripe customer
    const customerId = await paymentService.createCustomer(
      userId,
      user.email,
      `${user.firstName} ${user.lastName}`
    )

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => {
      const quantity = item.quantity || 1
      return sum + (item.amount * quantity)
    }, 0)

    // Create invoice in Stripe
    const stripeInvoice = await paymentService.createInvoice({
      customerId,
      items: items.map(item => ({
        description: item.description,
        amount: item.amount * (item.quantity || 1),
        currency: item.currency || 'usd'
      })),
      dueDate: options.dueDate,
      metadata: {
        userId,
        ...options.metadata
      }
    })

    // Store invoice in database
    const invoice = await db.invoice.create({
      data: {
        userId,
        invoiceNumber: this.generateInvoiceNumber(),
        amount: totalAmount,
        currency: items[0]?.currency || 'usd',
        status: stripeInvoice.status,
        dueDate: options.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        items: JSON.stringify(items),
        notes: options.notes,
        stripeInvoiceId: stripeInvoice.invoiceId,
        stripePaymentIntentId: (stripeInvoice as any).payment_intent?.id,
        metadata: JSON.stringify({
          userId,
          ...options.metadata
        })
      }
    })

    return {
      invoice,
      invoiceUrl: stripeInvoice.invoiceUrl
    }
  }

  // Generate invoice PDF (placeholder - would integrate with PDF generation library)
  async generateInvoicePDF(invoiceId: string): Promise<Buffer> {
    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        user: true,
        subscription: true
      }
    })

    if (!invoice) {
      throw new Error('Invoice not found')
    }

    // This is a placeholder implementation
    // In production, you would use a library like PDFKit, Puppeteer, or a service
    const pdfContent = `
      INVOICE
      ========
      
      Invoice Number: ${invoice.invoiceNumber}
      Date: ${invoice.createdAt.toLocaleDateString()}
      Due Date: ${invoice.dueDate.toLocaleDateString()}
      
      Bill To:
      ${invoice.user.firstName} ${invoice.user.lastName}
      ${invoice.user.email}
      
      Items:
      ${JSON.parse(invoice.items || '[]').map((item: any) => 
        `${item.description}: $${item.amount}`
      ).join('\n')}
      
      Total: $${invoice.amount}
      
      Status: ${invoice.status}
    `

    return Buffer.from(pdfContent)
  }

  // Send invoice email (placeholder)
  async sendInvoiceEmail(invoiceId: string): Promise<void> {
    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        user: true
      }
    })

    if (!invoice) {
      throw new Error('Invoice not found')
    }

    // This is a placeholder implementation
    // In production, you would integrate with an email service
    console.log(`Sending invoice ${invoice.invoiceNumber} to ${invoice.user.email}`)
    
    // Update invoice status
    await db.invoice.update({
      where: { id: invoiceId },
      data: { status: 'sent' }
    })
  }

  // Get user invoices
  async getUserInvoices(
    userId: string,
    options: {
      page?: number
      limit?: number
      status?: string
    } = {}
  ): Promise<{
    invoices: any[]
    pagination: any
  }> {
    const { page = 1, limit = 20, status } = options
    const skip = (page - 1) * limit

    const where: any = { userId }
    if (status) {
      where.status = status
    }

    const [invoices, total] = await Promise.all([
      db.invoice.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          subscription: {
            select: {
              id: true,
              planName: true,
              status: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.invoice.count({ where })
    ])

    // Parse JSON items for each invoice
    const processedInvoices = invoices.map(invoice => ({
      ...invoice,
      items: invoice.items ? JSON.parse(invoice.items) : [],
      metadata: invoice.metadata ? JSON.parse(invoice.metadata) : null
    }))

    return {
      invoices: processedInvoices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  // Update invoice status
  async updateInvoiceStatus(
    invoiceId: string,
    status: string,
    additionalData?: {
      paidAt?: Date
      refundedAt?: Date
      cancelledAt?: Date
    }
  ): Promise<void> {
    const updateData: any = { status }
    
    if (additionalData) {
      Object.assign(updateData, additionalData)
    }

    await db.invoice.update({
      where: { id: invoiceId },
      data: updateData
    })
  }

  // Generate recurring invoices for active subscriptions
  async generateRecurringInvoices(): Promise<number> {
    const now = new Date()
    const activeSubscriptions = await db.subscription.findMany({
      where: {
        status: 'active',
        currentPeriodEnd: {
          lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // Within 7 days
        }
      }
    })

    let generatedCount = 0

    for (const subscription of activeSubscriptions) {
      try {
        await this.createSubscriptionInvoice(subscription.id, {
          dueDate: subscription.currentPeriodEnd,
          autoSend: true
        })
        generatedCount++
      } catch (error) {
        console.error(`Failed to generate invoice for subscription ${subscription.id}:`, error)
      }
    }

    return generatedCount
  }

  // Get invoice statistics
  async getInvoiceStatistics(userId?: string): Promise<{
    totalInvoices: number
    paidInvoices: number
    overdueInvoices: number
    totalRevenue: number
    averageInvoiceAmount: number
  }> {
    const where = userId ? { userId } : {}

    const [
      totalInvoices,
      paidInvoices,
      overdueInvoices,
      invoices
    ] = await Promise.all([
      db.invoice.count({ where }),
      db.invoice.count({ where: { ...where, status: 'paid' } }),
      db.invoice.count({ 
        where: { 
          ...where, 
          status: 'overdue',
          dueDate: { lt: new Date() }
        } 
      }),
      db.invoice.findMany({ where })
    ])

    const totalRevenue = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.amount, 0)

    const averageInvoiceAmount = totalInvoices > 0 ? 
      invoices.reduce((sum, inv) => sum + inv.amount, 0) / totalInvoices : 0

    return {
      totalInvoices,
      paidInvoices,
      overdueInvoices,
      totalRevenue,
      averageInvoiceAmount
    }
  }
}

// Export singleton instance
export const invoiceGenerator = new InvoiceGenerator()