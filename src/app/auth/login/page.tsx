'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Eye, EyeOff, Chrome, Linkedin } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAuth } from '@/components/auth/auth-provider'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [twoFactorData, setTwoFactorData] = useState<any>(null)
  const [twoFactorToken, setTwoFactorToken] = useState('')
  const [isVerifying2FA, setIsVerifying2FA] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      })

      const data = await response.json()
      
      if (response.ok) {
        if (data.requiresTwoFactor) {
          setTwoFactorData(data.user)
        } else {
          // Use the auth context login method
          const result = await login(formData.email, formData.password)
          if (result.success) {
            router.push('/')
          } else {
            setError(result.error || 'Login failed')
          }
        }
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handle2FAVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsVerifying2FA(true)
    setError('')

    try {
      const response = await fetch('/api/auth/2fa/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: twoFactorData.id, token: twoFactorToken }),
      })

      const data = await response.json()
      
      if (response.ok) {
        // Set authentication data manually since we're bypassing the normal login flow
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        router.push('/')
      } else {
        setError(data.error || '2FA verification failed')
      }
    } catch (err) {
      setError('An error occurred during 2FA verification. Please try again.')
    } finally {
      setIsVerifying2FA(false)
    }
  }

  const handleOAuthLogin = async (provider: string) => {
    setIsOAuthLoading(provider)
    setError('')

    try {
      const response = await fetch(`/api/auth/${provider}`, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error(`Failed to initialize ${provider} OAuth`)
      }

      const data = await response.json()
      
      // Redirect to OAuth provider
      window.location.href = data.authorizationUrl
    } catch (err) {
      setError(`Failed to connect to ${provider}. Please try again.`)
      setIsOAuthLoading(null)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">GP</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">GirlsPreneur</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back! Sign in to your account
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {twoFactorData ? 'Two-Factor Authentication' : 'Sign In'}
            </CardTitle>
            <CardDescription>
              {twoFactorData 
                ? 'Enter the 6-digit code from your authenticator app'
                : 'Enter your email and password to access your account'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {twoFactorData ? (
              // 2FA Verification Form
              <form onSubmit={handle2FAVerification} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="twoFactorToken">Authentication Code</Label>
                  <Input
                    id="twoFactorToken"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={twoFactorToken}
                    onChange={(e) => setTwoFactorToken(e.target.value)}
                    maxLength={6}
                    pattern="[0-9]{6}"
                    required
                    className="text-center text-lg tracking-widest"
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Open your authenticator app and enter the 6-digit code
                  </p>
                </div>

                <div className="space-y-2">
                  <Button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={isVerifying2FA || twoFactorToken.length !== 6}
                  >
                    {isVerifying2FA ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify Code'
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setTwoFactorData(null)
                      setTwoFactorToken('')
                      setError('')
                    }}
                  >
                    Back to Login
                  </Button>
                </div>
              </form>
            ) : (
              // Regular Login Form
              <>
                {/* OAuth Login Buttons */}
                <div className="space-y-3 mb-6">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleOAuthLogin('google')}
                    disabled={isOAuthLoading === 'google'}
                  >
                    {isOAuthLoading === 'google' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Chrome className="mr-2 h-4 w-4" />
                        Continue with Google
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleOAuthLogin('linkedin')}
                    disabled={isOAuthLoading === 'linkedin'}
                  >
                    {isOAuthLoading === 'linkedin' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Linkedin className="mr-2 h-4 w-4" />
                        Continue with LinkedIn
                      </>
                    )}
                  </Button>
                </div>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with email
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm text-purple-600 hover:text-purple-500 dark:text-purple-400"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Don't have an account?{' '}
                    <Link
                      href="/auth/register"
                      className="text-purple-600 hover:text-purple-500 dark:text-purple-400 font-medium"
                    >
                      Sign up
                    </Link>
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            Demo Credentials
          </h3>
          <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <p><strong>Email:</strong> demo@girlspreneur.com</p>
            <p><strong>Password:</strong> demo123</p>
          </div>
        </div>
      </div>
    </div>
  )
}