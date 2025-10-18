'use client'

import { PublicLayout } from '@/components/layout/public-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Rocket, 
  CheckCircle, 
  Clock, 
  FileText, 
  Users, 
  Target,
  Lightbulb,
  Building,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Download,
  Play
} from 'lucide-react'

const businessSteps = [
  {
    id: 1,
    title: "Business Idea Validation",
    description: "Validate your business idea and ensure market demand",
    status: "completed",
    progress: 100,
    icon: Lightbulb,
    estimatedTime: "2-3 days",
    resources: [
      "Market Research Template",
      "Competitor Analysis Guide",
      "Customer Interview Questions"
    ]
  },
  {
    id: 2,
    title: "Business Plan Creation",
    description: "Create a comprehensive business plan for your venture",
    status: "in-progress",
    progress: 65,
    icon: FileText,
    estimatedTime: "1-2 weeks",
    resources: [
      "Business Plan Template",
      "Financial Projection Calculator",
      "Executive Summary Guide"
    ]
  },
  {
    id: 3,
    title: "Legal Structure & Registration",
    description: "Choose and register your business legal structure",
    status: "pending",
    progress: 0,
    icon: Building,
    estimatedTime: "1-2 weeks",
    resources: [
      "Business Type Comparison",
      "Registration Checklist",
      "Legal Requirements Guide"
    ]
  },
  {
    id: 4,
    title: "Brand Identity Development",
    description: "Create your brand identity and online presence",
    status: "pending",
    progress: 0,
    icon: Target,
    estimatedTime: "1-2 weeks",
    resources: [
      "Brand Strategy Template",
      "Logo Design Guide",
      "Social Media Setup Checklist"
    ]
  },
  {
    id: 5,
    title: "Funding Strategy",
    description: "Develop your funding strategy and secure initial capital",
    status: "pending",
    progress: 0,
    icon: DollarSign,
    estimatedTime: "2-4 weeks",
    resources: [
      "Funding Options Guide",
      "Investor Pitch Template",
      "Grant Application Checklist"
    ]
  },
  {
    id: 6,
    title: "Launch & Growth",
    description: "Launch your business and implement growth strategies",
    status: "pending",
    progress: 0,
    icon: Rocket,
    estimatedTime: "Ongoing",
    resources: [
      "Launch Checklist",
      "Marketing Strategy Template",
      "Growth Hacking Guide"
    ]
  }
]

const templates = [
  {
    title: "One-Page Business Plan",
    description: "Concise business plan template perfect for startups",
    category: "Business Planning",
    downloads: 15420,
    rating: 4.8,
    icon: FileText
  },
  {
    title: "Lean Canvas Template",
    description: "Lean startup methodology canvas for quick validation",
    category: "Business Planning",
    downloads: 12350,
    rating: 4.9,
    icon: Target
  },
  {
    title: "Financial Projection Model",
    description: "Comprehensive financial modeling spreadsheet",
    category: "Financial",
    downloads: 8930,
    rating: 4.7,
    icon: DollarSign
  },
  {
    title: "Social Media Content Calendar",
    description: "Plan your social media content for 3 months",
    category: "Marketing",
    downloads: 6780,
    rating: 4.6,
    icon: TrendingUp
  },
  {
    title: "Investor Pitch Deck",
    description: "Professional pitch deck template for investors",
    category: "Funding",
    downloads: 5420,
    rating: 4.8,
    icon: Users
  },
  {
    title: "Business Registration Checklist",
    description: "Step-by-step checklist for business registration",
    category: "Legal",
    downloads: 4320,
    rating: 4.9,
    icon: Building
  }
]

export default function BusinessLaunch() {
  return (
    <PublicLayout showAuthPrompt={true}>
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Business Launch Toolkit
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Everything you need to turn your business idea into reality
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
              <Rocket className="w-3 h-3 mr-1" />
              6 Steps to Launch
            </Badge>
          </div>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span>Your Launch Progress</span>
            </CardTitle>
            <CardDescription>
              Track your progress through the business launch journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">27.5% Complete</span>
              </div>
              <Progress value={27.5} className="h-3" />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">1</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">1</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-400">4</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Remaining</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="roadmap" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="roadmap">Launch Roadmap</TabsTrigger>
            <TabsTrigger value="templates">Templates & Tools</TabsTrigger>
            <TabsTrigger value="guides">Industry Guides</TabsTrigger>
          </TabsList>

          <TabsContent value="roadmap" className="space-y-6">
            <div className="grid gap-6">
              {businessSteps.map((step, index) => {
                const Icon = step.icon
                const statusColor = {
                  completed: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
                  "in-progress": "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
                  pending: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                }[step.status]

                const statusIcon = {
                  completed: CheckCircle,
                  "in-progress": Clock,
                  pending: Clock
                }[step.status]

                const StatusIcon = statusIcon

                return (
                  <Card key={step.id} className="transition-all hover:shadow-md">
                    <CardHeader>
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${statusColor}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <CardTitle className="text-lg">{step.title}</CardTitle>
                            <Badge variant="outline" className={statusColor}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {step.status.replace('-', ' ')}
                            </Badge>
                          </div>
                          <CardDescription className="mt-1">
                            {step.description}
                          </CardDescription>
                          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{step.estimatedTime}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Target className="h-4 w-4" />
                              <span>Step {step.id} of 6</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Progress</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{step.progress}%</span>
                          </div>
                          <Progress value={step.progress} className="h-2" />
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-2">Available Resources</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {step.resources.map((resource, resourceIndex) => (
                              <Button key={resourceIndex} variant="outline" size="sm" className="justify-start">
                                <FileText className="h-4 w-4 mr-2" />
                                {resource}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {step.status !== "completed" && (
                          <div className="flex space-x-2">
                            <Button size="sm">
                              {step.status === "pending" ? "Start Step" : "Continue"}
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template, index) => {
                const Icon = template.icon
                return (
                  <Card key={index} className="transition-all hover:shadow-md">
                    <CardHeader>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                            <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base">{template.title}</CardTitle>
                          <Badge variant="secondary" className="mt-1">
                            {template.category}
                          </Badge>
                        </div>
                      </div>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-1">
                            <Download className="h-4 w-4" />
                            <span>{template.downloads.toLocaleString()} downloads</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-yellow-500">★</span>
                            <span>{template.rating}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" className="flex-1">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button variant="outline" size="sm">
                            Preview
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="guides" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="h-5 w-5 text-purple-600" />
                    <span>E-commerce & Retail</span>
                  </CardTitle>
                  <CardDescription>
                    Complete guide for launching an online store or retail business
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Duration</span>
                      <span className="text-sm font-medium">4-6 weeks</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Difficulty</span>
                      <Badge variant="secondary">Intermediate</Badge>
                    </div>
                    <Button className="w-full">
                      <Play className="h-4 w-4 mr-2" />
                      Start Guide
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-green-600" />
                    <span>Service-Based Business</span>
                  </CardTitle>
                  <CardDescription>
                    Launch a consulting, coaching, or other service business
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Duration</span>
                      <span className="text-sm font-medium">2-4 weeks</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Difficulty</span>
                      <Badge variant="secondary">Beginner</Badge>
                    </div>
                    <Button className="w-full">
                      <Play className="h-4 w-4 mr-2" />
                      Start Guide
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5 text-orange-600" />
                    <span>Tech Startup</span>
                  </CardTitle>
                  <CardDescription>
                    Build and launch a technology startup or app
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Duration</span>
                      <span className="text-sm font-medium">3-6 months</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Difficulty</span>
                      <Badge variant="secondary">Advanced</Badge>
                    </div>
                    <Button className="w-full">
                      <Play className="h-4 w-4 mr-2" />
                      Start Guide
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span>Food & Beverage</span>
                  </CardTitle>
                  <CardDescription>
                    Start a restaurant, cafe, or food business
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Duration</span>
                      <span className="text-sm font-medium">2-3 months</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Difficulty</span>
                      <Badge variant="secondary">Advanced</Badge>
                    </div>
                    <Button className="w-full">
                      <Play className="h-4 w-4 mr-2" />
                      Start Guide
                    </Button>
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