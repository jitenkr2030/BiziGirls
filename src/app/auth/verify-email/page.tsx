'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Mail, ArrowLeft, Loader2, RefreshCw } from 'lucide-react'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [isLoading, setIsLoading] = useState(true)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      setIsLoading(false)
      setError('Invalid verification link. Please check your email and try again.')
      return
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`)
        const data = await response.json()

        if (response.ok) {
          setIsVerified(true)
        } else {
          setError(data.message || 'Failed to verify email')
        }
      } catch (err) {
        setError('An error occurred while verifying your email')
      } finally {
        setIsLoading(false)
      }
    }

    verifyEmail()
  }, [token])

  const handleResendEmail = async () => {
    // This would typically require the user's email
    // For now, we'll redirect to the resend page
    window.location.href = '/auth/resend-verification'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to home
            </Link>
            <div className="mt-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Verifying your email
              </h2>
            </div>
          </div>

          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600 dark:text-gray-400">
                  Please wait while we verify your email address...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to home
          </Link>
          <div className="mt-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Email Verification
            </h2>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-center space-x-2">
              {isVerified ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span className="text-green-600">Email Verified!</span>
                </>
              ) : (
                <>
                  <XCircle className="h-6 w-6 text-red-600" />
                  <span className="text-red-600">Verification Failed</span>
                </>
              )}
            </CardTitle>
            <CardDescription className="text-center">
              {isVerified 
                ? 'Your email has been successfully verified'
                : 'We could not verify your email address'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isVerified ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                
                <div className="space-y-2">
                  <p className="text-gray-600 dark:text-gray-400">
                    Thank you for verifying your email address! Your account is now fully active.
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    You can now access all features of GirlsPreneur.
                  </p>
                </div>

                <div className="space-y-2">
                  <Button asChild className="w-full">
                    <Link href="/dashboard">
                      Go to Dashboard
                    </Link>
                  </Button>
                  
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/auth/login">
                      Sign In
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
                  <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <p className="text-gray-600 dark:text-gray-400">
                    This verification link may have expired or is invalid. Don't worry, we can send you a new one.
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Verification links expire after 24 hours for security reasons.
                  </p>
                </div>

                <div className="space-y-2">
                  <Button asChild className="w-full">
                    <Link href="/auth/resend-verification">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Resend Verification Email
                    </Link>
                  </Button>
                  
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/auth/login">
                      Back to Login
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}