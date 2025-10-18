import { validateEmail, validatePassword, validatePhoneNumber } from '@/lib/validations'
import { securityTestHelpers } from '@/lib/testing-utils'

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.uk')).toBe(true)
      expect(validateEmail('user+tag@example.org')).toBe(true)
    })

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('test@.com')).toBe(false)
    })
  })

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const result = validatePassword('StrongPass123!')
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject passwords without uppercase letters', () => {
      const result = validatePassword('weakpass123!')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one uppercase letter')
    })

    it('should reject passwords without lowercase letters', () => {
      const result = validatePassword('WEAKPASS123!')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one lowercase letter')
    })

    it('should reject passwords without numbers', () => {
      const result = validatePassword('WeakPassword!')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one number')
    })

    it('should reject passwords without special characters', () => {
      const result = validatePassword('WeakPassword123')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one special character')
    })

    it('should reject short passwords', () => {
      const result = validatePassword('Short1!')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password must be at least 8 characters long')
    })
  })

  describe('validatePhoneNumber', () => {
    it('should validate correct phone numbers', () => {
      expect(validatePhoneNumber('+1234567890')).toBe(true)
      expect(validatePhoneNumber('123-456-7890')).toBe(true)
      expect(validatePhoneNumber('(123) 456-7890')).toBe(true)
    })

    it('should reject invalid phone numbers', () => {
      expect(validatePhoneNumber('123')).toBe(false)
      expect(validatePhoneNumber('abc-def-ghij')).toBe(false)
      expect(validatePhoneNumber('')).toBe(false)
    })
  })
})

describe('Security Validation', () => {
  describe('XSS Detection', () => {
    it('should detect XSS patterns', () => {
      expect(securityTestHelpers.testXSSVulnerability('<script>alert("xss")</script>')).toBe(true)
      expect(securityTestHelpers.testXSSVulnerability('javascript:alert("xss")')).toBe(true)
      expect(securityTestHelpers.testXSSVulnerability('<img src="x" onerror="alert(1)">')).toBe(true)
      expect(securityTestHelpers.testXSSVulnerability('<iframe src="javascript:alert(1)"></iframe>')).toBe(true)
    })

    it('should not detect XSS in safe content', () => {
      expect(securityTestHelpers.testXSSVulnerability('Hello World')).toBe(false)
      expect(securityTestHelpers.testXSSVulnerability('This is safe content')).toBe(false)
      expect(securityTestHelpers.testXSSVulnerability('No scripts here')).toBe(false)
    })
  })

  describe('SQL Injection Detection', () => {
    it('should detect SQL injection patterns', () => {
      expect(securityTestHelpers.testSQLInjection('SELECT * FROM users')).toBe(true)
      expect(securityTestHelpers.testSQLInjection('DROP TABLE users')).toBe(true)
      expect(securityTestHelpers.testSQLInjection('OR 1=1')).toBe(true)
      expect(securityTestHelpers.testSQLInjection('UNION SELECT * FROM passwords')).toBe(true)
    })

    it('should not detect SQL injection in safe content', () => {
      expect(securityTestHelpers.testSQLInjection('Hello World')).toBe(false)
      expect(securityTestHelpers.testSQLInjection('This is safe content')).toBe(false)
      expect(securityTestHelpers.testSQLInjection('No SQL here')).toBe(false)
    })
  })

  describe('CSRF Token Validation', () => {
    it('should validate CSRF tokens', () => {
      expect(securityTestHelpers.testCSRFToken('a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6')).toBe(true)
      expect(securityTestHelpers.testCSRFToken('valid-token-123')).toBe(true)
    })

    it('should reject invalid CSRF tokens', () => {
      expect(securityTestHelpers.testCSRFToken('')).toBe(false)
      expect(securityTestHelpers.testCSRFToken('short')).toBe(false)
      expect(securityTestHelpers.testCSRFToken('123')).toBe(false)
    })
  })
})