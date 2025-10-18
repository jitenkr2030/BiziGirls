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
  Gift, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Share2,
  Link,
  Copy,
  QrCode,
  BarChart3,
  Target,
  Star,
  Award,
  Calendar,
  Download,
  Eye,
  Click,
  ShoppingCart,
  Percent,
  CheckCircle,
  Zap,
  Crown,
  Gift as GiftIcon,
  ExternalLink,
  Filter
} from 'lucide-react'

export default function AffiliateProgram() {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Affiliate & Referral Program
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Earn rewards by referring women entrepreneurs to GirlsPreneur platform
            </p>
          </div>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Gift className="mr-2 h-4 w-4" />
            Join Affiliate Program
          </Button>
        </div>

        {/* Program Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$2,847</div>
              <p className="text-xs text-muted-foreground">
                Lifetime earnings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Referrals</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">47</div>
              <p className="text-xs text-muted-foreground">
                Successful referrals
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12.5%</div>
              <p className="text-xs text-muted-foreground">
                Above average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commission Rate</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">25%</div>
              <p className="text-xs text-muted-foreground">
                On all referrals
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Program Overview */}
        <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <Crown className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge className="bg-purple-100 text-purple-800">Premium Program</Badge>
                  <Badge variant="outline">25% Commission</Badge>
                </div>
                <h3 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                  GirlsPreneur Affiliate Program
                </h3>
                <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
                  Join our exclusive affiliate program and earn generous commissions by referring women entrepreneurs to our platform. Get paid for every successful referral and help empower more women in business.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">25% commission on all sales</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">30-day cookie duration</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Monthly payouts</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    Become an Affiliate
                  </Button>
                  <Button variant="outline" size="sm">
                    Learn More
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Affiliate Program Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="marketing">Marketing Tools</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Affiliate Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <span>Your Performance</span>
                  </CardTitle>
                  <CardDescription>
                    Track your affiliate performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Clicks This Month</span>
                      <span className="font-medium">1,234</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Conversions</span>
                      <span className="font-medium">47</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Conversion Rate</span>
                      <span className="font-medium">12.5%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Revenue Generated</span>
                      <span className="font-medium">$11,388</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Your Commission</span>
                      <span className="font-medium text-green-600">$2,847</span>
                    </div>
                  </div>

                  <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Performance Chart</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-yellow-600" />
                    <span>Quick Actions</span>
                  </CardTitle>
                  <CardDescription>
                    Common affiliate tasks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button className="w-full justify-start">
                      <Link className="mr-2 h-4 w-4" />
                      Get Your Referral Link
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <QrCode className="mr-2 h-4 w-4" />
                      Generate QR Code
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="mr-2 h-4 w-4" />
                      Download Marketing Kit
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Share2 className="mr-2 h-4 w-4" />
                      Share on Social Media
                    </Button>
                  </div>

                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <h4 className="font-medium text-sm text-yellow-900 dark:text-yellow-100 mb-1">
                      Pro Tip
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Share your referral link with women entrepreneur groups and communities for better conversion rates.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="referrals" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input placeholder="Search referrals..." />
              </div>
              <Select>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left p-4 font-medium text-sm">Date</th>
                        <th className="text-left p-4 font-medium text-sm">Referral</th>
                        <th className="text-left p-4 font-medium text-sm">Status</th>
                        <th className="text-left p-4 font-medium text-sm">Commission</th>
                        <th className="text-left p-4 font-medium text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4, 5, 6].map((item) => (
                        <tr key={item} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="p-4 text-sm">
                            {item === 1 ? "2024-01-15" : 
                             item === 2 ? "2024-01-14" :
                             item === 3 ? "2024-01-13" :
                             item === 4 ? "2024-01-12" :
                             item === 5 ? "2024-01-11" :
                             "2024-01-10"}
                          </td>
                          <td className="p-4 text-sm">
                            <div>
                              <div className="font-medium">user_{item === 1 ? "abc123" : item === 2 ? "def456" : item === 3 ? "ghi789" : "jkl012"}</div>
                              <div className="text-xs text-gray-500">Sarah Johnson</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant={
                              item === 1 || item === 2 ? "default" : 
                              item === 3 || item === 4 ? "secondary" : "outline"
                            }>
                              {item === 1 || item === 2 ? "Converted" :
                               item === 3 || item === 4 ? "Pending" :
                               "Completed"}
                            </Badge>
                          </td>
                          <td className="p-4 text-sm font-medium text-green-600">
                            {item === 1 ? "$125" :
                             item === 2 ? "$89" :
                             item === 3 ? "$0" :
                             item === 4 ? "$0" :
                             item === 5 ? "$156" :
                             "$203"}
                          </td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Share2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="marketing" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Referral Link Generator */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Link className="h-5 w-5 text-blue-600" />
                    <span>Your Referral Link</span>
                  </CardTitle>
                  <CardDescription>
                    Generate and share your unique referral link
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <code className="text-sm break-all">
                          https://girlspreneur.com/ref/affiliate_12345
                        </code>
                        <Button variant="ghost" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="h-16 flex-col space-y-1">
                        <QrCode className="h-4 w-4" />
                        <span className="text-xs">QR Code</span>
                      </Button>
                      <Button variant="outline" size="sm" className="h-16 flex-col space-y-1">
                        <Share2 className="h-4 w-4" />
                        <span className="text-xs">Share Link</span>
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Customize Your Link</h4>
                      <Input placeholder="Custom slug (optional)" />
                      <Button size="sm" className="w-full">Generate Custom Link</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Marketing Materials */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Download className="h-5 w-5 text-green-600" />
                    <span>Marketing Materials</span>
                  </CardTitle>
                  <CardDescription>
                    Download ready-to-use marketing assets
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-sm">Social Media Kit</h4>
                        <p className="text-xs text-gray-500">Posts, stories, and templates</p>
                      </div>
                      <Button size="sm">Download</Button>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-sm">Email Templates</h4>
                        <p className="text-xs text-gray-500">Pre-written email sequences</p>
                      </div>
                      <Button size="sm">Download</Button>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-sm">Banners & Graphics</h4>
                        <p className="text-xs text-gray-500">Ready-to-use visual assets</p>
                      </div>
                      <Button size="sm">Download</Button>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-sm">Video Content</h4>
                        <p className="text-xs text-gray-500">Promotional videos</p>
                      </div>
                      <Button size="sm">Download</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="earnings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Earnings Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span>Earnings Overview</span>
                  </CardTitle>
                  <CardDescription>
                    Your commission earnings breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">This Month</span>
                        <span className="text-2xl font-bold text-green-600">$487</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-green-600">
                        <TrendingUp className="h-4 w-4" />
                        <span>+23% from last month</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Pending Earnings</span>
                        <span className="font-medium">$156</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Lifetime Earnings</span>
                        <span className="font-medium">$2,847</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Average per Referral</span>
                        <span className="font-medium">$60.57</span>
                      </div>
                    </div>

                    <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Earnings Chart</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payout History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <span>Payout History</span>
                  </CardTitle>
                  <CardDescription>
                    Your payment history and upcoming payouts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-sm">January 2024</h4>
                        <p className="text-xs text-gray-500">Paid on Feb 1, 2024</p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-600">$425</div>
                        <Badge variant="outline">Completed</Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-sm">December 2023</h4>
                        <p className="text-xs text-gray-500">Paid on Jan 1, 2024</p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-600">$389</div>
                        <Badge variant="outline">Completed</Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-sm">February 2024</h4>
                        <p className="text-xs text-gray-500">Expected March 1, 2024</p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-blue-600">$487</div>
                        <Badge variant="outline">Pending</Badge>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download Statements
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="rewards" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Reward Tiers */}
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <Card key={item} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        item === 1 ? "bg-bronze-100" :
                        item === 2 ? "bg-silver-100" :
                        item === 3 ? "bg-yellow-100" :
                        item === 4 ? "bg-purple-100" :
                        item === 5 ? "bg-pink-100" :
                        "bg-gradient-to-r from-purple-100 to-pink-100"
                      }`}>
                        {item === 1 ? <Award className="h-6 w-6 text-yellow-600" /> :
                         item === 2 ? <Award className="h-6 w-6 text-gray-400" /> :
                         item === 3 ? <Crown className="h-6 w-6 text-yellow-500" /> :
                         item === 4 ? <Star className="h-6 w-6 text-purple-600" /> :
                         item === 5 ? <GiftIcon className="h-6 w-6 text-pink-600" /> :
                         <Gift className="h-6 w-6 text-purple-600" />}
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">
                          {item === 1 ? "Bronze Affiliate" :
                           item === 2 ? "Silver Affiliate" :
                           item === 3 ? "Gold Affiliate" :
                           item === 4 ? "Platinum Affiliate" :
                           item === 5 ? "Diamond Affiliate" :
                           "Elite Ambassador"}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {item === 1 ? "10+ referrals" :
                           item === 2 ? "25+ referrals" :
                           item === 3 ? "50+ referrals" :
                           item === 4 ? "100+ referrals" :
                           item === 5 ? "250+ referrals" :
                           "500+ referrals"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="text-sm">
                        <span className="font-medium">Commission:</span>
                        <span className="ml-1">
                          {item === 1 ? "25%" :
                           item === 2 ? "27%" :
                           item === 3 ? "30%" :
                           item === 4 ? "32%" :
                           item === 5 ? "35%" :
                           "40%"}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Bonus:</span>
                        <span className="ml-1">
                          {item === 1 ? "$50" :
                           item === 2 ? "$100" :
                           item === 3 ? "$250" :
                           item === 4 ? "$500" :
                           item === 5 ? "$1,000" :
                           "$2,500"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span>Progress</span>
                        <span>{item === 1 ? "47/10" : item === 2 ? "47/25" : item === 3 ? "47/50" : "47/100"}</span>
                      </div>
                      <Progress value={item === 1 ? 100 : item === 2 ? 100 : item === 3 ? 94 : 47} className="h-2" />
                    </div>

                    <Button 
                      size="sm" 
                      className={`w-full ${
                        item === 1 || item === 2 ? "bg-yellow-600 hover:bg-yellow-700" :
                        item === 3 ? "bg-yellow-500 hover:bg-yellow-600" :
                        "bg-purple-600 hover:bg-purple-700"
                      }`}
                      disabled={item > 3}
                    >
                      {item === 1 || item === 2 ? "Achieved!" : item === 3 ? "Almost There" : "Locked"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}