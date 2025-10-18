import { performanceOptimizer } from './performance-optimization'
import React from 'react'

export interface CodeSplittingOptions {
  strategy: 'route' | 'component' | 'feature' | 'vendor'
  chunkSize?: number
  preload?: boolean
  prefetch?: boolean
  priority?: 'high' | 'low' | 'auto'
  cacheStrategy?: 'cache-first' | 'network-first' | 'cache-only' | 'network-only'
}

export interface ChunkInfo {
  name: string
  size: number
  loaded: boolean
  error?: string
  loadTime?: number
}

export class CodeSplittingService {
  private chunks: Map<string, ChunkInfo> = new Map()
  private loadingPromises: Map<string, Promise<any>> = new Map()
  private defaultOptions: Required<CodeSplittingOptions>

  constructor() {
    this.defaultOptions = {
      strategy: 'route',
      chunkSize: 244 * 1024, // 244KB (recommended max chunk size)
      preload: false,
      prefetch: false,
      priority: 'auto',
      cacheStrategy: 'cache-first'
    }
  }

  /**
   * Create dynamic import with code splitting
   */
  createDynamicImport<T,>(
    importFn: () => Promise<T>,
    options: CodeSplittingOptions = {}
  ): () => Promise<T> {
    const mergedOptions = { ...this.defaultOptions, ...options }
    const chunkName = this.generateChunkName(importFn.toString(), mergedOptions.strategy)

    return async () => {
      // Check if already loading
      if (this.loadingPromises.has(chunkName)) {
        return this.loadingPromises.get(chunkName)!
      }

      // Check cache if cache-first strategy
      if (mergedOptions.cacheStrategy === 'cache-first') {
        const cached = await this.getFromCache(chunkName)
        if (cached) {
          return cached
        }
      }

      const startTime = performance.now()
      const loadPromise = this.loadChunk(importFn, chunkName, mergedOptions)
      
      this.loadingPromises.set(chunkName, loadPromise)

      try {
        const result = await loadPromise
        const loadTime = performance.now() - startTime
        
        // Update chunk info
        this.chunks.set(chunkName, {
          name: chunkName,
          size: this.estimateChunkSize(result),
          loaded: true,
          loadTime
        })

        // Cache the result
        await this.setToCache(chunkName, result, mergedOptions)

        return result
      } catch (error) {
        // Update chunk info with error
        this.chunks.set(chunkName, {
          name: chunkName,
          size: 0,
          loaded: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })

        throw error
      } finally {
        this.loadingPromises.delete(chunkName)
      }
    }
  }

  /**
   * Load chunk with error handling and retry
   */
  private async loadChunk<T,>(
    importFn: () => Promise<T>,
    chunkName: string,
    options: CodeSplittingOptions
  ): Promise<T> {
    const maxRetries = 3
    const retryDelay = 1000
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await importFn()
        return result
      } catch (error) {
        lastError = error as Error
        console.warn(`Failed to load chunk ${chunkName} (attempt ${attempt}/${maxRetries}):`, error)
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
        }
      }
    }

    throw lastError || new Error(`Failed to load chunk ${chunkName} after ${maxRetries} attempts`)
  }

  /**
   * Generate chunk name based on strategy
   */
  private generateChunkName(importFnString: string, strategy: string): string {
    // Simple hash function for generating consistent chunk names
    const hash = (str: string): number => {
      let hash = 0
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32-bit integer
      }
      return Math.abs(hash)
    }

    const importHash = hash(importFnString).toString(36)
    
    switch (strategy) {
      case 'route':
        return `route-${importHash}`
      case 'component':
        return `component-${importHash}`
      case 'feature':
        return `feature-${importHash}`
      case 'vendor':
        return `vendor-${importHash}`
      default:
        return `chunk-${importHash}`
    }
  }

  /**
   * Estimate chunk size
   */
  private estimateChunkSize(result: any): number {
    // This is a simplified estimation
    // In a real implementation, you'd get the actual bundle size
    try {
      const jsonString = JSON.stringify(result)
      return new Blob([jsonString]).size
    } catch {
      return 0
    }
  }

  /**
   * Get chunk from cache
   */
  private async getFromCache<T,>(chunkName: string): Promise<T | null> {
    try {
      const cacheKey = `chunk-${chunkName}`
      const cached = await performanceOptimizer.getCache(cacheKey)
      return cached as T
    } catch {
      return null
    }
  }

  /**
   * Set chunk to cache
   */
  private async setToCache<T,>(
    chunkName: string,
    result: T,
    options: CodeSplittingOptions
  ): Promise<void> {
    try {
      const cacheKey = `chunk-${chunkName}`
      const ttl = options.cacheStrategy === 'cache-first' ? 3600000 : 600000 // 1 hour or 10 minutes
      await performanceOptimizer.setCache({ key: cacheKey, data: result, ttl })
    } catch (error) {
      console.warn('Failed to cache chunk:', error)
    }
  }

  /**
   * Preload chunk
   */
  async preloadChunk<T,>(
    importFn: () => Promise<T>,
    options: CodeSplittingOptions = {}
  ): Promise<void> {
    const mergedOptions = { ...this.defaultOptions, ...options, preload: true }
    const dynamicImport = this.createDynamicImport(importFn, mergedOptions)
    
    try {
      await dynamicImport()
    } catch (error) {
      console.warn('Failed to preload chunk:', error)
    }
  }

  /**
   * Prefetch chunk
   */
  prefetchChunk<T,>(
    importFn: () => Promise<T>,
    options: CodeSplittingOptions = {}
  ): void {
    const mergedOptions = { ...this.defaultOptions, ...options, prefetch: true }
    
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        this.preloadChunk(importFn, mergedOptions)
      })
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        this.preloadChunk(importFn, mergedOptions)
      }, 2000)
    }
  }

  /**
   * Get chunk information
   */
  getChunkInfo(chunkName: string): ChunkInfo | null {
    return this.chunks.get(chunkName) || null
  }

  /**
   * Get all chunks information
   */
  getAllChunksInfo(): ChunkInfo[] {
    return Array.from(this.chunks.values())
  }

  /**
   * Get loading statistics
   */
  getStats(): {
    totalChunks: number
    loadedChunks: number
    errorChunks: number
    totalSize: number
    averageLoadTime: number
  } {
    const chunks = Array.from(this.chunks.values())
    const loadedChunks = chunks.filter(chunk => chunk.loaded)
    const errorChunks = chunks.filter(chunk => chunk.error)
    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0)
    const averageLoadTime = loadedChunks.length > 0
      ? loadedChunks.reduce((sum, chunk) => sum + (chunk.loadTime || 0), 0) / loadedChunks.length
      : 0

    return {
      totalChunks: chunks.length,
      loadedChunks: loadedChunks.length,
      errorChunks: errorChunks.length,
      totalSize,
      averageLoadTime
    }
  }

  /**
   * Clear cache for specific chunk
   */
  async clearChunkCache(chunkName: string): Promise<void> {
    try {
      const cacheKey = `chunk-${chunkName}`
      await performanceOptimizer.clearCache(cacheKey)
    } catch (error) {
      console.warn('Failed to clear chunk cache:', error)
    }
  }

  /**
   * Clear all chunk cache
   */
  async clearAllCache(): Promise<void> {
    try {
      await performanceOptimizer.clearAllCache()
    } catch (error) {
      console.warn('Failed to clear all chunk cache:', error)
    }
  }
}

// Default code splitting service instance
export const codeSplittingService = new CodeSplittingService()

/**
 * Utility functions for code splitting
 */
export class CodeSplittingUtils {
  /**
   * Create route-based code splitting
   */
  static createRouteSplitter<T,>(
    importFn: () => Promise<T>,
    routeName: string
  ): () => Promise<T> {
    return codeSplittingService.createDynamicImport(importFn, {
      strategy: 'route',
      preload: false,
      prefetch: true
    })
  }

  /**
   * Create component-based code splitting
   */
  static createComponentSplitter<T,>(
    importFn: () => Promise<T>,
    componentName: string
  ): () => Promise<T> {
    return codeSplittingService.createDynamicImport(importFn, {
      strategy: 'component',
      preload: false,
      prefetch: false
    })
  }

  /**
   * Create feature-based code splitting
   */
  static createFeatureSplitter<T,>(
    importFn: () => Promise<T>,
    featureName: string
  ): () => Promise<T> {
    return codeSplittingService.createDynamicImport(importFn, {
      strategy: 'feature',
      preload: false,
      prefetch: true
    })
  }

  /**
   * Create vendor-based code splitting
   */
  static createVendorSplitter<T,>(
    importFn: () => Promise<T>,
    vendorName: string
  ): () => Promise<T> {
    return codeSplittingService.createDynamicImport(importFn, {
      strategy: 'vendor',
      preload: true,
      prefetch: false,
      priority: 'high'
    })
  }

  /**
   * Create lazy component for React
   */
  static createLazyComponent<T extends React.ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    options: {
      fallback?: React.ReactNode
      componentName?: string
      preload?: boolean
      prefetch?: boolean
    } = {}
  ): React.LazyExoticComponent<T> {
    const { fallback = null, componentName = 'Unknown', preload, prefetch } = options
    const dynamicImport = codeSplittingService.createDynamicImport(importFn, {
      strategy: 'component',
      preload,
      prefetch
    })

    const LazyComponent = React.lazy(() => dynamicImport())

    // Create a wrapper component for better error handling
    const WrappedComponent = (props: any) => (
      <React.Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </React.Suspense>
    )

    return WrappedComponent as React.LazyExoticComponent<T>
  }

  /**
   * Generate webpack magic comments for better chunk naming
   */
  static generateWebpackComments(
    chunkName: string,
    options: {
      mode?: 'eager' | 'lazy'
      preload?: boolean
      prefetch?: boolean
    } = {}
  ): string {
    const { mode = 'lazy', preload = false, prefetch = false } = options
    const comments = [`/* webpackChunkName: "${chunkName}"`]

    if (mode === 'eager') {
      comments.push('webpackMode: "eager"')
    } else {
      comments.push('webpackMode: "lazy"')
    }

    if (preload) {
      comments.push('webpackPrefetch: true')
    }

    if (prefetch) {
      comments.push('webpackPreload: true')
    }

    return comments.join(', ') + ' */'
  }

  /**
   * Create optimized dynamic import with webpack comments
   */
  static createOptimizedDynamicImport<T,>(
    importFn: () => Promise<T>,
    chunkName: string,
    options: {
      mode?: 'eager' | 'lazy'
      preload?: boolean
      prefetch?: boolean
    } = {}
  ): () => Promise<T> {
    const comments = this.generateWebpackComments(chunkName, options)
    
    // This is a simplified version - in a real implementation, you'd need to
    // inject these comments into the import statement
    return importFn
  }

  /**
   * Analyze bundle size and provide recommendations
   */
  static analyzeBundle(chunks: ChunkInfo[]): {
    recommendations: string[]
    largeChunks: ChunkInfo[]
    optimizationSuggestions: string[]
  } {
    const recommendations: string[] = []
    const largeChunks: ChunkInfo[] = []
    const optimizationSuggestions: string[] = []

    chunks.forEach(chunk => {
      // Check for large chunks (>500KB)
      if (chunk.size > 500 * 1024) {
        largeChunks.push(chunk)
        recommendations.push(`Consider splitting large chunk "${chunk.name}" (${(chunk.size / 1024 / 1024).toFixed(2)}MB)`)
      }

      // Check for slow loading chunks
      if (chunk.loadTime && chunk.loadTime > 3000) {
        recommendations.push(`Chunk "${chunk.name}" is loading slowly (${chunk.loadTime.toFixed(2)}ms). Consider preloading.`)
      }

      // Check for failed chunks
      if (chunk.error) {
        recommendations.push(`Chunk "${chunk.name}" failed to load: ${chunk.error}`)
      }
    })

    // General optimization suggestions
    if (largeChunks.length > 0) {
      optimizationSuggestions.push('Consider implementing code splitting for large features')
      optimizationSuggestions.push('Use dynamic imports for rarely used components')
    }

    if (chunks.some(chunk => chunk.loadTime && chunk.loadTime > 2000)) {
      optimizationSuggestions.push('Implement preloading for critical chunks')
      optimizationSuggestions.push('Consider using a CDN for faster delivery')
    }

    return {
      recommendations,
      largeChunks,
      optimizationSuggestions
    }
  }

  /**
   * Generate performance report
   */
  static generatePerformanceReport(): string {
    const stats = codeSplittingService.getStats()
    const chunks = codeSplittingService.getAllChunksInfo()
    const analysis = this.analyzeBundle(chunks)

    const report = [
      '=== Code Splitting Performance Report ===',
      `Total Chunks: ${stats.totalChunks}`,
      `Loaded Chunks: ${stats.loadedChunks}`,
      `Error Chunks: ${stats.errorChunks}`,
      `Total Size: ${(stats.totalSize / 1024 / 1024).toFixed(2)}MB`,
      `Average Load Time: ${stats.averageLoadTime.toFixed(2)}ms`,
      '',
      'Recommendations:',
      ...analysis.recommendations.map(rec => `  - ${rec}`),
      '',
      'Large Chunks:',
      ...analysis.largeChunks.map(chunk => `  - ${chunk.name}: ${(chunk.size / 1024 / 1024).toFixed(2)}MB`),
      '',
      'Optimization Suggestions:',
      ...analysis.optimizationSuggestions.map(suggestion => `  - ${suggestion}`),
      '=========================================='
    ]

    return report.join('\n')
  }
}

/**
 * React hooks for code splitting
 */
export function useCodeSplitting() {
  const createDynamicImport = <T,>(
    importFn: () => Promise<T>,
    options: CodeSplittingOptions = {}
  ) => {
    return codeSplittingService.createDynamicImport(importFn, options)
  }

  const preloadChunk = <T,>(
    importFn: () => Promise<T>,
    options: CodeSplittingOptions = {}
  ) => {
    return codeSplittingService.preloadChunk(importFn, options)
  }

  const prefetchChunk = <T,>(
    importFn: () => Promise<T>,
    options: CodeSplittingOptions = {}
  ) => {
    codeSplittingService.prefetchChunk(importFn, options)
  }

  const getStats = () => {
    return codeSplittingService.getStats()
  }

  return { createDynamicImport, preloadChunk, prefetchChunk, getStats }
}