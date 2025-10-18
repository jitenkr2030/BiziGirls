import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login')
  })

  test.describe('Login', () => {
    test('should display login form', async ({ page }) => {
      await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
      await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
      await expect(page.locator('[data-testid="password-input"]')).toBeVisible()
      await expect(page.locator('[data-testid="login-button"]')).toBeVisible()
    })

    test('should show validation errors for empty fields', async ({ page }) => {
      await page.click('[data-testid="login-button"]')
      
      await expect(page.locator('[data-testid="email-error"]')).toContainText('Email is required')
      await expect(page.locator('[data-testid="password-error"]')).toContainText('Password is required')
    })

    test('should successfully login with valid credentials', async ({ page }) => {
      await page.route('**/api/auth/login', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            user: { id: '1', email: 'test@example.com', name: 'Test User' },
            token: 'mock-token'
          })
        })
      })

      await page.fill('[data-testid="email-input"]', 'test@example.com')
      await page.fill('[data-testid="password-input"]', 'StrongPass123!')
      await page.click('[data-testid="login-button"]')

      await expect(page).toHaveURL('/dashboard')
      await expect(page.locator('[data-testid="user-menu"]')).toContainText('Test User')
    })

    test('should handle login failure', async ({ page }) => {
      await page.route('**/api/auth/login', async (route) => {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Invalid credentials'
          })
        })
      })

      await page.fill('[data-testid="email-input"]', 'test@example.com')
      await page.fill('[data-testid="password-input"]', 'wrongpassword')
      await page.click('[data-testid="login-button"]')

      await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials')
    })

    test('should show loading state during login', async ({ page }) => {
      await page.route('**/api/auth/login', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            user: { id: '1', email: 'test@example.com', name: 'Test User' },
            token: 'mock-token'
          })
        })
      })

      await page.fill('[data-testid="email-input"]', 'test@example.com')
      await page.fill('[data-testid="password-input"]', 'StrongPass123!')
      await page.click('[data-testid="login-button"]')

      await expect(page.locator('[data-testid="login-button"]')).toBeDisabled()
      await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible()

      await expect(page.locator('[data-testid="login-button"]')).not.toBeDisabled()
      await expect(page.locator('[data-testid="loading-spinner"]')).not.toBeVisible()
    })
  })

  test.describe('Registration', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth/register')
    })

    test('should display registration form', async ({ page }) => {
      await expect(page.locator('[data-testid="register-form"]')).toBeVisible()
      await expect(page.locator('[data-testid="name-input"]')).toBeVisible()
      await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
      await expect(page.locator('[data-testid="password-input"]')).toBeVisible()
      await expect(page.locator('[data-testid="confirm-password-input"]')).toBeVisible()
      await expect(page.locator('[data-testid="register-button"]')).toBeVisible()
    })

    test('should successfully register with valid data', async ({ page }) => {
      await page.route('**/api/auth/register', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            user: { id: '1', email: 'new@example.com', name: 'New User' },
            token: 'mock-token'
          })
        })
      })

      await page.fill('[data-testid="name-input"]', 'New User')
      await page.fill('[data-testid="email-input"]', 'new@example.com')
      await page.fill('[data-testid="password-input"]', 'StrongPass123!')
      await page.fill('[data-testid="confirm-password-input"]', 'StrongPass123!')
      await page.click('[data-testid="register-button"]')

      await expect(page).toHaveURL('/dashboard')
      await expect(page.locator('[data-testid="user-menu"]')).toContainText('New User')
    })

    test('should show validation error for password mismatch', async ({ page }) => {
      await page.fill('[data-testid="name-input"]', 'Test User')
      await page.fill('[data-testid="email-input"]', 'test@example.com')
      await page.fill('[data-testid="password-input"]', 'StrongPass123!')
      await page.fill('[data-testid="confirm-password-input"]', 'DifferentPass123!')
      await page.click('[data-testid="register-button"]')

      await expect(page.locator('[data-testid="confirm-password-error"]')).toContainText('Passwords do not match')
    })
  })

  test.describe('Password Reset', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth/forgot-password')
    })

    test('should display password reset form', async ({ page }) => {
      await expect(page.locator('[data-testid="forgot-password-form"]')).toBeVisible()
      await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
      await expect(page.locator('[data-testid="reset-button"]')).toBeVisible()
    })

    test('should successfully send password reset email', async ({ page }) => {
      await page.route('**/api/auth/forgot-password', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, message: 'Password reset email sent' })
        })
      })

      await page.fill('[data-testid="email-input"]', 'test@example.com')
      await page.click('[data-testid="reset-button"]')

      await expect(page.locator('[data-testid="success-message"]')).toContainText('Password reset email sent')
    })
  })

  test.describe('Accessibility', () => {
    test('should be accessible', async ({ page }) => {
      // Check for proper heading structure
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all()
      expect(headings.length).toBeGreaterThan(0)

      // Check for proper form labels
      const inputs = await page.locator('input').all()
      for (const input of inputs) {
        const label = await input.locator('xpath=../label | preceding-sibling::label').first()
        expect(await label.count()).toBeGreaterThan(0)
      }

      // Check for proper button text
      const buttons = await page.locator('button').all()
      for (const button of buttons) {
        const text = await button.textContent()
        expect(text?.trim()).toBeTruthy()
      }
    })

    test('should have proper keyboard navigation', async ({ page }) => {
      await page.fill('[data-testid="email-input"]', 'test@example.com')
      await page.press('[data-testid="email-input"]', 'Tab')
      await expect(page.locator('[data-testid="password-input"]')).toBeFocused()
      await page.press('[data-testid="password-input"]', 'Tab')
      await expect(page.locator('[data-testid="login-button"]')).toBeFocused()
    })
  })

  test.describe('Security', () => {
    test('should prevent XSS attacks', async ({ page }) => {
      await page.fill('[data-testid="email-input"]', '<script>alert("xss")</script>@example.com')
      await page.fill('[data-testid="password-input"]', 'password123')
      await page.click('[data-testid="login-button"]')

      await expect(page.locator('[data-testid="email-error"]')).toContainText('Invalid email format')
    })

    test('should have CSRF protection', async ({ page }) => {
      const csrfToken = await page.locator('input[name="csrf_token"]').inputValue()
      expect(csrfToken).toBeTruthy()
      expect(csrfToken.length).toBeGreaterThan(10)
    })
  })

  test.describe('Performance', () => {
    test('should load login page quickly', async ({ page }) => {
      const startTime = Date.now()
      await page.goto('/auth/login')
      await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
      const endTime = Date.now()
      
      const loadTime = endTime - startTime
      expect(loadTime).toBeLessThan(3000) // Should load within 3 seconds
    })

    test('should handle login within acceptable time', async ({ page }) => {
      await page.route('**/api/auth/login', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 500))
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            user: { id: '1', email: 'test@example.com', name: 'Test User' },
            token: 'mock-token'
          })
        })
      })

      await page.fill('[data-testid="email-input"]', 'test@example.com')
      await page.fill('[data-testid="password-input"]', 'StrongPass123!')
      
      const startTime = Date.now()
      await page.click('[data-testid="login-button"]')
      await expect(page).toHaveURL('/dashboard')
      const endTime = Date.now()

      const duration = endTime - startTime
      expect(duration).toBeLessThan(2000) // Should complete within 2 seconds
    })
  })

  test.describe('Cross-browser Compatibility', () => {
    test('should work on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }) // iPhone 6/7/8
      await page.goto('/auth/login')
      
      await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
      await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
      await expect(page.locator('[data-testid="password-input"]')).toBeVisible()
      await expect(page.locator('[data-testid="login-button"]')).toBeVisible()
      
      // Check responsive layout
      const form = await page.locator('[data-testid="login-form"]')
      const formBox = await form.boundingBox()
      expect(formBox?.width).toBeLessThan(400) // Should be narrow on mobile
    })

    test('should work on tablet devices', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }) // iPad
      await page.goto('/auth/login')
      
      await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
      await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
      await expect(page.locator('[data-testid="password-input"]')).toBeVisible()
      await expect(page.locator('[data-testid="login-button"]')).toBeVisible()
    })
  })
})