import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

// Mock providers for testing
const AuthProvider = ({ children, value }: { children: React.ReactNode; value?: any }) => (
  <div data-testid="auth-provider">{children}</div>
)

const ThemeProvider = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="theme-provider">{children}</div>
)

// Custom render function with providers
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    )
  }

  return {
    ...render(ui, { wrapper: AllTheProviders, ...options }),
    queryClient,
  }
}

// Re-export everything from testing-library
export * from '@testing-library/react'

// Mock data generators
export const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'USER',
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockCourse = {
  id: '1',
  title: 'Test Course',
  description: 'Test course description',
  price: 99.99,
  duration: 3600,
  level: 'BEGINNER',
  category: 'BUSINESS',
  instructorId: '1',
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockMentor = {
  id: '1',
  name: 'Test Mentor',
  email: 'mentor@example.com',
  bio: 'Test mentor bio',
  expertise: ['Business', 'Marketing'],
  experience: 10,
  rating: 4.5,
  createdAt: new Date(),
  updatedAt: new Date(),
}

// API response mockers
export const createMockResponse = <T,>(data: T, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
  text: async () => JSON.stringify(data),
})

export const mockFetch = (responses: Array<Response | Error>) => {
  const mockFetch = jest.fn()
  
  responses.forEach((response, index) => {
    if (response instanceof Error) {
      mockFetch.mockRejectedValueOnce(response)
    } else {
      mockFetch.mockResolvedValueOnce(response)
    }
  })
  
  global.fetch = mockFetch
  return mockFetch
}

// Test helpers
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0))
}

export const createMockFile = (name: string, size: number = 1024, type: string = 'image/jpeg'): File => {
  const blob = new Blob(['x'.repeat(size)], { type })
  return new File([blob], name, { type })
}

export const createMockFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData()
  
  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof File) {
      formData.append(key, value)
    } else if (Array.isArray(value)) {
      value.forEach(item => formData.append(`${key}[]`, item))
    } else {
      formData.append(key, String(value))
    }
  })
  
  return formData
}

// Event simulation helpers
export const simulateFileUpload = (input: HTMLInputElement, files: File[]) => {
  Object.defineProperty(input, 'files', {
    value: files,
    writable: false,
  })
  
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

export const simulateFormSubmit = (form: HTMLFormElement) => {
  const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
  form.dispatchEvent(submitEvent)
}

// Mock intersection observer
export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn()
  mockIntersectionObserver.mockReturnValue({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  })
  
  global.IntersectionObserver = mockIntersectionObserver
  return mockIntersectionObserver
}

// Mock resize observer
export const mockResizeObserver = () => {
  const mockResizeObserver = jest.fn()
  mockResizeObserver.mockReturnValue({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  })
  
  global.ResizeObserver = mockResizeObserver
  return mockResizeObserver
}

// Performance test helpers
export const measurePerformance = async (fn: () => Promise<void> | void) => {
  const start = performance.now()
  await fn()
  const end = performance.now()
  return end - start
}

export const createPerformanceTest = (name: string, fn: () => Promise<void> | void, maxTime: number) => {
  test(`Performance: ${name}`, async () => {
    const time = await measurePerformance(fn)
    expect(time).toBeLessThan(maxTime)
  })
}

// Accessibility test helpers
export const checkAccessibility = async (container: HTMLElement) => {
  const axe = await import('@axe-core/react')
  const results = await axe.default(container)
  
  return {
    passed: results.violations.length === 0,
    violations: results.violations,
  }
}

// Database test helpers
export const createTestDatabase = () => {
  // This would typically create a test database instance
  return {
    connect: jest.fn(),
    disconnect: jest.fn(),
    query: jest.fn(),
    transaction: jest.fn(),
  }
}

// Authentication test helpers
export const mockAuthContext = (user: any = null) => {
  return {
    user,
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
    isLoading: false,
    error: null,
  }
}

// Component test helpers
export const renderWithAuth = (
  ui: ReactElement,
  authContext: any = mockAuthContext()
) => {
  return renderWithProviders(ui, {
    wrapper: ({ children }) => (
      <AuthProvider value={authContext}>
        {children}
      </AuthProvider>
    ),
  })
}

// Integration test helpers
export const createTestServer = () => {
  const handlers = []
  
  return {
    use: (handler) => handlers.push(handler),
    listen: (port = 3000) => {
      // Mock server implementation
      return {
        close: jest.fn(),
      }
    },
  }
}

// E2E test helpers
export const e2eTestHelpers = {
  login: (page, email = 'test@example.com', password = 'password') => {
    return page.fillInput('[data-testid="email"]', email)
      .then(() => page.fillInput('[data-testid="password"]', password))
      .then(() => page.click('[data-testid="login-button"]'))
  },
  
  register: (page, userData) => {
    return page.fillInput('[data-testid="name"]', userData.name)
      .then(() => page.fillInput('[data-testid="email"]', userData.email))
      .then(() => page.fillInput('[data-testid="password"]', userData.password))
      .then(() => page.click('[data-testid="register-button"]'))
  },
  
  navigateTo: (page, path) => {
    return page.goto(path)
  },
  
  waitForElement: (page, selector) => {
    return page.waitForSelector(selector)
  },
  
  clickElement: (page, selector) => {
    return page.click(selector)
  },
  
  fillInput: (page, selector, value) => {
    return page.fill(selector, value)
  },
  
  takeScreenshot: (page, name) => {
    return page.screenshot({ path: `screenshots/${name}.png` })
  },
}

// Security test helpers
export const securityTestHelpers = {
  testXSSVulnerability: (input: string) => {
    const xssPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
    ]
    
    return xssPatterns.some(pattern => pattern.test(input))
  },
  
  testSQLInjection: (input: string) => {
    const sqlPatterns = [
      /(\s|^)(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE)(\s|$)/i,
      /(\s|^)(OR|AND)\s+\d+\s*=\s*\d+/gi,
      /(\s|^)(OR|AND)\s+['"][^'"]*['"]\s*=\s*['"][^'"]*['"]/gi,
      /(\s|^)(UNION|EXEC|EXECUTE|DECLARE|CAST|CONVERT)(\s|$)/gi,
    ]
    
    return sqlPatterns.some(pattern => pattern.test(input))
  },
  
  testCSRFToken: (token: string) => {
    return token && token.length >= 32
  },
  
  testRateLimiting: async (url: string, maxRequests = 100) => {
    const requests = []
    
    for (let i = 0; i < maxRequests; i++) {
      requests.push(fetch(url))
    }
    
    const responses = await Promise.allSettled(requests)
    const successCount = responses.filter(r => r.status === 'fulfilled').length
    
    return {
      successCount,
      rateLimited: successCount < maxRequests,
    }
  },
}

// Load testing helpers
export const loadTestHelpers = {
  createLoadTest: (name: string, url: string, options: {
    concurrentUsers?: number
    duration?: number
    rampUp?: number
  } = {}) => {
    const { concurrentUsers = 10, duration = 60000, rampUp = 10000 } = options
    
    return {
      name,
      url,
      concurrentUsers,
      duration,
      rampUp,
      run: async () => {
        const results = []
        const startTime = Date.now()
        
        const runUser = async () => {
          const userStartTime = Date.now()
          
          try {
            const response = await fetch(url)
            const userEndTime = Date.now()
            
            results.push({
              success: response.ok,
              responseTime: userEndTime - userStartTime,
              timestamp: userStartTime,
            })
          } catch (error) {
            const userEndTime = Date.now()
            results.push({
              success: false,
              responseTime: userEndTime - userStartTime,
              timestamp: userStartTime,
              error: error.message,
            })
          }
        }
        
        // Ramp up users
        const rampUpInterval = rampUp / concurrentUsers
        
        for (let i = 0; i < concurrentUsers; i++) {
          setTimeout(runUser, i * rampUpInterval)
        }
        
        // Wait for test duration
        await new Promise(resolve => setTimeout(resolve, duration))
        
        // Calculate statistics
        const successCount = results.filter(r => r.success).length
        const averageResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length
        const maxResponseTime = Math.max(...results.map(r => r.responseTime))
        const minResponseTime = Math.min(...results.map(r => r.responseTime))
        
        return {
          totalRequests: results.length,
          successCount,
          failureCount: results.length - successCount,
          successRate: (successCount / results.length) * 100,
          averageResponseTime,
          maxResponseTime,
          minResponseTime,
          duration: Date.now() - startTime,
        }
      },
    }
  },
}

// Export all testing utilities
export * from '@testing-library/react'
export * from '@testing-library/jest-dom'
export * from '@testing-library/user-event'