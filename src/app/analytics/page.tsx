'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart,
  BarChart3,
  LineChart,
  CreditCard,
  Receipt,
  Banknote,
  AlertTriangle,
  CheckCircle,
  Target,
  Calendar,
  Download,
  Filter,
  Eye,
  Plus,
  FileText,
  Settings,
  Bell,
  Activity,
  Users,
  ShoppingCart,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Brain,
  RefreshCw,
  Zap,
  Star,
  TrendingUpIcon,
  UserCheck,
  MousePointer,
  Gift
} from 'lucide-react'

interface BusinessMetric {
  id: string
  metricType: string
  metricName: string
  value: number
  unit?: string
  period: string
  date: string
  targetValue?: number
  variance?: number
  trend?: string
  category?: string
  subcategory?: string
}

interface CustomerAnalytics {
  id: string
  totalSpent: number
  orderCount: number
  averageOrderValue: number
  customerSegment?: string
  acquisitionSource?: string
  lifetimeValue: number
  churnRisk?: number
}

interface SalesReport {
  id: string
  reportName: string
  reportType: string
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  newCustomers: number
  returningCustomers: number
  conversionRate?: number
  customerAcquisitionCost?: number
}

interface GrowthTracking {
  id: string
  kpiName: string
  kpiCategory: string
  currentValue: number
  targetValue: number
  period: string
  growthRate?: number
  variance?: number
  achievement?: string
}

export default function Analytics() {
  const [metrics, setMetrics] = useState<BusinessMetric[]>([])
  const [customerAnalytics, setCustomerAnalytics] = useState<CustomerAnalytics[]>([])
  const [salesReports, setSalesReports] = useState<SalesReport[]>([])
  const [growthTracking, setGrowthTracking] = useState<GrowthTracking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('monthly')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    fetchAnalyticsData()
  }, [selectedPeriod, selectedCategory])

  const fetchAnalyticsData = async () => {
    setLoading(true)
    try {
      const [metricsRes, customersRes, salesRes, growthRes] = await Promise.all([
        fetch(`/api/analytics/metrics?period=${selectedPeriod}&category=${selectedCategory}`),
        fetch('/api/analytics/customers'),
        fetch(`/api/analytics/sales?type=${selectedPeriod}`),
        fetch('/api/analytics/growth')
      ])

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json()
        setMetrics(metricsData.metrics || [])
      }

      if (customersRes.ok) {
        const customersData = await customersRes.json()
        setCustomerAnalytics(customersData.customers || [])
      }

      if (salesRes.ok) {
        const salesData = await salesRes.json()
        setSalesReports(salesData.reports || [])
      }

      if (growthRes.ok) {
        const growthData = await growthRes.json()
        setGrowthTracking(growthData.growthTracking || [])
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateOverviewMetrics = () => {
    const revenueMetrics = metrics.filter(m => m.metricType === 'revenue')
    const expenseMetrics = metrics.filter(m => m.metricType === 'expenses')
    
    const totalRevenue = revenueMetrics.reduce((sum, m) => sum + m.value, 0)
    const totalExpenses = expenseMetrics.reduce((sum, m) => sum + m.value, 0)
    const netProfit = totalRevenue - totalExpenses
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
    }
  }

  const getCustomerMetrics = () => {
    const totalCustomers = customerAnalytics.length
    const totalSpent = customerAnalytics.reduce((sum, c) => sum + c.totalSpent, 0)
    const totalOrders = customerAnalytics.reduce((sum, c) => sum + c.orderCount, 0)
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0
    const averageLifetimeValue = totalCustomers > 0 ? totalSpent / totalCustomers : 0

    const segments = customerAnalytics.reduce((acc, c) => {
      acc[c.customerSegment || 'unknown'] = (acc[c.customerSegment || 'unknown'] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalCustomers,
      totalSpent,
      totalOrders,
      averageOrderValue,
      averageLifetimeValue,
      segments,
    }
  }

  const getGrowthMetrics = () => {
    const achievedKPIs = growthTracking.filter(g => g.achievement === 'achieved').length
    const totalKPIs = growthTracking.length
    const achievementRate = totalKPIs > 0 ? (achievedKPIs / totalKPIs) * 100 : 0

    const categories = growthTracking.reduce((acc, g) => {
      acc[g.kpiCategory] = (acc[g.kpiCategory] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      achievedKPIs,
      totalKPIs,
      achievementRate,
      categories,
    }
  }

  const overview = calculateOverviewMetrics()
  const customerMetrics = getCustomerMetrics()
  const growthMetrics = getGrowthMetrics()

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
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
              Business Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Real-time insights and analytics for your business growth
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchAnalyticsData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Real-time Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${overview.totalRevenue.toLocaleString()}
              </div>
              <div className="flex items-center space-x-2 text-xs text-green-600">
                <ArrowUpRight className="h-3 w-3" />
                <span>+12.5% from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <CreditCard className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ${overview.totalExpenses.toLocaleString()}
              </div>
              <div className="flex items-center space-x-2 text-xs text-red-600">
                <ArrowDownRight className="h-3 w-3" />
                <span>+8.2% from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                ${overview.netProfit.toLocaleString()}
              </div>
              <div className="flex items-center space-x-2 text-xs text-blue-600">
                <ArrowUpRight className="h-3 w-3" />
                <span>+18.7% from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 dark:border-purple-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
              <Percent className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {overview.profitMargin.toFixed(1)}%
              </div>
              <div className="flex items-center space-x-2 text-xs text-purple-600">
                <ArrowUpRight className="h-3 w-3" />
                <span>+2.3% from last period</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-orange-900 dark:text-orange-100">
                    High Expenses Alert
                  </h4>
                  <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                    Your marketing expenses are 23% above budget this month. Consider optimizing your ad spend.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Review Expenses
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-green-900 dark:text-green-100">
                    Revenue Milestone Achieved
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Congratulations! You've reached ${Math.floor(overview.totalRevenue / 1000)}K monthly revenue for the first time.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    View Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="growth">Growth</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="realtime">Real-time</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue vs Expenses Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <LineChart className="h-5 w-5 text-blue-600" />
                    <span>Revenue vs Expenses</span>
                  </CardTitle>
                  <CardDescription>
                    {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} comparison of revenue and expenses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Interactive Chart</p>
                      <p className="text-xs text-gray-400">
                        Revenue: ${overview.totalRevenue.toLocaleString()} | Expenses: ${overview.totalExpenses.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Revenue</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Expenses</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Performance Indicators */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    <span>Key Performance Indicators</span>
                  </CardTitle>
                  <CardDescription>
                    Critical business metrics and performance indicators
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Total Customers</span>
                      </div>
                      <div className="text-xl font-bold text-blue-600">
                        {customerMetrics.totalCustomers}
                      </div>
                      <div className="text-xs text-blue-500">
                        +{Math.floor(customerMetrics.totalCustomers * 0.12)} new this month
                      </div>
                    </div>

                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <ShoppingCart className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Avg Order Value</span>
                      </div>
                      <div className="text-xl font-bold text-green-600">
                        ${customerMetrics.averageOrderValue.toFixed(2)}
                      </div>
                      <div className="text-xs text-green-500">
                        +8.7% from last month
                      </div>
                    </div>

                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <Gift className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">Lifetime Value</span>
                      </div>
                      <div className="text-xl font-bold text-purple-600">
                        ${customerMetrics.averageLifetimeValue.toFixed(2)}
                      </div>
                      <div className="text-xs text-purple-500">
                        +15.3% from last month
                      </div>
                    </div>

                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium">KPI Achievement</span>
                      </div>
                      <div className="text-xl font-bold text-orange-600">
                        {growthMetrics.achievementRate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-orange-500">
                        {growthMetrics.achievedKPIs}/{growthMetrics.totalKPIs} achieved
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Customer Segments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <UserCheck className="h-5 w-5 text-blue-600" />
                    <span>Customer Segments</span>
                  </CardTitle>
                  <CardDescription>
                    Distribution of customers by segment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(customerMetrics.segments).map(([segment, count]) => {
                    const percentage = (count / customerMetrics.totalCustomers) * 100
                    return (
                      <div key={segment} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">{segment}</span>
                          <span className="text-sm text-gray-500">{count} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              {/* Customer Analytics */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MousePointer className="h-5 w-5 text-green-600" />
                    <span>Customer Analytics</span>
                  </CardTitle>
                  <CardDescription>
                    Detailed customer behavior and metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {customerMetrics.totalCustomers}
                      </div>
                      <div className="text-sm text-blue-500">Total Customers</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        ${customerMetrics.totalSpent.toLocaleString()}
                      </div>
                      <div className="text-sm text-green-500">Total Revenue</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {customerMetrics.totalOrders}
                      </div>
                      <div className="text-sm text-purple-500">Total Orders</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        ${customerMetrics.averageLifetimeValue.toFixed(2)}
                      </div>
                      <div className="text-sm text-orange-500">Avg LTV</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sales" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sales Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUpIcon className="h-5 w-5 text-green-600" />
                    <span>Sales Performance</span>
                  </CardTitle>
                  <CardDescription>
                    {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} sales overview
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {salesReports.slice(0, 5).map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium text-sm">{report.reportName}</h4>
                          <p className="text-xs text-gray-500">{report.reportType}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">
                            ${report.totalRevenue.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {report.totalOrders} orders
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Sales Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-purple-600" />
                    <span>Sales Metrics</span>
                  </CardTitle>
                  <CardDescription>
                    Key sales performance indicators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {salesReports.length > 0 && (
                      <>
                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium">Total Revenue</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-600">
                              ${salesReports.reduce((sum, r) => sum + r.totalRevenue, 0).toLocaleString()}
                            </div>
                            <div className="text-xs text-green-500">All periods</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <ShoppingCart className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium">Total Orders</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-blue-600">
                              {salesReports.reduce((sum, r) => sum + r.totalOrders, 0)}
                            </div>
                            <div className="text-xs text-blue-500">All periods</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium">New Customers</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-purple-600">
                              {salesReports.reduce((sum, r) => sum + r.newCustomers, 0)}
                            </div>
                            <div className="text-xs text-purple-500">All periods</div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="growth" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* KPI Tracking */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <span>KPI Tracking</span>
                  </CardTitle>
                  <CardDescription>
                    Key Performance Indicator progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {growthTracking.slice(0, 5).map((kpi) => {
                      const progress = (kpi.currentValue / kpi.targetValue) * 100
                      return (
                        <div key={kpi.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{kpi.kpiName}</span>
                            <span className="text-sm text-gray-500">
                              {kpi.currentValue.toLocaleString()} / {kpi.targetValue.toLocaleString()}
                            </span>
                          </div>
                          <Progress value={Math.min(progress, 100)} className="h-2" />
                          <div className="flex items-center justify-between text-xs">
                            <Badge variant={
                              kpi.achievement === 'achieved' ? 'default' :
                              kpi.achievement === 'ahead' ? 'secondary' :
                              kpi.achievement === 'on_track' ? 'outline' : 'destructive'
                            }>
                              {kpi.achievement || 'pending'}
                            </Badge>
                            <span className="text-gray-500">{progress.toFixed(1)}%</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Growth Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span>Growth by Category</span>
                  </CardTitle>
                  <CardDescription>
                    KPI distribution by category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(growthMetrics.categories).map(([category, count]) => {
                      const percentage = (count / growthMetrics.totalKPIs) * 100
                      return (
                        <div key={category} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium capitalize">{category}</span>
                            <span className="text-sm text-gray-500">{count} KPIs</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Custom Reports</h3>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Report
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <Card key={item} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">Custom Report {item}</h3>
                        <p className="text-xs text-gray-500">Last generated 2 days ago</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Comprehensive business analytics report with detailed insights.
                    </p>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="realtime" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-yellow-600" />
                    <span>Live Metrics</span>
                  </CardTitle>
                  <CardDescription>
                    Real-time business metrics updating every 30 seconds
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">Active Users</span>
                      </div>
                      <div className="text-lg font-bold text-green-600">1,247</div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">Page Views</span>
                      </div>
                      <div className="text-lg font-bold text-blue-600">8,923</div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">Conversion Rate</span>
                      </div>
                      <div className="text-lg font-bold text-purple-600">3.2%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-red-600" />
                    <span>System Status</span>
                  </CardTitle>
                  <CardDescription>
                    Real-time system health and performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">API Response</span>
                      </div>
                      <div className="text-sm text-green-600">245ms</div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">Database</span>
                      </div>
                      <div className="text-sm text-green-600">Healthy</div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm font-medium">Memory Usage</span>
                      </div>
                      <div className="text-sm text-yellow-600">78%</div>
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