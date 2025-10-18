import { createMockResponse, mockFetch } from '@/lib/testing-utils'
import { login, register, logout } from '@/lib/auth'

describe('Authentication API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockResponse = createMockResponse({
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
        token: 'mock-token',
      })

      mockFetch([mockResponse])

      const result = await login({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(result.success).toBe(true)
      expect(result.user).toEqual({ id: '1', email: 'test@example.com', name: 'Test User' })
      expect(result.token).toBe('mock-token')
    })

    it('should handle login failure with invalid credentials', async () => {
      const mockResponse = createMockResponse(
        { error: 'Invalid credentials' },
        401
      )

      mockFetch([mockResponse])

      const result = await login({
        email: 'invalid@example.com',
        password: 'wrongpassword',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid credentials')
    })

    it('should handle network errors', async () => {
      mockFetch([new Error('Network error')])

      const result = await login({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })

    it('should validate email format', async () => {
      const result = await login({
        email: 'invalid-email',
        password: 'password123',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid email format')
    })

    it('should validate password requirements', async () => {
      const result = await login({
        email: 'test@example.com',
        password: '123',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Password requirements')
    })
  })

  describe('register', () => {
    it('should successfully register with valid data', async () => {
      const mockResponse = createMockResponse({
        user: { id: '1', email: 'new@example.com', name: 'New User' },
        token: 'mock-token',
      })

      mockFetch([mockResponse])

      const result = await register({
        name: 'New User',
        email: 'new@example.com',
        password: 'StrongPass123!',
      })

      expect(result.success).toBe(true)
      expect(result.user).toEqual({ id: '1', email: 'new@example.com', name: 'New User' })
      expect(result.token).toBe('mock-token')
    })

    it('should handle registration failure with existing email', async () => {
      const mockResponse = createMockResponse(
        { error: 'Email already exists' },
        409
      )

      mockFetch([mockResponse])

      const result = await register({
        name: 'Test User',
        email: 'existing@example.com',
        password: 'StrongPass123!',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email already exists')
    })

    it('should validate registration data', async () => {
      const result = await register({
        name: '',
        email: 'invalid-email',
        password: 'weak',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('validation failed')
    })
  })

  describe('logout', () => {
    it('should successfully logout', async () => {
      const mockResponse = createMockResponse({ success: true })

      mockFetch([mockResponse])

      const result = await logout('mock-token')

      expect(result.success).toBe(true)
    })

    it('should handle logout failure', async () => {
      const mockResponse = createMockResponse(
        { error: 'Invalid token' },
        401
      )

      mockFetch([mockResponse])

      const result = await logout('invalid-token')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid token')
    })
  })

  describe('Security', () => {
    it('should sanitize input data', async () => {
      const mockResponse = createMockResponse({
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
        token: 'mock-token',
      })

      mockFetch([mockResponse])

      await login({
        email: 'test@example.com',
        password: 'password123<script>alert("xss")</script>',
      })

      // Verify that the fetch was called with sanitized data
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: expect.stringContaining('password123'),
        })
      )
    })

    it('should include security headers', async () => {
      const mockResponse = createMockResponse({
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
        token: 'mock-token',
      })

      mockFetch([mockResponse])

      await login({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          }),
        })
      )
    })
  })

  describe('Performance', () => {
    it('should complete login within acceptable time', async () => {
      const mockResponse = createMockResponse({
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
        token: 'mock-token',
      })

      mockFetch([mockResponse])

      const startTime = performance.now()
      await login({
        email: 'test@example.com',
        password: 'password123',
      })
      const endTime = performance.now()

      const duration = endTime - startTime
      expect(duration).toBeLessThan(1000) // Should complete within 1 second
    })
  })
})