import { getUploadConfig } from './config'

export interface ImageOptimizationOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'avif' | 'jpeg' | 'png'
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  background?: string
  progressive?: boolean
  withoutEnlargement?: boolean
  withoutReduction?: boolean
}

export interface ImageMetadata {
  width: number
  height: number
  format: string
  size: number
  density?: number
  hasTransparency?: boolean
  hasAlpha?: boolean
  isAnimated?: boolean
}

export class ImageOptimizer {
  private config: typeof getUploadConfig.return

  constructor() {
    this.config = getUploadConfig()
  }

  /**
   * Generate optimized image URL for different CDNs
   */
  generateOptimizedUrl(
    originalUrl: string,
    options: ImageOptimizationOptions = {}
  ): string {
    const {
      width,
      height,
      quality = 80,
      format = 'webp',
      fit = 'cover',
      position = 'center'
    } = options

    // Cloudinary optimization
    if (originalUrl.includes('cloudinary.com')) {
      return this.generateCloudinaryUrl(originalUrl, { width, height, quality, format, fit })
    }

    // AWS S3 with CloudFront
    if (originalUrl.includes('amazonaws.com') || originalUrl.includes('cloudfront.net')) {
      return this.generateS3Url(originalUrl, { width, height, quality, format })
    }

    // Local images - return as-is (Next.js Image component will handle optimization)
    return originalUrl
  }

  /**
   * Generate Cloudinary optimized URL
   */
  private generateCloudinaryUrl(
    url: string,
    options: Pick<ImageOptimizationOptions, 'width' | 'height' | 'quality' | 'format' | 'fit'>
  ): string {
    const transformations = []
    
    if (options.width) transformations.push(`w_${options.width}`)
    if (options.height) transformations.push(`h_${options.height}`)
    if (options.quality) transformations.push(`q_${options.quality}`)
    if (options.format) transformations.push(`f_${options.format}`)
    if (options.fit && options.fit !== 'cover') transformations.push(`c_${options.fit}`)
    
    if (transformations.length === 0) return url
    
    const transformString = transformations.join(',')
    return url.replace('/upload/', `/upload/${transformString}/`)
  }

  /**
   * Generate S3/CloudFront optimized URL
   */
  private generateS3Url(
    url: string,
    options: Pick<ImageOptimizationOptions, 'width' | 'height' | 'quality' | 'format'>
  ): string {
    const params = new URLSearchParams()
    
    if (options.width) params.set('w', options.width.toString())
    if (options.height) params.set('h', options.height.toString())
    if (options.quality) params.set('q', options.quality.toString())
    if (options.format) params.set('f', options.format)
    
    const queryString = params.toString()
    return queryString ? `${url}?${queryString}` : url
  }

  /**
   * Generate responsive image srcset
   */
  generateSrcSet(
    originalUrl: string,
    options: {
      widths?: number[]
      quality?: number
      format?: string
    } = {}
  ): string {
    const { widths = [320, 640, 768, 1024, 1280, 1536, 1920], quality = 80, format = 'webp' } = options
    
    return widths
      .map(width => {
        const optimizedUrl = this.generateOptimizedUrl(originalUrl, { width, quality, format })
        return `${optimizedUrl} ${width}w`
      })
      .join(', ')
  }

  /**
   * Generate responsive image sizes attribute
   */
  generateSizes(breakpoints: Array<{ minWidth?: number; maxWidth?: number; size: string }>): string {
    return breakpoints
      .map(bp => {
        if (bp.minWidth && bp.maxWidth) {
          return `(min-width: ${bp.minWidth}px) and (max-width: ${bp.maxWidth}px) ${bp.size}`
        } else if (bp.minWidth) {
          return `(min-width: ${bp.minWidth}px) ${bp.size}`
        } else if (bp.maxWidth) {
          return `(max-width: ${bp.maxWidth}px) ${bp.size}`
        } else {
          return bp.size
        }
      })
      .join(', ')
  }

  /**
   * Get image metadata
   */
  async getImageMetadata(imageUrl: string): Promise<ImageMetadata | null> {
    try {
      // For local development, return mock metadata
      if (process.env.NODE_ENV === 'development') {
        return {
          width: 1200,
          height: 800,
          format: 'jpeg',
          size: 256000,
          density: 72,
          hasTransparency: false,
          hasAlpha: false,
          isAnimated: false
        }
      }

      // In production, you would use a proper image processing library
      const response = await fetch(imageUrl, { method: 'HEAD' })
      if (!response.ok) return null

      const contentType = response.headers.get('content-type')
      const contentLength = response.headers.get('content-length')

      return {
        width: 1200, // Placeholder - would be calculated from actual image
        height: 800, // Placeholder - would be calculated from actual image
        format: contentType?.split('/')[1] || 'unknown',
        size: contentLength ? parseInt(contentLength) : 0,
        density: 72,
        hasTransparency: false,
        hasAlpha: false,
        isAnimated: false
      }
    } catch (error) {
      console.error('Error getting image metadata:', error)
      return null
    }
  }

  /**
   * Validate image file
   */
  validateImageFile(file: File): { valid: boolean; error?: string } {
    const { allowedTypes, maxFileSize } = this.config

    // Check file size
    if (file.size > maxFileSize) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${maxFileSize / 1024 / 1024}MB`
      }
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed`
      }
    }

    // Check file extension
    const extension = file.name.split('.').pop()?.toLowerCase()
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif']
    
    if (!extension || !allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error: `File extension .${extension} is not allowed`
      }
    }

    return { valid: true }
  }

  /**
   * Generate placeholder image
   */
  generatePlaceholder(
    width: number,
    height: number,
    options: {
      text?: string
      backgroundColor?: string
      textColor?: string
      format?: 'svg' | 'png'
    } = {}
  ): string {
    const {
      text = `${width}×${height}`,
      backgroundColor = '#f3f4f6',
      textColor = '#6b7280',
      format = 'svg'
    } = options

    if (format === 'svg') {
      return `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="${backgroundColor}"/>
          <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" 
                fill="${textColor}" text-anchor="middle" dominant-baseline="middle">
            ${text}
          </text>
        </svg>
      `.trim()
    }

    // For PNG, return a data URL (simplified)
    return `data:image/svg+xml;base64,${btoa(
      `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${backgroundColor}"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" 
              fill="${textColor}" text-anchor="middle" dominant-baseline="middle">
          ${text}
        </text>
      </svg>`
    )}`
  }

  /**
   * Create lazy loading image component props
   */
  createLazyImageProps(
    src: string,
    options: {
      alt: string
      width?: number
      height?: number
      priority?: boolean
      placeholder?: 'blur' | 'empty'
      className?: string
      sizes?: string
    } = {}
  ): any {
    const {
      alt,
      width,
      height,
      priority = false,
      placeholder = 'blur',
      className = '',
      sizes
    } = options

    return {
      src,
      alt,
      width,
      height,
      priority,
      placeholder,
      loading: priority ? 'eager' : 'lazy',
      className,
      sizes,
      style: {
        objectFit: 'cover',
        width: '100%',
        height: 'auto'
      }
    }
  }

  /**
   * Optimize image for different devices
   */
  createResponsiveImageSet(
    baseUrl: string,
    options: {
      alt: string
      breakpoints?: Array<{ width: number; media?: string }>
      quality?: number
    } = {}
  ): {
    src: string
    srcSet: string
    sizes: string
    alt: string
  } {
    const {
      alt,
      breakpoints = [
        { width: 320 },
        { width: 640 },
        { width: 768 },
        { width: 1024 },
        { width: 1280 }
      ],
      quality = 80
    } = options

    const srcSet = breakpoints
      .map(bp => {
        const optimizedUrl = this.generateOptimizedUrl(baseUrl, { width: bp.width, quality })
        return `${optimizedUrl} ${bp.width}w`
      })
      .join(', ')

    const sizes = breakpoints
      .map(bp => {
        if (bp.media) {
          return `${bp.media} ${bp.width}px`
        }
        return `(max-width: ${bp.width}px) ${bp.width}px`
      })
      .join(', ')

    return {
      src: this.generateOptimizedUrl(baseUrl, { width: breakpoints[0].width, quality }),
      srcSet,
      sizes,
      alt
    }
  }

  /**
   * Generate image optimization attributes
   */
  generateImageAttributes(
    src: string,
    options: ImageOptimizationOptions & {
      alt: string
      loading?: 'lazy' | 'eager'
      decoding?: 'sync' | 'async' | 'auto'
      fetchPriority?: 'high' | 'low' | 'auto'
    } = {}
  ): Record<string, string> {
    const {
      alt,
      loading = 'lazy',
      decoding = 'async',
      fetchPriority = 'auto',
      width,
      height,
      quality = 80,
      format = 'webp'
    } = options

    const optimizedSrc = this.generateOptimizedUrl(src, { width, height, quality, format })

    const attributes: Record<string, string> = {
      src: optimizedSrc,
      alt,
      loading,
      decoding,
      fetchPriority
    }

    if (width) attributes.width = width.toString()
    if (height) attributes.height = height.toString()

    return attributes
  }

  /**
   * Create picture element with multiple sources
   */
  createPictureElement(
    sources: Array<{
      srcSet: string
      type: string
      media?: string
    }>,
    fallbackImage: {
      src: string
      alt: string
      width?: number
      height?: number
      className?: string
    }
  ): string {
    const sourceElements = sources
      .map(source => {
        const mediaAttr = source.media ? ` media="${source.media}"` : ''
        return `<source srcset="${source.srcSet}" type="${source.type}"${mediaAttr}>`
      })
      .join('\n')

    const widthAttr = fallbackImage.width ? ` width="${fallbackImage.width}"` : ''
    const heightAttr = fallbackImage.height ? ` height="${fallbackImage.height}"` : ''
    const classAttr = fallbackImage.className ? ` class="${fallbackImage.className}"` : ''

    return `
      <picture>
        ${sourceElements}
        <img src="${fallbackImage.src}" alt="${fallbackImage.alt}"${widthAttr}${heightAttr}${classAttr}>
      </picture>
    `.trim()
  }
}

// Default image optimizer instance
export const imageOptimizer = new ImageOptimizer()

/**
 * Utility functions for image optimization
 */
export class ImageUtils {
  /**
   * Calculate aspect ratio
   */
  static calculateAspectRatio(width: number, height: number): number {
    return width / height
  }

  /**
   * Calculate dimensions based on aspect ratio
   */
  static calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    targetWidth?: number,
    targetHeight?: number
  ): { width: number; height: number } {
    const aspectRatio = this.calculateAspectRatio(originalWidth, originalHeight)

    if (targetWidth && !targetHeight) {
      return {
        width: targetWidth,
        height: Math.round(targetWidth / aspectRatio)
      }
    }

    if (targetHeight && !targetWidth) {
      return {
        width: Math.round(targetHeight * aspectRatio),
        height: targetHeight
      }
    }

    if (targetWidth && targetHeight) {
      return {
        width: targetWidth,
        height: targetHeight
      }
    }

    return {
      width: originalWidth,
      height: originalHeight
    }
  }

  /**
   * Generate blur placeholder data URL
   */
  static generateBlurPlaceholder(width: number, height: number): string {
    // Create a simple blur placeholder
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      ctx.fillStyle = '#f3f4f6'
      ctx.fillRect(0, 0, width, height)
      
      // Add some noise for blur effect
      const imageData = ctx.getImageData(0, 0, width, height)
      const data = imageData.data
      
      for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 20 - 10
        data[i] = Math.min(255, Math.max(0, data[i] + noise))     // Red
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise)) // Green
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise)) // Blue
      }
      
      ctx.putImageData(imageData, 0, 0)
      return canvas.toDataURL('image/jpeg', 0.1)
    }

    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4='
  }

  /**
   * Get optimal image format for browser support
   */
  static getOptimalFormat(): 'webp' | 'avif' | 'jpeg' {
    if (typeof document === 'undefined') return 'jpeg'

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    if (context && context.getImageData) {
      // Check for AVIF support
      if (canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0) {
        return 'avif'
      }
      
      // Check for WebP support
      if (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
        return 'webp'
      }
    }

    return 'jpeg'
  }

  /**
   * Calculate optimal image quality based on file size
   */
  static calculateOptimalQuality(
    originalSize: number,
    targetSize: number,
    currentQuality: number = 80
  ): number {
    const sizeRatio = targetSize / originalSize
    const qualityAdjustment = Math.log(sizeRatio) / Math.log(0.8) // Approximate quality-size relationship
    
    return Math.max(10, Math.min(95, Math.round(currentQuality + qualityAdjustment * 10)))
  }

  /**
   * Generate CSS for responsive images
   */
  static generateResponsiveImageCSS(
    selector: string,
    breakpoints: Array<{ minWidth?: number; maxWidth?: number; width: number }>
  ): string {
    const rules = breakpoints.map(bp => {
      const mediaQuery = bp.minWidth && bp.maxWidth
        ? `@media (min-width: ${bp.minWidth}px) and (max-width: ${bp.maxWidth}px)`
        : bp.minWidth
        ? `@media (min-width: ${bp.minWidth}px)`
        : bp.maxWidth
        ? `@media (max-width: ${bp.maxWidth}px)`
        : ''
      
      const rule = `${selector} { max-width: ${bp.width}px; }`
      
      return mediaQuery ? `${mediaQuery} { ${rule} }` : rule
    })

    return rules.join('\n')
  }
}

/**
 * React component utilities for image optimization
 */
export const ImageOptimizationComponents = {
  /**
   * Generate Next.js Image component props
   */
  NextImageProps: (
    src: string,
    options: {
      alt: string
      width?: number
      height?: number
      priority?: boolean
      placeholder?: 'blur' | 'empty'
      blurDataURL?: string
      className?: string
      sizes?: string
      quality?: number
    } = {}
  ) => {
    const {
      alt,
      width,
      height,
      priority = false,
      placeholder = 'blur',
      blurDataURL,
      className = '',
      sizes,
      quality = 80
    } = options

    return {
      src,
      alt,
      width,
      height,
      priority,
      placeholder,
      ...(blurDataURL && { blurDataURL }),
      className,
      sizes,
      quality,
      style: {
        objectFit: 'cover',
        width: '100%',
        height: 'auto'
      }
    }
  },

  /**
   * Generate picture element with Next.js Images
   */
  ResponsivePicture: (
    sources: Array<{
      srcSet: string
      type: string
      media?: string
    }>,
    fallbackImage: {
      src: string
      alt: string
      width?: number
      height?: number
      className?: string
    }
  ) => {
    return {
      sources: sources.map(source => ({
        srcSet: source.srcSet,
        type: source.type,
        media: source.media
      })),
      img: {
        src: fallbackImage.src,
        alt: fallbackImage.alt,
        width: fallbackImage.width,
        height: fallbackImage.height,
        className: fallbackImage.className
      }
    }
  }
}