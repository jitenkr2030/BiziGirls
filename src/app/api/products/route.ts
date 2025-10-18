import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const minPrice = parseFloat(searchParams.get('minPrice') || '0')
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const featured = searchParams.get('featured') === 'true'
    const vendorId = searchParams.get('vendorId') || ''
    
    const skip = (page - 1) * limit
    
    // Build where clause
    const where: any = {
      isPublished: true,
      price: {
        gte: minPrice,
        lte: maxPrice
      }
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (category) {
      where.category = { equals: category, mode: 'insensitive' }
    }
    
    if (featured) {
      where.isFeatured = true
    }
    
    if (vendorId) {
      where.userId = vendorId
    }
    
    // Build sort clause
    const orderBy: any = {}
    orderBy[sortBy] = sortOrder
    
    // Get products with pagination
    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              businessProfile: {
                select: {
                  businessName: true
                }
              }
            }
          },
          _count: {
            select: {
              reviews: true,
              orderItems: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      db.product.count({ where })
    ])
    
    // Format response
    const formattedProducts = products.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      tags: product.tags ? JSON.parse(product.tags) : [],
      vendorName: product.user.businessProfile?.businessName || 
                   `${product.user.firstName} ${product.user.lastName}`,
      reviewCount: product._count.reviews,
      salesCount: product._count.orderItems
    }))
    
    return NextResponse.json({
      products: formattedProducts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const {
      name,
      description,
      category,
      price,
      images,
      tags,
      inventory,
      sku,
      isDigital,
      digitalFile,
      isFeatured
    } = body
    
    // Validate required fields
    if (!name || !description || !category || !price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const product = await db.product.create({
      data: {
        userId: session.user.id,
        name,
        description,
        category,
        price: parseFloat(price),
        images: images ? JSON.stringify(images) : null,
        tags: tags ? JSON.stringify(tags) : null,
        inventory: parseInt(inventory) || 0,
        sku,
        isDigital: isDigital || false,
        digitalFile,
        isFeatured: isFeatured || false
      }
    })
    
    return NextResponse.json({
      product: {
        ...product,
        images: product.images ? JSON.parse(product.images) : [],
        tags: product.tags ? JSON.parse(product.tags) : []
      }
    })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}