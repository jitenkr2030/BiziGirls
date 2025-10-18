'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Languages, 
  Mic, 
  Volume2, 
  Play, 
  Pause,
  BookOpen,
  Users,
  Target,
  Award,
  Calendar,
  Clock,
  Star,
  TrendingUp,
  MessageCircle,
  Video,
  FileText,
  CheckCircle,
  Headphones,
  Globe,
  Brain,
  Lightbulb
} from 'lucide-react'

export default function EnglishDevelopment() {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              English Speaking & Personality Development
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Enhance your communication skills and build confidence for global business success
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Mic className="mr-2 h-4 w-4" />
            Start Practice Session
          </Button>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">English Level</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">B2</div>
              <Progress value={75} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Upper Intermediate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Practice Streak</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">
                Days in a row
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Lessons</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">47</div>
              <p className="text-xs text-muted-foreground">
                Out of 120 total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confidence Score</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">82%</div>
              <Progress value={82} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Great improvement!
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Practice Plan */}
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Today's Practice Plan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-blue-700 dark:text-blue-300">Business Vocabulary (15 min)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-blue-700 dark:text-blue-300">Pronunciation Practice (20 min)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <span className="text-sm text-blue-700 dark:text-blue-300">Mock Interview (30 min)</span>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Continue Practice
                  </Button>
                  <Button variant="outline" size="sm">
                    View Full Plan
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Modules Tabs */}
        <Tabs defaultValue="speaking" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="speaking">Speaking Practice</TabsTrigger>
            <TabsTrigger value="personality">Personality Dev</TabsTrigger>
            <TabsTrigger value="business">Business English</TabsTrigger>
            <TabsTrigger value="pronunciation">Pronunciation</TabsTrigger>
            <TabsTrigger value="progress">Progress Track</TabsTrigger>
          </TabsList>

          <TabsContent value="speaking" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Speaking Exercises */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mic className="h-5 w-5 text-green-600" />
                    <span>Interactive Speaking Exercises</span>
                  </CardTitle>
                  <CardDescription>
                    Practice real-life conversations with AI feedback
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">Business Meeting Simulation</h4>
                        <Badge variant="outline">Intermediate</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Practice leading a business meeting with professional vocabulary
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>25 min</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3" />
                            <span>4.8</span>
                          </div>
                        </div>
                        <Button size="sm">Start</Button>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">Elevator Pitch Practice</h4>
                        <Badge variant="outline">Advanced</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Perfect your 60-second elevator pitch for investors
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>15 min</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3" />
                            <span>4.9</span>
                          </div>
                        </div>
                        <Button size="sm">Start</Button>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">Customer Service Scenarios</h4>
                        <Badge variant="outline">Beginner</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Handle customer inquiries with confidence and clarity
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>20 min</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3" />
                            <span>4.7</span>
                          </div>
                        </div>
                        <Button size="sm">Start</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Live Practice Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    <span>Live Practice Sessions</span>
                  </CardTitle>
                  <CardDescription>
                    Join group sessions or practice with native speakers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">Daily Conversation Club</h4>
                        <Badge className="bg-green-100 text-green-800">Live Now</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Casual conversation practice with native speakers
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>12 participants</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Globe className="h-3 w-3" />
                            <span>USA, UK, Canada</span>
                          </div>
                        </div>
                        <Button size="sm">Join Now</Button>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">Business English Workshop</h4>
                        <Badge variant="outline">Today 3:00 PM</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Professional business communication and etiquette
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>8/15 spots</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>60 min</span>
                          </div>
                        </div>
                        <Button size="sm">Reserve Spot</Button>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">1-on-1 Tutoring</h4>
                        <Badge variant="outline">Available</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Personalized sessions with certified instructors
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3" />
                            <span>4.9 rating</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>30-60 min</span>
                          </div>
                        </div>
                        <Button size="sm">Book Session</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="personality" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Personality Development Cards */}
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <Card key={item} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                        <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">
                          {item === 1 ? "Confidence Building" :
                           item === 2 ? "Leadership Skills" :
                           item === 3 ? "Public Speaking" :
                           item === 4 ? "Body Language" :
                           item === 5 ? "Emotional Intelligence" :
                           "Networking Skills"}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {item === 1 ? "Self-Esteem" :
                           item === 2 ? "Management" :
                           item === 3 ? "Presentation" :
                           item === 4 ? "Non-verbal" :
                           item === 5 ? "EQ Development" :
                           "Relationship Building"}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {item === 1 ? "Build unshakable confidence through proven techniques and exercises." :
                       item === 2 ? "Develop essential leadership qualities for business success." :
                       item === 3 ? "Master the art of speaking to any audience with confidence." :
                       item === 4 ? "Understand and improve your non-verbal communication." :
                       item === 5 ? "Enhance your emotional intelligence for better relationships." :
                       "Learn effective networking strategies for business growth."}
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span>Progress</span>
                        <span>{item === 1 ? "65%" : item === 2 ? "40%" : item === 3 ? "80%" : "25%"}</span>
                      </div>
                      <Progress value={item === 1 ? 65 : item === 2 ? 40 : item === 3 ? 80 : 25} className="h-2" />
                    </div>
                    <Button size="sm" className="w-full">
                      {item === 1 ? "Continue" : "Start"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="business" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Business English Courses */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span>Business English Courses</span>
                  </CardTitle>
                  <CardDescription>
                    Professional English for workplace success
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">Email Writing Mastery</h4>
                        <Badge variant="outline">12 Lessons</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Write professional emails that get results
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>4 hours</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3" />
                            <span>4.8</span>
                          </div>
                        </div>
                        <Button size="sm">Enroll</Button>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">Negotiation Skills</h4>
                        <Badge variant="outline">8 Lessons</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Master business negotiations and deal-making
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>3 hours</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3" />
                            <span>4.9</span>
                          </div>
                        </div>
                        <Button size="sm">Enroll</Button>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">Presentation Skills</h4>
                        <Badge variant="outline">10 Lessons</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Deliver powerful business presentations
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>5 hours</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3" />
                            <span>4.7</span>
                          </div>
                        </div>
                        <Button size="sm">Enroll</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Business Vocabulary Builder */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                    <span>Business Vocabulary Builder</span>
                  </CardTitle>
                  <CardDescription>
                    Expand your professional vocabulary daily
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <h4 className="font-medium text-sm mb-2">Today's Words</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Synergy</span>
                        <Button variant="ghost" size="sm">
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        The interaction of elements that when combined produce a total effect greater than the sum of individual elements.
                      </p>
                    </div>
                    <div className="space-y-2 mt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Leverage</span>
                        <Button variant="ghost" size="sm">
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        The use of borrowed capital to increase the potential return of an investment.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Practice Exercises</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="h-20 flex-col space-y-1">
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-xs">Fill in Blanks</span>
                      </Button>
                      <Button variant="outline" size="sm" className="h-20 flex-col space-y-1">
                        <Target className="h-4 w-4" />
                        <span className="text-xs">Matching</span>
                      </Button>
                      <Button variant="outline" size="sm" className="h-20 flex-col space-y-1">
                        <Video className="h-4 w-4" />
                        <span className="text-xs">Video Context</span>
                      </Button>
                      <Button variant="outline" size="sm" className="h-20 flex-col space-y-1">
                        <Headphones className="h-4 w-4" />
                        <span className="text-xs">Audio Practice</span>
                      </Button>
                    </div>
                  </div>

                  <Button className="w-full">
                    Start Vocabulary Challenge
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pronunciation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pronunciation Practice */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Volume2 className="h-5 w-5 text-red-600" />
                    <span>Pronunciation Practice</span>
                  </CardTitle>
                  <CardDescription>
                    Improve your accent and clarity with AI-powered feedback
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">Sound Recognition</h4>
                        <Badge variant="outline">AI-Powered</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Practice difficult sounds and get instant feedback
                      </p>
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="flex-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-center">
                          <span className="font-mono text-lg">/θ/ vs /ð/</span>
                        </div>
                        <Button variant="outline" size="sm">
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button size="sm" className="w-full">Start Practice</Button>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">Word Stress Patterns</h4>
                        <Badge variant="outline">Essential</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Master English stress patterns for natural speech
                      </p>
                      <div className="space-y-2 mb-3">
                        <div className="text-sm">
                          <span className="font-medium">COM</span>-pu-ter
                        </div>
                        <div className="text-sm">
                          re-<span className="font-medium">PRE</span>-sent
                        </div>
                      </div>
                      <Button size="sm" className="w-full">Practice Now</Button>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">Intonation Practice</h4>
                        <Badge variant="outline">Advanced</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Learn the music of English speech
                      </p>
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="flex-1 text-sm text-gray-600 dark:text-gray-400">
                          Questions rise, statements fall
                        </div>
                        <Button variant="outline" size="sm">
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button size="sm" className="w-full">Start Lesson</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Accent Reduction */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="h-5 w-5 text-green-600" />
                    <span>Accent Reduction</span>
                  </CardTitle>
                  <CardDescription>
                    Reduce your accent and speak more clearly
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-medium text-sm mb-2">Your Progress</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>Clarity Score</span>
                          <span>78%</span>
                        </div>
                        <Progress value={78} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>Accent Reduction</span>
                          <span>65%</span>
                        </div>
                        <Progress value={65} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>Fluency</span>
                          <span>82%</span>
                        </div>
                        <Progress value={82} className="h-2" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Target Areas</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">Vowel Sounds</span>
                        <Badge variant="outline">Needs Work</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">Consonant Clusters</span>
                        <Badge variant="outline">Good</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">Rhythm and Timing</span>
                        <Badge variant="outline">Excellent</Badge>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full">
                    Start Accent Training
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Progress Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-indigo-600" />
                    <span>Learning Analytics</span>
                  </CardTitle>
                  <CardDescription>
                    Track your improvement over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">156</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Hours Practiced</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">89%</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Accuracy Rate</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Weekly Progress</h4>
                    <div className="space-y-2">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                        <div key={day} className="flex items-center space-x-2">
                          <span className="text-xs w-8">{day}</span>
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-indigo-600 h-2 rounded-full" 
                              style={{ width: `${[60, 80, 45, 90, 75, 30, 85][index]}%` }}
                            ></div>
                          </div>
                          <span className="text-xs w-8 text-right">
                            {[60, 80, 45, 90, 75, 30, 85][index]}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Skill Breakdown</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Speaking</span>
                        <span className="text-sm font-medium">85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Listening</span>
                        <span className="text-sm font-medium">78%</span>
                      </div>
                      <Progress value={78} className="h-2" />
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Vocabulary</span>
                        <span className="text-sm font-medium">92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Grammar</span>
                        <span className="text-sm font-medium">88%</span>
                      </div>
                      <Progress value={88} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-yellow-600" />
                    <span>Achievements & Certificates</span>
                  </CardTitle>
                  <CardDescription>
                    Celebrate your milestones and earn certificates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Award className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <h4 className="font-medium text-sm mb-1">Week Warrior</h4>
                      <p className="text-xs text-gray-500">7-day streak</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Mic className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h4 className="font-medium text-sm mb-1">Voice Master</h4>
                      <p className="text-xs text-gray-500">100 hours practice</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Star className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <h4 className="font-medium text-sm mb-1">Quick Learner</h4>
                      <p className="text-xs text-gray-500">50 lessons completed</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Globe className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h4 className="font-medium text-sm mb-1">Global Speaker</h4>
                      <p className="text-xs text-gray-500">B2 level achieved</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Certificates Earned</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h5 className="font-medium text-sm">Business English Certificate</h5>
                          <p className="text-xs text-gray-500">Completed • Level B2</p>
                        </div>
                        <Button variant="outline" size="sm">View</Button>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h5 className="font-medium text-sm">Pronunciation Mastery</h5>
                          <p className="text-xs text-gray-500">In Progress • 75%</p>
                        </div>
                        <Button variant="outline" size="sm">Continue</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}