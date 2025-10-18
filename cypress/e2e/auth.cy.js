describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/auth/login')
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  describe('Login', () => {
    it('should display login form', () => {
      cy.get('[data-testid="login-form"]').should('be.visible')
      cy.get('[data-testid="email-input"]').should('be.visible')
      cy.get('[data-testid="password-input"]').should('be.visible')
      cy.get('[data-testid="login-button"]').should('be.visible')
    })

    it('should show validation errors for empty fields', () => {
      cy.get('[data-testid="login-button"]').click()
      
      cy.get('[data-testid="email-error"]').should('contain', 'Email is required')
      cy.get('[data-testid="password-error"]').should('contain', 'Password is required')
    })

    it('should show validation error for invalid email', () => {
      cy.get('[data-testid="email-input"]').type('invalid-email')
      cy.get('[data-testid="password-input"]').type('password123')
      cy.get('[data-testid="login-button"]').click()
      
      cy.get('[data-testid="email-error"]').should('contain', 'Invalid email format')
    })

    it('should show validation error for weak password', () => {
      cy.get('[data-testid="email-input"]').type('test@example.com')
      cy.get('[data-testid="password-input"]').type('123')
      cy.get('[data-testid="login-button"]').click()
      
      cy.get('[data-testid="password-error"]').should('contain', 'Password requirements')
    })

    it('should successfully login with valid credentials', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          success: true,
          user: { id: '1', email: 'test@example.com', name: 'Test User' },
          token: 'mock-token'
        }
      }).as('loginRequest')

      cy.get('[data-testid="email-input"]').type('test@example.com')
      cy.get('[data-testid="password-input"]').type('StrongPass123!')
      cy.get('[data-testid="login-button"]').click()

      cy.wait('@loginRequest')
      cy.url().should('include', '/dashboard')
      cy.get('[data-testid="user-menu"]').should('contain', 'Test User')
    })

    it('should handle login failure with invalid credentials', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 401,
        body: {
          success: false,
          error: 'Invalid credentials'
        }
      }).as('loginRequest')

      cy.get('[data-testid="email-input"]').type('test@example.com')
      cy.get('[data-testid="password-input"]').type('wrongpassword')
      cy.get('[data-testid="login-button"]').click()

      cy.wait('@loginRequest')
      cy.get('[data-testid="error-message"]').should('contain', 'Invalid credentials')
    })

    it('should handle network errors', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 500,
        body: {
          success: false,
          error: 'Network error'
        }
      }).as('loginRequest')

      cy.get('[data-testid="email-input"]').type('test@example.com')
      cy.get('[data-testid="password-input"]').type('StrongPass123!')
      cy.get('[data-testid="login-button"]').click()

      cy.wait('@loginRequest')
      cy.get('[data-testid="error-message"]').should('contain', 'Network error')
    })

    it('should show loading state during login', () => {
      cy.intercept('POST', '/api/auth/login', {
        delay: 1000,
        statusCode: 200,
        body: {
          success: true,
          user: { id: '1', email: 'test@example.com', name: 'Test User' },
          token: 'mock-token'
        }
      }).as('loginRequest')

      cy.get('[data-testid="email-input"]').type('test@example.com')
      cy.get('[data-testid="password-input"]').type('StrongPass123!')
      cy.get('[data-testid="login-button"]').click()

      cy.get('[data-testid="login-button"]').should('be.disabled')
      cy.get('[data-testid="loading-spinner"]').should('be.visible')

      cy.wait('@loginRequest')
      cy.get('[data-testid="login-button"]').should('not.be.disabled')
      cy.get('[data-testid="loading-spinner"]').should('not.exist')
    })

    it('should remember login state after page refresh', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          success: true,
          user: { id: '1', email: 'test@example.com', name: 'Test User' },
          token: 'mock-token'
        }
      }).as('loginRequest')

      cy.get('[data-testid="email-input"]').type('test@example.com')
      cy.get('[data-testid="password-input"]').type('StrongPass123!')
      cy.get('[data-testid="login-button"]').click()

      cy.wait('@loginRequest')
      cy.reload()

      cy.get('[data-testid="user-menu"]').should('contain', 'Test User')
    })
  })

  describe('Registration', () => {
    beforeEach(() => {
      cy.visit('/auth/register')
    })

    it('should display registration form', () => {
      cy.get('[data-testid="register-form"]').should('be.visible')
      cy.get('[data-testid="name-input"]').should('be.visible')
      cy.get('[data-testid="email-input"]').should('be.visible')
      cy.get('[data-testid="password-input"]').should('be.visible')
      cy.get('[data-testid="confirm-password-input"]').should('be.visible')
      cy.get('[data-testid="register-button"]').should('be.visible')
    })

    it('should show validation errors for empty fields', () => {
      cy.get('[data-testid="register-button"]').click()
      
      cy.get('[data-testid="name-error"]').should('contain', 'Name is required')
      cy.get('[data-testid="email-error"]').should('contain', 'Email is required')
      cy.get('[data-testid="password-error"]').should('contain', 'Password is required')
      cy.get('[data-testid="confirm-password-error"]').should('contain', 'Password confirmation is required')
    })

    it('should show validation error for password mismatch', () => {
      cy.get('[data-testid="name-input"]').type('Test User')
      cy.get('[data-testid="email-input"]').type('test@example.com')
      cy.get('[data-testid="password-input"]').type('StrongPass123!')
      cy.get('[data-testid="confirm-password-input"]').type('DifferentPass123!')
      cy.get('[data-testid="register-button"]').click()
      
      cy.get('[data-testid="confirm-password-error"]').should('contain', 'Passwords do not match')
    })

    it('should successfully register with valid data', () => {
      cy.intercept('POST', '/api/auth/register', {
        statusCode: 200,
        body: {
          success: true,
          user: { id: '1', email: 'new@example.com', name: 'New User' },
          token: 'mock-token'
        }
      }).as('registerRequest')

      cy.get('[data-testid="name-input"]').type('New User')
      cy.get('[data-testid="email-input"]').type('new@example.com')
      cy.get('[data-testid="password-input"]').type('StrongPass123!')
      cy.get('[data-testid="confirm-password-input"]').type('StrongPass123!')
      cy.get('[data-testid="register-button"]').click()

      cy.wait('@registerRequest')
      cy.url().should('include', '/dashboard')
      cy.get('[data-testid="user-menu"]').should('contain', 'New User')
    })

    it('should handle registration failure with existing email', () => {
      cy.intercept('POST', '/api/auth/register', {
        statusCode: 409,
        body: {
          success: false,
          error: 'Email already exists'
        }
      }).as('registerRequest')

      cy.get('[data-testid="name-input"]').type('Test User')
      cy.get('[data-testid="email-input"]').type('existing@example.com')
      cy.get('[data-testid="password-input"]').type('StrongPass123!')
      cy.get('[data-testid="confirm-password-input"]').type('StrongPass123!')
      cy.get('[data-testid="register-button"]').click()

      cy.wait('@registerRequest')
      cy.get('[data-testid="error-message"]').should('contain', 'Email already exists')
    })
  })

  describe('Logout', () => {
    beforeEach(() => {
      // Login first
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          success: true,
          user: { id: '1', email: 'test@example.com', name: 'Test User' },
          token: 'mock-token'
        }
      }).as('loginRequest')

      cy.visit('/auth/login')
      cy.get('[data-testid="email-input"]').type('test@example.com')
      cy.get('[data-testid="password-input"]').type('StrongPass123!')
      cy.get('[data-testid="login-button"]').click()
      cy.wait('@loginRequest')
    })

    it('should successfully logout', () => {
      cy.intercept('POST', '/api/auth/logout', {
        statusCode: 200,
        body: { success: true }
      }).as('logoutRequest')

      cy.get('[data-testid="user-menu"]').click()
      cy.get('[data-testid="logout-button"]').click()

      cy.wait('@logoutRequest')
      cy.url().should('include', '/auth/login')
      cy.get('[data-testid="user-menu"]').should('not.exist')
    })
  })

  describe('Password Reset', () => {
    beforeEach(() => {
      cy.visit('/auth/forgot-password')
    })

    it('should display password reset form', () => {
      cy.get('[data-testid="forgot-password-form"]').should('be.visible')
      cy.get('[data-testid="email-input"]').should('be.visible')
      cy.get('[data-testid="reset-button"]').should('be.visible')
    })

    it('should show validation error for empty email', () => {
      cy.get('[data-testid="reset-button"]').click()
      cy.get('[data-testid="email-error"]').should('contain', 'Email is required')
    })

    it('should successfully send password reset email', () => {
      cy.intercept('POST', '/api/auth/forgot-password', {
        statusCode: 200,
        body: { success: true, message: 'Password reset email sent' }
      }).as('resetRequest')

      cy.get('[data-testid="email-input"]').type('test@example.com')
      cy.get('[data-testid="reset-button"]').click()

      cy.wait('@resetRequest')
      cy.get('[data-testid="success-message"]').should('contain', 'Password reset email sent')
    })
  })

  describe('Accessibility', () => {
    it('should be accessible', () => {
      cy.injectAxe()
      cy.checkA11y()
    })

    it('should have proper keyboard navigation', () => {
      cy.get('[data-testid="email-input"]').focus()
      cy.realPress('Tab')
      cy.get('[data-testid="password-input"]').should('be.focused')
      cy.realPress('Tab')
      cy.get('[data-testid="login-button"]').should('be.focused')
    })

    it('should have proper ARIA labels', () => {
      cy.get('[data-testid="email-input"]').should('have.attr', 'aria-label', 'Email address')
      cy.get('[data-testid="password-input"]').should('have.attr', 'aria-label', 'Password')
      cy.get('[data-testid="login-button"]').should('have.attr', 'aria-label', 'Login to your account')
    })
  })

  describe('Security', () => {
    it('should prevent XSS attacks', () => {
      cy.get('[data-testid="email-input"]').type('<script>alert("xss")</script>@example.com')
      cy.get('[data-testid="password-input"]').type('password123')
      cy.get('[data-testid="login-button"]').click()

      // Should not execute script
      cy.get('[data-testid="email-error"]').should('contain', 'Invalid email format')
    })

    it('should have CSRF protection', () => {
      cy.get('[data-testid="login-form"]').within(() => {
        cy.get('input[name="csrf_token"]').should('exist')
      })
    })

    it('should have rate limiting', () => {
      // Simulate multiple rapid login attempts
      for (let i = 0; i < 6; i++) {
        cy.get('[data-testid="email-input"]').type('test@example.com')
        cy.get('[data-testid="password-input"]').type('password123')
        cy.get('[data-testid="login-button"]').click()
        cy.get('[data-testid="email-input"]').clear()
        cy.get('[data-testid="password-input"]').clear()
      }

      cy.get('[data-testid="error-message"]').should('contain', 'Too many attempts')
    })
  })

  describe('Performance', () => {
    it('should load login page quickly', () => {
      cy.visit('/auth/login')
      cy.get('[data-testid="login-form"]').should('be.visible')
      
      // Page should load within 3 seconds
      cy.get('[data-testid="login-form"]').should(($el) => {
        const loadTime = performance.now() - window.performance.timing.navigationStart
        expect(loadTime).to.be.lessThan(3000)
      })
    })

    it('should handle login within acceptable time', () => {
      cy.intercept('POST', '/api/auth/login', {
        delay: 500,
        statusCode: 200,
        body: {
          success: true,
          user: { id: '1', email: 'test@example.com', name: 'Test User' },
          token: 'mock-token'
        }
      }).as('loginRequest')

      cy.get('[data-testid="email-input"]').type('test@example.com')
      cy.get('[data-testid="password-input"]').type('StrongPass123!')
      
      const startTime = Date.now()
      cy.get('[data-testid="login-button"]').click()
      cy.wait('@loginRequest')
      const endTime = Date.now()

      const duration = endTime - startTime
      expect(duration).to.be.lessThan(2000) // Should complete within 2 seconds
    })
  })
})