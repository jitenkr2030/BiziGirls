import { db } from '@/lib/db'

export interface VideoCallProvider {
  name: string
  createMeeting: (options: VideoCallOptions) => Promise<VideoCallResult>
  joinMeeting: (meetingId: string) => string
  endMeeting: (meetingId: string) => Promise<boolean>
}

export interface VideoCallOptions {
  title?: string
  startTime?: Date
  endTime?: Date
  participants?: string[]
  record?: boolean
  waitingRoom?: boolean
}

export interface VideoCallResult {
  meetingId: string
  meetingUrl: string
  hostUrl?: string
  password?: string
  expiresAt?: Date
}

// Mock video call provider (in production, integrate with Zoom, Google Meet, or WebRTC)
class MockVideoCallProvider implements VideoCallProvider {
  name = 'MockVideoCall'

  async createMeeting(options: VideoCallOptions): Promise<VideoCallResult> {
    // Generate a unique meeting ID
    const meetingId = `meet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const meetingUrl = `https://meet.example.com/${meetingId}`
    
    // Store meeting details in database
    await db.videoCall.create({
      data: {
        meetingId,
        meetingUrl,
        title: options.title || 'Mentorship Session',
        startTime: options.startTime || new Date(),
        endTime: options.endTime || new Date(Date.now() + 3600000), // 1 hour default
        status: 'scheduled',
        provider: this.name,
        record: options.record || false,
        waitingRoom: options.waitingRoom || true,
        expiresAt: options.endTime || new Date(Date.now() + 3600000)
      }
    })

    return {
      meetingId,
      meetingUrl,
      hostUrl: `${meetingUrl}?host=true`,
      password: Math.random().toString(36).substr(2, 8),
      expiresAt: options.endTime || new Date(Date.now() + 3600000)
    }
  }

  joinMeeting(meetingId: string): string {
    return `https://meet.example.com/${meetingId}`
  }

  async endMeeting(meetingId: string): Promise<boolean> {
    try {
      await db.videoCall.update({
        where: { meetingId },
        data: { 
          status: 'ended',
          endedAt: new Date()
        }
      })
      return true
    } catch (error) {
      console.error('Error ending video call:', error)
      return false
    }
  }
}

// Video call service
export class VideoCallService {
  private provider: VideoCallProvider

  constructor(provider?: VideoCallProvider) {
    this.provider = provider || new MockVideoCallProvider()
  }

  async createMentorshipSession(
    sessionId: string,
    options: VideoCallOptions = {}
  ): Promise<VideoCallResult> {
    try {
      // Get session details
      const session = await db.mentorshipSession.findUnique({
        where: { id: sessionId },
        include: {
          mentorship: {
            include: {
              mentor: {
                select: {
                  firstName: true,
                  lastName: true
                }
              },
              mentee: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        }
      })

      if (!session) {
        throw new Error('Session not found')
      }

      // Set default options
      const meetingOptions: VideoCallOptions = {
        title: options.title || `Mentorship Session: ${session.mentorship.mentor.firstName} & ${session.mentorship.mentee.firstName}`,
        startTime: session.startTime,
        endTime: session.endTime,
        participants: [session.mentorship.mentorId, session.mentorship.menteeId],
        record: options.record ?? true,
        waitingRoom: options.waitingRoom ?? true,
        ...options
      }

      // Create meeting with provider
      const meetingResult = await this.provider.createMeeting(meetingOptions)

      // Update session with meeting details
      await db.mentorshipSession.update({
        where: { id: sessionId },
        data: {
          meetingUrl: meetingResult.meetingUrl,
          meetingId: meetingResult.meetingId
        }
      })

      return meetingResult
    } catch (error) {
      console.error('Error creating mentorship session video call:', error)
      throw error
    }
  }

  async joinSession(sessionId: string, userId: string): Promise<string> {
    try {
      const session = await db.mentorshipSession.findUnique({
        where: { id: sessionId },
        include: {
          mentorship: true
        }
      })

      if (!session) {
        throw new Error('Session not found')
      }

      // Check if user is part of this mentorship
      if (session.mentorship.mentorId !== userId && session.mentorship.menteeId !== userId) {
        throw new Error('Access denied')
      }

      // Check if session is scheduled or in progress
      if (session.status !== 'scheduled' && session.status !== 'in-progress') {
        throw new Error('Session is not active')
      }

      // Update session status to in-progress if joining for the first time
      if (session.status === 'scheduled') {
        await db.mentorshipSession.update({
          where: { id: sessionId },
          data: { status: 'in-progress' }
        })
      }

      return this.provider.joinMeeting(session.meetingId || '')
    } catch (error) {
      console.error('Error joining session:', error)
      throw error
    }
  }

  async endSession(sessionId: string, userId: string): Promise<boolean> {
    try {
      const session = await db.mentorshipSession.findUnique({
        where: { id: sessionId },
        include: {
          mentorship: true
        }
      })

      if (!session) {
        throw new Error('Session not found')
      }

      // Check if user is part of this mentorship
      if (session.mentorship.mentorId !== userId && session.mentorship.menteeId !== userId) {
        throw new Error('Access denied')
      }

      // End the video call
      const success = await this.provider.endMeeting(session.meetingId || '')

      if (success) {
        // Update session status
        await db.mentorshipSession.update({
          where: { id: sessionId },
          data: { status: 'completed' }
        })
      }

      return success
    } catch (error) {
      console.error('Error ending session:', error)
      throw error
    }
  }

  async getSessionRecording(sessionId: string, userId: string): Promise<string | null> {
    try {
      const session = await db.mentorshipSession.findUnique({
        where: { id: sessionId },
        include: {
          mentorship: true
        }
      })

      if (!session) {
        throw new Error('Session not found')
      }

      // Check if user is part of this mentorship
      if (session.mentorship.mentorId !== userId && session.mentorship.menteeId !== userId) {
        throw new Error('Access denied')
      }

      // Check if session is completed and has recording
      if (session.status !== 'completed' || !session.recordingUrl) {
        return null
      }

      return session.recordingUrl
    } catch (error) {
      console.error('Error getting session recording:', error)
      throw error
    }
  }
}

// Export singleton instance
export const videoCallService = new VideoCallService()