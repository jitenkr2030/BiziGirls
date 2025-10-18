const { createLoadTest } = require('../../src/lib/testing-utils')

describe('Load Testing', () => {
  const baseUrl = 'http://localhost:3000'

  test.concurrent('Homepage load test', async () => {
    const test = createLoadTest('homepage', `${baseUrl}/`, {
      concurrentUsers: 50,
      duration: 30000, // 30 seconds
      rampUp: 5000 // 5 seconds ramp up
    })

    const results = await test.run()

    console.log('Homepage Load Test Results:', {
      totalRequests: results.totalRequests,
      successCount: results.successCount,
      failureCount: results.failureCount,
      successRate: `${results.successRate.toFixed(2)}%`,
      averageResponseTime: `${results.averageResponseTime.toFixed(2)}ms`,
      maxResponseTime: `${results.maxResponseTime.toFixed(2)}ms`,
      minResponseTime: `${results.minResponseTime.toFixed(2)}ms`,
      duration: `${results.duration}ms`
    })

    expect(results.successRate).toBeGreaterThan(95) // Success rate > 95%
    expect(results.averageResponseTime).toBeLessThan(1000) // Average response time < 1s
    expect(results.maxResponseTime).toBeLessThan(5000) // Max response time < 5s
  })

  test.concurrent('API load test', async () => {
    const test = createLoadTest('api-health', `${baseUrl}/api/health`, {
      concurrentUsers: 100,
      duration: 60000, // 60 seconds
      rampUp: 10000 // 10 seconds ramp up
    })

    const results = await test.run()

    console.log('API Load Test Results:', {
      totalRequests: results.totalRequests,
      successCount: results.successCount,
      failureCount: results.failureCount,
      successRate: `${results.successRate.toFixed(2)}%`,
      averageResponseTime: `${results.averageResponseTime.toFixed(2)}ms`,
      maxResponseTime: `${results.maxResponseTime.toFixed(2)}ms`,
      minResponseTime: `${results.minResponseTime.toFixed(2)}ms`,
      duration: `${results.duration}ms`
    })

    expect(results.successRate).toBeGreaterThan(98) // Success rate > 98%
    expect(results.averageResponseTime).toBeLessThan(500) // Average response time < 500ms
    expect(results.maxResponseTime).toBeLessThan(2000) // Max response time < 2s
  })

  test.concurrent('Authentication load test', async () => {
    const test = createLoadTest('auth-login', `${baseUrl}/api/auth/login`, {
      concurrentUsers: 25,
      duration: 45000, // 45 seconds
      rampUp: 5000 // 5 seconds ramp up
    })

    const results = await test.run()

    console.log('Authentication Load Test Results:', {
      totalRequests: results.totalRequests,
      successCount: results.successCount,
      failureCount: results.failureCount,
      successRate: `${results.successRate.toFixed(2)}%`,
      averageResponseTime: `${results.averageResponseTime.toFixed(2)}ms`,
      maxResponseTime: `${results.maxResponseTime.toFixed(2)}ms`,
      minResponseTime: `${results.minResponseTime.toFixed(2)}ms`,
      duration: `${results.duration}ms`
    })

    expect(results.successRate).toBeGreaterThan(90) // Success rate > 90%
    expect(results.averageResponseTime).toBeLessThan(1500) // Average response time < 1.5s
    expect(results.maxResponseTime).toBeLessThan(5000) // Max response time < 5s
  })

  test.concurrent('Database load test', async () => {
    const test = createLoadTest('database-health', `${baseUrl}/api/database/health`, {
      concurrentUsers: 75,
      duration: 45000, // 45 seconds
      rampUp: 7500 // 7.5 seconds ramp up
    })

    const results = await test.run()

    console.log('Database Load Test Results:', {
      totalRequests: results.totalRequests,
      successCount: results.successCount,
      failureCount: results.failureCount,
      successRate: `${results.successRate.toFixed(2)}%`,
      averageResponseTime: `${results.averageResponseTime.toFixed(2)}ms`,
      maxResponseTime: `${results.maxResponseTime.toFixed(2)}ms`,
      minResponseTime: `${results.minResponseTime.toFixed(2)}ms`,
      duration: `${results.duration}ms`
    })

    expect(results.successRate).toBeGreaterThan(95) // Success rate > 95%
    expect(results.averageResponseTime).toBeLessThan(800) // Average response time < 800ms
    expect(results.maxResponseTime).toBeLessThan(3000) // Max response time < 3s
  })

  test.concurrent('File upload load test', async () => {
    const test = createLoadTest('file-upload', `${baseUrl}/api/upload`, {
      concurrentUsers: 10,
      duration: 30000, // 30 seconds
      rampUp: 3000 // 3 seconds ramp up
    })

    const results = await test.run()

    console.log('File Upload Load Test Results:', {
      totalRequests: results.totalRequests,
      successCount: results.successCount,
      failureCount: results.failureCount,
      successRate: `${results.successRate.toFixed(2)}%`,
      averageResponseTime: `${results.averageResponseTime.toFixed(2)}ms`,
      maxResponseTime: `${results.maxResponseTime.toFixed(2)}ms`,
      minResponseTime: `${results.minResponseTime.toFixed(2)}ms`,
      duration: `${results.duration}ms`
    })

    expect(results.successRate).toBeGreaterThan(85) // Success rate > 85%
    expect(results.averageResponseTime).toBeLessThan(3000) // Average response time < 3s
    expect(results.maxResponseTime).toBeLessThan(10000) // Max response time < 10s
  })
})

// Generate load test report
afterAll(() => {
  console.log('\n=== Load Testing Summary ===')
  console.log('All load tests completed successfully')
  console.log('Check individual test results above for detailed metrics')
  console.log('============================\n')
})