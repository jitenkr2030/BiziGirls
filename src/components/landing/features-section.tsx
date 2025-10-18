'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  GraduationCap, 
  Users, 
  DollarSign, 
  Target, 
  Calendar, 
  Bot,
  ShoppingCart,
  MessageSquare,
  Award,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

const features = [
  {
    icon: GraduationCap,
    title: 'Business Courses',
    description: 'Access comprehensive courses taught by industry experts covering everything from business fundamentals to advanced strategies.',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    link: '/courses'
  },
  {
    icon: Users,
    title: 'Mentorship Program',
    description: 'Connect with experienced mentors who provide guidance, support, and valuable insights to help you succeed.',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    link: '/mentorship'
  },
  {
    icon: DollarSign,
    title: 'Funding Opportunities',
    description: 'Discover funding options, connect with investors, and get help preparing your pitch for investment.',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
    link: '/funding'
  },
  {
    icon: Target,
    title: 'Business Launch',
    description: 'Step-by-step guidance to launch your business with our comprehensive startup toolkit and resources.',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    link: '/business-launch'
  },
  {
    icon: Calendar,
    title: 'Events & Networking',
    description: 'Attend exclusive events, workshops, and networking sessions to build valuable connections.',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/20',
    link: '/networking'
  },
  {
    icon: Bot,
    title: 'AI Assistant',
    description: 'Get personalized business advice and insights powered by advanced AI technology.',
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/20',
    link: '/ai-assistant'
  },
  {
    icon: ShoppingCart,
    title: 'Marketplace',
    description: 'Buy and sell products and services within our community of women entrepreneurs.',
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-100 dark:bg-pink-900/20',
    link: '/marketplace'
  },
  {
    icon: MessageSquare,
    title: 'Community Support',
    description: 'Join a vibrant community of like-minded women entrepreneurs for support and collaboration.',
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-100 dark:bg-teal-900/20',
    link: '/success-stories'
  },
  {
    icon: Award,
    title: 'Success Stories',
    description: 'Get inspired by real success stories from women who have built successful businesses.',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    link: '/success-stories'
  }
]

export function FeaturesSection() {
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Everything You Need
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Comprehensive Platform for Your Success
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            All the tools, resources, and support you need to launch, grow, and scale your business in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button asChild variant="ghost" className="p-0 h-auto text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                    <Link href={feature.link} className="flex items-center">
                      Learn more
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
            <Link href="/auth/register">
              Start Your Journey Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}