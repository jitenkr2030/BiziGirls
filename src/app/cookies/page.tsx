'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MainLayout } from '@/components/layout/main-layout'
import { AuthGuard } from '@/components/auth/auth-guard'
import { useAuth } from '@/components/auth/auth-provider'
import { 
  Cookie, 
  Settings, 
  CheckCircle, 
  XCircle,
  Eye,
  Shield,
  BarChart3
} from 'lucide-react'

function CookiesContent() {
  const { user } = useAuth()

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Cookie Policy
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Learn about how we use cookies and similar technologies to enhance your experience on GirlsPreneur.
          </p>
        </div>

        {/* What Are Cookies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Cookie className="h-6 w-6 text-blue-600" />
              <span>What Are Cookies?</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide a better user experience.
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              At GirlsPreneur, we use cookies to remember your preferences, understand how you use our platform, and provide personalized content and features.
            </p>
          </CardContent>
        </Card>

        {/* Types of Cookies We Use */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-purple-600" />
              <span>Types of Cookies We Use</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Essential Cookies</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                These cookies are necessary for the Platform to function and cannot be switched off. They include:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                <li>Session management and authentication</li>
                <li>Security and fraud prevention</li>
                <li>Platform functionality and performance</li>
              </ul>
              <div className="flex items-center mt-2">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm text-green-600">Always required</span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Analytics Cookies</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                These cookies help us understand how visitors interact with our Platform by collecting and reporting information anonymously:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                <li>Pages visited and time spent on each page</li>
                <li>Navigation paths and user behavior</li>
                <li>Device and browser information</li>
                <li>Platform performance metrics</li>
              </ul>
              <div className="flex items-center mt-2">
                <Settings className="h-4 w-4 text-orange-600 mr-2" />
                <span className="text-sm text-orange-600">Optional</span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Functional Cookies</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                These cookies allow the Platform to remember choices you make and provide enhanced, more personalized features:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                <li>Language and region preferences</li>
                <li>Theme and display settings</li>
                <li>Customized content recommendations</li>
                <li>Remembered login information</li>
              </ul>
              <div className="flex items-center mt-2">
                <Settings className="h-4 w-4 text-orange-600 mr-2" />
                <span className="text-sm text-orange-600">Optional</span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Marketing Cookies</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                These cookies are used to track visitors across websites to display relevant advertisements and measure marketing effectiveness:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                <li>Targeted advertising based on your interests</li>
                <li>Social media integration and sharing</li>
                <li>Campaign performance tracking</li>
                <li>Retargeting and remarketing</li>
              </ul>
              <div className="flex items-center mt-2">
                <Settings className="h-4 w-4 text-orange-600 mr-2" />
                <span className="text-sm text-orange-600">Optional</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Cookies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-6 w-6 text-green-600" />
              <span>How We Use Cookies</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Platform Performance</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Monitor and improve Platform speed, reliability, and user experience.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Personalization</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Customize content and features based on your preferences and behavior.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Analytics</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Understand how users interact with our Platform to make data-driven improvements.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Security</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Protect your account and prevent fraudulent activities.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cookie Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-6 w-6 text-purple-600" />
              <span>Managing Your Cookie Preferences</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Browser Settings</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                You can control cookies through your browser settings. Most browsers allow you to:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                <li>View the cookies stored on your device</li>
                <li>Delete existing cookies</li>
                <li>Block cookies from specific websites</li>
                <li>Block third-party cookies</li>
                <li>Enable or disable cookies altogether</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Cookie Consent Banner</h3>
              <p className="text-gray-600 dark:text-gray-300">
                When you first visit GirlsPreneur, you'll see a cookie consent banner that allows you to choose which types of cookies you want to accept. You can change your preferences at any time through your account settings or by clicking the cookie preferences link in the footer.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Impact of Disabling Cookies</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Please note that disabling essential cookies may affect the functionality of the Platform, and some features may not work as intended. Disabling analytics and marketing cookies will not affect core functionality but may result in a less personalized experience.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Third-Party Cookies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <span>Third-Party Cookies</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We work with third-party service providers who may set cookies on your device when you interact with their services on our Platform:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
              <li><strong>Google Analytics:</strong> For website analytics and performance measurement</li>
              <li><strong>Facebook Pixel:</strong> For advertising and retargeting</li>
              <li><strong>LinkedIn Insight Tag:</strong> For professional networking and B2B marketing</li>
              <li><strong>Stripe:</strong> For secure payment processing</li>
              <li><strong>Zoom:</strong> For video conferencing and mentorship sessions</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-300 mt-4">
              These third parties have their own privacy policies and cookie policies, and we encourage you to review them for more information about their cookie practices.
            </p>
          </CardContent>
        </Card>

        {/* Cookie Duration */}
        <Card>
          <CardHeader>
            <CardTitle>Cookie Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-900 dark:text-white font-medium">Session Cookies</span>
                <span className="text-sm text-gray-600 dark:text-gray-300">Deleted when you close your browser</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-900 dark:text-white font-medium">Persistent Cookies</span>
                <span className="text-sm text-gray-600 dark:text-gray-300">Remain until they expire or are deleted</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-900 dark:text-white font-medium">Analytics Cookies</span>
                <span className="text-sm text-gray-600 dark:text-gray-300">Typically 13 months</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-900 dark:text-white font-medium">Marketing Cookies</span>
                <span className="text-sm text-gray-600 dark:text-gray-300">Typically 30 days to 1 year</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card>
          <CardHeader>
            <CardTitle>Your Rights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
              <li>Be informed about the use of cookies on our Platform</li>
              <li>Consent to or reject non-essential cookies</li>
              <li>Withdraw your consent at any time</li>
              <li>Access and manage your cookie preferences</li>
              <li>Request information about cookies stored on your device</li>
            </ul>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              If you have any questions about our Cookie Policy or how we use cookies, please contact us at:
            </p>
            <p className="text-gray-900 dark:text-white">
              Email: privacy@girlspreneur.com<br />
              Phone: +1 (555) 123-4567
            </p>
          </CardContent>
        </Card>

        {/* Effective Date */}
        <Card>
          <CardHeader>
            <CardTitle>Effective Date</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300">
              This Cookie Policy is effective as of December 1, 2024, and was last updated on this date.
            </p>
          </CardContent>
        </Card>

        {/* Cookie Settings CTA */}
        <Card>
          <CardContent className="text-center pt-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Manage Your Cookie Preferences
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              You can update your cookie settings at any time through your account preferences.
            </p>
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Settings className="mr-2 h-4 w-4" />
              Update Cookie Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

export default function CookiesPage() {
  return <CookiesContent />
}