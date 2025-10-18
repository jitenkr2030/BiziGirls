'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Heart, 
  Search, 
  Users, 
  BookOpen, 
  Download,
  ExternalLink,
  Calendar,
  MapPin,
  Star,
  Award,
  TrendingUp,
  Shield,
  Lightbulb,
  Target,
  Globe,
  FileText,
  Video,
  Podcast,
  MessageCircle,
  CheckCircle,
  ArrowRight,
  Filter,
  Clock,
  Eye
} from 'lucide-react'

export default function WomenResources() {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Women-Centric Business Resources
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Curated resources, tools, and support specifically for women entrepreneurs
            </p>
          </div>
          <Button className="bg-pink-600 hover:bg-pink-700">
            <Heart className="mr-2 h-4 w-4" />
            Contribute Resource
          </Button>
        </div>

        {/* Resource Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">
                Across 25 categories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Women Helped</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45,231</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94%</div>
              <p className="text-xs text-muted-foreground">
                Resource satisfaction
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">28</div>
              <p className="text-xs text-muted-foreground">
                Support programs
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Featured Resource */}
        <Card className="border-pink-200 dark:border-pink-800 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <Star className="h-6 w-6 text-pink-600 dark:text-pink-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge className="bg-pink-100 text-pink-800">Featured</Badge>
                  <Badge variant="outline">New</Badge>
                </div>
                <h3 className="font-medium text-pink-900 dark:text-pink-100 mb-2">
                  Women's Business Accelerator Program 2024
                </h3>
                <p className="text-sm text-pink-700 dark:text-pink-300 mb-4">
                  A comprehensive 12-week program designed to help women entrepreneurs scale their businesses with mentorship, funding opportunities, and strategic guidance.
                </p>
                <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-pink-600 dark:text-pink-400">
                    <Calendar className="h-4 w-4" />
                    <span>Starts March 1, 2024</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-pink-600 dark:text-pink-400">
                    <Users className="h-4 w-4" />
                    <span>50 spots available</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-pink-600 dark:text-pink-400">
                    <Shield className="h-4 w-4" />
                    <span>Fully funded</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button className="bg-pink-600 hover:bg-pink-700">
                    Apply Now
                  </Button>
                  <Button variant="outline" size="sm">
                    Learn More
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Search resources, programs, or topics..." 
                  className="pl-10"
                />
              </div>
              <Select>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="funding">Funding & Grants</SelectItem>
                  <SelectItem value="mentorship">Mentorship</SelectItem>
                  <SelectItem value="education">Education & Training</SelectItem>
                  <SelectItem value="networking">Networking</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="healthcare">Healthcare & Wellness</SelectItem>
                  <SelectItem value="legal">Legal Support</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Business Stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  <SelectItem value="idea">Idea Stage</SelectItem>
                  <SelectItem value="startup">Startup</SelectItem>
                  <SelectItem value="growth">Growth</SelectItem>
                  <SelectItem value="established">Established</SelectItem>
                  <SelectItem value="expansion">Expansion</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resource Categories Tabs */}
        <Tabs defaultValue="programs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="programs">Programs</TabsTrigger>
            <TabsTrigger value="guides">Guides & Templates</TabsTrigger>
            <TabsTrigger value="tools">Digital Tools</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="events">Events & Workshops</TabsTrigger>
          </TabsList>

          <TabsContent value="programs" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Program Cards */}
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <Card key={item} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-500 rounded-lg flex items-center justify-center">
                        <Target className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">
                          {item === 1 ? "Women in Tech Initiative" :
                           item === 2 ? "Mompreneur Network" :
                           item === 3 ? "Female Founder Fellowship" :
                           item === 4 ? "Women's Leadership Program" :
                           item === 5 ? "Startup Accelerator for Women" :
                           "Global Women Entrepreneurs Network"}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {item === 1 ? "Technology" :
                           item === 2 ? "Parenting & Business" :
                           item === 3 ? "Early Stage" :
                           item === 4 ? "Leadership" :
                           item === 5 ? "Scale-up" :
                           "International"}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {item === 1 ? "Supporting women in technology with coding bootcamps, mentorship, and job placement." :
                       item === 2 ? "Resources and support for mothers balancing entrepreneurship and family life." :
                       item === 3 ? "Intensive program for early-stage female founders with seed funding opportunities." :
                       item === 4 ? "Developing leadership skills for women in executive positions." :
                       item === 5 ? "Acceleration program for women-led startups ready to scale." :
                       "Connecting women entrepreneurs globally for collaboration and growth."}
                    </p>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span>Duration</span>
                        <span className="font-medium">
                          {item === 1 ? "12 weeks" :
                           item === 2 ? "Ongoing" :
                           item === 3 ? "6 months" :
                           item === 4 ? "8 weeks" :
                           item === 5 ? "4 months" :
                           "Year-round"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span>Cost</span>
                        <span className="font-medium text-green-600">
                          {item === 1 ? "Free" :
                           item === 2 ? "Free" :
                           item === 3 ? "Scholarship" :
                           item === 4 ? "$500" :
                           item === 5 ? "Equity-based" :
                           "Membership"}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button size="sm" className="flex-1">
                        Learn More
                      </Button>
                      <Button variant="outline" size="sm">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="guides" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Guide Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <span>Business Guides</span>
                  </CardTitle>
                  <CardDescription>
                    Step-by-step guides for women entrepreneurs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: "Starting a Business as a Woman", downloads: 1234, category: "Getting Started" },
                    { name: "Women's Business Funding Guide", downloads: 892, category: "Finance" },
                    { name: "Balancing Business and Family", downloads: 1567, category: "Work-Life Balance" },
                    { name: "Networking Strategies for Women", downloads: 745, category: "Networking" },
                    { name: "Leadership Skills for Women", downloads: 923, category: "Leadership" },
                  ].map((guide, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{guide.name}</h4>
                        <p className="text-xs text-gray-500">{guide.category} • {guide.downloads} downloads</p>
                      </div>
                      <Download className="h-4 w-4 text-gray-400" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    <span>Templates & Worksheets</span>
                  </CardTitle>
                  <CardDescription>
                    Ready-to-use templates for your business
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: "Business Plan Template for Women", downloads: 2341, category: "Planning" },
                    { name: "Grant Application Template", downloads: 1567, category: "Funding" },
                    { name: "Women-led Pitch Deck Template", downloads: 987, category: "Investment" },
                    { name: "Work-Life Balance Planner", downloads: 1876, category: "Personal" },
                    { name: "Networking Event Template", downloads: 654, category: "Networking" },
                  ].map((template, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{template.name}</h4>
                        <p className="text-xs text-gray-500">{template.category} • {template.downloads} downloads</p>
                      </div>
                      <Download className="h-4 w-4 text-gray-400" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tools" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Digital Tools */}
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <Card key={item} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center">
                        <Lightbulb className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">
                          {item === 1 ? "AI Business Coach" :
                           item === 2 ? "Financial Planning Tool" :
                           item === 3 ? "Networking Platform" :
                           item === 4 ? "Mentor Matching System" :
                           item === 5 ? "Grant Finder" :
                           "Business Health Checker"}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {item === 1 ? "AI Assistant" :
                           item === 2 ? "Finance" :
                           item === 3 ? "Community" :
                           item === 4 ? "Mentorship" :
                           item === 5 ? "Funding" :
                           "Analytics"}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {item === 1 ? "AI-powered business coaching and advice tailored for women entrepreneurs." :
                       item === 2 ? "Comprehensive financial planning and budgeting tools for your business." :
                       item === 3 ? "Connect with other women entrepreneurs and build meaningful relationships." :
                       item === 4 ? "Get matched with experienced mentors based on your business needs." :
                       item === 5 ? "Find grants and funding opportunities specifically for women-owned businesses." :
                       "Analyze your business health and get actionable insights."}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>4.{item + 5}</span>
                      </div>
                      <Badge variant={item === 1 || item === 4 ? "default" : "secondary"}>
                        {item === 1 ? "Premium" : item === 4 ? "Premium" : "Free"}
                      </Badge>
                    </div>

                    <Button size="sm" className="w-full">
                      {item === 1 || item === 4 ? "Upgrade" : "Try Now"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="community" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Community Groups */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    <span>Active Communities</span>
                  </CardTitle>
                  <CardDescription>
                    Join communities of women entrepreneurs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">Women in Tech Entrepreneurs</h4>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        For women founders in the technology industry
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>2,341 members</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="h-3 w-3" />
                            <span>156 online</span>
                          </div>
                        </div>
                        <Button size="sm">Join</Button>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">Mompreneurs United</h4>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Supporting mothers who are entrepreneurs
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>1,892 members</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="h-3 w-3" />
                            <span>89 online</span>
                          </div>
                        </div>
                        <Button size="sm">Join</Button>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">Female Founders Network</h4>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Exclusive network for women founders
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>3,456 members</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="h-3 w-3" />
                            <span>234 online</span>
                          </div>
                        </div>
                        <Button size="sm">Join</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Success Stories */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-600" />
                    <span>Community Success Stories</span>
                  </CardTitle>
                  <CardDescription>
                    Real stories from our community members
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium">SC</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-1">Sarah's Tech Startup Success</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            "Thanks to the Women in Tech community, I found my co-founder and secured $500K in funding!"
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>2 days ago</span>
                            <div className="flex items-center space-x-1">
                              <Heart className="h-3 w-3 text-red-500" />
                              <span>234</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium">MJ</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-1">Maria's Journey to $1M Revenue</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            "The mentorship and resources from this platform helped me scale my business to 7 figures."
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>1 week ago</span>
                            <div className="flex items-center space-x-1">
                              <Heart className="h-3 w-3 text-red-500" />
                              <span>189</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium">LK</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-1">Lisa's Work-Life Balance</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            "Found the perfect balance between running my business and family life with the help of this community."
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>2 weeks ago</span>
                            <div className="flex items-center space-x-1">
                              <Heart className="h-3 w-3 text-red-500" />
                              <span>156</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    View All Stories
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upcoming Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-indigo-600" />
                    <span>Upcoming Events</span>
                  </CardTitle>
                  <CardDescription>
                    Join workshops, webinars, and networking events
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">Women's Leadership Summit</h4>
                        <Badge variant="outline">In Person</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Annual summit featuring keynote speakers and workshops
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>Mar 15-17, 2024</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>San Francisco, CA</span>
                          </div>
                        </div>
                        <Button size="sm">Register</Button>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">Grant Writing Workshop</h4>
                        <Badge variant="outline">Online</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Learn how to write successful grant applications
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>Feb 28, 2024</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Video className="h-3 w-3" />
                            <span>2:00 PM EST</span>
                          </div>
                        </div>
                        <Button size="sm">Register</Button>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">Networking Mixer</h4>
                        <Badge variant="outline">Hybrid</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Monthly networking event for women entrepreneurs
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>Every First Thursday</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>50+ attendees</span>
                          </div>
                        </div>
                        <Button size="sm">RSVP</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Event Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Video className="h-5 w-5 text-red-600" />
                    <span>On-Demand Content</span>
                  </CardTitle>
                  <CardDescription>
                    Watch past events and workshops anytime
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">Pitch Perfect Workshop</h4>
                        <Badge variant="outline">Recorded</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Master the art of pitching to investors
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>2 hours</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>1,234 views</span>
                          </div>
                        </div>
                        <Button size="sm">Watch</Button>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">Financial Planning 101</h4>
                        <Badge variant="outline">Recorded</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Essential financial planning for your business
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>1.5 hours</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>892 views</span>
                          </div>
                        </div>
                        <Button size="sm">Watch</Button>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">Building Your Brand</h4>
                        <Badge variant="outline">Recorded</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Create a powerful brand for your business
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>1 hour</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>567 views</span>
                          </div>
                        </div>
                        <Button size="sm">Watch</Button>
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