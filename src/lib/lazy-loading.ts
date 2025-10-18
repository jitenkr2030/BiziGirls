import { performanceOptimizer } from './performance-optimization'

export interface LazyLoadOptions {
  root?: Element | null
  rootMargin?: string
  threshold?: number | number[]
  placeholder?: string
  loadingStrategy?: 'lazy' | 'eager' | 'auto'
  retryCount?: number
  retryDelay?: number
  onError?: (error: Error, element: Element) => void
  onSuccess?: (element: Element) => void
}

export interface LazyLoadEntry {
  element: Element
  src: string
  options: LazyLoadOptions
  retryCount: number
  loaded: boolean
  error: boolean
}

export class LazyLoadingService {
  private observer: IntersectionObserver | null = null
  private entries: Map<Element, LazyLoadEntry> = new Map()
  private defaultOptions: Required<LazyLoadOptions>

  constructor() {
    this.defaultOptions = {
      root: null,
      rootMargin: '50px',
      threshold: [0, 0.1, 0.5, 1],
      placeholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4=',
      loadingStrategy: 'lazy',
      retryCount: 3,
      retryDelay: 1000,
      onError: (error, element) => console.error('Lazy load error:', error, element),
      onSuccess: (element) => console.log('Lazy load success:', element)
    }

    this.initializeObserver()
  }

  /**
   * Initialize Intersection Observer
   */
  private initializeObserver(): void {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver not supported, falling back to eager loading')
      return
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.loadElement(entry.target)
          }
        })
      },
      {
        root: this.defaultOptions.root,
        rootMargin: this.defaultOptions.rootMargin,
        threshold: this.defaultOptions.threshold
      }
    )
  }

  /**
   * Add element to lazy loading
   */
  add(element: Element, src: string, options: LazyLoadOptions = {}): void {
    const mergedOptions = { ...this.defaultOptions, ...options }
    const lazyEntry: LazyLoadEntry = {
      element,
      src,
      options: mergedOptions,
      retryCount: 0,
      loaded: false,
      error: false
    }

    this.entries.set(element, lazyEntry)

    // Set placeholder
    if (element instanceof HTMLImageElement) {
      element.dataset.src = src
      element.src = mergedOptions.placeholder
      element.loading = 'lazy'
    } else if (element instanceof HTMLIFrameElement) {
      element.dataset.src = src
      element.src = 'about:blank'
    }

    // Start observing if observer is available
    if (this.observer && mergedOptions.loadingStrategy === 'lazy') {
      this.observer.observe(element)
    } else if (mergedOptions.loadingStrategy === 'eager') {
      this.loadElement(element)
    }
  }

  /**
   * Remove element from lazy loading
   */
  remove(element: Element): void {
    if (this.observer) {
      this.observer.unobserve(element)
    }
    this.entries.delete(element)
  }

  /**
   * Load element
   */
  private async loadElement(element: Element): Promise<void> {
    const entry = this.entries.get(element)
    if (!entry || entry.loaded || entry.error) return

    try {
      if (element instanceof HTMLImageElement) {
        await this.loadImage(element, entry)
      } else if (element instanceof HTMLIFrameElement) {
        await this.loadIframe(element, entry)
      } else if (element instanceof HTMLElement) {
        await this.loadCustomElement(element, entry)
      }

      entry.loaded = true
      entry.options.onSuccess(element)
    } catch (error) {
      await this.handleError(element, entry, error as Error)
    }
  }

  /**
   * Load image element
   */
  private async loadImage(element: HTMLImageElement, entry: LazyLoadEntry): Promise<void> {
    return new Promise((resolve, reject) => {
      const src = entry.src
      
      // Create a new image to preload
      const img = new Image()
      
      img.onload = () => {
        element.src = src
        element.classList.add('loaded')
        resolve()
      }
      
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${src}`))
      }
      
      // Start loading
      img.src = src
    })
  }

  /**
   * Load iframe element
   */
  private async loadIframe(element: HTMLIFrameElement, entry: LazyLoadEntry): Promise<void> {
    return new Promise((resolve, reject) => {
      const src = entry.src
      
      element.onload = () => {
        element.classList.add('loaded')
        resolve()
      }
      
      element.onerror = () => {
        reject(new Error(`Failed to load iframe: ${src}`))
      }
      
      // Start loading
      element.src = src
    })
  }

  /**
   * Load custom element (background image, etc.)
   */
  private async loadCustomElement(element: HTMLElement, entry: LazyLoadEntry): Promise<void> {
    const src = entry.src
    
    if (element.dataset.background === 'true') {
      // Load background image
      return new Promise((resolve, reject) => {
        const img = new Image()
        
        img.onload = () => {
          element.style.backgroundImage = `url(${src})`
          element.classList.add('loaded')
          resolve()
        }
        
        img.onerror = () => {
          reject(new Error(`Failed to load background image: ${src}`))
        }
        
        img.src = src
      })
    } else {
      // Custom loading logic
      element.setAttribute('data-loaded', 'true')
      element.classList.add('loaded')
    }
  }

  /**
   * Handle loading error
   */
  private async handleError(element: Element, entry: LazyLoadEntry, error: Error): Promise<void> {
    entry.error = true
    entry.retryCount++

    if (entry.retryCount <= entry.options.retryCount) {
      // Retry loading
      setTimeout(() => {
        entry.error = false
        this.loadElement(element)
      }, entry.options.retryDelay)
    } else {
      // Final error
      element.classList.add('error')
      entry.options.onError(error, element)
    }
  }

  /**
   * Load all elements immediately
   */
  loadAll(): void {
    this.entries.forEach((entry, element) => {
      if (!entry.loaded && !entry.error) {
        this.loadElement(element)
      }
    })
  }

  /**
   * Get statistics
   */
  getStats(): {
    total: number
    loaded: number
    error: number
    pending: number
  } {
    let loaded = 0
    let error = 0
    let pending = 0

    this.entries.forEach((entry) => {
      if (entry.loaded) loaded++
      else if (entry.error) error++
      else pending++
    })

    return {
      total: this.entries.size,
      loaded,
      error,
      pending
    }
  }

  /**
   * Destroy observer and clear entries
   */
  destroy(): void {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
    this.entries.clear()
  }
}

// Default lazy loading service instance
export const lazyLoadingService = new LazyLoadingService()

/**
 * React hook for lazy loading
 */
export function useLazyLoading() {
  const addLazyLoad = (element: Element, src: string, options?: LazyLoadOptions) => {
    lazyLoadingService.add(element, src, options)
  }

  const removeLazyLoad = (element: Element) => {
    lazyLoadingService.remove(element)
  }

  const loadAll = () => {
    lazyLoadingService.loadAll()
  }

  const getStats = () => {
    return lazyLoadingService.getStats()
  }

  return { addLazyLoad, removeLazyLoad, loadAll, getStats }
}

/**
 * Lazy loading utilities for different element types
 */
export class LazyLoadingUtils {
  /**
   * Lazy load images
   */
  static lazyLoadImages(
    selector: string = '[data-lazy-src]',
    options: LazyLoadOptions = {}
  ): void {
    const elements = document.querySelectorAll(selector)
    elements.forEach((element) => {
      if (element instanceof HTMLElement) {
        const src = element.dataset.lazySrc || ''
        if (src) {
          lazyLoadingService.add(element, src, options)
        }
      }
    })
  }

  /**
   * Lazy load iframes
   */
  static lazyLoadIframes(
    selector: string = 'iframe[data-lazy-src]',
    options: LazyLoadOptions = {}
  ): void {
    const elements = document.querySelectorAll(selector)
    elements.forEach((element) => {
      if (element instanceof HTMLIFrameElement) {
        const src = element.dataset.lazySrc || ''
        if (src) {
          lazyLoadingService.add(element, src, options)
        }
      }
    })
  }

  /**
   * Lazy load background images
   */
  static lazyLoadBackgrounds(
    selector: string = '[data-lazy-background]',
    options: LazyLoadOptions = {}
  ): void {
    const elements = document.querySelectorAll(selector)
    elements.forEach((element) => {
      if (element instanceof HTMLElement) {
        const src = element.dataset.lazyBackground || ''
        if (src) {
          element.dataset.background = 'true'
          lazyLoadingService.add(element, src, options)
        }
      }
    })
  }

  /**
   * Create lazy load component props
   */
  static createLazyProps(
    src: string,
    options: LazyLoadOptions & {
      alt?: string
      className?: string
      width?: number
      height?: number
    } = {}
  ): any {
    const {
      alt = '',
      className = '',
      width,
      height,
      ...lazyOptions
    } = options

    return {
      'data-lazy-src': src,
      alt,
      className,
      width,
      height,
      loading: 'lazy',
      onLoad: (e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.classList.add('loaded')
        lazyOptions.onSuccess?.(e.currentTarget)
      },
      onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.classList.add('error')
        lazyOptions.onError?.(new Error('Image load failed'), e.currentTarget)
      }
    }
  }

  /**
   * Generate CSS for lazy loading animations
   */
  static generateLazyLoadingCSS(): string {
    return `
      [data-lazy-src] {
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
      }
      
      [data-lazy-src].loaded {
        opacity: 1;
      }
      
      [data-lazy-src].error {
        opacity: 0.5;
        filter: grayscale(100%);
      }
      
      .lazy-loading-placeholder {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
      }
      
      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      
      .lazy-skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
        border-radius: 4px;
      }
    `.trim()
  }

  /**
   * Create skeleton loader component
   */
  static createSkeletonLoader(
    type: 'text' | 'image' | 'avatar' | 'button' | 'card',
    options: {
      width?: string
      height?: string
      className?: string
    } = {}
  ): string {
    const { width = '100%', height = '1rem', className = '' } = options
    
    const baseClasses = 'lazy-skeleton'
    const typeClasses = {
      text: 'rounded',
      image: 'rounded-lg',
      avatar: 'rounded-full',
      button: 'rounded-md',
      card: 'rounded-xl'
    }
    
    const allClasses = `${baseClasses} ${typeClasses[type]} ${className}`.trim()
    
    return `<div class="${allClasses}" style="width: ${width}; height: ${height};"></div>`
  }

  /**
   * Initialize lazy loading on page load
   */
  static initialize(): void {
    if (typeof window !== 'undefined') {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          this.lazyLoadImages()
          this.lazyLoadIframes()
          this.lazyLoadBackgrounds()
        })
      } else {
        this.lazyLoadImages()
        this.lazyLoadIframes()
        this.lazyLoadBackgrounds()
      }
    }
  }
}

/**
 * Performance monitoring for lazy loading
 */
export class LazyLoadingPerformance {
  private metrics: Map<string, number> = new Map()

  /**
   * Track load time
   */
  trackLoadTime(element: Element, loadTime: number): void {
    const key = `${element.tagName.toLowerCase()}-${element.className || 'unnamed'}`
    const currentTime = this.metrics.get(key) || 0
    this.metrics.set(key, currentTime + loadTime)
  }

  /**
   * Get average load times
   */
  getAverageLoadTimes(): Record<string, number> {
    const averages: Record<string, number> = {}
    const counts: Record<string, number> = {}

    this.metrics.forEach((time, key) => {
      const [type] = key.split('-')
      averages[type] = (averages[type] || 0) + time
      counts[type] = (counts[type] || 0) + 1
    })

    Object.keys(averages).forEach(type => {
      averages[type] = averages[type] / counts[type]
    })

    return averages
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const averages = this.getAverageLoadTimes()
    const stats = lazyLoadingService.getStats()
    
    const report = [
      '=== Lazy Loading Performance Report ===',
      `Total Elements: ${stats.total}`,
      `Loaded: ${stats.loaded}`,
      `Error: ${stats.error}`,
      `Pending: ${stats.pending}`,
      '',
      'Average Load Times:',
      ...Object.entries(averages).map(([type, time]) => `  ${type}: ${time.toFixed(2)}ms`),
      '=========================================='
    ]

    return report.join('\n')
  }
}

// Performance monitoring instance
export const lazyLoadingPerformance = new LazyLoadingPerformance()

// Initialize lazy loading when DOM is ready
if (typeof window !== 'undefined') {
  LazyLoadingUtils.initialize()
}