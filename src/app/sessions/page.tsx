'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { 
  Loader2, 
  Monitor, 
  Smartphone, 
  Tablet, 
  Globe, 
  LogOut, 
  Shield, 
  AlertTriangle,
  Clock,
  MapPin,
  Trash2,
  Power
} from 'lucide-react'
import { useAuth } from '@/components/auth/auth-provider'

interface Session {
  id: string
  token: string
  deviceInfo?: string
  ipAddress?: string
  userAgent?: string
  expiresAt: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTerminating, setIsTerminating] = useState<string | null>(null)
  const [isTerminatingAll, setIsTerminatingAll] = useState(false)
  const [isTerminatingOthers, setIsTerminatingOthers] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { user, isAuthenticated, token } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }
    fetchSessions()
  }, [isAuthenticated])

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/sessions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions || [])
      } else {
        setError('Failed to fetch sessions')
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
      setError('Failed to fetch sessions')
    } finally {
      setIsLoading(false)
    }
  }

  const terminateSession = async (sessionId: string) => {
    setIsTerminating(sessionId)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setSuccess('Session terminated successfully')
        await fetchSessions()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to terminate session')
      }
    } catch (error) {
      setError('Failed to terminate session. Please try again.')
    } finally {
      setIsTerminating(null)
    }
  }

  const terminateAllOtherSessions = async () => {
    setIsTerminatingOthers(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/sessions?action=others', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSuccess(data.message)
        await fetchSessions()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to terminate other sessions')
      }
    } catch (error) {
      setError('Failed to terminate other sessions. Please try again.')
    } finally {
      setIsTerminatingOthers(false)
    }
  }

  const terminateAllSessions = async () => {
    setIsTerminatingAll(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/sessions?action=all', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSuccess(data.message)
        setSessions([])
        // Log out the user since all sessions are terminated
        setTimeout(() => {
          window.location.href = '/auth/login'
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to terminate all sessions')
      }
    } catch (error) {
      setError('Failed to terminate all sessions. Please try again.')
    } finally {
      setIsTerminatingAll(false)
    }
  }

  const getDeviceIcon = (userAgent?: string) => {
    if (!userAgent) return <Globe className="h-4 w-4" />
    
    const ua = userAgent.toLowerCase()
    
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return <Smartphone className="h-4 w-4" />
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      return <Tablet className="h-4 w-4" />
    } else {
      return <Monitor className="h-4 w-4" />
    }
  }

  const getDeviceInfo = (userAgent?: string) => {
    if (!userAgent) return 'Unknown Device'
    
    const ua = userAgent.toLowerCase()
    
    if (ua.includes('chrome')) return 'Chrome'
    if (ua.includes('firefox')) return 'Firefox'
    if (ua.includes('safari')) return 'Safari'
    if (ua.includes('edge')) return 'Edge'
    
    if (ua.includes('android')) return 'Android'
    if (ua.includes('iphone')) return 'iPhone'
    if (ua.includes('ipad')) return 'iPad'
    
    return 'Unknown Browser'
  }

  const getOSInfo = (userAgent?: string) => {
    if (!userAgent) return 'Unknown OS'
    
    const ua = userAgent.toLowerCase()
    
    if (ua.includes('windows')) return 'Windows'
    if (ua.includes('mac')) return 'macOS'
    if (ua.includes('linux')) return 'Linux'
    if (ua.includes('android')) return 'Android'
    if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) return 'iOS'
    
    return 'Unknown OS'
  }

  const isCurrentSession = (sessionToken: string) => {
    return sessionToken === token
  }

  const formatExpiryTime = (expiresAt: string) => {
    const expiryDate = new Date(expiresAt)
    const now = new Date()
    const diff = expiryDate.getTime() - now.getTime()
    
    if (diff < 0) return 'Expired'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours > 1 ? 's' : ''}`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`
    
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${minutes} minute${minutes > 1 ? 's' : ''}`
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">Authentication Required</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Please log in to view your active sessions.
              </p>
              <Button onClick={() => window.location.href = '/auth/login'}>
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Active Sessions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your active login sessions across devices
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-100 mb-6">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Actions Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Power className="h-5 w-5 mr-2" />
              Session Management
            </CardTitle>
            <CardDescription>
              Control your active sessions and enhance security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out Other Devices
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Sign Out Other Devices</DialogTitle>
                    <DialogDescription>
                      This will terminate all your active sessions except the current one. 
                      You will need to log in again on those devices.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => {}}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={terminateAllOtherSessions}
                      disabled={isTerminatingOthers}
                      variant="destructive"
                    >
                      {isTerminatingOthers ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing out...
                        </>
                      ) : (
                        'Sign Out Other Devices'
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="flex-1">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Sign Out All Devices
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Sign Out All Devices</DialogTitle>
                    <DialogDescription>
                      This will terminate all your active sessions, including the current one. 
                      You will be logged out immediately and need to sign in again.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => {}}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={terminateAllSessions}
                      disabled={isTerminatingAll}
                      variant="destructive"
                    >
                      {isTerminatingAll ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing out...
                        </>
                      ) : (
                        'Sign Out All Devices'
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Sessions List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Active Sessions
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You don't have any active sessions at the moment.
              </p>
            </div>
          ) : (
            sessions.map((session) => (
              <Card key={session.id} className="relative">
                {isCurrentSession(session.token) && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="text-xs">
                      Current Session
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getDeviceIcon(session.userAgent)}
                      <div>
                        <CardTitle className="text-sm">
                          {getDeviceInfo(session.userAgent)}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {getOSInfo(session.userAgent)}
                        </CardDescription>
                      </div>
                    </div>
                    {!isCurrentSession(session.token) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => terminateSession(session.id)}
                        disabled={isTerminating === session.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {isTerminating === session.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <LogOut className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>Expires in {formatExpiryTime(session.expiresAt)}</span>
                    </div>
                    
                    {session.ipAddress && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{session.ipAddress}</span>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <div>Created: {new Date(session.createdAt).toLocaleString()}</div>
                      <div>Last active: {new Date(session.updatedAt).toLocaleString()}</div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Shield className="h-3 w-3 text-green-600" />
                        <span className="text-xs text-green-600">Active</span>
                      </div>
                      <Badge variant={isCurrentSession(session.token) ? "default" : "outline"} className="text-xs">
                        {isCurrentSession(session.token) ? "Current" : "Other"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Security Tips */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Regular Session Review</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Periodically check your active sessions and sign out from devices you don't recognize or no longer use.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Public Devices</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Always sign out completely when using public or shared devices to prevent unauthorized access.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enable 2FA for an additional layer of security beyond just passwords.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Strong Passwords</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Use unique, strong passwords and change them regularly to maintain account security.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}