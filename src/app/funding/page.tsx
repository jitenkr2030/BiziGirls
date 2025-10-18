'use client'

import { useState, useEffect } from 'react'
import { PublicLayout } from '@/components/layout/public-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  DollarSign, 
  Search, 
  TrendingUp, 
  Award, 
  Calendar, 
  Users,
  Building,
  Target,
  CheckCircle,
  Clock,
  BarChart3,
  FileText,
  Star,
  Filter,
  ArrowUpRight,
  ExternalLink,
  Download,
  Upload,
  Plus,
  Edit,
  Trash2,
  Eye
} from 'lucide-react'
import { GrantApplicationForm } from '@/components/funding/grant-application-form'

interface FundingOpportunity {
  id: string
  title: string
  organization: string
  description: string
  amount: number
  type: string
  category: string
  industry?: string
  region?: string
  deadline?: string
  difficulty: string
  eligibility: string[]
  requirements: string[]
  applicationUrl?: string
  contactInfo?: string
  isFeatured: boolean
  viewCount: number
  applicationCount: number
  userApplication?: {
    status: string
    progress: number
  }
}

interface GrantApplication {
  id: string
  opportunityId: string
  status: string
  progress: number
  businessPlan?: string
  pitchDeck?: string
  financialStatements?: string
  supportingDocuments?: string[]
  submittedAt?: string
  reviewedAt?: string
  decisionDate?: string
  feedback?: string
  opportunity: {
    id: string
    title: string
    organization: string
    amount: number
    type: string
    category: string
    deadline?: string
  }
}

interface Investor {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
  bio?: string
  industry?: string
  businessProfile?: {
    businessName: string
    description?: string
    businessWebsite?: string
  }
  investments: Array<{
    id: string
    amount: number
    fundingRequest: {
      id: string
      businessName: string
      industry: string
      status: string
    }
  }>
  _count?: {
    investments: number
  }
}

export default function Funding() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [fundingIndustry, setFundingIndustry] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('')
  const [fundingOpportunities, setFundingOpportunities] = useState<FundingOpportunity[]>([])
  const [myApplications, setMyApplications] = useState<GrantApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [applicationsLoading, setApplicationsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showApplicationDialog, setShowApplicationDialog] = useState(false)
  const [selectedOpportunity, setSelectedOpportunity] = useState<FundingOpportunity | null>(null)
  const [applicationData, setApplicationData] = useState({
    businessPlan: '',
    pitchDeck: '',
    financialStatements: '',
    supportingDocuments: [] as string[]
  })
  
  // Investor matching state
  const [investors, setInvestors] = useState<Investor[]>([])
  const [investorsLoading, setInvestorsLoading] = useState(true)
  const [selectedIndustry, setSelectedIndustry] = useState('')
  const [selectedFundingType, setSelectedFundingType] = useState('')
  const [investorRegion, setInvestorRegion] = useState('')
  const [minInvestment, setMinInvestment] = useState('')
  const [maxInvestment, setMaxInvestment] = useState('')
  const [showFundingRequestDialog, setShowFundingRequestDialog] = useState(false)
  const [fundingRequestData, setFundingRequestData] = useState({
    businessName: '',
    description: '',
    industry: '',
    fundingType: 'equity',
    amount: 0,
    valuation: 0,
    equityOffered: 0,
    useOfFunds: '',
    businessPlan: '',
    pitchDeck: ''
  })
  
  // Investor matches state
  const [investorMatches, setInvestorMatches] = useState<any[]>([])
  const [showMatchesDialog, setShowMatchesDialog] = useState(false)
  
  // My funding requests state
  const [myFundingRequests, setMyFundingRequests] = useState<any[]>([])
  const [fundingRequestsLoading, setFundingRequestsLoading] = useState(true)

  useEffect(() => {
    fetchFundingOpportunities()
    fetchMyApplications()
    fetchInvestors()
    fetchMyFundingRequests()
  }, [currentPage, searchTerm, selectedCategory, selectedType, fundingIndustry, selectedRegion])

  useEffect(() => {
    fetchInvestors()
  }, [selectedIndustry, selectedFundingType, investorRegion, minInvestment, maxInvestment, searchTerm])

  const fetchFundingOpportunities = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        search: searchTerm,
        category: selectedCategory,
        type: selectedType,
        industry: fundingIndustry,
        region: selectedRegion
      })

      const response = await fetch(`/api/funding-opportunities?${params}`)
      if (response.ok) {
        const data = await response.json()
        setFundingOpportunities(data.opportunities)
        setTotalPages(data.pagination.pages)
      }
    } catch (error) {
      console.error('Error fetching funding opportunities:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyApplications = async () => {
    try {
      setApplicationsLoading(true)
      const response = await fetch('/api/grant-applications')
      if (response.ok) {
        const data = await response.json()
        setMyApplications(data.applications)
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setApplicationsLoading(false)
    }
  }

  const fetchInvestors = async () => {
    try {
      setInvestorsLoading(true)
      const params = new URLSearchParams({
        page: '1',
        limit: '12',
        industry: selectedIndustry,
        fundingType: selectedFundingType,
        region: investorRegion,
        minInvestment: minInvestment,
        maxInvestment: maxInvestment,
        search: searchTerm
      })

      const response = await fetch(`/api/investors?${params}`)
      if (response.ok) {
        const data = await response.json()
        setInvestors(data.investors)
      }
    } catch (error) {
      console.error('Error fetching investors:', error)
    } finally {
      setInvestorsLoading(false)
    }
  }

  const fetchMyFundingRequests = async () => {
    try {
      setFundingRequestsLoading(true)
      const response = await fetch('/api/funding-requests')
      if (response.ok) {
        const data = await response.json()
        setMyFundingRequests(data.data)
      }
    } catch (error) {
      console.error('Error fetching funding requests:', error)
    } finally {
      setFundingRequestsLoading(false)
    }
  }

  const startApplication = (opportunity: FundingOpportunity) => {
    setSelectedOpportunity(opportunity)
    setShowApplicationDialog(true)
    setApplicationData({
      businessPlan: '',
      pitchDeck: '',
      financialStatements: '',
      supportingDocuments: []
    })
  }

  const submitApplication = async () => {
    if (!selectedOpportunity) return

    try {
      const response = await fetch('/api/grant-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          opportunityId: selectedOpportunity.id,
          ...applicationData
        })
      })

      if (response.ok) {
        setShowApplicationDialog(false)
        fetchMyApplications()
        fetchFundingOpportunities()
      }
    } catch (error) {
      console.error('Error submitting application:', error)
    }
  }

  const submitFundingRequest = async () => {
    try {
      const response = await fetch('/api/funding-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fundingRequestData)
      })

      if (response.ok) {
        const data = await response.json()
        setShowFundingRequestDialog(false)
        
        // Fetch investor matches for the new funding request
        const matchResponse = await fetch('/api/investors/match', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fundingRequestId: data.data.id,
            preferences: {}
          })
        })

        if (matchResponse.ok) {
          const matchData = await matchResponse.json()
          setInvestorMatches(matchData.matches)
          setShowMatchesDialog(true)
        }
        
        // Refresh funding requests list
        fetchMyFundingRequests()
        
        // Reset form
        setFundingRequestData({
          businessName: '',
          description: '',
          industry: '',
          fundingType: 'equity',
          amount: 0,
          valuation: 0,
          equityOffered: 0,
          useOfFunds: '',
          businessPlan: '',
          pitchDeck: ''
        })
      }
    } catch (error) {
      console.error('Error submitting funding request:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'submitted': return 'bg-blue-100 text-blue-800'
      case 'under-review': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Grant': return 'bg-green-100 text-green-800'
      case 'Loan': return 'bg-blue-100 text-blue-800'
      case 'Equity': return 'bg-purple-100 text-purple-800'
      case 'Competition': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Low': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'High': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const categories = Array.from(new Set(fundingOpportunities.map(o => o.category)))
  const types = Array.from(new Set(fundingOpportunities.map(o => o.type)))
  const industries = Array.from(new Set(fundingOpportunities.map(o => o.industry).filter(Boolean)))
  const regions = Array.from(new Set(fundingOpportunities.map(o => o.region).filter(Boolean)))

  return (
    <PublicLayout showAuthPrompt={true}>
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Funding & Grants
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Discover funding opportunities and connect with investors who support women entrepreneurs
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
              <DollarSign className="w-3 h-3 mr-1" />
              ${fundingOpportunities.reduce((sum, opp) => sum + opp.amount, 0).toLocaleString()} Available
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="opportunities" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="opportunities">Funding Opportunities</TabsTrigger>
            <TabsTrigger value="my-applications">My Applications</TabsTrigger>
            <TabsTrigger value="investors">Investors</TabsTrigger>
            <TabsTrigger value="tools">Funding Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="opportunities" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search funding opportunities..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={() => {
                    setSelectedCategory('')
                    setSelectedType('')
                    setFundingIndustry('')
                    setSelectedRegion('')
                  }}>
                    <Filter className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {types.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={fundingIndustry} onValueChange={setFundingIndustry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Industries</SelectItem>
                      {industries.map(industry => (
                        <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger>
                      <SelectValue placeholder="Region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      {regions.map(region => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Funding Opportunities Grid */}
            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {fundingOpportunities.map((opportunity) => (
                  <Card key={opportunity.id} className="transition-all hover:shadow-lg">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                            {opportunity.isFeatured && (
                              <Star className="h-5 w-5 text-yellow-500 fill-current" />
                            )}
                          </div>
                          <CardDescription>{opportunity.organization}</CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            ${opportunity.amount.toLocaleString()}
                          </div>
                          <Badge variant="outline" className={getTypeColor(opportunity.type)}>
                            {opportunity.type}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {opportunity.description}
                      </p>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Category</span>
                          <div className="font-medium">{opportunity.category}</div>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Deadline</span>
                          <div className="font-medium">
                            {opportunity.deadline ? new Date(opportunity.deadline).toLocaleDateString() : 'Rolling'}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Difficulty</span>
                          <div className="font-medium">
                            <Badge className={getDifficultyColor(opportunity.difficulty)}>
                              {opportunity.difficulty}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Applications</span>
                          <div className="font-medium">{opportunity.applicationCount}</div>
                        </div>
                      </div>

                      {opportunity.userApplication && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Application Progress</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {opportunity.userApplication.progress}%
                            </span>
                          </div>
                          <Progress value={opportunity.userApplication.progress} className="h-2" />
                          <div className="mt-1">
                            <Badge className={getStatusColor(opportunity.userApplication.status)}>
                              {opportunity.userApplication.status}
                            </Badge>
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="text-sm font-medium mb-2">Eligibility</h4>
                        <div className="space-y-1">
                          {opportunity.eligibility.slice(0, 3).map((item, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span>{item}</span>
                            </div>
                          ))}
                          {opportunity.eligibility.length > 3 && (
                            <div className="text-sm text-gray-500">
                              +{opportunity.eligibility.length - 3} more...
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button 
                          className="flex-1" 
                          size="sm"
                          onClick={() => startApplication(opportunity)}
                        >
                          {opportunity.userApplication ? "Continue Application" : "Start Application"}
                        </Button>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-applications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Grant Applications</CardTitle>
                <CardDescription>
                  Track the progress of your funding applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {applicationsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-6 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : myApplications.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No applications yet
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Start applying for funding opportunities to track your progress here.
                    </p>
                    <Button onClick={() => {
                      const opportunitiesTab = document.querySelector('[value="opportunities"]') as HTMLElement
                      opportunitiesTab?.click()
                    }}>
                      Browse Opportunities
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myApplications.map((application) => (
                      <Card key={application.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-medium">{application.opportunity.title}</h3>
                              <p className="text-sm text-gray-500">{application.opportunity.organization}</p>
                            </div>
                            <Badge className={getStatusColor(application.status)}>
                              {application.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <span className="text-sm text-gray-500">Amount</span>
                              <div className="font-medium">${application.opportunity.amount.toLocaleString()}</div>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">Type</span>
                              <div className="font-medium">{application.opportunity.type}</div>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">Progress</span>
                              <div className="font-medium">{application.progress}%</div>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">Submitted</span>
                              <div className="font-medium">
                                {application.submittedAt ? new Date(application.submittedAt).toLocaleDateString() : 'Not submitted'}
                              </div>
                            </div>
                          </div>
                          
                          {application.progress > 0 && (
                            <Progress value={application.progress} className="h-2 mb-4" />
                          )}
                          
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            {application.status === 'draft' && (
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="investors" className="space-y-6">
            {/* Investor Search and Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search investors..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={() => {
                    setSelectedIndustry('')
                    setSelectedFundingType('')
                    setInvestorRegion('')
                    setMinInvestment('')
                    setMaxInvestment('')
                  }}>
                    <Filter className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                  <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Industries</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                      <SelectItem value="Fashion">Fashion</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedFundingType} onValueChange={setSelectedFundingType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Funding Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="equity">Equity</SelectItem>
                      <SelectItem value="debt">Debt</SelectItem>
                      <SelectItem value="grant">Grant</SelectItem>
                      <SelectItem value="loan">Loan</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Input
                    placeholder="Min Investment"
                    type="number"
                    value={minInvestment}
                    onChange={(e) => setMinInvestment(e.target.value)}
                  />
                  
                  <Input
                    placeholder="Max Investment"
                    type="number"
                    value={maxInvestment}
                    onChange={(e) => setMaxInvestment(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Create Funding Request CTA */}
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Looking for Investment?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Create a funding request to get matched with interested investors
                    </p>
                  </div>
                  <Button onClick={() => setShowFundingRequestDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Funding Request
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Investors Grid */}
            {investorsLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {investors.map((investor) => (
                  <Card key={investor.id} className="transition-all hover:shadow-lg">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            {investor.avatar ? (
                              <img src={investor.avatar} alt={investor.firstName} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              <span className="text-gray-600 font-medium">
                                {investor.firstName?.[0]}{investor.lastName?.[0]}
                              </span>
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              {investor.firstName} {investor.lastName}
                            </CardTitle>
                            <CardDescription>
                              {investor.businessProfile?.businessName || 'Investor'}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {investor.bio && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {investor.bio}
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Industry</span>
                          <div className="font-medium">{investor.industry || 'Various'}</div>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Investments</span>
                          <div className="font-medium">{investor._count?.investments || 0}</div>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Total Invested</span>
                          <div className="font-medium">
                            ${investor.investments?.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString() || '0'}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Success Rate</span>
                          <div className="font-medium">
                            {investor.investments?.length > 0 
                              ? `${Math.round((investor.investments.filter(inv => inv.fundingRequest?.status === 'funded').length / investor.investments.length) * 100)}%`
                              : 'N/A'
                            }
                          </div>
                        </div>
                      </div>

                      {investor.businessProfile?.description && (
                        <div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">Focus</span>
                          <p className="text-sm text-gray-900 dark:text-white mt-1">
                            {investor.businessProfile.description}
                          </p>
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Building className="h-4 w-4 mr-2" />
                          View Profile
                        </Button>
                        <Button size="sm" className="flex-1">
                          <ArrowUpRight className="h-4 w-4 mr-2" />
                          Connect
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tools" className="space-y-6">
            {/* My Funding Requests Section */}
            <Card>
              <CardHeader>
                <CardTitle>My Funding Requests</CardTitle>
                <CardDescription>
                  Track your funding requests and investor matches
                </CardDescription>
              </CardHeader>
              <CardContent>
                {fundingRequestsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-6 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : myFundingRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No funding requests yet
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Create your first funding request to get matched with investors.
                    </p>
                    <Button onClick={() => setShowFundingRequestDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Funding Request
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myFundingRequests.map((request) => (
                      <Card key={request.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-medium">{request.businessName}</h3>
                              <p className="text-sm text-gray-500">{request.industry} • {request.fundingType}</p>
                            </div>
                            <Badge className={getStatusColor(request.status)}>
                              {request.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <span className="text-sm text-gray-500">Amount</span>
                              <div className="font-medium">${request.amount.toLocaleString()}</div>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">Type</span>
                              <div className="font-medium">{request.fundingType}</div>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">Investments</span>
                              <div className="font-medium">{request._count?.investments || 0}</div>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">Created</span>
                              <div className="font-medium">
                                {new Date(request.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            <Button size="sm" onClick={() => {
                              // Fetch matches for this request
                              fetch(`/api/investors/match`, {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                  fundingRequestId: request.id,
                                  preferences: {}
                                })
                              })
                              .then(response => response.json())
                              .then(data => {
                                setInvestorMatches(data.matches)
                                setShowMatchesDialog(true)
                              })
                            }}>
                              <Users className="h-4 w-4 mr-2" />
                              View Matches
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Business Plan Template</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Professional business plan template for grant applications
                  </p>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <BarChart3 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Financial Projections</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Tools for creating accurate financial projections
                  </p>
                  <Button variant="outline" size="sm">
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Open Tool
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Target className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Pitch Deck Builder</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Create compelling pitch decks for investors
                  </p>
                  <Button variant="outline" size="sm">
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Start Building
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Application Dialog */}
      <Dialog open={showApplicationDialog} onOpenChange={setShowApplicationDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Apply for {selectedOpportunity?.title}</DialogTitle>
            <DialogDescription>
              Complete your application for this funding opportunity
            </DialogDescription>
          </DialogHeader>
          
          {selectedOpportunity && (
            <GrantApplicationForm
              opportunity={{
                id: selectedOpportunity.id,
                title: selectedOpportunity.title,
                organization: selectedOpportunity.organization,
                requirements: selectedOpportunity.requirements
              }}
              initialData={applicationData}
              onSave={(data) => {
                setApplicationData(data)
              }}
              onSubmit={() => {
                submitApplication()
              }}
              isSubmitting={false}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Funding Request Dialog */}
      <Dialog open={showFundingRequestDialog} onOpenChange={setShowFundingRequestDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Funding Request</DialogTitle>
            <DialogDescription>
              Submit your business to get matched with interested investors
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={fundingRequestData.businessName}
                  onChange={(e) => setFundingRequestData({...fundingRequestData, businessName: e.target.value})}
                  placeholder="Enter your business name"
                />
              </div>
              
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Select value={fundingRequestData.industry} onValueChange={(value) => setFundingRequestData({...fundingRequestData, industry: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Retail">Retail</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                    <SelectItem value="Fashion">Fashion</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Business Description</Label>
              <Textarea
                id="description"
                value={fundingRequestData.description}
                onChange={(e) => setFundingRequestData({...fundingRequestData, description: e.target.value})}
                placeholder="Describe your business, mission, and vision"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="fundingType">Funding Type</Label>
                <Select value={fundingRequestData.fundingType} onValueChange={(value) => setFundingRequestData({...fundingRequestData, fundingType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equity">Equity</SelectItem>
                    <SelectItem value="debt">Debt</SelectItem>
                    <SelectItem value="grant">Grant</SelectItem>
                    <SelectItem value="loan">Loan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="amount">Funding Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={fundingRequestData.amount}
                  onChange={(e) => setFundingRequestData({...fundingRequestData, amount: parseFloat(e.target.value) || 0})}
                  placeholder="100000"
                />
              </div>
              
              <div>
                <Label htmlFor="valuation">Valuation ($)</Label>
                <Input
                  id="valuation"
                  type="number"
                  value={fundingRequestData.valuation}
                  onChange={(e) => setFundingRequestData({...fundingRequestData, valuation: parseFloat(e.target.value) || 0})}
                  placeholder="1000000"
                />
              </div>
            </div>

            {fundingRequestData.fundingType === 'equity' && (
              <div>
                <Label htmlFor="equityOffered">Equity Offered (%)</Label>
                <Input
                  id="equityOffered"
                  type="number"
                  value={fundingRequestData.equityOffered}
                  onChange={(e) => setFundingRequestData({...fundingRequestData, equityOffered: parseFloat(e.target.value) || 0})}
                  placeholder="10"
                  max={100}
                  min={0}
                />
              </div>
            )}

            <div>
              <Label htmlFor="useOfFunds">Use of Funds</Label>
              <Textarea
                id="useOfFunds"
                value={fundingRequestData.useOfFunds}
                onChange={(e) => setFundingRequestData({...fundingRequestData, useOfFunds: e.target.value})}
                placeholder="How will you use the funding? (e.g., product development, marketing, hiring)"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="businessPlan">Business Plan URL</Label>
                <Input
                  id="businessPlan"
                  value={fundingRequestData.businessPlan}
                  onChange={(e) => setFundingRequestData({...fundingRequestData, businessPlan: e.target.value})}
                  placeholder="https://example.com/business-plan.pdf"
                />
              </div>
              
              <div>
                <Label htmlFor="pitchDeck">Pitch Deck URL</Label>
                <Input
                  id="pitchDeck"
                  value={fundingRequestData.pitchDeck}
                  onChange={(e) => setFundingRequestData({...fundingRequestData, pitchDeck: e.target.value})}
                  placeholder="https://example.com/pitch-deck.pdf"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowFundingRequestDialog(false)}>
                Cancel
              </Button>
              <Button onClick={submitFundingRequest}>
                Submit Funding Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Investor Matches Dialog */}
      <Dialog open={showMatchesDialog} onOpenChange={setShowMatchesDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Investor Matches</DialogTitle>
            <DialogDescription>
              Here are the top investors matched to your funding request
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {investorMatches.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No matches found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your funding criteria or check back later for new investors.
                </p>
              </div>
            ) : (
              investorMatches.map((match, index) => (
                <Card key={match.investor.id} className="transition-all hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          {match.investor.avatar ? (
                            <img src={match.investor.avatar} alt={match.investor.firstName} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-gray-600 font-medium">
                              {match.investor.firstName?.[0]}{match.investor.lastName?.[0]}
                            </span>
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <span>{match.investor.firstName} {match.investor.lastName}</span>
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              {match.score}% Match
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            {match.investor.businessProfile?.businessName || 'Investor'}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Match Score</div>
                        <div className="text-2xl font-bold text-green-600">{match.score}%</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {match.reasons.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Match Reasons</h4>
                        <div className="flex flex-wrap gap-2">
                          {match.reasons.map((reason: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {reason}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Industry</span>
                        <div className="font-medium">{match.investor.industry || 'Various'}</div>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Investments</span>
                        <div className="font-medium">{match.investmentCount}</div>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Total Invested</span>
                        <div className="font-medium">${match.totalInvested.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Success Rate</span>
                        <div className="font-medium">{Math.round(match.successRate * 100)}%</div>
                      </div>
                    </div>

                    {match.investor.bio && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {match.investor.bio}
                      </p>
                    )}

                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Building className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                      <Button size="sm" className="flex-1">
                        <ArrowUpRight className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </PublicLayout>
  )
}