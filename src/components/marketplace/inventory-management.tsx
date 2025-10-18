'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Package, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle,
  RefreshCw,
  Plus,
  Edit,
  Download,
  Upload,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Eye,
  ShoppingCart
} from 'lucide-react'
import Image from 'next/image'

interface InventoryItem {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  category: string
  inventory: number
  isDigital: boolean
  status: string
  viewCount: number
  salesCount: number
  rating: number
  lowStockThreshold: number
  lastRestocked: string
  nextRestockDate?: string
  supplierInfo?: string
  costPerUnit: number
  totalValue: number
}

interface InventoryStats {
  totalProducts: number
  lowStockItems: number
  outOfStockItems: number
  totalInventoryValue: number
  topSelling: InventoryItem[]
  recentlyAdded: InventoryItem[]
}

interface StockAlert {
  id: string
  productId: string
  productName: string
  currentStock: number
  threshold: number
  severity: 'low' | 'critical'
  message: string
}

export function InventoryManagement() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [stats, setStats] = useState<InventoryStats>({
    totalProducts: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    totalInventoryValue: 0,
    topSelling: [],
    recentlyAdded: []
  })
  const [alerts, setAlerts] = useState<StockAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')
  const [showRestockModal, setShowRestockModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [restockQuantity, setRestockQuantity] = useState(0)

  useEffect(() => {
    fetchInventoryData()
  }, [])

  const fetchInventoryData = async () => {
    try {
      setLoading(true)
      
      // Fetch products with inventory info
      const response = await fetch('/api/products?inventory=true')
      if (response.ok) {
        const data = await response.json()
        const inventoryItems = data.products.map((product: any) => ({
          ...product,
          lowStockThreshold: product.lowStockThreshold || 10,
          lastRestocked: product.lastRestocked || new Date().toISOString(),
          costPerUnit: product.costPerUnit || product.price * 0.6,
          totalValue: (product.inventory || 0) * (product.costPerUnit || product.price * 0.6)
        }))
        
        setInventory(inventoryItems)
        calculateStats(inventoryItems)
        generateAlerts(inventoryItems)
      }
    } catch (error) {
      console.error('Error fetching inventory data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (items: InventoryItem[]) => {
    const totalProducts = items.length
    const lowStockItems = items.filter(item => !item.isDigital && item.inventory <= item.lowStockThreshold && item.inventory > 0).length
    const outOfStockItems = items.filter(item => !item.isDigital && item.inventory === 0).length
    const totalInventoryValue = items.reduce((sum, item) => sum + (item.isDigital ? 0 : item.totalValue), 0)
    
    const topSelling = items
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, 5)
    
    const recentlyAdded = items
      .sort((a, b) => new Date(b.lastRestocked).getTime() - new Date(a.lastRestocked).getTime())
      .slice(0, 5)

    setStats({
      totalProducts,
      lowStockItems,
      outOfStockItems,
      totalInventoryValue,
      topSelling,
      recentlyAdded
    })
  }

  const generateAlerts = (items: InventoryItem[]) => {
    const newAlerts: StockAlert[] = []
    
    items.forEach(item => {
      if (item.isDigital) return
      
      if (item.inventory === 0) {
        newAlerts.push({
          id: `out-${item.id}`,
          productId: item.id,
          productName: item.name,
          currentStock: item.inventory,
          threshold: item.lowStockThreshold,
          severity: 'critical',
          message: 'Out of stock'
        })
      } else if (item.inventory <= item.lowStockThreshold) {
        const severity = item.inventory <= item.lowStockThreshold / 2 ? 'critical' : 'low'
        newAlerts.push({
          id: `low-${item.id}`,
          productId: item.id,
          productName: item.name,
          currentStock: item.inventory,
          threshold: item.lowStockThreshold,
          severity,
          message: `Low stock (${item.inventory} remaining)`
        })
      }
    })
    
    setAlerts(newAlerts)
  }

  const handleRestock = async () => {
    if (!selectedItem || restockQuantity <= 0) return

    try {
      const response = await fetch(`/api/products/${selectedItem.id}/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quantity: restockQuantity,
          action: 'restock'
        })
      })

      if (response.ok) {
        setShowRestockModal(false)
        setSelectedItem(null)
        setRestockQuantity(0)
        fetchInventoryData()
      }
    } catch (error) {
      console.error('Error restocking item:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStockStatus = (item: InventoryItem) => {
    if (item.isDigital) return { text: 'Digital', color: 'bg-blue-100 text-blue-800' }
    if (item.inventory === 0) return { text: 'Out of Stock', color: 'bg-red-100 text-red-800' }
    if (item.inventory <= item.lowStockThreshold / 2) return { text: 'Critical', color: 'bg-red-100 text-red-800' }
    if (item.inventory <= item.lowStockThreshold) return { text: 'Low Stock', color: 'bg-orange-100 text-orange-800' }
    return { text: 'In Stock', color: 'bg-green-100 text-green-800' }
  }

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    
    let matchesStockFilter = true
    if (stockFilter === 'low') {
      matchesStockFilter = !item.isDigital && item.inventory <= item.lowStockThreshold && item.inventory > 0
    } else if (stockFilter === 'out') {
      matchesStockFilter = !item.isDigital && item.inventory === 0
    } else if (stockFilter === 'digital') {
      matchesStockFilter = item.isDigital
    } else if (stockFilter === 'physical') {
      matchesStockFilter = !item.isDigital
    }
    
    return matchesSearch && matchesCategory && matchesStockFilter
  })

  const categories = Array.from(new Set(inventory.map(item => item.category)))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold">Inventory Management</h2>
          <p className="text-gray-600 mt-1">Track and manage your product inventory</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchInventoryData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalProducts - stats.outOfStockItems} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.outOfStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Cannot sell
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalInventoryValue)}</div>
            <p className="text-xs text-muted-foreground">
              Total value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Stock Alerts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {alerts.slice(0, 4).map((alert) => (
              <Alert key={alert.id} className={alert.severity === 'critical' ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'}>
                <AlertTriangle className={`h-4 w-4 ${alert.severity === 'critical' ? 'text-red-600' : 'text-orange-600'}`} />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <span>
                      <strong>{alert.productName}</strong> - {alert.message}
                    </span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        const item = inventory.find(i => i.id === alert.productId)
                        if (item) {
                          setSelectedItem(item)
                          setShowRestockModal(true)
                        }
                      }}
                    >
                      Restock
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={stockFilter} onValueChange={setStockFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Stock Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Items</SelectItem>
                    <SelectItem value="physical">Physical Only</SelectItem>
                    <SelectItem value="digital">Digital Only</SelectItem>
                    <SelectItem value="low">Low Stock</SelectItem>
                    <SelectItem value="out">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('all')
                  setStockFilter('all')
                }}>
                  <Filter className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Inventory List */}
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="p-3 text-left font-medium">Product</th>
                    <th className="p-3 text-left font-medium">Category</th>
                    <th className="p-3 text-left font-medium">Stock</th>
                    <th className="p-3 text-left font-medium">Status</th>
                    <th className="p-3 text-left font-medium">Value</th>
                    <th className="p-3 text-left font-medium">Sales</th>
                    <th className="p-3 text-left font-medium">Last Restocked</th>
                    <th className="p-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                      </td>
                    </tr>
                  ) : filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-500">
                        No inventory items found
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map((item) => {
                      const stockStatus = getStockStatus(item)
                      return (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 relative flex-shrink-0">
                                {item.images[0] ? (
                                  <Image
                                    src={item.images[0]}
                                    alt={item.name}
                                    fill
                                    className="object-cover rounded"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                                    <Package className="h-5 w-5 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-medium">{item.name}</div>
                                <div className="text-sm text-gray-500">{formatCurrency(item.price)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline">{item.category}</Badge>
                          </td>
                          <td className="p-3">
                            <div className="text-center">
                              <div className="font-medium">{item.inventory}</div>
                              {!item.isDigital && (
                                <div className="text-xs text-gray-500">
                                  Threshold: {item.lowStockThreshold}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge className={stockStatus.color}>
                              {stockStatus.text}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="text-right">
                              <div className="font-medium">{formatCurrency(item.totalValue)}</div>
                              <div className="text-xs text-gray-500">
                                {formatCurrency(item.costPerUnit)}/unit
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center space-x-2">
                              <ShoppingCart className="h-4 w-4 text-gray-400" />
                              <span>{item.salesCount}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-sm">{formatDate(item.lastRestocked)}</div>
                          </td>
                          <td className="p-3">
                            <div className="flex space-x-1">
                              {!item.isDigital && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedItem(item)
                                    setShowRestockModal(true)
                                  }}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              )}
                              <Button size="sm" variant="outline">
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>Products with highest sales volume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.topSelling.map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium">#{index + 1}</span>
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {item.salesCount} units sold
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recently Restocked</CardTitle>
                <CardDescription>Products that were recently restocked</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.recentlyAdded.map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatDate(item.lastRestocked)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Settings</CardTitle>
              <CardDescription>Configure inventory management preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="defaultThreshold">Default Low Stock Threshold</Label>
                  <Input
                    id="defaultThreshold"
                    type="number"
                    defaultValue="10"
                    placeholder="10"
                  />
                </div>
                <div>
                  <Label htmlFor="alertEmail">Alert Email Frequency</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="autoRestock" defaultChecked />
                <Label htmlFor="autoRestock">Enable automatic restocking suggestions</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="trackCosts" defaultChecked />
                <Label htmlFor="trackCosts">Track inventory costs and values</Label>
              </div>
              <Button>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Restock Modal */}
      {showRestockModal && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Restock Product</h3>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    setShowRestockModal(false)
                    setSelectedItem(null)
                    setRestockQuantity(0)
                  }}
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="font-medium">{selectedItem.name}</p>
                  <p className="text-sm text-gray-600">
                    Current stock: {selectedItem.inventory} units
                  </p>
                  <p className="text-sm text-gray-600">
                    Low stock threshold: {selectedItem.lowStockThreshold} units
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="restockQuantity">Restock Quantity</Label>
                  <Input
                    id="restockQuantity"
                    type="number"
                    value={restockQuantity}
                    onChange={(e) => setRestockQuantity(parseInt(e.target.value) || 0)}
                    min="1"
                    placeholder="Enter quantity to add"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    className="flex-1"
                    onClick={handleRestock}
                    disabled={restockQuantity <= 0}
                  >
                    Restock Item
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setShowRestockModal(false)
                      setSelectedItem(null)
                      setRestockQuantity(0)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}