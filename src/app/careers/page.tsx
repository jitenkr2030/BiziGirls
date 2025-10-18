'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PublicLayout } from '@/components/layout/public-layout'
import { Briefcase, Users, Heart, Star } from 'lucide-react'

function CareersContent() {
  return (
    <PublicLayout>
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Careers at GirlsPreneur
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Join our mission to empower women entrepreneurs worldwide. Build your career while making a difference.
          </p>
        </div>

        {/* Coming Soon */}
        <Card>
          <CardContent className="text-center py-12">
            <Briefcase className="h-16 w-16 text-purple-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Join Our Team
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We're always looking for passionate individuals who believe in our mission. While we don't have any open positions at the moment, we'd love to hear from you!
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Send us your resume and a note about why you'd like to join GirlsPreneur. We'll keep your information on file and reach out when opportunities arise.
            </p>
          </CardContent>
        </Card>

        {/* Our Values */}
        <Card>
          <CardHeader>
            <CardTitle>Why Work With Us?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Mission-Driven</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Make a real impact in women's entrepreneurship and economic empowerment.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Inclusive Culture</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Join a diverse team that values collaboration, growth, and mutual support.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Growth Opportunities</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Develop your skills and advance your career in a fast-growing startup environment.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Briefcase className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Flexible Work</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Enjoy remote work options and flexible schedules that support work-life balance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Get in Touch</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Interested in joining our team? Send your resume and cover letter to:
            </p>
            <p className="text-gray-900 dark:text-white font-medium">
              careers@girlspreneur.com
            </p>
            <p className="text-gray-600 dark:text-gray-300 mt-4">
              Please include the type of role you're interested in and tell us why you're passionate about empowering women entrepreneurs.
            </p>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  )
}

export default function CareersPage() {
  return <CareersContent />
}