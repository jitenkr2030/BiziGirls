import { db } from '@/lib/db'
import Stripe from 'stripe'

// Initialize Stripe only if secret key is available
let stripe: Stripe | null = null

if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-11-20.acacia',
  })
} else {
  console.warn('STRIPE_SECRET_KEY not found. Payment features will be disabled.')
}

export interface PaymentIntentData {
  amount: number
  currency?: string
  description?: string
  metadata?: Record<string, string>
  customerId?: string
  paymentMethodId?: string
}

export interface SubscriptionData {
  priceId: string
  customerId?: string
  paymentMethodId?: string
  trialPeriodDays?: number
  metadata?: Record<string, string>
}

export interface InvoiceData {
  customerId: string
  items: Array<{
    description: string
    amount: number
    currency?: string
  }>
  dueDate?: Date
  metadata?: Record<string, string>
}

export class PaymentService {
  // Check if Stripe is initialized
  private checkStripeInitialized(): void {
    if (!stripe) {
      throw new Error('Stripe is not initialized. Please set STRIPE_SECRET_KEY environment variable.')
    }
  }

  // Create a payment intent
  async createPaymentIntent(data: PaymentIntentData): Promise<{
    clientSecret: string
    paymentIntentId: string
    amount: number
    currency: string
  }> {
    this.checkStripeInitialized()
    
    const paymentIntent = await stripe!.paymentIntents.create({
      amount: Math.round(data.amount * 100), // Convert to cents
      currency: data.currency || 'usd',
      description: data.description,
      metadata: data.metadata,
      customer: data.customerId,
      payment_method: data.paymentMethodId,
      setup_future_usage: data.paymentMethodId ? 'off_session' : undefined,
    })

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
      amount: data.amount,
      currency: data.currency || 'usd',
    }
  }

  // Create or retrieve Stripe customer
  async createCustomer(userId: string, email: string, name?: string): Promise<string> {
    this.checkStripeInitialized()
    
    // Check if user already has a Stripe customer ID
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true }
    })

    if (user?.stripeCustomerId) {
      return user.stripeCustomerId
    }

    // Create new Stripe customer
    const customer = await stripe!.customers.create({
      email,
      name,
      metadata: {
        userId,
      },
    })

    // Update user with Stripe customer ID
    await db.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customer.id }
    })

    return customer.id
  }

  // Attach payment method to customer
  async attachPaymentMethod(
    paymentMethodId: string,
    customerId: string
  ): Promise<void> {
    this.checkStripeInitialized()
    
    await stripe!.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    })

    // Set as default payment method
    await stripe!.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    })
  }

  // Create subscription
  async createSubscription(
    userId: string,
    data: SubscriptionData
  ): Promise<{
    subscriptionId: string
    clientSecret: string
    status: string
    currentPeriodStart: Date
    currentPeriodEnd: Date
  }> {
    this.checkStripeInitialized()
    
    // Get or create customer
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true, lastName: true, stripeCustomerId: true }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const customerId = await this.createCustomer(
      userId,
      user.email,
      `${user.firstName} ${user.lastName}`
    )

    // Attach payment method if provided
    if (data.paymentMethodId) {
      await this.attachPaymentMethod(data.paymentMethodId, customerId)
    }

    // Create subscription
    const subscriptionData: any = {
      customer: customerId,
      items: [{ price: data.priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
      metadata: data.metadata,
    }

    if (data.trialPeriodDays) {
      subscriptionData.trial_period_days = data.trialPeriodDays
    }

    const subscription = await stripe!.subscriptions.create(subscriptionData)

    // Store subscription in database
    const price = await stripe!.prices.retrieve(data.priceId)
    const product = await stripe!.products.retrieve(price.product as string)

    await db.subscription.create({
      data: {
        userId,
        planId: data.priceId,
        planName: product.name,
        description: product.description,
        price: price.unit_amount ? price.unit_amount / 100 : 0,
        currency: price.currency,
        interval: price.recurring?.interval || 'month',
        intervalCount: price.recurring?.interval_count || 1,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: customerId,
        metadata: JSON.stringify(data.metadata),
      },
    })

    const latestInvoice = subscription.latest_invoice as any
    const paymentIntent = latestInvoice.payment_intent

    return {
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string, immediately = false): Promise<void> {
    this.checkStripeInitialized()
    
    const subscription = await stripe!.subscriptions.retrieve(subscriptionId)

    if (immediately) {
      await stripe!.subscriptions.cancel(subscriptionId)
    } else {
      await stripe!.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      })
    }

    // Update database
    await db.subscription.updateMany({
      where: { stripeSubscriptionId: subscriptionId },
      data: {
        status: immediately ? 'cancelled' : 'active',
        cancelledAt: immediately ? new Date() : null,
      },
    })
  }

  // Create invoice
  async createInvoice(data: InvoiceData): Promise<{
    invoiceId: string
    invoiceUrl: string
    amount: number
    currency: string
    status: string
  }> {
    this.checkStripeInitialized()
    
    const invoiceItems = await Promise.all(
      data.items.map(item =>
        stripe!.invoiceItems.create({
          customer: data.customerId,
          description: item.description,
          amount: Math.round(item.amount * 100),
          currency: item.currency || 'usd',
        })
      )
    )

    const invoice = await stripe!.invoices.create({
      customer: data.customerId,
      auto_advance: true,
      collection_method: 'send_invoice',
      days_until_due: data.dueDate ? 
        Math.ceil((data.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 
        30,
      metadata: data.metadata,
    })

    return {
      invoiceId: invoice.id,
      invoiceUrl: invoice.hosted_invoice_url!,
      amount: invoice.total / 100,
      currency: invoice.currency,
      status: invoice.status,
    }
  }

  // Process refund
  async createRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: string
  ): Promise<{
    refundId: string
    amount: number
    status: string
  }> {
    this.checkStripeInitialized()
    
    const refund = await stripe!.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
      reason: reason as any,
    })

    return {
      refundId: refund.id,
      amount: refund.amount / 100,
      status: refund.status,
    }
  }

  // Get payment methods for customer
  async getPaymentMethods(customerId: string): Promise<any[]> {
    this.checkStripeInitialized()
    
    const paymentMethods = await stripe!.paymentMethods.list({
      customer: customerId,
      type: 'card',
    })

    return paymentMethods.data
  }

  // Setup payment method for future use
  async setupPaymentMethod(
    userId: string,
    paymentMethodId: string
  ): Promise<void> {
    this.checkStripeInitialized()
    
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true }
    })

    if (!user?.stripeCustomerId) {
      throw new Error('User has no Stripe customer ID')
    }

    await this.attachPaymentMethod(paymentMethodId, user.stripeCustomerId)

    // Store payment method in database
    const paymentMethod = await stripe!.paymentMethods.retrieve(paymentMethodId)

    await db.paymentMethod.create({
      data: {
        userId,
        type: 'card',
        provider: 'stripe',
        isDefault: true, // Set as default since it's the first one
        last4: paymentMethod.card?.last4,
        brand: paymentMethod.card?.brand,
        expMonth: paymentMethod.card?.exp_month,
        expYear: paymentMethod.card?.exp_year,
        stripePaymentMethodId: paymentMethodId,
      },
    })
  }

  // Handle webhook events
  async handleWebhook(event: Stripe.Event): Promise<void> {
    this.checkStripeInitialized()
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break
      case 'payment_intent.payment_failed':
        await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break
      case 'customer.subscription.created':
        await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      case 'invoice.payment_succeeded':
        await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break
      default:
        console.log(`Unhandled webhook event type: ${event.type}`)
    }
  }

  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    // Update payment status in database
    await db.payment.updateMany({
      where: { paymentId: paymentIntent.id },
      data: {
        status: 'succeeded',
        processedAt: new Date(),
      },
    })

    // Send notification to user
    if (paymentIntent.metadata?.userId) {
      const notificationService = (await import('@/lib/notifications')).notificationService
      await notificationService.sendPaymentSuccessNotification(
        paymentIntent.metadata.userId,
        paymentIntent.amount / 100,
        paymentIntent.description || 'Payment'
      )
    }
  }

  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    // Update payment status in database
    await db.payment.updateMany({
      where: { paymentId: paymentIntent.id },
      data: {
        status: 'failed',
      },
    })
  }

  private async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    // Subscription is already created in the createSubscription method
    console.log(`Subscription created: ${subscription.id}`)
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    // Update subscription in database
    await db.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        endedAt: subscription.ended_at ? new Date(subscription.ended_at * 1000) : null,
      },
    })
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    // Update subscription in database
    await db.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: 'cancelled',
        endedAt: new Date(),
      },
    })
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    // Update invoice status in database
    await db.invoice.updateMany({
      where: { stripeInvoiceId: invoice.id },
      data: {
        status: 'paid',
        paidAt: new Date(),
      },
    })
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    // Update invoice status in database
    await db.invoice.updateMany({
      where: { stripeInvoiceId: invoice.id },
      data: {
        status: 'overdue',
      },
    })
  }

  // Verify webhook signature
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    this.checkStripeInitialized()
    
    try {
      stripe!.webhooks.constructEvent(payload, signature, secret)
      return true
    } catch (error) {
      console.error('Webhook signature verification failed:', error)
      return false
    }
  }
}

// Export singleton instance
export const paymentService = new PaymentService()