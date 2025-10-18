import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface CartItem {
  productId: string
  quantity: number
  variantId?: string
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get user's cart items
    const cartItems = await db.orderItem.findMany({
      where: {
        order: {
          userId: session.user.id,
          status: 'pending'
        }
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            isDigital: true,
            inventory: true,
            userId: true
          }
        }
      }
    })
    
    // Format response
    const formattedItems = cartItems.map(item => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      product: {
        ...item.product,
        images: item.product.images ? JSON.parse(item.product.images) : []
      },
      subtotal: item.price * item.quantity
    }))
    
    const totalAmount = formattedItems.reduce((sum, item) => sum + item.subtotal, 0)
    const totalItems = formattedItems.reduce((sum, item) => sum + item.quantity, 0)
    
    return NextResponse.json({
      items: formattedItems,
      summary: {
        totalItems,
        totalAmount,
        itemCount: formattedItems.length
      }
    })
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
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
    const { productId, quantity = 1, variantId } = body
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }
    
    // Get product details
    const product = await db.product.findUnique({
      where: { id: productId }
    })
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    if (!product.isPublished) {
      return NextResponse.json(
        { error: 'Product is not available' },
        { status: 400 }
      )
    }
    
    if (!product.isDigital && product.inventory < quantity) {
      return NextResponse.json(
        { error: 'Insufficient inventory' },
        { status: 400 }
      )
    }
    
    // Find or create pending order
    let order = await db.order.findFirst({
      where: {
        userId: session.user.id,
        status: 'pending'
      }
    })
    
    if (!order) {
      order = await db.order.create({
        data: {
          userId: session.user.id,
          totalAmount: 0,
          status: 'pending'
        }
      })
    }
    
    // Check if item already exists in cart
    const existingItem = await db.orderItem.findFirst({
      where: {
        orderId: order.id,
        productId
      }
    })
    
    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity
      
      if (!product.isDigital && product.inventory < newQuantity) {
        return NextResponse.json(
          { error: 'Insufficient inventory' },
          { status: 400 }
        )
      }
      
      await db.orderItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity }
      })
    } else {
      // Add new item
      await db.orderItem.create({
        data: {
          orderId: order.id,
          productId,
          quantity,
          price: product.price
        }
      })
    }
    
    // Update order total
    const updatedItems = await db.orderItem.findMany({
      where: { orderId: order.id }
    })
    
    const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    
    await db.order.update({
      where: { id: order.id },
      data: { totalAmount: newTotal }
    })
    
    return NextResponse.json({ 
      message: 'Item added to cart successfully',
      cartCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
    })
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json(
      { error: 'Failed to add item to cart' },
      { status: 500 }
    )
  }
}