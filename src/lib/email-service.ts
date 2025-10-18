import { getEmailConfig } from './config'
import { cacheService } from './caching-service'

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  html: string
  text?: string
  variables: string[]
}

export interface EmailOptions {
  to: string | string[]
  cc?: string | string[]
  bcc?: string | string[]
  subject: string
  html?: string
  text?: string
  templateId?: string
  templateData?: Record<string, any>
  attachments?: EmailAttachment[]
  from?: string
  replyTo?: string
  priority?: 'high' | 'normal' | 'low'
  trackOpens?: boolean
  trackClicks?: boolean
}

export interface EmailAttachment {
  filename: string
  content: Buffer | string
  contentType?: string
  encoding?: string
}

export interface EmailProvider {
  name: string
  send(options: EmailOptions): Promise<EmailResult>
  getTemplate(templateId: string): Promise<EmailTemplate | null>
  createTemplate(template: Omit<EmailTemplate, 'id'>): Promise<EmailTemplate>
  updateTemplate(templateId: string, template: Partial<EmailTemplate>): Promise<EmailTemplate>
  deleteTemplate(templateId: string): Promise<boolean>
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
  provider: string
  timestamp: Date
}

export interface EmailAnalytics {
  sent: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  complained: number
  unsubscribed: number
}

export class EmailService {
  private providers: Map<string, EmailProvider> = new Map()
  private defaultProvider: string = 'sendgrid'
  private config: typeof getEmailConfig.return

  constructor() {
    this.config = getEmailConfig()
    this.initializeProviders()
  }

  /**
   * Initialize email providers
   */
  private initializeProviders(): void {
    // Initialize SendGrid provider
    if (this.config.services?.sendgrid?.apiKey) {
      this.providers.set('sendgrid', new SendGridProvider(this.config.services.sendgrid))
    }

    // Initialize Mailchimp provider
    if (this.config.services?.mailchimp?.apiKey) {
      this.providers.set('mailchimp', new MailchimpProvider(this.config.services.mailchimp))
    }

    // Initialize SMTP provider as fallback
    if (this.config.smtp?.host && this.config.smtp?.user) {
      this.providers.set('smtp', new SMTPProvider(this.config.smtp))
    }
  }

  /**
   * Send email
   */
  async send(options: EmailOptions): Promise<EmailResult> {
    const provider = this.providers.get(this.defaultProvider) || this.providers.get('smtp')
    
    if (!provider) {
      return {
        success: false,
        error: 'No email provider configured',
        provider: 'none',
        timestamp: new Date()
      }
    }

    try {
      // Apply template if specified
      let finalOptions = { ...options }
      if (options.templateId && options.templateData) {
        const template = await this.getTemplate(options.templateId)
        if (template) {
          finalOptions = await this.applyTemplate(template, options.templateData, options)
        }
      }

      // Validate email options
      this.validateEmailOptions(finalOptions)

      // Send email
      const result = await provider.send(finalOptions)

      // Cache the result
      await this.cacheEmailResult(finalOptions, result)

      return result
    } catch (error) {
      console.error('Email sending error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: provider.name,
        timestamp: new Date()
      }
    }
  }

  /**
   * Send bulk emails
   */
  async sendBulk(
    recipients: Array<{ to: string; data?: Record<string, any> }>,
    baseOptions: Omit<EmailOptions, 'to'>
  ): Promise<EmailResult[]> {
    const results: EmailResult[] = []
    
    for (const recipient of recipients) {
      try {
        const options: EmailOptions = {
          ...baseOptions,
          to: recipient.to,
          ...(recipient.data && { templateData: recipient.data })
        }

        const result = await this.send(options)
        results.push(result)

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          provider: this.defaultProvider,
          timestamp: new Date()
        })
      }
    }

    return results
  }

  /**
   * Get email template
   */
  async getTemplate(templateId: string): Promise<EmailTemplate | null> {
    const cacheKey = `email-template-${templateId}`
    
    // Try to get from cache first
    const cached = await cacheService.get<EmailTemplate>(cacheKey)
    if (cached) {
      return cached
    }

    // Get from provider
    const provider = this.providers.get(this.defaultProvider)
    if (!provider) return null

    const template = await provider.getTemplate(templateId)
    if (template) {
      await cacheService.set(cacheKey, template, { ttl: 3600000 }) // Cache for 1 hour
    }

    return template
  }

  /**
   * Create email template
   */
  async createTemplate(template: Omit<EmailTemplate, 'id'>): Promise<EmailTemplate> {
    const provider = this.providers.get(this.defaultProvider)
    if (!provider) {
      throw new Error('No email provider configured')
    }

    const createdTemplate = await provider.createTemplate(template)
    
    // Clear cache
    await cacheService.clearByTags(['email-templates'])
    
    return createdTemplate
  }

  /**
   * Update email template
   */
  async updateTemplate(templateId: string, template: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const provider = this.providers.get(this.defaultProvider)
    if (!provider) {
      throw new Error('No email provider configured')
    }

    const updatedTemplate = await provider.updateTemplate(templateId, template)
    
    // Clear cache
    await cacheService.clearByTags(['email-templates'])
    
    return updatedTemplate
  }

  /**
   * Delete email template
   */
  async deleteTemplate(templateId: string): Promise<boolean> {
    const provider = this.providers.get(this.defaultProvider)
    if (!provider) {
      throw new Error('No email provider configured')
    }

    const result = await provider.deleteTemplate(templateId)
    
    // Clear cache
    await cacheService.clearByTags(['email-templates'])
    
    return result
  }

  /**
   * Apply template to email options
   */
  private async applyTemplate(
    template: EmailTemplate,
    data: Record<string, any>,
    options: EmailOptions
  ): Promise<EmailOptions> {
    const subject = this.renderTemplate(template.subject, data)
    const html = this.renderTemplate(template.html, data)
    const text = template.text ? this.renderTemplate(template.text, data) : undefined

    return {
      ...options,
      subject: subject || options.subject,
      html: html || options.html,
      text: text || options.text
    }
  }

  /**
   * Render template with data
   */
  private renderTemplate(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? String(data[key]) : match
    })
  }

  /**
   * Validate email options
   */
  private validateEmailOptions(options: EmailOptions): void {
    if (!options.to || (Array.isArray(options.to) && options.to.length === 0)) {
      throw new Error('Email recipient is required')
    }

    if (!options.subject) {
      throw new Error('Email subject is required')
    }

    if (!options.html && !options.text && !options.templateId) {
      throw new Error('Email content is required (html, text, or template)')
    }

    // Validate email addresses
    const validateEmail = (email: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    }

    const emails = Array.isArray(options.to) ? options.to : [options.to]
    if (!emails.every(validateEmail)) {
      throw new Error('Invalid email address in recipients')
    }
  }

  /**
   * Cache email result
   */
  private async cacheEmailResult(options: EmailOptions, result: EmailResult): Promise<void> {
    const cacheKey = `email-result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    await cacheService.set(cacheKey, { options, result }, { 
      ttl: 86400000, // Cache for 24 hours
      tags: ['email-results']
    })
  }

  /**
   * Get email analytics
   */
  async getAnalytics(dateRange?: { start: Date; end: Date }): Promise<EmailAnalytics> {
    // This would typically query the email provider's analytics API
    // For now, return mock data
    return {
      sent: 1000,
      delivered: 950,
      opened: 600,
      clicked: 200,
      bounced: 50,
      complained: 5,
      unsubscribed: 10
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
 * SendGrid email provider
 */
class SendGridProvider implements EmailProvider {
  name = 'SendGrid'
  private apiKey: string
  private fromEmail: string

  constructor(config: { apiKey: string; fromEmail: string }) {
    this.apiKey = config.apiKey
    this.fromEmail = config.fromEmail
  }

  async send(options: EmailOptions): Promise<EmailResult> {
    try {
      // This is a simplified implementation
      // In production, you would use the actual SendGrid SDK
      console.log('Sending email via SendGrid:', options)
      
      // Mock successful send
      return {
        success: true,
        messageId: `sg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        provider: this.name,
        timestamp: new Date()
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'SendGrid error',
        provider: this.name,
        timestamp: new Date()
      }
    }
  }

  async getTemplate(templateId: string): Promise<EmailTemplate | null> {
    // Mock implementation
    return {
      id: templateId,
      name: 'Mock Template',
      subject: 'Hello {{name}}',
      html: '<h1>Hello {{name}}!</h1><p>{{message}}</p>',
      text: 'Hello {{name}}!\\n\\n{{message}}',
      variables: ['name', 'message']
    }
  }

  async createTemplate(template: Omit<EmailTemplate, 'id'>): Promise<EmailTemplate> {
    const newTemplate: EmailTemplate = {
      ...template,
      id: `sg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    return newTemplate
  }

  async updateTemplate(templateId: string, template: Partial<EmailTemplate>): Promise<EmailTemplate> {
    return {
      id: templateId,
      name: template.name || 'Updated Template',
      subject: template.subject || '',
      html: template.html || '',
      text: template.text,
      variables: template.variables || []
    }
  }

  async deleteTemplate(templateId: string): Promise<boolean> {
    return true
  }
}

/**
 * Mailchimp email provider
 */
class MailchimpProvider implements EmailProvider {
  name = 'Mailchimp'
  private apiKey: string
  private listId: string

  constructor(config: { apiKey: string; listId: string }) {
    this.apiKey = config.apiKey
    this.listId = config.listId
  }

  async send(options: EmailOptions): Promise<EmailResult> {
    try {
      console.log('Sending email via Mailchimp:', options)
      
      return {
        success: true,
        messageId: `mc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        provider: this.name,
        timestamp: new Date()
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Mailchimp error',
        provider: this.name,
        timestamp: new Date()
      }
    }
  }

  async getTemplate(templateId: string): Promise<EmailTemplate | null> {
    return {
      id: templateId,
      name: 'Mailchimp Template',
      subject: 'Hi {{name}}',
      html: '<div>Hi {{name}}!</div><p>{{content}}</p>',
      variables: ['name', 'content']
    }
  }

  async createTemplate(template: Omit<EmailTemplate, 'id'>): Promise<EmailTemplate> {
    return {
      ...template,
      id: `mc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  async updateTemplate(templateId: string, template: Partial<EmailTemplate>): Promise<EmailTemplate> {
    return {
      id: templateId,
      name: template.name || 'Updated Mailchimp Template',
      subject: template.subject || '',
      html: template.html || '',
      text: template.text,
      variables: template.variables || []
    }
  }

  async deleteTemplate(templateId: string): Promise<boolean> {
    return true
  }
}

/**
 * SMTP email provider
 */
class SMTPProvider implements EmailProvider {
  name = 'SMTP'
  private config: typeof getEmailConfig.return.smtp

  constructor(config: typeof getEmailConfig.return.smtp) {
    this.config = config
  }

  async send(options: EmailOptions): Promise<EmailResult> {
    try {
      console.log('Sending email via SMTP:', options)
      
      return {
        success: true,
        messageId: `smtp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        provider: this.name,
        timestamp: new Date()
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'SMTP error',
        provider: this.name,
        timestamp: new Date()
      }
    }
  }

  async getTemplate(templateId: string): Promise<EmailTemplate | null> {
    return {
      id: templateId,
      name: 'SMTP Template',
      subject: 'Hello {{name}}',
      html: '<h1>Hello {{name}}!</h1>',
      variables: ['name']
    }
  }

  async createTemplate(template: Omit<EmailTemplate, 'id'>): Promise<EmailTemplate> {
    return {
      ...template,
      id: `smtp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  async updateTemplate(templateId: string, template: Partial<EmailTemplate>): Promise<EmailTemplate> {
    return {
      id: templateId,
      name: template.name || 'Updated SMTP Template',
      subject: template.subject || '',
      html: template.html || '',
      text: template.text,
      variables: template.variables || []
    }
  }

  async deleteTemplate(templateId: string): Promise<boolean> {
    return true
  }
}

// Default email service instance
export const emailService = new EmailService()

/**
 * Email template utilities
 */
export class EmailTemplateUtils {
  /**
   * Create welcome email template
   */
  static createWelcomeTemplate(): EmailTemplate {
    return {
      id: 'welcome',
      name: 'Welcome Email',
      subject: 'Welcome to GirlsPreneur, {{name}}!',
      html: `
        <h1>Welcome to GirlsPreneur!</h1>
        <p>Hello {{name}},</p>
        <p>We're excited to have you join our community of women entrepreneurs. Here's what you can expect:</p>
        <ul>
          <li>Access to exclusive resources and tools</li>
          <li>Networking opportunities with like-minded women</li>
          <li>Mentorship programs and workshops</li>
          <li>Funding opportunities and investor connections</li>
        </ul>
        <p>Get started by <a href="{{dashboardUrl}}">visiting your dashboard</a>.</p>
        <p>Best regards,<br>The GirlsPreneur Team</p>
      `.trim(),
      text: `
        Welcome to GirlsPreneur!
        
        Hello {{name}},
        
        We're excited to have you join our community of women entrepreneurs. Here's what you can expect:
        
        - Access to exclusive resources and tools
        - Networking opportunities with like-minded women
        - Mentorship programs and workshops
        - Funding opportunities and investor connections
        
        Get started by visiting your dashboard: {{dashboardUrl}}
        
        Best regards,
        The GirlsPreneur Team
      `.trim(),
      variables: ['name', 'dashboardUrl']
    }
  }

  /**
   * Create password reset template
   */
  static createPasswordResetTemplate(): EmailTemplate {
    return {
      id: 'password-reset',
      name: 'Password Reset',
      subject: 'Reset Your GirlsPreneur Password',
      html: `
        <h1>Reset Your Password</h1>
        <p>Hello {{name}},</p>
        <p>We received a request to reset your password for your GirlsPreneur account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="{{resetUrl}}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Reset Password</a>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <p>This link will expire in 1 hour for security reasons.</p>
        <p>Best regards,<br>The GirlsPreneur Team</p>
      `.trim(),
      text: `
        Reset Your Password
        
        Hello {{name}},
        
        We received a request to reset your password for your GirlsPreneur account.
        
        Click the link below to reset your password:
        {{resetUrl}}
        
        If you didn't request this password reset, please ignore this email.
        
        This link will expire in 1 hour for security reasons.
        
        Best regards,
        The GirlsPreneur Team
      `.trim(),
      variables: ['name', 'resetUrl']
    }
  }

  /**
   * Create email verification template
   */
  static createEmailVerificationTemplate(): EmailTemplate {
    return {
      id: 'email-verification',
      name: 'Email Verification',
      subject: 'Verify Your GirlsPreneur Email Address',
      html: `
        <h1>Verify Your Email Address</h1>
        <p>Hello {{name}},</p>
        <p>Thank you for registering with GirlsPreneur! Please verify your email address to complete your registration.</p>
        <a href="{{verificationUrl}}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Verify Email</a>
        <p>If you didn't create this account, please ignore this email.</p>
        <p>Best regards,<br>The GirlsPreneur Team</p>
      `.trim(),
      text: `
        Verify Your Email Address
        
        Hello {{name}},
        
        Thank you for registering with GirlsPreneur! Please verify your email address to complete your registration.
        
        Click the link below to verify your email:
        {{verificationUrl}}
        
        If you didn't create this account, please ignore this email.
        
        Best regards,
        The GirlsPreneur Team
      `.trim(),
      variables: ['name', 'verificationUrl']
    }
  }

  /**
   * Create newsletter template
   */
  static createNewsletterTemplate(): EmailTemplate {
    return {
      id: 'newsletter',
      name: 'Monthly Newsletter',
      subject: 'GirlsPreneur Monthly Newsletter - {{month}} {{year}}',
      html: `
        <h1>GirlsPreneur Monthly Newsletter</h1>
        <p>Hello {{name}},</p>
        <h2>{{month}} {{year}} Highlights</h2>
        {{content}}
        <h2>Upcoming Events</h2>
        {{events}}
        <h2>Success Stories</h2>
        {{successStories}}
        <p>Stay connected with us on social media:</p>
        <p>
          <a href="{{socialLinks.facebook}}">Facebook</a> |
          <a href="{{socialLinks.twitter}}">Twitter</a> |
          <a href="{{socialLinks.linkedin}}">LinkedIn</a>
        </p>
        <p>Best regards,<br>The GirlsPreneur Team</p>
      `.trim(),
      text: `
        GirlsPreneur Monthly Newsletter
        
        Hello {{name}},
        
        {{month}} {{year}} Highlights
        {{content}}
        
        Upcoming Events
        {{events}}
        
        Success Stories
        {{successStories}}
        
        Stay connected with us on social media:
        Facebook: {{socialLinks.facebook}}
        Twitter: {{socialLinks.twitter}}
        LinkedIn: {{socialLinks.linkedin}}
        
        Best regards,
        The GirlsPreneur Team
      `.trim(),
      variables: ['name', 'month', 'year', 'content', 'events', 'successStories', 'socialLinks']
    }
  }
}