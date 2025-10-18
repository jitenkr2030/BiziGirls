'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  FileText, 
  Search, 
  Shield, 
  Scale, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Download,
  BookOpen,
  Users,
  Calendar,
  DollarSign,
  Building,
  Globe,
  HelpCircle,
  FileCheck,
  Gavel,
  Eye,
  Star,
  Plus,
  Filter,
  RefreshCw,
  Check,
  X,
  UserCheck,
  CalendarDays,
  AlertTriangle,
  Info,
  Lightbulb,
  FileSignature,
  ClipboardCheck,
  Briefcase,
  Award,
  Zap
} from 'lucide-react'

interface DocumentTemplate {
  id: string
  name: string
  description: string
  category: string
  type: string
  isPremium: boolean
  downloadCount: number
  viewCount: number
  tags?: string
}

interface ComplianceChecklist {
  id: string
  name: string
  description: string
  category: string
  isIndustrySpecific: boolean
  industry?: string
  jurisdiction?: string
  usageCount: number
  userProgress?: {
    progress: string
    isCompleted: boolean
    completedAt?: string
  }
}

interface LegalConsultation {
  id: string
  consultationType: string
  title: string
  description: string
  urgency: string
  status: string
  preferredDate?: string
  preferredTime?: string
  duration: number
  scheduledAt?: string
  assignedTo?: string
}

export default function LegalCompliance() {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([])
  const [checklists, setChecklists] = useState<ComplianceChecklist[]>([])
  const [consultations, setConsultations] = useState<LegalConsultation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [activeTab, setActiveTab] = useState('templates')

  useEffect(() => {
    fetchLegalData()
  }, [activeTab])

  const fetchLegalData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'templates') {
        const templatesRes = await fetch('/api/legal/templates')
        if (templatesRes.ok) {
          const templatesData = await templatesRes.json()
          setTemplates(templatesData.templates || [])
        }
      } else if (activeTab === 'compliance') {
        const checklistsRes = await fetch('/api/legal/compliance?progress=true')
        if (checklistsRes.ok) {
          const checklistsData = await checklistsRes.json()
          setChecklists(checklistsData.checklists || [])
        }
      } else if (activeTab === 'consultations') {
        const consultationsRes = await fetch('/api/legal/consultations')
        if (consultationsRes.ok) {
          const consultationsData = await consultationsRes.json()
          setConsultations(consultationsData.consultations || [])
        }
      }
    } catch (error) {
      console.error('Error fetching legal data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadTemplate = async (templateId: string) => {
    try {
      await fetch('/api/legal/templates', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ templateId }),
      })
      
      // In a real app, this would trigger an actual download
      alert('Template downloaded successfully!')
    } catch (error) {
      console.error('Error downloading template:', error)
    }
  }

  const handleUpdateChecklistProgress = async (checklistId: string, progress: any[]) => {
    try {
      await fetch('/api/legal/compliance', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          checklistId,
          progress,
        }),
      })
      
      // Refresh checklists
      fetchLegalData()
    } catch (error) {
      console.error('Error updating checklist progress:', error)
    }
  }

  const handleScheduleConsultation = async (consultationData: any) => {
    try {
      const response = await fetch('/api/legal/consultations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(consultationData),
      })

      if (response.ok) {
        // Refresh consultations
        fetchLegalData()
        alert('Consultation scheduled successfully!')
      }
    } catch (error) {
      console.error('Error scheduling consultation:', error)
    }
  }

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = searchTerm === '' || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (template.tags && JSON.parse(template.tags).some((tag: string) => 
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    
    const matchesCategory = selectedCategory === '' || template.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'scheduled': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Legal & Compliance Assistance
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Comprehensive legal guidance and compliance resources for women entrepreneurs
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <HelpCircle className="mr-2 h-4 w-4" />
            Get Legal Help
          </Button>
        </div>

        {/* Compliance Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85%</div>
              <Progress value={85} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                3 items need attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                2 expiring soon
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Legal Consultations</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">
                2 urgent
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alert Section */}
        <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-orange-900 dark:text-orange-100">
                  Action Required: Business License Renewal
                </h4>
                <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                  Your business license expires in 15 days. Please renew to avoid penalties.
                </p>
                <div className="flex space-x-2 mt-3">
                  <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                    Renew Now
                  </Button>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal Resources Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="templates">Document Templates</TabsTrigger>
            <TabsTrigger value="compliance">Compliance Hub</TabsTrigger>
            <TabsTrigger value="consultations">Consultations</TabsTrigger>
            <TabsTrigger value="updates">Regulatory Updates</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search document templates..."
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
                      variant={selectedCategory === 'business-formation' ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setSelectedCategory('business-formation')}
                    >
                      Business Formation
                    </Button>
                    <Button 
                      variant={selectedCategory === 'contracts' ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setSelectedCategory('contracts')}
                    >
                      Contracts
                    </Button>
                    <Button 
                      variant={selectedCategory === 'compliance' ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setSelectedCategory('compliance')}
                    >
                      Compliance
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Document Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-3 mb-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{template.name}</h3>
                        <p className="text-xs text-gray-500">
                          {template.type} • {template.category.replace('-', ' ')}
                        </p>
                      </div>
                      {template.isPremium && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {template.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Download className="h-3 w-3" />
                        <span>{template.downloadCount} downloads</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {template.category.replace('-', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleDownloadTemplate(template.id)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleDownloadTemplate(template.id)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Compliance Checklist */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ClipboardCheck className="h-5 w-5 text-green-600" />
                    <span>Your Compliance Checklists</span>
                  </CardTitle>
                  <CardDescription>
                    Track your business compliance status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {checklists.slice(0, 5).map((checklist) => {
                    const progress = checklist.userProgress ? JSON.parse(checklist.userProgress.progress) : []
                    const completedItems = progress.filter((item: any) => item.completed).length
                    const totalItems = progress.length
                    const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

                    return (
                      <div key={checklist.id} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-sm">{checklist.name}</h4>
                            <p className="text-xs text-gray-500">{checklist.category.replace('-', ' ')}</p>
                          </div>
                          {checklist.userProgress?.isCompleted ? (
                            <Badge variant="secondary" className="text-xs">
                              <Check className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              {completionPercentage}% Complete
                            </Badge>
                          )}
                        </div>
                        <Progress value={completionPercentage} className="h-2" />
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{completedItems}/{totalItems} items completed</span>
                          <span>{checklist.usageCount} uses</span>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              {/* Available Checklists */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <span>Available Checklists</span>
                  </CardTitle>
                  <CardDescription>
                    Browse compliance checklists for your industry
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {checklists.filter(c => !c.userProgress).slice(0, 5).map((checklist) => (
                    <div key={checklist.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-sm">{checklist.name}</h4>
                        <p className="text-xs text-gray-500">{checklist.category.replace('-', ' ')}</p>
                        {checklist.isIndustrySpecific && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {checklist.industry}
                          </Badge>
                        )}
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleUpdateChecklistProgress(checklist.id, [])}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Start
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="consultations" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Legal Consultations</h3>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Consultation
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {consultations.map((consultation) => (
                <Card key={consultation.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{consultation.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {consultation.consultationType.replace('-', ' ')}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge className={getUrgencyColor(consultation.urgency)}>
                            {consultation.urgency}
                          </Badge>
                          <Badge className={getStatusColor(consultation.status)}>
                            {consultation.status.replace('-', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 mb-1">
                          {consultation.duration} minutes
                        </div>
                        {consultation.scheduledAt && (
                          <div className="text-xs text-blue-600">
                            {new Date(consultation.scheduledAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {consultation.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        {consultation.preferredDate && (
                          <div className="flex items-center space-x-1">
                            <CalendarDays className="h-3 w-3" />
                            <span>{new Date(consultation.preferredDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        {consultation.preferredTime && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{consultation.preferredTime}</span>
                          </div>
                        )}
                      </div>
                      {consultation.status === 'pending' && (
                        <Button size="sm" variant="outline">
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {consultations.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <UserCheck className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No consultations scheduled</h3>
                    <p className="text-gray-500 mb-4">
                      Schedule a legal consultation to get professional advice for your business.
                    </p>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule Consultation
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="updates" className="space-y-6">
            <Card>
              <CardContent className="p-12 text-center">
                <Gavel className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Regulatory Updates</h3>
                <p className="text-gray-500 mb-4">
                  Stay informed about the latest regulatory changes that affect your business.
                </p>
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Check for Updates
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}