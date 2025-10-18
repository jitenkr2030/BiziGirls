import { config } from './config'
import { cacheService } from './caching-service'

export interface VideoMeeting {
  id: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  hostId: string
  participants: string[]
  meetingUrl: string
  password?: string
  settings: MeetingSettings
  status: 'scheduled' | 'started' | 'ended' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}

export interface MeetingSettings {
  enableWaitingRoom: boolean
  enableRecording: boolean
  enableChat: boolean
  enableScreenShare: boolean
  enableBreakoutRooms: boolean
  maxParticipants?: number
  muteParticipantsOnEntry: boolean
  allowParticipantsToUnmute: boolean
  requirePassword: boolean
}

export interface VideoProvider {
  name: string
  createMeeting(options: CreateMeetingOptions): Promise<VideoMeeting>
  updateMeeting(meetingId: string, updates: Partial<VideoMeeting>): Promise<VideoMeeting>
  deleteMeeting(meetingId: string): Promise<boolean>
  getMeeting(meetingId: string): Promise<VideoMeeting | null>
  startMeeting(meetingId: string): Promise<string>
  endMeeting(meetingId: string): Promise<boolean>
  inviteParticipant(meetingId: string, participantEmail: string): Promise<boolean>
  removeParticipant(meetingId: string, participantId: string): Promise<boolean>
  getRecordings(meetingId: string): Promise<VideoRecording[]>
  getAnalytics(meetingId: string): Promise<MeetingAnalytics>
}

export interface CreateMeetingOptions {
  title: string
  description?: string
  startTime: Date
  endTime: Date
  hostId: string
  participants?: string[]
  settings?: Partial<MeetingSettings>
}

export interface VideoRecording {
  id: string
  meetingId: string
  title: string
  downloadUrl: string
  playUrl: string
  fileSize: number
  duration: number
  createdAt: Date
  status: 'processing' | 'ready' | 'failed'
}

export interface MeetingAnalytics {
  totalParticipants: number
  averageDuration: number
  peakParticipants: number
  chatMessages: number
  screenShares: number
  recordings: number
  joinTime: Date
  endTime: Date
  participantStats: Array<{
    participantId: string
    joinTime: Date
    leaveTime: Date
    duration: number
  }>
}

export class VideoConferencingService {
  private providers: Map<string, VideoProvider> = new Map()
  private defaultProvider: string = 'zoom'

  constructor() {
    this.initializeProviders()
  }

  /**
   * Initialize video providers
   */
  private initializeProviders(): void {
    // Initialize Zoom provider
    if (config.services?.zoom?.apiKey && config.services?.zoom?.apiSecret) {
      this.providers.set('zoom', new ZoomProvider(config.services.zoom))
    }

    // Initialize WebRTC provider as fallback
    this.providers.set('webrtc', new WebRTCProvider())
  }

  /**
   * Create video meeting
   */
  async createMeeting(options: CreateMeetingOptions): Promise<VideoMeeting> {
    const provider = this.providers.get(this.defaultProvider)
    
    if (!provider) {
      throw new Error(`Video provider ${this.defaultProvider} not found`)
    }

    try {
      // Validate meeting options
      this.validateMeetingOptions(options)

      // Create meeting
      const meeting = await provider.createMeeting(options)

      // Cache meeting data
      await this.cacheMeeting(meeting)

      return meeting
    } catch (error) {
      console.error('Meeting creation error:', error)
      throw error
    }
  }

  /**
   * Update video meeting
   */
  async updateMeeting(meetingId: string, updates: Partial<VideoMeeting>): Promise<VideoMeeting> {
    const provider = this.providers.get(this.defaultProvider)
    
    if (!provider) {
      throw new Error(`Video provider ${this.defaultProvider} not found`)
    }

    try {
      const updatedMeeting = await provider.updateMeeting(meetingId, updates)
      
      // Update cache
      await this.cacheMeeting(updatedMeeting)
      
      return updatedMeeting
    } catch (error) {
      console.error('Meeting update error:', error)
      throw error
    }
  }

  /**
   * Delete video meeting
   */
  async deleteMeeting(meetingId: string): Promise<boolean> {
    const provider = this.providers.get(this.defaultProvider)
    
    if (!provider) {
      throw new Error(`Video provider ${this.defaultProvider} not found`)
    }

    try {
      const result = await provider.deleteMeeting(meetingId)
      
      // Clear cache
      await this.clearMeetingCache(meetingId)
      
      return result
    } catch (error) {
      console.error('Meeting deletion error:', error)
      throw error
    }
  }

  /**
   * Get video meeting
   */
  async getMeeting(meetingId: string): Promise<VideoMeeting | null> {
    const provider = this.providers.get(this.defaultProvider)
    
    if (!provider) {
      throw new Error(`Video provider ${this.defaultProvider} not found`)
    }

    // Try cache first
    const cached = await this.getCachedMeeting(meetingId)
    if (cached) {
      return cached
    }

    // Get from provider
    const meeting = await provider.getMeeting(meetingId)
    if (meeting) {
      await this.cacheMeeting(meeting)
    }

    return meeting
  }

  /**
   * Start video meeting
   */
  async startMeeting(meetingId: string): Promise<string> {
    const provider = this.providers.get(this.defaultProvider)
    
    if (!provider) {
      throw new Error(`Video provider ${this.defaultProvider} not found`)
    }

    try {
      const meetingUrl = await provider.startMeeting(meetingId)
      
      // Update meeting status in cache
      await this.updateMeetingStatus(meetingId, 'started')
      
      return meetingUrl
    } catch (error) {
      console.error('Meeting start error:', error)
      throw error
    }
  }

  /**
   * End video meeting
   */
  async endMeeting(meetingId: string): Promise<boolean> {
    const provider = this.providers.get(this.defaultProvider)
    
    if (!provider) {
      throw new Error(`Video provider ${this.defaultProvider} not found`)
    }

    try {
      const result = await provider.endMeeting(meetingId)
      
      // Update meeting status in cache
      await this.updateMeetingStatus(meetingId, 'ended')
      
      return result
    } catch (error) {
      console.error('Meeting end error:', error)
      throw error
    }
  }

  /**
   * Invite participant to meeting
   */
  async inviteParticipant(meetingId: string, participantEmail: string): Promise<boolean> {
    const provider = this.providers.get(this.defaultProvider)
    
    if (!provider) {
      throw new Error(`Video provider ${this.defaultProvider} not found`)
    }

    try {
      const result = await provider.inviteParticipant(meetingId, participantEmail)
      
      // Update meeting cache
      await this.invalidateMeetingCache(meetingId)
      
      return result
    } catch (error) {
      console.error('Participant invitation error:', error)
      throw error
    }
  }

  /**
   * Remove participant from meeting
   */
  async removeParticipant(meetingId: string, participantId: string): Promise<boolean> {
    const provider = this.providers.get(this.defaultProvider)
    
    if (!provider) {
      throw new Error(`Video provider ${this.defaultProvider} not found`)
    }

    try {
      const result = await provider.removeParticipant(meetingId, participantId)
      
      // Update meeting cache
      await this.invalidateMeetingCache(meetingId)
      
      return result
    } catch (error) {
      console.error('Participant removal error:', error)
      throw error
    }
  }

  /**
   * Get meeting recordings
   */
  async getRecordings(meetingId: string): Promise<VideoRecording[]> {
    const provider = this.providers.get(this.defaultProvider)
    
    if (!provider) {
      throw new Error(`Video provider ${this.defaultProvider} not found`)
    }

    return provider.getRecordings(meetingId)
  }

  /**
   * Get meeting analytics
   */
  async getAnalytics(meetingId: string): Promise<MeetingAnalytics> {
    const provider = this.providers.get(this.defaultProvider)
    
    if (!provider) {
      throw new Error(`Video provider ${this.defaultProvider} not found`)
    }

    return provider.getAnalytics(meetingId)
  }

  /**
   * Get user's upcoming meetings
   */
  async getUpcomingMeetings(userId: string): Promise<VideoMeeting[]> {
    // This would typically query a database
    // For now, return mock data
    return []
  }

  /**
   * Get user's past meetings
   */
  async getPastMeetings(userId: string): Promise<VideoMeeting[]> {
    // This would typically query a database
    // For now, return mock data
    return []
  }

  /**
   * Validate meeting options
   */
  private validateMeetingOptions(options: CreateMeetingOptions): void {
    if (!options.title) {
      throw new Error('Meeting title is required')
    }

    if (!options.startTime) {
      throw new Error('Meeting start time is required')
    }

    if (!options.endTime) {
      throw new Error('Meeting end time is required')
    }

    if (options.startTime >= options.endTime) {
      throw new Error('Meeting start time must be before end time')
    }

    if (!options.hostId) {
      throw new Error('Meeting host ID is required')
    }

    // Check if meeting is in the future
    if (options.startTime < new Date()) {
      throw new Error('Meeting start time must be in the future')
    }

    // Check meeting duration (max 24 hours)
    const duration = options.endTime.getTime() - options.startTime.getTime()
    if (duration > 24 * 60 * 60 * 1000) {
      throw new Error('Meeting duration cannot exceed 24 hours')
    }
  }

  /**
   * Cache meeting data
   */
  private async cacheMeeting(meeting: VideoMeeting): Promise<void> {
    const cacheKey = `video-meeting-${meeting.id}`
    await cacheService.set(cacheKey, meeting, { 
      ttl: 3600000, // Cache for 1 hour
      tags: ['video-meetings']
    })
  }

  /**
   * Get cached meeting
   */
  private async getCachedMeeting(meetingId: string): Promise<VideoMeeting | null> {
    const cacheKey = `video-meeting-${meetingId}`
    return cacheService.get<VideoMeeting>(cacheKey)
  }

  /**
   * Clear meeting cache
   */
  private async clearMeetingCache(meetingId: string): Promise<void> {
    const cacheKey = `video-meeting-${meetingId}`
    await cacheService.clearCache(cacheKey)
  }

  /**
   * Invalidate meeting cache
   */
  private async invalidateMeetingCache(meetingId: string): Promise<void> {
    await this.clearMeetingCache(meetingId)
  }

  /**
   * Update meeting status in cache
   */
  private async updateMeetingStatus(meetingId: string, status: VideoMeeting['status']): Promise<void> {
    const meeting = await this.getCachedMeeting(meetingId)
    if (meeting) {
      meeting.status = status
      meeting.updatedAt = new Date()
      await this.cacheMeeting(meeting)
    }
  }

  /**
   * Set default provider
   */
  setDefaultProvider(provider: string): void {
    if (this.providers.has(provider)) {
      this.defaultProvider = provider
    } else {
      throw new Error(`Provider ${provider} not found`)
    }
  }

  /**
   * Get available providers
   */
  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys())
  }
}

/**
 * Zoom video provider
 */
class ZoomProvider implements VideoProvider {
  name = 'Zoom'
  private config: typeof config.services.zoom

  constructor(config: typeof config.services.zoom) {
    this.config = config
  }

  async createMeeting(options: CreateMeetingOptions): Promise<VideoMeeting> {
    console.log('Creating Zoom meeting:', options)
    
    const meetingId = `zoom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return {
      id: meetingId,
      title: options.title,
      description: options.description,
      startTime: options.startTime,
      endTime: options.endTime,
      hostId: options.hostId,
      participants: options.participants || [],
      meetingUrl: `https://zoom.us/j/${meetingId}`,
      password: Math.random().toString(36).substr(2, 8),
      settings: {
        enableWaitingRoom: true,
        enableRecording: false,
        enableChat: true,
        enableScreenShare: true,
        enableBreakoutRooms: false,
        muteParticipantsOnEntry: true,
        allowParticipantsToUnmute: false,
        requirePassword: true,
        ...options.settings
      },
      status: 'scheduled',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  async updateMeeting(meetingId: string, updates: Partial<VideoMeeting>): Promise<VideoMeeting> {
    console.log('Updating Zoom meeting:', meetingId, updates)
    
    // Mock implementation - in production, you'd call Zoom API
    return {
      id: meetingId,
      title: updates.title || 'Updated Meeting',
      description: updates.description,
      startTime: updates.startTime || new Date(),
      endTime: updates.endTime || new Date(),
      hostId: updates.hostId || '',
      participants: updates.participants || [],
      meetingUrl: `https://zoom.us/j/${meetingId}`,
      password: updates.password,
      settings: updates.settings || this.getDefaultSettings(),
      status: updates.status || 'scheduled',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  async deleteMeeting(meetingId: string): Promise<boolean> {
    console.log('Deleting Zoom meeting:', meetingId)
    return true
  }

  async getMeeting(meetingId: string): Promise<VideoMeeting | null> {
    console.log('Getting Zoom meeting:', meetingId)
    
    // Mock implementation
    return {
      id: meetingId,
      title: 'Mock Meeting',
      startTime: new Date(),
      endTime: new Date(Date.now() + 3600000),
      hostId: 'mock-host',
      participants: [],
      meetingUrl: `https://zoom.us/j/${meetingId}`,
      settings: this.getDefaultSettings(),
      status: 'scheduled',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  async startMeeting(meetingId: string): Promise<string> {
    console.log('Starting Zoom meeting:', meetingId)
    return `https://zoom.us/j/${meetingId}`
  }

  async endMeeting(meetingId: string): Promise<boolean> {
    console.log('Ending Zoom meeting:', meetingId)
    return true
  }

  async inviteParticipant(meetingId: string, participantEmail: string): Promise<boolean> {
    console.log('Inviting participant to Zoom meeting:', meetingId, participantEmail)
    return true
  }

  async removeParticipant(meetingId: string, participantId: string): Promise<boolean> {
    console.log('Removing participant from Zoom meeting:', meetingId, participantId)
    return true
  }

  async getRecordings(meetingId: string): Promise<VideoRecording[]> {
    console.log('Getting Zoom recordings:', meetingId)
    return []
  }

  async getAnalytics(meetingId: string): Promise<MeetingAnalytics> {
    console.log('Getting Zoom analytics:', meetingId)
    
    return {
      totalParticipants: 5,
      averageDuration: 1800,
      peakParticipants: 5,
      chatMessages: 25,
      screenShares: 2,
      recordings: 1,
      joinTime: new Date(),
      endTime: new Date(),
      participantStats: []
    }
  }

  private getDefaultSettings(): MeetingSettings {
    return {
      enableWaitingRoom: true,
      enableRecording: false,
      enableChat: true,
      enableScreenShare: true,
      enableBreakoutRooms: false,
      muteParticipantsOnEntry: true,
      allowParticipantsToUnmute: false,
      requirePassword: true
    }
  }
}

/**
 * WebRTC video provider
 */
class WebRTCProvider implements VideoProvider {
  name = 'WebRTC'

  async createMeeting(options: CreateMeetingOptions): Promise<VideoMeeting> {
    console.log('Creating WebRTC meeting:', options)
    
    const meetingId = `webrtc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return {
      id: meetingId,
      title: options.title,
      description: options.description,
      startTime: options.startTime,
      endTime: options.endTime,
      hostId: options.hostId,
      participants: options.participants || [],
      meetingUrl: `/video-conference/${meetingId}`,
      settings: {
        enableWaitingRoom: false,
        enableRecording: false,
        enableChat: true,
        enableScreenShare: true,
        enableBreakoutRooms: false,
        muteParticipantsOnEntry: false,
        allowParticipantsToUnmute: true,
        requirePassword: false,
        ...options.settings
      },
      status: 'scheduled',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  async updateMeeting(meetingId: string, updates: Partial<VideoMeeting>): Promise<VideoMeeting> {
    console.log('Updating WebRTC meeting:', meetingId, updates)
    
    return {
      id: meetingId,
      title: updates.title || 'Updated Meeting',
      description: updates.description,
      startTime: updates.startTime || new Date(),
      endTime: updates.endTime || new Date(),
      hostId: updates.hostId || '',
      participants: updates.participants || [],
      meetingUrl: `/video-conference/${meetingId}`,
      settings: updates.settings || this.getDefaultSettings(),
      status: updates.status || 'scheduled',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  async deleteMeeting(meetingId: string): Promise<boolean> {
    console.log('Deleting WebRTC meeting:', meetingId)
    return true
  }

  async getMeeting(meetingId: string): Promise<VideoMeeting | null> {
    console.log('Getting WebRTC meeting:', meetingId)
    
    return {
      id: meetingId,
      title: 'Mock WebRTC Meeting',
      startTime: new Date(),
      endTime: new Date(Date.now() + 3600000),
      hostId: 'mock-host',
      participants: [],
      meetingUrl: `/video-conference/${meetingId}`,
      settings: this.getDefaultSettings(),
      status: 'scheduled',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  async startMeeting(meetingId: string): Promise<string> {
    console.log('Starting WebRTC meeting:', meetingId)
    return `/video-conference/${meetingId}`
  }

  async endMeeting(meetingId: string): Promise<boolean> {
    console.log('Ending WebRTC meeting:', meetingId)
    return true
  }

  async inviteParticipant(meetingId: string, participantEmail: string): Promise<boolean> {
    console.log('Inviting participant to WebRTC meeting:', meetingId, participantEmail)
    return true
  }

  async removeParticipant(meetingId: string, participantId: string): Promise<boolean> {
    console.log('Removing participant from WebRTC meeting:', meetingId, participantId)
    return true
  }

  async getRecordings(meetingId: string): Promise<VideoRecording[]> {
    console.log('Getting WebRTC recordings:', meetingId)
    return []
  }

  async getAnalytics(meetingId: string): Promise<MeetingAnalytics> {
    console.log('Getting WebRTC analytics:', meetingId)
    
    return {
      totalParticipants: 3,
      averageDuration: 1200,
      peakParticipants: 3,
      chatMessages: 15,
      screenShares: 1,
      recordings: 0,
      joinTime: new Date(),
      endTime: new Date(),
      participantStats: []
    }
  }

  private getDefaultSettings(): MeetingSettings {
    return {
      enableWaitingRoom: false,
      enableRecording: false,
      enableChat: true,
      enableScreenShare: true,
      enableBreakoutRooms: false,
      muteParticipantsOnEntry: false,
      allowParticipantsToUnmute: true,
      requirePassword: false
    }
  }
}

// Default video conferencing service instance
export const videoConferencingService = new VideoConferencingService()

/**
 * Video conferencing utilities
 */
export class VideoConferencingUtils {
  /**
   * Generate meeting invitation email content
   */
  static generateInvitationEmail(meeting: VideoMeeting): {
    subject: string
    html: string
    text: string
  } {
    const subject = `Meeting Invitation: ${meeting.title}`
    
    const html = `
      <h2>Meeting Invitation</h2>
      <p>You have been invited to a video meeting.</p>
      
      <h3>Meeting Details</h3>
      <ul>
        <li><strong>Title:</strong> ${meeting.title}</li>
        <li><strong>Date:</strong> ${meeting.startTime.toLocaleDateString()}</li>
        <li><strong>Time:</strong> ${meeting.startTime.toLocaleTimeString()} - ${meeting.endTime.toLocaleTimeString()}</li>
        <li><strong>Duration:</strong> ${Math.round((meeting.endTime.getTime() - meeting.startTime.getTime()) / 60000)} minutes</li>
      </ul>
      
      ${meeting.description ? `<p><strong>Description:</strong> ${meeting.description}</p>` : ''}
      
      <h3>Join Meeting</h3>
      <p><a href="${meeting.meetingUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Join Meeting</a></p>
      
      ${meeting.password ? `<p><strong>Password:</strong> ${meeting.password}</p>` : ''}
      
      <p>If you have any issues joining the meeting, please contact the host.</p>
      
      <p>Best regards,<br>GirlsPreneur Team</p>
    `.trim()
    
    const text = `
      Meeting Invitation
      
      You have been invited to a video meeting.
      
      Meeting Details:
      Title: ${meeting.title}
      Date: ${meeting.startTime.toLocaleDateString()}
      Time: ${meeting.startTime.toLocaleTimeString()} - ${meeting.endTime.toLocaleTimeString()}
      Duration: ${Math.round((meeting.endTime.getTime() - meeting.startTime.getTime()) / 60000)} minutes
      
      ${meeting.description ? `Description: ${meeting.description}` : ''}
      
      Join Meeting: ${meeting.meetingUrl}
      ${meeting.password ? `Password: ${meeting.password}` : ''}
      
      If you have any issues joining the meeting, please contact the host.
      
      Best regards,
      GirlsPreneur Team
    `.trim()
    
    return { subject, html, text }
  }

  /**
   * Generate meeting reminder email content
   */
  static generateReminderEmail(meeting: VideoMeeting): {
    subject: string
    html: string
    text: string
  } {
    const subject = `Meeting Reminder: ${meeting.title}`
    
    const html = `
      <h2>Meeting Reminder</h2>
      <p>This is a reminder for your upcoming meeting.</p>
      
      <h3>Meeting Details</h3>
      <ul>
        <li><strong>Title:</strong> ${meeting.title}</li>
        <li><strong>Date:</strong> ${meeting.startTime.toLocaleDateString()}</li>
        <li><strong>Time:</strong> ${meeting.startTime.toLocaleTimeString()} - ${meeting.endTime.toLocaleTimeString()}</li>
        <li><strong>Duration:</strong> ${Math.round((meeting.endTime.getTime() - meeting.startTime.getTime()) / 60000)} minutes</li>
      </ul>
      
      <h3>Join Meeting</h3>
      <p><a href="${meeting.meetingUrl}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Join Meeting</a></p>
      
      ${meeting.password ? `<p><strong>Password:</strong> ${meeting.password}</p>` : ''}
      
      <p>We look forward to seeing you there!</p>
      
      <p>Best regards,<br>GirlsPreneur Team</p>
    `.trim()
    
    const text = `
      Meeting Reminder
      
      This is a reminder for your upcoming meeting.
      
      Meeting Details:
      Title: ${meeting.title}
      Date: ${meeting.startTime.toLocaleDateString()}
      Time: ${meeting.startTime.toLocaleTimeString()} - ${meeting.endTime.toLocaleTimeString()}
      Duration: ${Math.round((meeting.endTime.getTime() - meeting.startTime.getTime()) / 60000)} minutes
      
      Join Meeting: ${meeting.meetingUrl}
      ${meeting.password ? `Password: ${meeting.password}` : ''}
      
      We look forward to seeing you there!
      
      Best regards,
      GirlsPreneur Team
    `.trim()
    
    return { subject, html, text }
  }

  /**
   * Calculate meeting duration
   */
  static calculateDuration(startTime: Date, endTime: Date): number {
    return Math.round((endTime.getTime() - startTime.getTime()) / 60000) // minutes
  }

  /**
   * Check if meeting is about to start (within 15 minutes)
   */
  static isMeetingAboutToStart(meeting: VideoMeeting): boolean {
    const now = new Date()
    const timeUntilStart = meeting.startTime.getTime() - now.getTime()
    return timeUntilStart > 0 && timeUntilStart <= 15 * 60 * 1000 // 15 minutes
  }

  /**
   * Check if meeting is in progress
   */
  static isMeetingInProgress(meeting: VideoMeeting): boolean {
    const now = new Date()
    return now >= meeting.startTime && now <= meeting.endTime
  }

  /**
   * Check if meeting has ended
   */
  static hasMeetingEnded(meeting: VideoMeeting): boolean {
    const now = new Date()
    return now > meeting.endTime
  }

  /**
   * Generate meeting settings based on meeting type
   */
  static generateMeetingSettings(meetingType: 'one-on-one' | 'group' | 'webinar' | 'workshop'): Partial<MeetingSettings> {
    switch (meetingType) {
      case 'one-on-one':
        return {
          enableWaitingRoom: false,
          enableRecording: true,
          enableChat: true,
          enableScreenShare: true,
          enableBreakoutRooms: false,
          muteParticipantsOnEntry: false,
          allowParticipantsToUnmute: true,
          requirePassword: false
        }
      
      case 'group':
        return {
          enableWaitingRoom: true,
          enableRecording: true,
          enableChat: true,
          enableScreenShare: true,
          enableBreakoutRooms: true,
          muteParticipantsOnEntry: true,
          allowParticipantsToUnmute: false,
          requirePassword: true
        }
      
      case 'webinar':
        return {
          enableWaitingRoom: true,
          enableRecording: true,
          enableChat: true,
          enableScreenShare: true,
          enableBreakoutRooms: false,
          muteParticipantsOnEntry: true,
          allowParticipantsToUnmute: false,
          requirePassword: true
        }
      
      case 'workshop':
        return {
          enableWaitingRoom: true,
          enableRecording: true,
          enableChat: true,
          enableScreenShare: true,
          enableBreakoutRooms: true,
          muteParticipantsOnEntry: false,
          allowParticipantsToUnmute: true,
          requirePassword: true
        }
      
      default:
        return {}
    }
  }
}