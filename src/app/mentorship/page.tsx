'use client'

import { useState } from 'react'
import { PublicLayout } from '@/components/layout/public-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Users, 
  Search, 
  Star, 
  Calendar, 
  Clock, 
  MessageSquare, 
  Video,
  Phone,
  MapPin,
  DollarSign,
  Briefcase,
  Award,
  Filter,
  Heart,
  CheckCircle
} from 'lucide-react'

const mentors = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    title: "Serial Entrepreneur & Business Coach",
    avatar: "/avatars/mentor1.jpg",
    rating: 4.9,
    reviews: 127,
    expertise: ["Startup Strategy", "Fundraising", "Scaling", "Leadership"],
    experience: 15,
    hourlyRate: 150,
    availability: "available",
    bio: "Built and sold 3 tech startups. Passionate about helping women entrepreneurs scale their businesses.",
    company: "TechVentures Capital",
    location: "San Francisco, CA",
    languages: ["English", "Spanish"],
    responseTime: "2 hours"
  },
  {
    id: 2,
    name: "Maria Rodriguez",
    title: "E-commerce & Digital Marketing Expert",
    avatar: "/avatars/mentor2.jpg",
    rating: 4.8,
    reviews: 89,
    expertise: ["E-commerce", "Digital Marketing", "Brand Building", "Social Media"],
    experience: 12,
    hourlyRate: 120,
    availability: "busy",
    bio: "Helped over 200 women launch successful e-commerce businesses. Specialized in sustainable fashion.",
    company: "Digital Growth Agency",
    location: "Austin, TX",
    languages: ["English", "Spanish"],
    responseTime: "4 hours"
  },
  {
    id: 3,
    name: "Lisa Chen",
    title: "Finance & Investment Specialist",
    avatar: "/avatars/mentor3.jpg",
    rating: 5.0,
    reviews: 203,
    expertise: ["Financial Planning", "Investment Strategy", "Business Valuation", "Risk Management"],
    experience: 20,
    hourlyRate: 200,
    availability: "available",
    bio: "Former Wall Street executive turned angel investor. Focus on women-led businesses.",
    company: "Women's Investment Network",
    location: "New York, NY",
    languages: ["English", "Mandarin"],
    responseTime: "1 hour"
  },
  {
    id: 4,
    name: "Amanda Thompson",
    title: "Leadership & Team Building Coach",
    avatar: "/avatars/mentor4.jpg",
    rating: 4.7,
    reviews: 156,
    expertise: ["Leadership Development", "Team Management", "Company Culture", "HR Strategy"],
    experience: 18,
    hourlyRate: 135,
    availability: "available",
    bio: "HR executive at Fortune 500 companies. Expert in building inclusive teams and leadership development.",
    company: "Leadership Dynamics",
    location: "Chicago, IL",
    languages: ["English"],
    responseTime: "3 hours"
  }
]

const mentorshipPrograms = [
  {
    id: 1,
    title: "Startup Accelerator Program",
    description: "12-week intensive program for early-stage startups",
    duration: "12 weeks",
    price: 2500,
    mentorCount: 5,
    participants: 45,
    rating: 4.9,
    nextStartDate: "2024-02-01",
    features: ["Weekly 1:1 sessions", "Group workshops", "Investor pitch prep", "Network access"]
  },
  {
    id: 2,
    title: "Leadership Excellence Circle",
    description: "Monthly group coaching for women leaders",
    duration: "6 months",
    price: 1800,
    mentorCount: 3,
    participants: 28,
    rating: 4.8,
    nextStartDate: "2024-01-15",
    features: ["Monthly group sessions", "Peer networking", "Leadership assessments", "Guest speakers"]
  },
  {
    id: 3,
    title: "E-commerce Mastery",
    description: "Complete guide to building a successful online store",
    duration: "8 weeks",
    price: 1200,
    mentorCount: 4,
    participants: 67,
    rating: 4.7,
    nextStartDate: "2024-01-20",
    features: ["Step-by-step training", "Live Q&A sessions", "Template access", "Community support"]
  }
]

const upcomingSessions = [
  {
    id: 1,
    mentor: "Dr. Sarah Johnson",
    type: "1-on-1 Session",
    date: "Today",
    time: "2:00 PM - 3:00 PM",
    status: "confirmed",
    topic: "Fundraising Strategy Review"
  },
  {
    id: 2,
    mentor: "Maria Rodriguez",
    type: "Group Workshop",
    date: "Tomorrow",
    time: "10:00 AM - 12:00 PM",
    status: "confirmed",
    topic: "Social Media Marketing Trends 2024"
  },
  {
    id: 3,
    mentor: "Lisa Chen",
    type: "1-on-1 Session",
    date: "Friday",
    time: "3:00 PM - 4:00 PM",
    status: "pending",
    topic: "Financial Planning for Q1"
  }
]

export default function Mentorship() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedExpertise, setSelectedExpertise] = useState('')

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.expertise.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesExpertise = !selectedExpertise || mentor.expertise.includes(selectedExpertise)
    return matchesSearch && matchesExpertise
  })

  const allExpertise = Array.from(new Set(mentors.flatMap(m => m.expertise)))

  return (
    <PublicLayout showAuthPrompt={true}>
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Mentorship & Coaching
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Connect with experienced women entrepreneurs and accelerate your growth
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
              <Users className="w-3 h-3 mr-1" />
              150+ Active Mentors
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="find-mentor" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="find-mentor">Find a Mentor</TabsTrigger>
            <TabsTrigger value="programs">Programs</TabsTrigger>
            <TabsTrigger value="my-sessions">My Sessions</TabsTrigger>
            <TabsTrigger value="group-coaching">Group Coaching</TabsTrigger>
          </TabsList>

          <TabsContent value="find-mentor" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search mentors by name, expertise, or bio..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={() => setSelectedExpertise('')}>
                      <Filter className="h-4 w-4 mr-2" />
                      All Expertise
                    </Button>
                    {allExpertise.slice(0, 5).map(expertise => (
                      <Button
                        key={expertise}
                        variant={selectedExpertise === expertise ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedExpertise(selectedExpertise === expertise ? '' : expertise)}
                      >
                        {expertise}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mentors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMentors.map((mentor) => (
                <Card key={mentor.id} className="transition-all hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={mentor.avatar} alt={mentor.name} />
                        <AvatarFallback>{mentor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{mentor.name}</CardTitle>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{mentor.rating}</span>
                          </div>
                        </div>
                        <CardDescription className="text-sm">{mentor.title}</CardDescription>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant={mentor.availability === 'available' ? 'default' : 'secondary'}>
                            {mentor.availability === 'available' ? 'Available' : 'Busy'}
                          </Badge>
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            {mentor.responseTime}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{mentor.bio}</p>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Expertise</h4>
                      <div className="flex flex-wrap gap-1">
                        {mentor.expertise.map((exp, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {exp}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Briefcase className="h-4 w-4 text-gray-500" />
                        <span>{mentor.experience} years</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{mentor.location.split(',')[0]}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span>${mentor.hourlyRate}/hr</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4 text-gray-500" />
                        <span>{mentor.reviews} reviews</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button className="flex-1" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button variant="outline" size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Session
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="programs" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentorshipPrograms.map((program) => (
                <Card key={program.id} className="transition-all hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{program.title}</CardTitle>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{program.rating}</span>
                      </div>
                    </div>
                    <CardDescription>{program.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Duration</span>
                        <div className="font-medium">{program.duration}</div>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Price</span>
                        <div className="font-medium">${program.price}</div>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Mentors</span>
                        <div className="font-medium">{program.mentorCount}</div>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Participants</span>
                        <div className="font-medium">{program.participants}</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Program Features</h4>
                      <div className="space-y-1">
                        {program.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Next cohort starts: {new Date(program.nextStartDate).toLocaleDateString()}
                      </div>
                      <Button className="w-full">
                        Apply Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my-sessions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Sessions</CardTitle>
                <CardDescription>Your scheduled mentorship sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${session.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                        <div>
                          <div className="font-medium">{session.topic}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            with {session.mentor} • {session.type}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{session.date}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{session.time}</div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Video className="h-4 w-4 mr-2" />
                          Join
                        </Button>
                        <Button variant="ghost" size="sm">
                          Reschedule
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session History</CardTitle>
                <CardDescription>Your past mentorship sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No completed sessions yet</p>
                  <Button variant="outline" className="mt-4">
                    Book Your First Session
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="group-coaching" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    <span>Live Group Sessions</span>
                  </CardTitle>
                  <CardDescription>
                    Join live group coaching sessions with expert mentors
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Women in Tech Leadership</h4>
                      <Badge variant="outline">Live</Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      with Dr. Sarah Johnson • 45 participants
                    </p>
                    <Button size="sm" className="w-full">
                      <Video className="h-4 w-4 mr-2" />
                      Join Session
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium text-sm">Marketing Mastermind</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Tomorrow, 2:00 PM • Maria Rodriguez
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Register
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium text-sm">Finance Roundtable</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Friday, 10:00 AM • Lisa Chen
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Register
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-red-600" />
                    <span>Peer Support Groups</span>
                  </CardTitle>
                  <CardDescription>
                    Connect with fellow women entrepreneurs in supportive groups
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">Startup Founders Circle</h4>
                        <Badge variant="secondary">234 members</Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        Early-stage founders supporting each other's journey
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        Join Group
                      </Button>
                    </div>

                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">Mom Entrepreneurs Network</h4>
                        <Badge variant="secondary">189 members</Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        Balancing motherhood and entrepreneurship
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        Join Group
                      </Button>
                    </div>

                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">Scale Your Business</h4>
                        <Badge variant="secondary">156 members</Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        For established businesses looking to scale
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        Join Group
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PublicLayout>
  )
}