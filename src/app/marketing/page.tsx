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
  TrendingUp, 
  Search, 
  Target, 
  Megaphone, 
  Palette,
  BarChart3,
  Users,
  DollarSign,
  Calendar,
  Star,
  Zap,
  FileText,
  Image,
  Video,
  MessageSquare,
  Share2,
  Download,
  Play,
  Sparkles,
  Lightbulb,
  Brain,
  Rocket,
  Eye,
  Heart,
  Filter
} from 'lucide-react'

export default function MarketingTools() {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              AI-Powered Marketing & Branding Tools
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Intelligent marketing solutions to grow your women-owned business
            </p>
          </div>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Campaign
          </Button>
        </div>

        {/* Marketing Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Campaign Performance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+24%</div>
              <p className="text-xs text-muted-foreground">
                vs last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Social Reach</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">125K</div>
              <p className="text-xs text-muted-foreground">
                Total followers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3.8%</div>
              <p className="text-xs text-muted-foreground">
                Above industry avg
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ROI</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">342%</div>
              <p className="text-xs text-muted-foreground">
                Marketing ROI
              </p>
            </CardContent>
          </Card>
        </div>

        {/* AI Campaign Generator */}
        <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                  AI Campaign Generator
                </h3>
                <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
                  Create personalized marketing campaigns in seconds with our AI-powered tool. Just describe your business and goals.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Input placeholder="Describe your business..." />
                  <Input placeholder="Campaign goal (e.g., increase sales, brand awareness)" />
                </div>
                <div className="flex space-x-2">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Rocket className="mr-2 h-4 w-4" />
                    Generate Campaign
                  </Button>
                  <Button variant="outline" size="sm">
                    View Examples
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Marketing Tools Tabs */}
        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="content">Content Creation</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Campaigns */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Megaphone className="h-5 w-5 text-green-600" />
                    <span>Active Campaigns</span>
                  </CardTitle>
                  <CardDescription>
                    Your current marketing campaigns
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">Summer Collection Launch</h4>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Social media campaign for new eco-friendly fashion line
                      </p>
                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">45K</div>
                          <div className="text-xs text-gray-500">Reach</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">2.3%</div>
                          <div className="text-xs text-gray-500">CTR</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">$847</div>
                          <div className="text-xs text-gray-500">Revenue</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          Runs until Aug 15
                        </div>
                        <Button size="sm">Manage</Button>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">Email Newsletter</h4>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Weekly newsletter with tips and product updates
                      </p>
                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">12.5K</div>
                          <div className="text-xs text-gray-500">Subscribers</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">34%</div>
                          <div className="text-xs text-gray-500">Open Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">4.2%</div>
                          <div className="text-xs text-gray-500">Click Rate</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          Every Tuesday
                        </div>
                        <Button size="sm">Manage</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Campaign Templates */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span>Campaign Templates</span>
                  </CardTitle>
                  <CardDescription>
                    Quick-start templates for common marketing goals
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">Product Launch Campaign</h4>
                        <Badge variant="outline">E-commerce</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Complete template for launching new products
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3" />
                            <span>4.8</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>234 used</span>
                          </div>
                        </div>
                        <Button size="sm">Use Template</Button>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">Brand Awareness Campaign</h4>
                        <Badge variant="outline">Social Media</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Build brand recognition and engagement
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3" />
                            <span>4.9</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>189 used</span>
                          </div>
                        </div>
                        <Button size="sm">Use Template</Button>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">Lead Generation Campaign</h4>
                        <Badge variant="outline">B2B</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Generate high-quality leads for your business
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3" />
                            <span>4.7</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>156 used</span>
                          </div>
                        </div>
                        <Button size="sm">Use Template</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI Content Generator */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    <span>AI Content Generator</span>
                  </CardTitle>
                  <CardDescription>
                    Create engaging content with AI assistance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Content type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="social-post">Social Media Post</SelectItem>
                        <SelectItem value="blog-article">Blog Article</SelectItem>
                        <SelectItem value="email">Email Campaign</SelectItem>
                        <SelectItem value="ad-copy">Ad Copy</SelectItem>
                        <SelectItem value="product-desc">Product Description</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Input placeholder="Topic or keyword..." />
                    <Input placeholder="Target audience..." />
                    <Input placeholder="Tone (e.g., professional, casual, fun)..." />
                    
                    <Button className="w-full">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Content
                    </Button>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Recent Generations</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">Instagram post about sustainability</span>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">Email newsletter for summer sale</span>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Content Calendar */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <span>Content Calendar</span>
                  </CardTitle>
                  <CardDescription>
                    Plan and schedule your content
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">This Week</h4>
                      <Button size="sm">Add Content</Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">Monday</span>
                          <Badge variant="outline">Instagram</Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Behind the scenes - workspace tour
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          {/* eslint-disable-next-line jsx-a11y/alt-text */}
                          <Image className="h-4 w-4 text-gray-400" />
                          <span className="text-xs text-gray-500">Ready to post</span>
                        </div>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">Wednesday</span>
                          <Badge variant="outline">Blog</Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          5 Tips for Sustainable Fashion
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="text-xs text-gray-500">In progress</span>
                        </div>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">Friday</span>
                          <Badge variant="outline">Email</Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Weekly newsletter + exclusive offer
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <MessageSquare className="h-4 w-4 text-gray-400" />
                          <span className="text-xs text-gray-500">Scheduled</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Social Media Platforms */}
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <Card key={item} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                        <Share2 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">
                          {item === 1 ? "Instagram" :
                           item === 2 ? "Facebook" :
                           item === 3 ? "Twitter" :
                           item === 4 ? "LinkedIn" :
                           item === 5 ? "TikTok" :
                           "Pinterest"}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {item === 1 ? "45.2K followers" :
                           item === 2 ? "23.8K followers" :
                           item === 3 ? "12.1K followers" :
                           item === 4 ? "8.9K followers" :
                           item === 5 ? "67.3K followers" :
                           "15.6K followers"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span>Engagement Rate</span>
                        <span className="font-medium">
                          {item === 1 ? "4.2%" :
                           item === 2 ? "3.8%" :
                           item === 3 ? "2.1%" :
                           item === 4 ? "5.4%" :
                           item === 5 ? "6.7%" :
                           "3.2%"}
                        </span>
                      </div>
                      <Progress value={item === 1 ? 42 : item === 2 ? 38 : item === 3 ? 21 : item === 4 ? 54 : item === 5 ? 67 : 32} className="h-2" />
                      
                      <div className="flex items-center justify-between text-sm">
                        <span>Posts This Month</span>
                        <span className="font-medium">
                          {item === 1 ? "24" :
                           item === 2 ? "18" :
                           item === 3 ? "45" :
                           item === 4 ? "12" :
                           item === 5 ? "38" :
                           "22"}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Analytics
                      </Button>
                      <Button size="sm" className="flex-1">
                        Post
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                    <span>Performance Overview</span>
                  </CardTitle>
                  <CardDescription>
                    Key marketing metrics and insights
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">89%</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Brand Awareness</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">4.2%</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Avg. CTR</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Channel Performance</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Social Media</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                          </div>
                          <span className="text-sm font-medium">85%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Email Marketing</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-green-600 h-2 rounded-full" style={{ width: '72%' }}></div>
                          </div>
                          <span className="text-sm font-medium">72%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Content Marketing</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-purple-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                          </div>
                          <span className="text-sm font-medium">68%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Paid Advertising</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-orange-600 h-2 rounded-full" style={{ width: '91%' }}></div>
                          </div>
                          <span className="text-sm font-medium">91%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Audience Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-pink-600" />
                    <span>Audience Insights</span>
                  </CardTitle>
                  <CardDescription>
                    Understand your target audience better
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Demographics</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Women 25-34</span>
                        <span className="text-sm font-medium">45%</span>
                      </div>
                      <Progress value={45} className="h-2" />
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Women 35-44</span>
                        <span className="text-sm font-medium">32%</span>
                      </div>
                      <Progress value={32} className="h-2" />
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Women 18-24</span>
                        <span className="text-sm font-medium">23%</span>
                      </div>
                      <Progress value={23} className="h-2" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Top Interests</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">Sustainability</Badge>
                      <Badge variant="secondary">Fashion</Badge>
                      <Badge variant="secondary">Wellness</Badge>
                      <Badge variant="secondary">Technology</Badge>
                      <Badge variant="secondary">Business</Badge>
                      <Badge variant="secondary">Lifestyle</Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Geographic Distribution</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">United States</span>
                        <span className="text-sm font-medium">62%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">United Kingdom</span>
                        <span className="text-sm font-medium">18%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Canada</span>
                        <span className="text-sm font-medium">12%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Other</span>
                        <span className="text-sm font-medium">8%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="branding" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Brand Identity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Palette className="h-5 w-5 text-purple-600" />
                    <span>Brand Identity</span>
                  </CardTitle>
                  <CardDescription>
                    Define and manage your brand assets
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium text-sm mb-2">Brand Colors</h4>
                      <div className="flex space-x-2">
                        <div className="w-12 h-12 bg-purple-600 rounded-lg"></div>
                        <div className="w-12 h-12 bg-pink-500 rounded-lg"></div>
                        <div className="w-12 h-12 bg-blue-500 rounded-lg"></div>
                        <div className="w-12 h-12 bg-gray-800 rounded-lg"></div>
                        <div className="w-12 h-12 bg-white border rounded-lg"></div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium text-sm mb-2">Brand Voice</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">Tone:</span>
                          <div className="flex space-x-1">
                            <Badge variant="secondary">Professional</Badge>
                            <Badge variant="secondary">Empowering</Badge>
                            <Badge variant="secondary">Innovative</Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">Style:</span>
                          <div className="flex space-x-1">
                            <Badge variant="secondary">Clean</Badge>
                            <Badge variant="secondary">Modern</Badge>
                            <Badge variant="secondary">Elegant</Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium text-sm mb-2">Brand Guidelines</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Logo Usage</span>
                          <Button variant="outline" size="sm">Download</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Typography Guide</span>
                          <Button variant="outline" size="sm">Download</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Brand Book</span>
                          <Button variant="outline" size="sm">Download</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Brand Strategy */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                    <span>Brand Strategy</span>
                  </CardTitle>
                  <CardDescription>
                    Strategic planning for brand growth
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium text-sm mb-2">Brand Positioning</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        "Empowering women entrepreneurs through innovative, sustainable, and accessible business solutions."
                      </p>
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-gray-600">Last updated 2 weeks ago</span>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium text-sm mb-2">Target Audience</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm">Aspiring women entrepreneurs</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm">Small business owners</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-sm">Career professionals transitioning to entrepreneurship</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium text-sm mb-2">Brand Values</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Badge variant="outline">Empowerment</Badge>
                        <Badge variant="outline">Innovation</Badge>
                        <Badge variant="outline">Sustainability</Badge>
                        <Badge variant="outline">Community</Badge>
                        <Badge variant="outline">Excellence</Badge>
                        <Badge variant="outline">Integrity</Badge>
                      </div>
                    </div>

                    <Button className="w-full">
                      <Zap className="mr-2 h-4 w-4" />
                      AI Brand Analysis
                    </Button>
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