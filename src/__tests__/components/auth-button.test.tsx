import { render, screen, fireEvent, waitFor } from '@/lib/testing-utils'
import { AuthButton } from '@/components/auth/auth-button'

// Mock the auth context
jest.mock('@/components/auth/auth-provider', () => ({
  useAuth: () => ({
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
    isLoading: false,
    error: null,
  }),
}))

describe('AuthButton Component', () => {
  it('should render login button when user is not authenticated', () => {
    render(<AuthButton />)
    
    const button = screen.getByRole('button', { name: /login/i })
    expect(button).toBeInTheDocument()
  })

  it('should render logout button when user is authenticated', () => {
    // Mock authenticated user
    jest.mock('@/components/auth/auth-provider', () => ({
      useAuth: () => ({
        user: { id: '1', name: 'Test User' },
        login: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        error: null,
      }),
    }))

    render(<AuthButton />)
    
    const button = screen.getByRole('button', { name: /logout/i })
    expect(button).toBeInTheDocument()
  })

  it('should show loading state when authentication is loading', () => {
    // Mock loading state
    jest.mock('@/components/auth/auth-provider', () => ({
      useAuth: () => ({
        user: null,
        login: jest.fn(),
        logout: jest.fn(),
        isLoading: true,
        error: null,
      }),
    }))

    render(<AuthButton />)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('should call login function when login button is clicked', async () => {
    const mockLogin = jest.fn()
    
    // Mock auth context with login function
    jest.mock('@/components/auth/auth-provider', () => ({
      useAuth: () => ({
        user: null,
        login: mockLogin,
        logout: jest.fn(),
        isLoading: false,
        error: null,
      }),
    }))

    render(<AuthButton />)
    
    const button = screen.getByRole('button', { name: /login/i })
    fireEvent.click(button)
    
    expect(mockLogin).toHaveBeenCalled()
  })

  it('should call logout function when logout button is clicked', async () => {
    const mockLogout = jest.fn()
    
    // Mock auth context with logout function
    jest.mock('@/components/auth/auth-provider', () => ({
      useAuth: () => ({
        user: { id: '1', name: 'Test User' },
        login: jest.fn(),
        logout: mockLogout,
        isLoading: false,
        error: null,
      }),
    }))

    render(<AuthButton />)
    
    const button = screen.getByRole('button', { name: /logout/i })
    fireEvent.click(button)
    
    expect(mockLogout).toHaveBeenCalled()
  })

  it('should display error message when authentication fails', () => {
    // Mock auth context with error
    jest.mock('@/components/auth/auth-provider', () => ({
      useAuth: () => ({
        user: null,
        login: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        error: 'Authentication failed',
      }),
    }))

    render(<AuthButton />)
    
    expect(screen.getByText(/authentication failed/i)).toBeInTheDocument()
  })

  it('should be accessible', () => {
    render(<AuthButton />)
    
    const button = screen.getByRole('button', { name: /login/i })
    expect(button).toHaveAttribute('type', 'button')
    expect(button).toBeEnabled()
  })

  it('should apply custom className when provided', () => {
    render(<AuthButton className="custom-class" />)
    
    const button = screen.getByRole('button', { name: /login/i })
    expect(button).toHaveClass('custom-class')
  })

  it('should apply custom variant when provided', () => {
    render(<AuthButton variant="outline" />)
    
    const button = screen.getByRole('button', { name: /login/i })
    expect(button).toHaveClass('outline')
  })

  it('should apply custom size when provided', () => {
    render(<AuthButton size="lg" />)
    
    const button = screen.getByRole('button', { name: /login/i })
    expect(button).toHaveClass('lg')
  })
})