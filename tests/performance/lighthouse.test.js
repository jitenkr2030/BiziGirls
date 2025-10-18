const lighthouse = require('lighthouse')
const chromeLauncher = require('chrome-launcher')
const { writeFileSync } = require('fs')
const { join } = require('path')

describe('Performance Tests', () => {
  let browser
  let port

  beforeAll(async () => {
    // Launch Chrome browser
    browser = await chromeLauncher.launch({
      chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox']
    })
    port = browser.port
  })

  afterAll(async () => {
    if (browser) {
      await browser.kill()
    }
  })

  const runLighthouseTest = async (url, testName) => {
    const options = {
      logLevel: 'info',
      output: 'html',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      port: port
    }

    console.log(`Running Lighthouse test for: ${testName}`)
    const results = await lighthouse(url, options)

    // Save HTML report
    const reportPath = join(__dirname, `../../reports/lighthouse-${testName}-${Date.now()}.html`)
    writeFileSync(reportPath, results.report)

    return {
      performance: results.lhr.categories.performance.score * 100,
      accessibility: results.lhr.categories.accessibility.score * 100,
      bestPractices: results.lhr.categories.bestPractices.score * 100,
      seo: results.lhr.categories.seo.score * 100,
      audits: results.lhr.audits
    }
  }

  test('Homepage performance', async () => {
    const results = await runLighthouseTest('http://localhost:3000', 'homepage')
    
    expect(results.performance).toBeGreaterThan(90) // Performance score > 90
    expect(results.accessibility).toBeGreaterThan(90) // Accessibility score > 90
    expect(results.bestPractices).toBeGreaterThan(90) // Best practices score > 90
    expect(results.seo).toBeGreaterThan(90) // SEO score > 90

    // Check specific performance metrics
    const firstContentfulPaint = results.audits['first-contentful-paint']
    expect(firstContentfulPaint.score).toBeGreaterThan(0.9) // Score > 90%

    const largestContentfulPaint = results.audits['largest-contentful-paint']
    expect(largestContentfulPaint.score).toBeGreaterThan(0.9) // Score > 90%

    const cumulativeLayoutShift = results.audits['cumulative-layout-shift']
    expect(cumulativeLayoutShift.score).toBeGreaterThan(0.9) // Score > 90%

    const timeToInteractive = results.audits['interactive']
    expect(timeToInteractive.score).toBeGreaterThan(0.9) // Score > 90%
  })

  test('Dashboard page performance', async () => {
    const results = await runLighthouseTest('http://localhost:3000/dashboard', 'dashboard')
    
    expect(results.performance).toBeGreaterThan(85) // Performance score > 85
    expect(results.accessibility).toBeGreaterThan(90) // Accessibility score > 90
    expect(results.bestPractices).toBeGreaterThan(90) // Best practices score > 90
    expect(results.seo).toBeGreaterThan(85) // SEO score > 85
  })

  test('Authentication page performance', async () => {
    const results = await runLighthouseTest('http://localhost:3000/auth/login', 'auth-login')
    
    expect(results.performance).toBeGreaterThan(90) // Performance score > 90
    expect(results.accessibility).toBeGreaterThan(95) // Accessibility score > 95
    expect(results.bestPractices).toBeGreaterThan(90) // Best practices score > 90
    expect(results.seo).toBeGreaterThan(80) // SEO score > 80
  })

  test('Course listing page performance', async () => {
    const results = await runLighthouseTest('http://localhost:3000/courses', 'courses')
    
    expect(results.performance).toBeGreaterThan(85) // Performance score > 85
    expect(results.accessibility).toBeGreaterThan(90) // Accessibility score > 90
    expect(results.bestPractices).toBeGreaterThan(90) // Best practices score > 90
    expect(results.seo).toBeGreaterThan(85) // SEO score > 85
  })

  test('Mobile performance', async () => {
    const options = {
      logLevel: 'info',
      output: 'html',
      onlyCategories: ['performance'],
      port: port,
      formFactor: 'mobile',
      throttling: {
        rttMs: 150,
        throughputKbps: 1638.4,
        cpuSlowdownMultiplier: 4,
        requestLatencyMs: 562.5,
        downloadThroughputKbps: 1638.4,
        uploadThroughputKbps: 675
      }
    }

    const results = await lighthouse('http://localhost:3000', options)
    
    const reportPath = join(__dirname, `../../reports/lighthouse-mobile-${Date.now()}.html`)
    writeFileSync(reportPath, results.report)

    const performanceScore = results.lhr.categories.performance.score * 100
    expect(performanceScore).toBeGreaterThan(70) // Mobile performance score > 70

    // Check mobile-specific metrics
    const firstContentfulPaint = results.audits['first-contentful-paint']
    expect(firstContentfulPaint.score).toBeGreaterThan(0.7) // Score > 70%

    const speedIndex = results.audits['speed-index']
    expect(speedIndex.score).toBeGreaterThan(0.7) // Score > 70%
  })
})