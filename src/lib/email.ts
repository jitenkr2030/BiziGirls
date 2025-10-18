import { config } from '@/lib/config'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

interface EmailTemplate {
  to: string
  subject: string
  template: string
  data: Record<string, any>
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  // In a real implementation, you would use a service like SendGrid, Mailgun, or AWS SES
  // For now, we'll log the email content
  
  console.log('=== EMAIL SENT ===')
  console.log('To:', options.to)
  console.log('Subject:', options.subject)
  console.log('HTML:', options.html)
  console.log('================')
  
  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 100))
}

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
  const resetLink = `${config.appUrl}/auth/reset-password?token=${resetToken}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reset Your Password</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Reset Your Password</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>We received a request to reset your password for your GirlsPreneur account. Click the button below to reset your password:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" class="button">Reset Password</a>
          </p>
          <p>If you didn't request this password reset, please ignore this email. This link will expire in 1 hour.</p>
          <p>For security reasons, please do not share this link with anyone.</p>
          <div class="footer">
            <p>Best regards,<br>The GirlsPreneur Team</p>
            <p>Empowering Women Entrepreneurs Worldwide</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  await sendEmail({
    to: email,
    subject: 'Reset Your Password - GirlsPreneur',
    html
  })
}

export async function sendEmailVerificationEmail(email: string, verificationToken: string): Promise<void> {
  const verificationLink = `${config.appUrl}/auth/verify-email?token=${verificationToken}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verify Your Email Address</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Verify Your Email Address</h1>
        </div>
        <div class="content">
          <p>Welcome to GirlsPreneur!</p>
          <p>To get started, please verify your email address by clicking the button below:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" class="button">Verify Email</a>
          </p>
          <p>If you didn't create an account with GirlsPreneur, please ignore this email. This link will expire in 24 hours.</p>
          <div class="footer">
            <p>Best regards,<br>The GirlsPreneur Team</p>
            <p>Empowering Women Entrepreneurs Worldwide</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  await sendEmail({
    to: email,
    subject: 'Verify Your Email Address - GirlsPreneur',
    html
  })
}

export async function sendWelcomeEmail(email: string, firstName: string): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to GirlsPreneur!</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to GirlsPreneur, ${firstName}!</h1>
        </div>
        <div class="content">
          <p>We're thrilled to have you join our community of women entrepreneurs!</p>
          <p>GirlsPreneur is your comprehensive platform for business growth, mentorship, funding opportunities, and skill development. Here's what you can do:</p>
          <ul style="margin: 20px 0; padding-left: 20px;">
            <li>🚀 Launch and grow your business with our tools</li>
            <li>👥 Connect with mentors and fellow entrepreneurs</li>
            <li>💰 Access funding opportunities and grants</li>
            <li>📚 Develop your skills with expert-led courses</li>
            <li>🤖 Get AI-powered business assistance</li>
          </ul>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${config.appUrl}/dashboard" class="button">Go to Dashboard</a>
          </p>
          <p>If you have any questions, don't hesitate to reach out to our support team.</p>
          <div class="footer">
            <p>Best regards,<br>The GirlsPreneur Team</p>
            <p>Empowering Women Entrepreneurs Worldwide</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  await sendEmail({
    to: email,
    subject: `Welcome to GirlsPreneur, ${firstName}!`,
    html
  })
}