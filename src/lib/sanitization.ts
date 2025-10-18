export class InputSanitizer {
  static sanitizeString(input: string): string {
    if (typeof input !== 'string') {
      return ''
    }
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove JavaScript protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  }

  static sanitizeEmail(email: string): string {
    if (typeof email !== 'string') {
      return ''
    }
    
    return email.toLowerCase().trim()
  }

  static sanitizeUrl(url: string): string {
    if (typeof url !== 'string') {
      return ''
    }
    
    // Remove dangerous protocols
    const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:']
    const lowerUrl = url.toLowerCase()
    
    for (const protocol of dangerousProtocols) {
      if (lowerUrl.startsWith(protocol)) {
        return ''
      }
    }
    
    return url.trim()
  }

  static sanitizeHtml(html: string): string {
    if (typeof html !== 'string') {
      return ''
    }
    
    // Basic HTML sanitization - remove script tags and event handlers
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/javascript:[^"']*/gi, '')
  }

  static sanitizeObject(obj: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {}
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value)
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        sanitized[key] = this.sanitizeObject(value)
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => {
          if (typeof item === 'string') {
            return this.sanitizeString(item)
          } else if (typeof item === 'object' && item !== null) {
            return this.sanitizeObject(item)
          }
          return item
        })
      } else {
        sanitized[key] = value
      }
    }
    
    return sanitized
  }

  static validateFileType(filename: string, allowedTypes: string[]): boolean {
    const extension = filename.split('.').pop()?.toLowerCase()
    if (!extension) {
      return false
    }
    
    const mimeType = this.getMimeType(extension)
    return allowedTypes.includes(mimeType)
  }

  static validateFileSize(size: number, maxSize: number): boolean {
    return size <= maxSize
  }

  private static getMimeType(extension: string): string {
    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    }
    
    return mimeTypes[extension] || 'application/octet-stream'
  }
}