'use client'

import { useState } from 'react'
import { PublicLayout } from '@/components/layout/public-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  GraduationCap, 
  Search, 
  Clock, 
  Star, 
  Users, 
  Play,
  BookOpen,
  Award,
  CheckCircle,
  TrendingUp,
  Filter,
  Calendar,
  Video,
  FileText,
  Download,
  ArrowRight
} from 'lucide-react'

const courses = [
  {
    id: 1,
    title: "Digital Marketing Mastery",
    instructor: "Maria Rodriguez",
    category: "Marketing",
    level: "Intermediate",
    duration: 8,
    price: 299,
    rating: 4.8,
    reviews: 1247,
    students: 5432,
    thumbnail: "/courses/digital-marketing.jpg",
    description: "Complete digital marketing course covering SEO, social media, content marketing, and paid advertising.",
    enrolled: true,
    progress: 65,
    lessons: [
      { title: "Introduction to Digital Marketing", duration: 15, completed: true },
      { title: "SEO Fundamentals", duration: 25, completed: true },
      { title: "Social Media Strategy", duration: 30, completed: true },
      { title: "Content Marketing", duration: 20, completed: false },
      { title: "Paid Advertising", duration: 35, completed: false }
    ]
  },
  {
    id: 2,
    title: "Business Finance for Entrepreneurs",
    instructor: "Lisa Chen",
    category: "Finance",
    level: "Beginner",
    duration: 6,
    price: 199,
    rating: 4.9,
    reviews: 892,
    students: 3210,
    thumbnail: "/courses/business-finance.jpg",
    description: "Learn essential financial concepts for running a successful business, from budgeting to financial analysis.",
    enrolled: true,
    progress: 100,
    lessons: [
      { title: "Financial Basics", duration: 20, completed: true },
      { title: "Budgeting & Forecasting", duration: 25, completed: true },
      { title: "Understanding Financial Statements", duration: 30, completed: true },
      { title: "Cash Flow Management", duration: 20, completed: true }
    ]
  },
  {
    id: 3,
    title: "Leadership & Team Management",
    instructor: "Dr. Sarah Johnson",
    category: "Leadership",
    level: "Advanced",
    duration: 10,
    price: 399,
    rating: 4.7,
    reviews: 654,
    students: 2341,
    thumbnail: "/courses/leadership.jpg",
    description: "Advanced leadership strategies for building and managing high-performing teams.",
    enrolled: false,
    progress: 0,
    lessons: []
  },
  {
    id: 4,
    title: "E-commerce Business Building",
    instructor: "Amanda Thompson",
    category: "E-commerce",
    level: "Intermediate",
    duration: 12,
    price: 349,
    rating: 4.8,
    reviews: 1103,
    students: 4567,
    thumbnail: "/courses/ecommerce.jpg",
    description: "Complete guide to building and scaling a successful e-commerce business from scratch.",
    enrolled: false,
    progress: 0,
    lessons: []
  }
]

const workshops = [
  {
    id: 1,
    title: "Social Media Marketing Trends 2024",
    instructor: "Maria Rodriguez",
    date: "2024-01-20",
    time: "10:00 AM - 12:00 PM",
    type: "Live Workshop",
    price: 49,
    seats: 50,
    registered: 42,
    description: "Stay ahead of the curve with the latest social media marketing trends and strategies.",
    category: "Marketing"
  },
  {
    id: 2,
    title: "Women in Tech Leadership Panel",
    instructor: "Multiple Speakers",
    date: "2024-01-25",
    time: "2:00 PM - 4:00 PM",
    type: "Panel Discussion",
    price: 0,
    seats: 100,
    registered: 87,
    description: "Join successful women tech leaders as they share their experiences and insights.",
    category: "Leadership"
  },
  {
    id: 3,
    title: "Financial Planning for Startups",
    instructor: "Lisa Chen",
    date: "2024-01-30",
    time: "3:00 PM - 5:00 PM",
    type: "Interactive Workshop",
    price: 79,
    seats: 30,
    registered: 28,
    description: "Hands-on workshop for creating financial plans and projections for your startup.",
    category: "Finance"
  }
]

const learningPaths = [
  {
    id: 1,
    title: "Complete Entrepreneur Journey",
    description: "From idea to successful business - comprehensive learning path",
    courses: 6,
    duration: "3 months",
    progress: 40,
    coursesList: ["Business Planning", "Marketing Fundamentals", "Financial Management", "Leadership Skills", "Sales Strategies", "Growth Hacking"]
  },
  {
    id: 2,
    title: "Digital Business Specialist",
    description: "Master digital skills for modern business success",
    courses: 4,
    duration: "2 months",
    progress: 75,
    coursesList: ["Digital Marketing", "E-commerce", "Data Analytics", "Social Media Strategy"]
  },
  {
    id: 3,
    title: "Leadership Excellence",
    description: "Develop advanced leadership and management skills",
    courses: 5,
    duration: "2.5 months",
    progress: 0,
    coursesList: ["Leadership Fundamentals", "Team Management", "Strategic Thinking", "Communication Skills", "Change Management"]
  }
]

export default function Courses() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || course.category === selectedCategory
    const matchesLevel = !selectedLevel || course.level === selectedLevel
    return matchesSearch && matchesCategory && matchesLevel
  })

  const categories = Array.from(new Set(courses.map(c => c.category)))
  const levels = Array.from(new Set(courses.map(c => c.level)))

  const enrolledCourses = courses.filter(c => c.enrolled)
  const completedCourses = enrolledCourses.filter(c => c.progress === 100)

  return (
    <PublicLayout showAuthPrompt={true}>
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Skill Development
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Advance your skills with expert-led courses and workshops
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
              <GraduationCap className="w-3 h-3 mr-1" />
              50+ Courses Available
            </Badge>
          </div>
        </div>

        {/* Learning Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>Your Learning Progress</span>
            </CardTitle>
            <CardDescription>
              Track your skill development journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{enrolledCourses.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Enrolled Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{completedCourses.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completed Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(enrolledCourses.reduce((sum, course) => sum + course.progress, 0) / enrolledCourses.length) || 0}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Average Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">3</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Certificates Earned</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="workshops">Workshops</TabsTrigger>
            <TabsTrigger value="learning-paths">Learning Paths</TabsTrigger>
            <TabsTrigger value="my-learning">My Learning</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={() => setSelectedCategory('')}>
                      <Filter className="h-4 w-4 mr-2" />
                      All Categories
                    </Button>
                    {categories.map(category => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(selectedCategory === category ? '' : category)}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  {levels.map(level => (
                    <Button
                      key={level}
                      variant={selectedLevel === level ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedLevel(selectedLevel === level ? '' : level)}
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="transition-all hover:shadow-lg">
                  <div className="aspect-video bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center">
                    <Play className="h-12 w-12 text-white/80" />
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{course.title}</CardTitle>
                        <CardDescription>by {course.instructor}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{course.rating}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {course.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Duration</span>
                        <div className="font-medium">{course.duration} hours</div>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Level</span>
                        <div className="font-medium">{course.level}</div>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Students</span>
                        <div className="font-medium">{course.students.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Reviews</span>
                        <div className="font-medium">{course.reviews}</div>
                      </div>
                    </div>

                    {course.enrolled && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                    )}

                    <div className="flex space-y-2">
                      <Button className="flex-1" size="sm">
                        {course.enrolled ? "Continue Learning" : "Enroll Now"}
                      </Button>
                      <Button variant="outline" size="sm">
                        Preview
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="workshops" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workshops.map((workshop) => (
                <Card key={workshop.id} className="transition-all hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{workshop.title}</CardTitle>
                        <CardDescription>by {workshop.instructor}</CardDescription>
                      </div>
                      <Badge variant={workshop.price === 0 ? "default" : "secondary"}>
                        {workshop.price === 0 ? "Free" : `$${workshop.price}`}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {workshop.description}
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{new Date(workshop.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{workshop.time}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>{workshop.registered}/{workshop.seats} seats</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Video className="h-4 w-4 text-gray-500" />
                        <span>{workshop.type}</span>
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(workshop.registered / workshop.seats) * 100}%` }}
                      ></div>
                    </div>

                    <Button className="w-full" size="sm">
                      {workshop.registered >= workshop.seats ? "Join Waitlist" : "Register Now"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="learning-paths" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {learningPaths.map((path) => (
                <Card key={path.id} className="transition-all hover:shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">{path.title}</CardTitle>
                    <CardDescription>{path.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Courses</span>
                        <div className="font-medium">{path.courses}</div>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Duration</span>
                        <div className="font-medium">{path.duration}</div>
                      </div>
                    </div>

                    {path.progress > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{path.progress}%</span>
                        </div>
                        <Progress value={path.progress} className="h-2" />
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-medium mb-2">Courses Included</h4>
                      <div className="space-y-1">
                        {path.coursesList.slice(0, 3).map((course, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>{course}</span>
                          </div>
                        ))}
                        {path.coursesList.length > 3 && (
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            +{path.coursesList.length - 3} more courses
                          </div>
                        )}
                      </div>
                    </div>

                    <Button className="w-full" size="sm">
                      {path.progress > 0 ? "Continue Path" : "Start Learning Path"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my-learning" className="space-y-6">
            {/* Currently Learning */}
            <Card>
              <CardHeader>
                <CardTitle>Currently Learning</CardTitle>
                <CardDescription>Your active courses and progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {enrolledCourses.filter(c => c.progress < 100).map((course) => (
                    <div key={course.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-white/80" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{course.title}</h4>
                          <Badge variant="outline">{course.progress}%</Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">by {course.instructor}</p>
                        <div className="mt-2">
                          <Progress value={course.progress} className="h-2 w-48" />
                        </div>
                      </div>
                      <Button size="sm">
                        Continue
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Completed Courses */}
            <Card>
              <CardHeader>
                <CardTitle>Completed Courses</CardTitle>
                <CardDescription>Courses you've successfully finished</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {completedCourses.map((course) => (
                    <div key={course.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                        <Award className="h-8 w-8 text-white/80" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{course.title}</h4>
                          <Badge variant="secondary">Completed</Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">by {course.instructor}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm">
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span>{course.rating}</span>
                          </div>
                          <div className="text-gray-600 dark:text-gray-400">
                            {course.duration} hours
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Certificate
                        </Button>
                        <Button variant="outline" size="sm">
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Workshops */}
            <Card>
              <CardHeader>
                <CardTitle>Registered Workshops</CardTitle>
                <CardDescription>Workshops you're registered to attend</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No upcoming workshops registered</p>
                  <Button variant="outline" className="mt-4">
                    Browse Workshops
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PublicLayout>
  )
}