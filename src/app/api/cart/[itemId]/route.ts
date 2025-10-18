import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { itemId: string } }
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
    const { quantity } = body
    
    if (quantity === undefined || quantity < 1) {
      return NextResponse.json(
        { error: 'Valid quantity is required' },
        { status: 400 }
      )
    }
    
    // Get cart item with product details
    const cartItem = await db.orderItem.findFirst({
      where: {
        id: params.itemId,
        order: {
          userId: session.user.id,
          status: 'pending'
        }
      },
      include: {
        product: true
      }
    })
    
    if (!cartItem) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      )
    }
    
    // Check inventory for physical products
    if (!cartItem.product.isDigital && cartItem.product.inventory < quantity) {
      return NextResponse.json(
        { error: 'Insufficient inventory' },
        { status: 400 }
      )
    }
    
    // Update quantity
    await db.orderItem.update({
      where: { id: params.itemId },
      data: { quantity }
    })
    
    // Update order total
    const order = await db.order.findUnique({
      where: { id: cartItem.orderId },
      include: {
        orderItems: true
      }
    })
    
    if (order) {
      const newTotal = order.orderItems.reduce((sum, item) => {
        return sum + (item.price * (item.id === params.itemId ? quantity : item.quantity))
      }, 0)
      
      await db.order.update({
        where: { id: order.id },
        data: { totalAmount: newTotal }
      })
    }
    
    return NextResponse.json({ 
      message: 'Cart updated successfully',
      quantity
    })
  } catch (error) {
    console.error('Error updating cart item:', error)
    return NextResponse.json(
      { error: 'Failed to update cart item' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get cart item
    const cartItem = await db.orderItem.findFirst({
      where: {
        id: params.itemId,
        order: {
          userId: session.user.id,
          status: 'pending'
        }
      }
    })
    
    if (!cartItem) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      )
    }
    
    const orderId = cartItem.orderId
    
    // Delete cart item
    await db.orderItem.delete({
      where: { id: params.itemId }
    })
    
    // Update order total
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: true
      }
    })
    
    if (order) {
      const newTotal = order.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      
      await db.order.update({
        where: { id: orderId },
        data: { totalAmount: newTotal }
      })
    }
    
    return NextResponse.json({ 
      message: 'Item removed from cart successfully' 
    })
  } catch (error) {
    console.error('Error removing cart item:', error)
    return NextResponse.json(
      { error: 'Failed to remove item from cart' },
      { status: 500 }
    )
  }
}