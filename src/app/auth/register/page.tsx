'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Eye, EyeOff, User, Building, Lightbulb, Chrome, Linkedin } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAuth } from '@/components/auth/auth-provider'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'ENTREPRENEUR',
    businessName: '',
    businessStage: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setIsSuccess] = useState(false)
  const [requiresVerification, setRequiresVerification] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const router = useRouter()
  const { register } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setIsSuccess(false)
    setRequiresVerification(false)

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const result = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role
      })
      
      if (result.success) {
        if (result.requiresVerification) {
          setRequiresVerification(true)
          setRegisteredEmail(formData.email)
          setIsSuccess(true)
        } else {
          setIsSuccess(true)
          // Redirect to dashboard after successful registration
          setTimeout(() => {
            router.push('/dashboard')
          }, 1500)
        }
      } else {
        setError(result.error || 'Registration failed')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
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

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 py-8">
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
            Join our community of women entrepreneurs
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>
              Fill in the details below to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                    Sign up with Google
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
                    Sign up with LinkedIn
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
                  Or register with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-100">
                  <AlertDescription>
                    {requiresVerification ? (
                      <div className="space-y-2">
                        <p className="font-medium">Registration successful! 🎉</p>
                        <p className="text-sm">
                          We've sent a verification email to <strong>{registeredEmail}</strong>. 
                          Please check your inbox and spam folder to verify your email address.
                        </p>
                        <div className="flex items-center space-x-2 mt-3">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push('/auth/resend-verification')}
                          >
                            Resend verification email
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push('/auth/login')}
                          >
                            Go to login
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="font-medium">Registration successful! 🎉</p>
                        <p className="text-sm">Redirecting to your dashboard...</p>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
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
              </div>

              {/* Role Selection */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  I am a...
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => handleSelectChange('role', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ENTREPRENEUR">Entrepreneur</SelectItem>
                      <SelectItem value="MENTOR">Mentor</SelectItem>
                      <SelectItem value="INVESTOR">Investor</SelectItem>
                      <SelectItem value="SERVICE_PROVIDER">Service Provider</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Business Information (conditional) */}
              {(formData.role === 'ENTREPRENEUR' || formData.role === 'SERVICE_PROVIDER') && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                    <Building className="h-4 w-4 mr-2" />
                    Business Information
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name (Optional)</Label>
                    <Input
                      id="businessName"
                      name="businessName"
                      type="text"
                      placeholder="Your business name"
                      value={formData.businessName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessStage">Business Stage (Optional)</Label>
                    <Select value={formData.businessStage} onValueChange={(value) => handleSelectChange('businessStage', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select business stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IDEA">Idea Stage</SelectItem>
                        <SelectItem value="STARTUP">Startup</SelectItem>
                        <SelectItem value="GROWTH">Growth</SelectItem>
                        <SelectItem value="ESTABLISHED">Established</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Password */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Security</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={8}
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
                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <p>Password must contain:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>At least 8 characters</li>
                      <li>One uppercase letter</li>
                      <li>One lowercase letter</li>
                      <li>One number</li>
                      <li>One special character</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      minLength={8}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link
                  href="/auth/login"
                  className="text-purple-600 hover:text-purple-500 dark:text-purple-400 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}