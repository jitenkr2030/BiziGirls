import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
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
    
    const application = await db.grantApplication.findUnique({
      where: {
        id: params.id,
        userId: session.user.id
      },
      include: {
        opportunity: {
          select: {
            id: true,
            title: true,
            organization: true,
            description: true,
            amount: true,
            type: true,
            category: true,
            industry: true,
            region: true,
            deadline: true,
            difficulty: true,
            eligibility: true,
            requirements: true,
            applicationUrl: true,
            contactInfo: true
          }
        }
      }
    })
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      application: {
        ...application,
        opportunity: {
          ...application.opportunity,
          eligibility: application.opportunity.eligibility ? JSON.parse(application.opportunity.eligibility) : [],
          requirements: application.opportunity.requirements ? JSON.parse(application.opportunity.requirements) : []
        },
        supportingDocuments: application.supportingDocuments ? JSON.parse(application.supportingDocuments) : []
      }
    })
  } catch (error) {
    console.error('Error fetching grant application:', error)
    return NextResponse.json(
      { error: 'Failed to fetch grant application' },
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
      businessPlan,
      pitchDeck,
      financialStatements,
      supportingDocuments,
      status,
      progress
    } = body
    
    // Check if application exists and belongs to user
    const existingApplication = await db.grantApplication.findUnique({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })
    
    if (!existingApplication) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }
    
    const updateData: any = {}
    
    if (businessPlan !== undefined) updateData.businessPlan = businessPlan
    if (pitchDeck !== undefined) updateData.pitchDeck = pitchDeck
    if (financialStatements !== undefined) updateData.financialStatements = financialStatements
    if (supportingDocuments !== undefined) {
      updateData.supportingDocuments = supportingDocuments ? JSON.stringify(supportingDocuments) : null
    }
    if (status !== undefined) {
      updateData.status = status
      if (status === 'submitted') {
        updateData.submittedAt = new Date()
      }
    }
    if (progress !== undefined) updateData.progress = progress
    
    const application = await db.grantApplication.update({
      where: { id: params.id },
      data: updateData
    })
    
    return NextResponse.json({
      application: {
        ...application,
        supportingDocuments: application.supportingDocuments ? JSON.parse(application.supportingDocuments) : []
      }
    })
  } catch (error) {
    console.error('Error updating grant application:', error)
    return NextResponse.json(
      { error: 'Failed to update grant application' },
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
    
    // Check if application exists and belongs to user
    const existingApplication = await db.grantApplication.findUnique({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })
    
    if (!existingApplication) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }
    
    // Only allow deletion of draft applications
    if (existingApplication.status !== 'draft') {
      return NextResponse.json(
        { error: 'Cannot delete submitted applications' },
        { status: 400 }
      )
    }
    
    await db.grantApplication.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ message: 'Application deleted successfully' })
  } catch (error) {
    console.error('Error deleting grant application:', error)
    return NextResponse.json(
      { error: 'Failed to delete grant application' },
      { status: 500 }
    )
  }
}