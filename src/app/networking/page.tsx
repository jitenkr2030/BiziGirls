'use client'

import { useState, useEffect } from 'react'
import { PublicLayout } from '@/components/layout/public-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  MessageSquare, 
  Search, 
  Users, 
  Calendar, 
  MapPin, 
  Heart,
  Share2,
  TrendingUp,
  Filter,
  Plus,
  Video,
  Clock,
  Star,
  ThumbsUp,
  MessageCircle,
  Eye,
  ExternalLink,
  Briefcase,
  Building,
  UserPlus,
  UserCheck,
  Zap,
  Target,
  Sparkles,
  Send,
  MoreHorizontal,
  X,
  Check
} from 'lucide-react'

interface UserProfile {
  id: string
  userId: string
  headline?: string
  bio?: string
  location?: string
  website?: string
  linkedin?: string
  twitter?: string
  instagram?: string
  skills?: string
  interests?: string
  goals?: string
  isPublic: boolean
  isMentor: boolean
  isInvestor: boolean
  availability?: string
  responseRate?: number
  viewCount: number
  connectionCount: number
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    avatar?: string
    businessStage?: string
    industry?: string
  }
}

interface Connection {
  id: string
  requesterId: string
  recipientId: string
  status: string
  message?: string
  connectedAt?: string
  createdAt: string
  isCurrentUserRequester: boolean
  otherUser: {
    id: string
    firstName: string
    lastName: string
    email: string
    avatar?: string
  }
}

interface NetworkingMatch {
  id: string
  userId: string
  matchedUserId: string
  matchScore: number
  matchReason?: string
  status: string
  expiresAt?: string
  matchedUser: {
    id: string
    firstName: string
    lastName: string
    email: string
    avatar?: string
    businessStage?: string
    industry?: string
    userProfile?: {
      headline?: string
      bio?: string
      location?: string
      skills?: string
      interests?: string
      isMentor: boolean
      isInvestor: boolean
    }
  }
}

export default function Networking() {
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [matches, setMatches] = useState<NetworkingMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [activeTab, setActiveTab] = useState('discover')

  useEffect(() => {
    fetchNetworkingData()
  }, [activeTab])

  const fetchNetworkingData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'discover') {
        const profilesRes = await fetch('/api/networking/profiles')
        if (profilesRes.ok) {
          const profilesData = await profilesRes.json()
          setUserProfiles(profilesData.profiles || [])
        }
      } else if (activeTab === 'connections') {
        const connectionsRes = await fetch('/api/networking/connections')
        if (connectionsRes.ok) {
          const connectionsData = await connectionsRes.json()
          setConnections(connectionsData.connections || [])
        }
      } else if (activeTab === 'matches') {
        const matchesRes = await fetch('/api/networking/matches')
        if (matchesRes.ok) {
          const matchesData = await matchesRes.json()
          setMatches(matchesData.matches || [])
        }
      }
    } catch (error) {
      console.error('Error fetching networking data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async (userId: string) => {
    try {
      const response = await fetch('/api/networking/connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: userId,
          message: 'Hi! I would love to connect and learn more about your work.',
        }),
      })

      if (response.ok) {
        // Refresh connections
        fetchNetworkingData()
      }
    } catch (error) {
      console.error('Error sending connection request:', error)
    }
  }

  const handleConnectionAction = async (connectionId: string, action: 'accept' | 'reject') => {
    try {
      const response = await fetch('/api/networking/connections', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: connectionId,
          status: action === 'accept' ? 'accepted' : 'rejected',
        }),
      })

      if (response.ok) {
        // Refresh connections
        fetchNetworkingData()
      }
    } catch (error) {
      console.error('Error updating connection:', error)
    }
  }

  const handleMatchAction = async (matchId: string, action: 'accept' | 'reject') => {
    try {
      const response = await fetch('/api/networking/matches', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: matchId,
          status: action,
        }),
      })

      if (response.ok) {
        // Refresh matches
        fetchNetworkingData()
      }
    } catch (error) {
      console.error('Error updating match:', error)
    }
  }

  const generateMatches = async () => {
    try {
      const response = await fetch('/api/networking/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          limit: 10,
        }),
      })

      if (response.ok) {
        const matchesData = await response.json()
        setMatches(matchesData.matches || [])
      }
    } catch (error) {
      console.error('Error generating matches:', error)
    }
  }

  const filteredProfiles = userProfiles.filter(profile => {
    const matchesSearch = searchTerm === '' || 
      profile.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.headline?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.location?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === '' || 
      (selectedCategory === 'mentors' && profile.isMentor) ||
      (selectedCategory === 'investors' && profile.isInvestor) ||
      (selectedCategory === profile.user.industry)

    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-[400px] p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout showAuthPrompt={true}>
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Networking Hub
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Connect with fellow women entrepreneurs and build your professional network
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
              <Users className="w-3 h-3 mr-1" />
              {userProfiles.length + connections.length} Members
            </Badge>
          </div>
        </div>

        {/* Networking Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search entrepreneurs, mentors, investors..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      variant={selectedCategory === '' ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setSelectedCategory('')}
                    >
                      All
                    </Button>
                    <Button 
                      variant={selectedCategory === 'mentors' ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setSelectedCategory('mentors')}
                    >
                      Mentors
                    </Button>
                    <Button 
                      variant={selectedCategory === 'investors' ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setSelectedCategory('investors')}
                    >
                      Investors
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Profiles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfiles.map((profile) => (
                <Card key={profile.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4 mb-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={profile.user.avatar} />
                        <AvatarFallback>
                          {profile.user.firstName[0]}{profile.user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {profile.user.firstName} {profile.user.lastName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {profile.headline}
                        </p>
                        <div className="flex items-center space-x-2 mb-2">
                          <MapPin className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-500">{profile.location}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {profile.isMentor && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Mentor
                            </Badge>
                          )}
                          {profile.isInvestor && (
                            <Badge variant="secondary" className="text-xs">
                              <Briefcase className="h-3 w-3 mr-1" />
                              Investor
                            </Badge>
                          )}
                          {profile.availability === 'available' && (
                            <Badge variant="outline" className="text-xs text-green-600">
                              <Check className="h-3 w-3 mr-1" />
                              Available
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {profile.bio}
                    </p>
                    
                    {profile.skills && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {JSON.parse(profile.skills).slice(0, 3).map((skill: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {JSON.parse(profile.skills).length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{JSON.parse(profile.skills).length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{profile.connectionCount}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>{profile.viewCount}</span>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleConnect(profile.userId)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="connections" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pending Connections */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <span>Pending Connections</span>
                  </CardTitle>
                  <CardDescription>
                    Connection requests awaiting your response
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {connections
                      .filter(conn => conn.status === 'pending' && !conn.isCurrentUserRequester)
                      .map((connection) => (
                        <div key={connection.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={connection.otherUser.avatar} />
                              <AvatarFallback>
                                {connection.otherUser.firstName[0]}{connection.otherUser.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium text-sm">
                                {connection.otherUser.firstName} {connection.otherUser.lastName}
                              </h4>
                              <p className="text-xs text-gray-500">
                                {connection.message || 'Wants to connect with you'}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleConnectionAction(connection.id, 'accept')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleConnectionAction(connection.id, 'reject')}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    {connections.filter(conn => conn.status === 'pending' && !conn.isCurrentUserRequester).length === 0 && (
                      <p className="text-center text-gray-500 py-8">No pending connection requests</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Accepted Connections */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <UserCheck className="h-5 w-5 text-green-600" />
                    <span>Your Connections</span>
                  </CardTitle>
                  <CardDescription>
                    People you're connected with
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {connections
                      .filter(conn => conn.status === 'accepted')
                      .map((connection) => (
                        <div key={connection.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={connection.otherUser.avatar} />
                              <AvatarFallback>
                                {connection.otherUser.firstName[0]}{connection.otherUser.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium text-sm">
                                {connection.otherUser.firstName} {connection.otherUser.lastName}
                              </h4>
                              <p className="text-xs text-gray-500">
                                Connected {connection.connectedAt ? new Date(connection.connectedAt).toLocaleDateString() : 'Recently'}
                              </p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Message
                          </Button>
                        </div>
                      ))}
                    {connections.filter(conn => conn.status === 'accepted').length === 0 && (
                      <p className="text-center text-gray-500 py-8">No connections yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="matches" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">AI-Powered Matches</h3>
              <Button onClick={generateMatches} className="bg-purple-600 hover:bg-purple-700">
                <Sparkles className="h-4 w-4 mr-2" />
                Generate New Matches
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {matches.map((match) => (
                <Card key={match.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={match.matchedUser.avatar} />
                          <AvatarFallback>
                            {match.matchedUser.firstName[0]}{match.matchedUser.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {match.matchedUser.firstName} {match.matchedUser.lastName}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {match.matchedUser.userProfile?.headline}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs">
                              <Target className="h-3 w-3 mr-1" />
                              {Math.round(match.matchScore * 100)}% Match
                            </Badge>
                            {match.matchedUser.userProfile?.isMentor && (
                              <Badge variant="outline" className="text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                Mentor
                              </Badge>
                            )}
                            {match.matchedUser.userProfile?.isInvestor && (
                              <Badge variant="outline" className="text-xs">
                                <Briefcase className="h-3 w-3 mr-1" />
                                Investor
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {match.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleMatchAction(match.id, 'accept')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleMatchAction(match.id, 'reject')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {match.matchReason && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2">Why you match:</h4>
                        <div className="flex flex-wrap gap-1">
                          {JSON.parse(match.matchReason).slice(0, 3).map((reason: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {reason}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {match.matchedUser.userProfile?.bio}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{match.matchedUser.userProfile?.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Building className="h-3 w-3" />
                          <span>{match.matchedUser.industry}</span>
                        </div>
                      </div>
                      {match.status === 'accepted' && (
                        <Badge variant="secondary" className="text-xs">
                          <Check className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {matches.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Sparkles className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No matches yet</h3>
                    <p className="text-gray-500 mb-4">
                      Generate AI-powered matches to find entrepreneurs, mentors, and investors who align with your goals.
                    </p>
                    <Button onClick={generateMatches} className="bg-purple-600 hover:bg-purple-700">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Matches
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Private Messages</h3>
                <p className="text-gray-500 mb-4">
                  Connect with other entrepreneurs through private messaging. Available once you have accepted connections.
                </p>
                <Button variant="outline">
                  <Send className="h-4 w-4 mr-2" />
                  Go to Connections
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PublicLayout>
  )
}