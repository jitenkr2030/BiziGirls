import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { CourseCompletionService } from '@/lib/services/course-completion'

// GET /api/courses/[courseId]/completion - Check course completion status
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const completionStatus = await CourseCompletionService.checkAndUpdateCourseCompletion(
      user.id, 
      params.courseId
    )

    return NextResponse.json({
      success: true,
      data: completionStatus
    })
  } catch (error) {
    console.error('Error checking course completion:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check completion status' },
      { status: 500 }
    )
  }
}

// POST /api/courses/[courseId]/completion - Manually trigger completion check
export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const completionStatus = await CourseCompletionService.checkAndUpdateCourseCompletion(
      user.id, 
      params.courseId
    )

    return NextResponse.json({
      success: true,
      data: completionStatus,
      message: 'Completion check completed'
    })
  } catch (error) {
    console.error('Error triggering completion check:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check completion' },
      { status: 500 }
    )
  }
}