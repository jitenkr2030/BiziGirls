'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, CheckCircle, Sparkles } from 'lucide-react'
import Link from 'next/link'

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Sparkles className="h-5 w-5 text-white" />
            <span className="text-white font-medium">Limited Time Offer</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Build Your Dream Business?
          </h2>
          <p className="text-xl text-purple-100 max-w-3xl mx-auto mb-8">
            Join thousands of successful women entrepreneurs and get instant access to all our tools, courses, and community support.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-6">Start Free, Grow Fast</h3>
              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-300 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Free Forever Plan</div>
                    <div className="text-purple-100 text-sm">Access basic features and community support</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-300 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Premium Courses</div>
                    <div className="text-purple-100 text-sm">Learn from industry experts</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-300 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Mentorship Access</div>
                    <div className="text-purple-100 text-sm">Connect with experienced mentors</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-300 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Funding Opportunities</div>
                    <div className="text-purple-100 text-sm">Get access to investors and grants</div>
                  </div>
                </div>
              </div>
              <Button asChild size="lg" variant="secondary" className="w-full bg-white text-purple-600 hover:bg-gray-100">
                <Link href="/auth/register">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Premium Plan</h3>
                <div className="bg-yellow-400 text-purple-900 px-3 py-1 rounded-full text-sm font-semibold">
                  MOST POPULAR
                </div>
              </div>
              <div className="mb-6">
                <div className="text-4xl font-bold mb-2">$29<span className="text-lg font-normal">/month</span></div>
                <div className="text-purple-100">Everything in Free, plus:</div>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-300 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Advanced AI Assistant</div>
                    <div className="text-purple-100 text-sm">Personalized business insights</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-300 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Priority Mentorship</div>
                    <div className="text-purple-100 text-sm">Get matched with top mentors</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-300 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Premium Analytics</div>
                    <div className="text-purple-100 text-sm">Detailed business insights</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-300 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Exclusive Events</div>
                    <div className="text-purple-100 text-sm">VIP networking opportunities</div>
                  </div>
                </div>
              </div>
              <Button asChild size="lg" className="w-full bg-yellow-400 text-purple-900 hover:bg-yellow-300">
                <Link href="/auth/register">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-purple-100 mb-4">
            No credit card required • Cancel anytime • 14-day free trial for Premium
          </p>
          <div className="flex justify-center space-x-8 text-purple-100">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-300" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-300" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-300" />
              <span>Money Back Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}