'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Founder, Bloom & Co',
    avatar: '/avatars/user1.jpg',
    content: 'GirlsPreneur transformed my business idea into a thriving company. The mentorship and funding opportunities were invaluable. I raised $250K in seed funding within 6 months!',
    rating: 5
  },
  {
    name: 'Maria Rodriguez',
    role: 'CEO, TechNova Solutions',
    avatar: '/avatars/user2.jpg',
    content: 'The courses and community support helped me scale my tech startup from 3 to 50 employees. The AI assistant provides amazing insights for business strategy.',
    rating: 5
  },
  {
    name: 'Amanda Chen',
    role: 'Owner, Green Beauty Co',
    avatar: '/avatars/user3.jpg',
    content: 'As a first-time entrepreneur, I was overwhelmed. GirlsPreneur provided step-by-step guidance and connected me with amazing mentors who believed in my vision.',
    rating: 5
  }
]

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Success Stories from Our Community
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Hear from women entrepreneurs who have built successful businesses with our platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="relative bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
              <CardContent className="p-8">
                <Quote className="h-8 w-8 text-purple-200 dark:text-purple-800 mb-4" />
                
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-2 bg-purple-100 dark:bg-purple-900/20 px-6 py-3 rounded-full">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
              ))}
            </div>
            <span className="text-purple-800 dark:text-purple-200 font-medium">
              4.9/5 Rating from 10,000+ Entrepreneurs
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}