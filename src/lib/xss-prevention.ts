import { InputSanitizer } from './sanitization'

export class XSSPrevention {
  private static readonly DANGEROUS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:\s*text\/html/gi,
    /vbscript:/gi,
    /livescript:/gi,
    /<\s*iframe\b[^>]*>/gi,
    /<\s*object\b[^>]*>/gi,
    /<\s*embed\b[^>]*>/gi,
    /<\s*applet\b[^>]*>/gi,
    /<\s*form\b[^>]*>/gi,
    /<\s*input\b[^>]*>/gi,
    /<\s*meta\b[^>]*>/gi,
    /<\s*link\b[^>]*>/gi,
    /<\s*style\b[^>]*>.*?<\/style>/gi,
    /<\s*\/?\s*html\b[^>]*>/gi,
    /<\s*\/?\s*head\b[^>]*>/gi,
    /<\s*\/?\s*body\b[^>]*>/gi,
    /expression\s*\(/gi,
    /-\s*moz-binding\s*:/gi,
    /-\s*o-link\s*:/gi,
    /-\s*o-link-source\s*:/gi,
    /-\s*ms-behavior\s*:/gi,
    /behavior\s*:\s*url\(/gi,
    /@import\s*url\(/gi,
    /@import\s*'/gi,
    /@import\s*"/gi,
  ]

  private static readonly DANGEROUS_ATTRIBUTES = [
    'onload', 'onerror', 'onclick', 'ondblclick', 'onmousedown', 'onmouseup',
    'onmouseover', 'onmousemove', 'onmouseout', 'onmouseenter', 'onmouseleave',
    'onkeydown', 'onkeyup', 'onkeypress', 'onfocus', 'onblur', 'onchange',
    'onsubmit', 'onreset', 'onselect', 'oncontextmenu', 'onabort', 'oncanplay',
    'oncanplaythrough', 'oncuechange', 'ondurationchange', 'onemptied', 'onended',
    'onerror', 'onloadeddata', 'onloadedmetadata', 'onloadstart', 'onpause',
    'onplay', 'onplaying', 'onprogress', 'onratechange', 'onseeked', 'onseeking',
    'onstalled', 'onsuspend', 'ontimeupdate', 'onvolumechange', 'onwaiting',
    'onwheel', 'oncopy', 'oncut', 'onpaste', 'ondrag', 'ondragend', 'ondragenter',
    'ondragleave', 'ondragover', 'ondragstart', 'ondrop', 'onscroll', 'onresize',
    'onshow', 'ontoggle', 'onmessage', 'onmessageerror', 'onoffline', 'ononline',
    'onpagehide', 'onpageshow', 'onpopstate', 'onrejectionhandled', 'onstorage',
    'onunhandledrejection', 'onunload'
  ]

  private static readonly DANGEROUS_CSS_PROPERTIES = [
    'expression', 'javascript', 'vbscript', 'behavior', 'script', 'binding',
    'include-source', '-moz-binding'
  ]

  /**
   * Sanitize input to prevent XSS attacks
   */
  static sanitize(input: string): string {
    if (typeof input !== 'string') {
      return input
    }

    let sanitized = input

    // Remove dangerous patterns
    for (const pattern of this.DANGEROUS_PATTERNS) {
      sanitized = sanitized.replace(pattern, '')
    }

    // Remove dangerous attributes
    for (const attr of this.DANGEROUS_ATTRIBUTES) {
      const regex = new RegExp(`${attr}\\s*=\\s*["'][^"']*["']`, 'gi')
      sanitized = sanitized.replace(regex, '')
    }

    // Remove dangerous CSS properties
    for (const prop of this.DANGEROUS_CSS_PROPERTIES) {
      const regex = new RegExp(`${prop}\\s*\\([^)]*\\)`, 'gi')
      sanitized = sanitized.replace(regex, '')
    }

    // HTML entity encoding
    sanitized = this.encodeHTMLEntities(sanitized)

    return sanitized
  }

  /**
   * Sanitize HTML content (allows safe HTML tags)
   */
  static sanitizeHTML(html: string, allowedTags: string[] = []): string {
    if (typeof html !== 'string') {
      return html
    }

    const defaultAllowedTags = [
      'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'blockquote',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre', 'code', 'span', 'div'
    ]

    const tags = [...defaultAllowedTags, ...allowedTags]
    
    // Create regex pattern for allowed tags
    const allowedPattern = tags.map(tag => `<\\s*${tag}\\b[^>]*>|<\\s*\\/\\s*${tag}\\s*>`).join('|')
    const allowedRegex = new RegExp(`(${allowedPattern})`, 'gi')

    // Extract allowed tags
    const parts = html.split(allowedRegex)
    const sanitizedParts = parts.map(part => {
      if (allowedRegex.test(part)) {
        // This is an allowed tag, sanitize its attributes
        return this.sanitizeHTMLAttributes(part)
      } else {
        // This is not a tag, encode it
        return this.encodeHTMLEntities(part)
      }
    })

    return sanitizedParts.join('')
  }

  /**
   * Sanitize HTML attributes
   */
  static sanitizeHTMLAttributes(html: string): string {
    const tagRegex = /<(\w+)([^>]*)>/gi
    return html.replace(tagRegex, (match, tagName, attributes) => {
      // Remove dangerous attributes
      const sanitizedAttributes = attributes.replace(
        /\s+(\w+)\s*=\s*["'][^"']*["']/gi,
        (attrMatch, attrName) => {
          if (this.DANGEROUS_ATTRIBUTES.includes(attrName.toLowerCase())) {
            return ''
          }
          return attrMatch
        }
      )
      
      return `<${tagName}${sanitizedAttributes}>`
    })
  }

  /**
   * Sanitize CSS to prevent XSS
   */
  static sanitizeCSS(css: string): string {
    if (typeof css !== 'string') {
      return css
    }

    let sanitized = css

    // Remove dangerous CSS properties
    for (const prop of this.DANGEROUS_CSS_PROPERTIES) {
      const regex = new RegExp(`${prop}\\s*\\([^)]*\\)`, 'gi')
      sanitized = sanitized.replace(regex, '')
    }

    // Remove dangerous URL schemes
    sanitized = sanitized.replace(/url\s*\(\s*["']?(javascript|data|vbscript):[^"']*["']?\s*\)/gi, '')

    return sanitized
  }

  /**
   * Sanitize URL to prevent XSS
   */
  static sanitizeURL(url: string): string {
    if (typeof url !== 'string') {
      return url
    }

    // Remove dangerous protocols
    const dangerousProtocols = [
      'javascript:', 'data:', 'vbscript:', 'file:', 'ftp:', 'mailto:', 'tel:'
    ]

    for (const protocol of dangerousProtocols) {
      if (url.toLowerCase().includes(protocol)) {
        return '#'
      }
    }

    // Validate URL structure
    try {
      new URL(url)
      return url
    } catch {
      return '#'
    }
  }

  /**
   * Encode HTML entities
   */
  static encodeHTMLEntities(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/\//g, '&#x2F;')
  }

  /**
   * Decode HTML entities (use with caution)
   */
  static decodeHTMLEntities(text: string): string {
    return text
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x2F;/g, '/')
      .replace(/&amp;/g, '&')
  }

  /**
   * Check if input contains XSS patterns
   */
  static containsXSS(input: string): boolean {
    if (typeof input !== 'string') {
      return false
    }

    for (const pattern of this.DANGEROUS_PATTERNS) {
      if (pattern.test(input)) {
        return true
      }
    }

    for (const attr of this.DANGEROUS_ATTRIBUTES) {
      if (input.toLowerCase().includes(attr)) {
        return true
      }
    }

    return false
  }

  /**
   * Validate and sanitize an object
   */
  static validateAndSanitizeObject(obj: Record<string, any>): {
    sanitized: Record<string, any>
    warnings: string[]
  } {
    const warnings: string[] = []
    const sanitized: Record<string, any> = {}

    const process = (value: any, path: string = ''): any => {
      if (typeof value === 'string') {
        if (this.containsXSS(value)) {
          warnings.push(`XSS detected in ${path || 'input'}: ${value}`)
          return this.sanitize(value)
        }
        return this.sanitize(value)
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const result: Record<string, any> = {}
        for (const [key, val] of Object.entries(value)) {
          result[key] = process(val, path ? `${path}.${key}` : key)
        }
        return result
      } else if (Array.isArray(value)) {
        return value.map((item, index) => 
          process(item, path ? `${path}[${index}]` : `[${index}]`)
        )
      } else {
        return value
      }
    }

    const result = process(obj)
    return { sanitized: result, warnings }
  }

  /**
   * Create a safe DOM element from HTML string
   */
  static createSafeElement(html: string, tagName: string = 'div'): HTMLElement {
    const sanitized = this.sanitizeHTML(html)
    const element = document.createElement(tagName)
    element.innerHTML = sanitized
    return element
  }

  /**
   * Sanitize user-generated content for display
   */
  static sanitizeUserContent(content: string): string {
    return this.sanitizeHTML(content, [
      'a', 'img', 'video', 'audio', 'iframe', 'table', 'tr', 'td', 'th',
      'thead', 'tbody', 'tfoot', 'caption', 'colgroup', 'col'
    ])
  }

  /**
   * Log XSS attempt
   */
  static logXSSAttempt(input: string, context: string = 'unknown'): void {
    console.error(`XSS Attempt Detected - Context: ${context}`)
    console.error(`Input: ${input}`)
    console.error(`Timestamp: ${new Date().toISOString()}`)
    
    // In production, this should be sent to a security monitoring system
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to security monitoring service
    }
  }

  /**
   * Validate SVG content
   */
  static validateSVG(svg: string): boolean {
    const dangerousSVGElements = ['script', 'iframe', 'object', 'embed', 'applet']
    const dangerousSVGAttributes = ['onload', 'onerror', 'onclick', 'onabort', 'onactivate']
    
    for (const element of dangerousSVGElements) {
      if (svg.toLowerCase().includes(`<${element}`)) {
        return false
      }
    }
    
    for (const attr of dangerousSVGAttributes) {
      if (svg.toLowerCase().includes(attr)) {
        return false
      }
    }
    
    return true
  }

  /**
   * Sanitize SVG content
   */
  static sanitizeSVG(svg: string): string {
    if (!this.validateSVG(svg)) {
      return '<!-- Invalid SVG content -->'
    }
    
    // Remove dangerous elements and attributes
    let sanitized = svg
    
    // Remove script tags
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    
    // Remove dangerous attributes
    for (const attr of dangerousSVGAttributes) {
      sanitized = sanitized.replace(new RegExp(`${attr}\\s*=\\s*["'][^"']*["']`, 'gi'), '')
    }
    
    return sanitized
  }
}

// Default instance
export const xssPrevention = new XSSPrevention()