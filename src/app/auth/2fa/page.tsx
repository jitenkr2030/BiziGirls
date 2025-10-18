'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Loader2, Shield, ShieldOff, QrCode, Copy, Eye, EyeOff, RefreshCw, Smartphone, Key } from 'lucide-react'
import { useAuth } from '@/components/auth/auth-provider'

export default function TwoFactorPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isDisabling, setIsDisabling] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [twoFactorData, setTwoFactorData] = useState<any>(null)
  const [verificationToken, setVerificationToken] = useState('')
  const [disablePassword, setDisablePassword] = useState('')
  const [regeneratePassword, setRegeneratePassword] = useState('')
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    check2FAStatus()
  }, [isAuthenticated, router])

  const check2FAStatus = async () => {
    try {
      const response = await fetch('/api/auth/2fa/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTwoFactorData(data)
      }
    } catch (error) {
      console.error('Failed to check 2FA status:', error)
    }
  }

  const setup2FA = async () => {
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTwoFactorData(data)
        setSuccess('2FA setup initiated. Please scan the QR code and verify the token.')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to setup 2FA')
      }
    } catch (error) {
      setError('Failed to setup 2FA. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const enable2FA = async () => {
    if (!verificationToken || !twoFactorData?.secret) {
      setError('Please enter the verification token')
      return
    }

    setIsVerifying(true)
    setError('')

    try {
      const response = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: verificationToken,
          secret: twoFactorData.secret,
          backupCodes: twoFactorData.backupCodes
        })
      })

      if (response.ok) {
        const data = await response.json()
        setSuccess(data.message)
        setTwoFactorData({ ...twoFactorData, enabled: true })
        setVerificationToken('')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to enable 2FA')
      }
    } catch (error) {
      setError('Failed to enable 2FA. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  const disable2FA = async () => {
    if (!disablePassword) {
      setError('Please enter your password')
      return
    }

    setIsDisabling(true)
    setError('')

    try {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: disablePassword })
      })

      if (response.ok) {
        const data = await response.json()
        setSuccess(data.message)
        setTwoFactorData(null)
        setDisablePassword('')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to disable 2FA')
      }
    } catch (error) {
      setError('Failed to disable 2FA. Please try again.')
    } finally {
      setIsDisabling(false)
    }
  }

  const regenerateBackupCodes = async () => {
    if (!regeneratePassword) {
      setError('Please enter your password')
      return
    }

    setIsRegenerating(true)
    setError('')

    try {
      const response = await fetch('/api/auth/2fa/backup-codes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: regeneratePassword })
      })

      if (response.ok) {
        const data = await response.json()
        setSuccess(data.message)
        if (twoFactorData) {
          setTwoFactorData({ ...twoFactorData, backupCodes: data.backupCodes })
        }
        setRegeneratePassword('')
        setShowBackupCodes(true)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to regenerate backup codes')
      }
    } catch (error) {
      setError('Failed to regenerate backup codes. Please try again.')
    } finally {
      setIsRegenerating(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCode(text)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Two-Factor Authentication
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Add an extra layer of security to your account
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                2FA Status
              </CardTitle>
              <CardDescription>
                Current status of your two-factor authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                <Badge variant={twoFactorData?.enabled ? "default" : "secondary"}>
                  {twoFactorData?.enabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>

              {twoFactorData?.enabled && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Backup Codes:</span>
                    <Badge variant="outline">
                      {twoFactorData.backupCodes?.length || 0} available
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Setup Date:</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>
                </>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-100">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>
                Manage your two-factor authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!twoFactorData?.enabled ? (
                <Button
                  onClick={setup2FA}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Enable 2FA
                    </>
                  )}
                </Button>
              ) : (
                <div className="space-y-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Eye className="mr-2 h-4 w-4" />
                        View Backup Codes
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Backup Codes</DialogTitle>
                        <DialogDescription>
                          Save these codes in a secure place. You can use them to access your account if you lose your phone.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-2">
                        {twoFactorData.backupCodes?.map((code: string, index: number) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            <code className="font-mono text-sm">{code}</code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(code)}
                            >
                              {copiedCode === code ? (
                                <span className="text-green-600 text-xs">Copied!</span>
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Regenerate Codes
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Regenerate Backup Codes</DialogTitle>
                        <DialogDescription>
                          This will invalidate all existing backup codes and generate new ones.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="regeneratePassword">Password</Label>
                          <Input
                            id="regeneratePassword"
                            type="password"
                            value={regeneratePassword}
                            onChange={(e) => setRegeneratePassword(e.target.value)}
                            placeholder="Enter your password"
                          />
                        </div>
                        <Button
                          onClick={regenerateBackupCodes}
                          disabled={isRegenerating || !regeneratePassword}
                          className="w-full"
                        >
                          {isRegenerating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Regenerating...
                            </>
                          ) : (
                            'Regenerate Codes'
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        <ShieldOff className="mr-2 h-4 w-4" />
                        Disable 2FA
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
                        <DialogDescription>
                          This will make your account less secure. Are you sure you want to continue?
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="disablePassword">Password</Label>
                          <Input
                            id="disablePassword"
                            type="password"
                            value={disablePassword}
                            onChange={(e) => setDisablePassword(e.target.value)}
                            placeholder="Enter your password"
                          />
                        </div>
                        <Button
                          onClick={disable2FA}
                          disabled={isDisabling || !disablePassword}
                          variant="destructive"
                          className="w-full"
                        >
                          {isDisabling ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Disabling...
                            </>
                          ) : (
                            'Disable 2FA'
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Setup Instructions */}
        {twoFactorData && !twoFactorData.enabled && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <QrCode className="h-5 w-5 mr-2" />
                Setup Instructions
              </CardTitle>
              <CardDescription>
                Follow these steps to enable two-factor authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* QR Code */}
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-4">Scan QR Code</h3>
                  {twoFactorData.qrCodeDataURL && (
                    <div className="bg-white p-4 rounded-lg inline-block">
                      <img
                        src={twoFactorData.qrCodeDataURL}
                        alt="2FA QR Code"
                        className="w-48 h-48"
                      />
                    </div>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Scan this code with your authenticator app
                  </p>
                </div>

                {/* Manual Entry */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Manual Entry</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Secret Key</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <code className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded text-sm font-mono">
                          {twoFactorData.secret}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(twoFactorData.secret)}
                        >
                          {copiedCode === twoFactorData.secret ? (
                            <span className="text-green-600 text-xs">Copied!</span>
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label>Verification</Label>
                      <div className="space-y-2 mt-1">
                        <Input
                          type="text"
                          placeholder="Enter 6-digit code"
                          value={verificationToken}
                          onChange={(e) => setVerificationToken(e.target.value)}
                          maxLength={6}
                        />
                        <Button
                          onClick={enable2FA}
                          disabled={isVerifying || verificationToken.length !== 6}
                          className="w-full"
                        >
                          {isVerifying ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            'Verify and Enable'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Recommended Apps</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Smartphone className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <h4 className="font-medium">Google Authenticator</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Available for iOS and Android
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Key className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <h4 className="font-medium">Authy</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Available for iOS and Android
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Shield className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <h4 className="font-medium">Microsoft Authenticator</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Available for iOS and Android
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}