'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PublicLayout } from '@/components/layout/public-layout'
import { BookOpen, Users, Trophy, Newspaper, FileText, Scale } from 'lucide-react'

function ResourcesContent() {
  return (
    <PublicLayout>
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Resources & Information
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Find all the information you need about GirlsPreneur, from success stories to legal policies.
          </p>
        </div>

        {/* Success Stories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-6 w-6 mr-2 text-yellow-600" />
              Success Stories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Discover inspiring stories from women entrepreneurs who have transformed their businesses with GirlsPreneur's platform and community support.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Sarah's Tech Startup</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  From idea to IPO in 3 years with our mentorship program and funding connections.
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Maria's Restaurant Chain</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Expanded from 1 to 15 locations using our business launch tools and networking events.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blog & News */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Newspaper className="h-6 w-6 mr-2 text-blue-600" />
              Blog & News
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Stay updated with the latest trends, tips, and insights in women's entrepreneurship.
            </p>
            <div className="space-y-3">
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">5 Essential Skills for Women Entrepreneurs in 2024</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Learn the key skills that will set you apart in today's competitive business landscape.</p>
              </div>
              <div className="border-l-4 border-pink-500 pl-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Funding Opportunities for Women-Led Startups</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Discover grants, venture capital, and other funding sources specifically for women entrepreneurs.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Press & Media */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-6 w-6 mr-2 text-green-600" />
              Press & Media
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              GirlsPreneur has been featured in leading publications and media outlets for our innovative approach to supporting women entrepreneurs.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Forbes</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">"Revolutionizing Women's Entrepreneurship"</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">TechCrunch</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">"The Future of Female-Led Startups"</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Business Insider</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">"Empowering the Next Generation"</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal & Policies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Scale className="h-6 w-6 mr-2 text-gray-600" />
              Legal & Policies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Important legal information and policies that govern your use of GirlsPreneur's platform and services.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">User Policies</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="/privacy" className="text-purple-600 hover:text-purple-700 transition-colors">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="/terms" className="text-purple-600 hover:text-purple-700 transition-colors">
                      Terms of Service
                    </a>
                  </li>
                  <li>
                    <a href="/cookies" className="text-purple-600 hover:text-purple-700 transition-colors">
                      Cookie Policy
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Legal Information</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="/legal" className="text-purple-600 hover:text-purple-700 transition-colors">
                      Legal Notice
                    </a>
                  </li>
                  <li>
                    <a href="/legal#disclaimer" className="text-purple-600 hover:text-purple-700 transition-colors">
                      Disclaimer
                    </a>
                  </li>
                  <li>
                    <a href="/legal#compliance" className="text-purple-600 hover:text-purple-700 transition-colors">
                      Compliance
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Community */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-6 w-6 mr-2 text-purple-600" />
              Community Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Connect with our vibrant community of women entrepreneurs and access valuable resources.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Networking Events</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Join our monthly networking events and connect with fellow entrepreneurs.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Resource Library</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Access our comprehensive library of guides, templates, and tools.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Trophy className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Success Programs</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Participate in our structured programs designed to accelerate your success.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  )
}

export default function ResourcesPage() {
  return <ResourcesContent />
}