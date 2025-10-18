import { NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { ApiUtils } from '@/lib/api-utils'
import { invoiceGenerator } from '@/lib/invoice-generator'
import { rateLimiters } from '@/lib/security-middleware'

// GET /api/invoices - Get user invoices
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
    const status = searchParams.get('status') || undefined

    const result = await invoiceGenerator.getUserInvoices(user.id, {
      page,
      limit,
      status
    })

    return ApiUtils.success(result.invoices, undefined, result.pagination)
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return ApiUtils.error('Failed to fetch invoices')
  }
}

// POST /api/invoices - Create custom invoice
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimiters.payment.check(request)
    if (!rateLimitResult.success && rateLimitResult.response) {
      return rateLimitResult.response
    }

    const user = await getAuthUser(request)
    if (!user) {
      return ApiUtils.unauthorized()
    }

    // Only admins can create invoices
    if (user.role !== 'admin') {
      return ApiUtils.forbidden()
    }

    const data = await request.json()

    // Validate required fields
    if (!data.userId || !data.items || !Array.isArray(data.items)) {
      return ApiUtils.badRequest('User ID and items are required')
    }

    if (data.items.length === 0) {
      return ApiUtils.badRequest('At least one item is required')
    }

    // Validate items
    for (const item of data.items) {
      if (!item.description || !item.amount || item.amount <= 0) {
        return ApiUtils.badRequest('Each item must have a valid description and amount')
      }
    }

    const result = await invoiceGenerator.createCustomInvoice(
      data.userId,
      data.items,
      {
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        notes: data.notes,
        metadata: data.metadata,
        autoSend: data.autoSend
      }
    )

    return ApiUtils.created({
      invoice: result.invoice,
      invoiceUrl: result.invoiceUrl
    }, 'Invoice created successfully')
  } catch (error) {
    console.error('Error creating invoice:', error)
    return ApiUtils.error('Failed to create invoice')
  }
}