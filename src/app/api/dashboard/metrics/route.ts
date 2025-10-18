import { NextRequest, NextResponse } from 'next/server'
import { monitoringService } from '@/lib/monitoring'
import { healthCheckService } from '@/lib/health-check'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const timeRange = searchParams.get('timeRange') || '1h'
        const metric = searchParams.get('metric')

        if (metric) {
            // Get specific metric
            const metricData = monitoringService.getMetricsSummary(metric)
            return NextResponse.json({ metric, data: metricData })
        }

        // Get comprehensive dashboard data
        const [
            systemHealth,
            performanceMetrics,
            resourceMetrics,
            alerts,
            services
        ] = await Promise.all([
            healthCheckService.getSystemHealth(),
            getPerformanceMetrics(timeRange),
            getResourceMetrics(timeRange),
            getRecentAlerts(),
            getServiceStatus()
        ])

        const dashboardData = {
            timestamp: new Date(),
            systemHealth,
            metrics: {
                responseTime: calculateAverageMetric('http.requests', 'duration'),
                requestsPerMinute: calculateRequestsPerMinute(),
                errorRate: calculateErrorRate(),
                memoryUsage: calculateMemoryUsage(),
                cpuUsage: calculateCpuUsage(),
                dbConnections: calculateDbConnections(),
                activeUsers: calculateActiveUsers(),
                uptime: calculateUptime()
            },
            charts: {
                performance: performanceMetrics,
                resources: resourceMetrics
            },
            alerts,
            services,
            summary: generateDashboardSummary()
        }

        return NextResponse.json(dashboardData)
    } catch (error) {
        logger.error('Dashboard metrics API error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch dashboard metrics' },
            { status: 500 }
        )
    }
}

async function getPerformanceMetrics(timeRange: string) {
    const now = new Date()
    const points = getTimeRangePoints(timeRange)
    const interval = getTimeRangeInterval(timeRange)
    
    const labels = []
    const responseTimes = []
    const requestCounts = []
    const errorRates = []

    for (let i = points - 1; i >= 0; i--) {
        const time = new Date(now.getTime() - (i * interval))
        labels.push(formatTimeLabel(time, timeRange))
        
        // Get metrics for this time period
        const responseTime = getMetricForTimeRange('http.requests', 'duration', time, interval)
        const requestCount = getMetricForTimeRange('http.requests', 'count', time, interval)
        const errorCount = getMetricForTimeRange('http.errors', 'count', time, interval)
        
        responseTimes.push(responseTime || 0)
        requestCounts.push(requestCount || 0)
        errorRates.push(requestCount > 0 ? ((errorCount || 0) / requestCount * 100) : 0)
    }

    return {
        labels,
        datasets: [
            {
                label: 'Response Time (ms)',
                data: responseTimes,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            },
            {
                label: 'Requests/min',
                data: requestCounts,
                borderColor: '#4ade80',
                backgroundColor: 'rgba(74, 222, 128, 0.1)',
                tension: 0.4,
                fill: true,
                yAxisID: 'y1'
            },
            {
                label: 'Error Rate (%)',
                data: errorRates,
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4,
                fill: true,
                yAxisID: 'y2'
            }
        ]
    }
}

async function getResourceMetrics(timeRange: string) {
    const now = new Date()
    const points = getTimeRangePoints(timeRange)
    const interval = getTimeRangeInterval(timeRange)
    
    const labels = []
    const cpuData = []
    const memoryData = []
    const diskData = []
    const networkData = []

    for (let i = points - 1; i >= 0; i--) {
        const time = new Date(now.getTime() - (i * interval))
        labels.push(formatTimeLabel(time, timeRange))
        
        cpuData.push(getMetricForTimeRange('system.cpu', 'usage', time, interval) || 0)
        memoryData.push(getMetricForTimeRange('system.memory', 'usage', time, interval) || 0)
        diskData.push(getMetricForTimeRange('system.disk', 'usage', time, interval) || 0)
        networkData.push(getMetricForTimeRange('system.network', 'throughput', time, interval) || 0)
    }

    return {
        labels,
        datasets: [
            {
                label: 'CPU Usage (%)',
                data: cpuData,
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                tension: 0.4,
                fill: true
            },
            {
                label: 'Memory Usage (%)',
                data: memoryData,
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                tension: 0.4,
                fill: true
            },
            {
                label: 'Disk Usage (%)',
                data: diskData,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true
            },
            {
                label: 'Network (MB/s)',
                data: networkData,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            }
        ]
    }
}

async function getRecentAlerts() {
    // Mock alerts data - in real implementation, this would come from alert system
    return [
        {
            id: '1',
            severity: 'warning',
            title: 'High Memory Usage Detected',
            description: 'Memory usage exceeded 80% threshold on web server',
            timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
            source: 'system',
            resolved: false
        },
        {
            id: '2',
            severity: 'critical',
            title: 'Payment Gateway Timeout',
            description: 'Stripe API response time exceeded 5 seconds',
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            source: 'payment',
            resolved: false
        },
        {
            id: '3',
            severity: 'info',
            title: 'Database Backup Completed',
            description: 'Scheduled database backup completed successfully',
            timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            source: 'database',
            resolved: true
        }
    ]
}

async function getServiceStatus() {
    // Get service health status
    const services = [
        { name: 'Web Application', icon: '🌐', status: 'healthy' },
        { name: 'Database', icon: '🗄️', status: 'healthy' },
        { name: 'Redis Cache', icon: '⚡', status: 'healthy' },
        { name: 'Email Service', icon: '📧', status: 'healthy' },
        { name: 'Payment Gateway', icon: '💳', status: 'warning' },
        { name: 'Analytics', icon: '📊', status: 'healthy' }
    ]

    // Check actual service health
    for (const service of services) {
        try {
            const healthCheck = await healthCheckService.runCheck(service.name.toLowerCase().replace(' ', '_'))
            service.status = healthCheck.status
            service.responseTime = healthCheck.responseTime
            service.lastCheck = healthCheck.timestamp
        } catch (error) {
            service.status = 'unhealthy'
            service.error = error.message
        }
    }

    return services
}

function calculateAverageMetric(metricName: string, field: string): number {
    const summary = monitoringService.getMetricsSummary(metricName)
    if (!summary) return 0
    
    if (field === 'duration') {
        return Math.round(summary.average)
    }
    
    return 0
}

function calculateRequestsPerMinute(): number {
    const summary = monitoringService.getMetricsSummary('http.requests')
    if (!summary) return 0
    
    // Calculate requests per minute based on recent data
    return Math.round(summary.count / 60) // Simplified calculation
}

function calculateErrorRate(): number {
    const requestsSummary = monitoringService.getMetricsSummary('http.requests')
    const errorsSummary = monitoringService.getMetricsSummary('http.errors')
    
    if (!requestsSummary || !errorsSummary) return 0
    
    const errorRate = (errorsSummary.count / requestsSummary.count) * 100
    return Math.round(errorRate * 10) / 10 // Round to 1 decimal place
}

function calculateMemoryUsage(): number {
    const summary = monitoringService.getMetricsSummary('system.memory')
    if (!summary) return 0
    
    return Math.round(summary.average)
}

function calculateCpuUsage(): number {
    const summary = monitoringService.getMetricsSummary('system.cpu')
    if (!summary) return 0
    
    return Math.round(summary.average)
}

function calculateDbConnections(): number {
    // This would typically come from database monitoring
    return Math.floor(Math.random() * 20) + 15 // Mock data
}

function calculateActiveUsers(): number {
    const summary = monitoringService.getMetricsSummary('user.activity')
    if (!summary) return 0
    
    return summary.count
}

function calculateUptime(): string {
    const startTime = new Date(process.env.START_TIME || Date.now())
    const now = new Date()
    const uptime = now.getTime() - startTime.getTime()
    
    const days = Math.floor(uptime / (1000 * 60 * 60 * 24))
    const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`
    } else if (hours > 0) {
        return `${hours}h ${minutes}m`
    } else {
        return `${minutes}m`
    }
}

function generateDashboardSummary() {
    const metrics = {
        responseTime: calculateAverageMetric('http.requests', 'duration'),
        errorRate: calculateErrorRate(),
        memoryUsage: calculateMemoryUsage(),
        cpuUsage: calculateCpuUsage()
    }

    let status = 'healthy'
    let issues = []

    if (metrics.errorRate > 1) {
        status = 'critical'
        issues.push('High error rate detected')
    } else if (metrics.errorRate > 0.5) {
        status = 'warning'
        issues.push('Elevated error rate')
    }

    if (metrics.memoryUsage > 85) {
        status = 'critical'
        issues.push('High memory usage')
    } else if (metrics.memoryUsage > 70) {
        if (status !== 'critical') status = 'warning'
        issues.push('Elevated memory usage')
    }

    if (metrics.cpuUsage > 80) {
        status = 'critical'
        issues.push('High CPU usage')
    } else if (metrics.cpuUsage > 60) {
        if (status !== 'critical') status = 'warning'
        issues.push('Elevated CPU usage')
    }

    if (metrics.responseTime > 1000) {
        if (status !== 'critical') status = 'warning'
        issues.push('Slow response times')
    }

    return {
        status,
        issues,
        recommendations: generateRecommendations(metrics, issues)
    }
}

function generateRecommendations(metrics: any, issues: string[]): string[] {
    const recommendations = []

    if (metrics.errorRate > 0.5) {
        recommendations.push('Review error logs and investigate root causes')
        recommendations.push('Consider implementing circuit breakers for external services')
    }

    if (metrics.memoryUsage > 70) {
        recommendations.push('Monitor memory usage and consider scaling')
        recommendations.push('Review application for memory leaks')
    }

    if (metrics.cpuUsage > 60) {
        recommendations.push('Optimize database queries and application code')
        recommendations.push('Consider scaling up server resources')
    }

    if (metrics.responseTime > 500) {
        recommendations.push('Implement caching for frequently accessed data')
        recommendations.push('Optimize database queries and add indexes')
    }

    if (recommendations.length === 0) {
        recommendations.push('System is performing well')
        recommendations.push('Continue monitoring for any changes')
    }

    return recommendations
}

function getTimeRangePoints(timeRange: string): number {
    switch (timeRange) {
        case '1h': return 60
        case '6h': return 36
        case '24h': return 24
        case '7d': return 7
        default: return 60
    }
}

function getTimeRangeInterval(timeRange: string): number {
    switch (timeRange) {
        case '1h': return 60000 // 1 minute
        case '6h': return 600000 // 10 minutes
        case '24h': return 3600000 // 1 hour
        case '7d': return 86400000 // 1 day
        default: return 60000
    }
}

function formatTimeLabel(date: Date, timeRange: string): string {
    switch (timeRange) {
        case '1h':
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        case '6h':
        case '24h':
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        case '7d':
            return date.toLocaleDateString()
        default:
            return date.toLocaleTimeString()
    }
}

function getMetricForTimeRange(metricName: string, field: string, time: Date, interval: number): number | null {
    // This would typically query the actual metrics storage
    // For now, return mock data
    const baseValue = metricName === 'http.requests' ? 1000 : 
                     metricName === 'system.cpu' ? 50 :
                     metricName === 'system.memory' ? 60 : 0
    
    const variation = Math.random() * 20 - 10 // ±10 variation
    return Math.max(0, baseValue + variation)
}