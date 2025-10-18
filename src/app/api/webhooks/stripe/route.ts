import { NextRequest } from 'next/server'
import { paymentService } from '@/lib/payments'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = headers().get('stripe-signature')!

    // Verify webhook signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
    if (!paymentService.verifyWebhookSignature(body, signature, webhookSecret)) {
      return new Response('Invalid signature', { status: 400 })
    }

    // Parse the event
    const event = JSON.parse(body)

    // Handle the webhook event
    await paymentService.handleWebhook(event)

    return new Response('Webhook received', { status: 200 })
  } catch (error) {
    console.error('Error handling Stripe webhook:', error)
    return new Response('Webhook handler failed', { status: 500 })
  }
}