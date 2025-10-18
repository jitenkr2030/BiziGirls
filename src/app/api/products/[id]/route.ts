import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await db.product.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            businessProfile: {
              select: {
                businessName: true,
                businessWebsite: true,
                description: true
              }
            }
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            reviews: true,
            orderItems: true
          }
        }
      }
    })
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    // Increment view count
    await db.product.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } }
    })
    
    return NextResponse.json({
      product: {
        ...product,
        images: product.images ? JSON.parse(product.images) : [],
        tags: product.tags ? JSON.parse(product.tags) : [],
        vendorName: product.user.businessProfile?.businessName || 
                     `${product.user.firstName} ${product.user.lastName}`,
        averageRating: product.reviews.length > 0 
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length 
          : 0
      }
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      isFeatured,
      isPublished
    } = body
    
    // Check if product exists and belongs to user
    const existingProduct = await db.product.findUnique({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })
    
    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found or unauthorized' },
        { status: 404 }
      )
    }
    
    const updateData: any = {}
    
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (category !== undefined) updateData.category = category
    if (price !== undefined) updateData.price = parseFloat(price)
    if (images !== undefined) updateData.images = images ? JSON.stringify(images) : null
    if (tags !== undefined) updateData.tags = tags ? JSON.stringify(tags) : null
    if (inventory !== undefined) updateData.inventory = parseInt(inventory)
    if (sku !== undefined) updateData.sku = sku
    if (isDigital !== undefined) updateData.isDigital = isDigital
    if (digitalFile !== undefined) updateData.digitalFile = digitalFile
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured
    if (isPublished !== undefined) updateData.isPublished = isPublished
    
    const product = await db.product.update({
      where: { id: params.id },
      data: updateData
    })
    
    return NextResponse.json({
      product: {
        ...product,
        images: product.images ? JSON.parse(product.images) : [],
        tags: product.tags ? JSON.parse(product.tags) : []
      }
    })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Check if product exists and belongs to user
    const existingProduct = await db.product.findUnique({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })
    
    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found or unauthorized' },
        { status: 404 }
      )
    }
    
    await db.product.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}