import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function main() {
  // Create demo users with different roles
  const demoUsers = await Promise.all([
    // Main entrepreneur user
    prisma.user.create({
      data: {
        email: 'demo@girlspreneur.com',
        password: hashPassword('demo123'),
        firstName: 'Sarah',
        lastName: 'Chen',
        role: 'entrepreneur',
        bio: 'Passionate entrepreneur building a sustainable fashion brand',
        location: 'San Francisco, CA',
        businessStage: 'growth',
        industry: 'Fashion',
        skills: JSON.stringify(['leadership', 'marketing', 'sustainability']),
        interests: JSON.stringify(['fashion', 'sustainability', 'technology']),
        isVerified: true,
        emailVerifiedAt: new Date()
      }
    }),
    // Mentor user
    prisma.user.create({
      data: {
        email: 'mentor@girlspreneur.com',
        password: hashPassword('mentor123'),
        firstName: 'Jennifer',
        lastName: 'Liu',
        role: 'mentor',
        bio: 'Tech entrepreneur with 10+ years of experience in scaling startups',
        location: 'Austin, TX',
        businessStage: 'established',
        industry: 'Technology',
        skills: JSON.stringify(['mentoring', 'leadership', 'fundraising', 'product']),
        interests: JSON.stringify(['technology', 'startups', 'investing']),
        isVerified: true,
        emailVerifiedAt: new Date()
      }
    }),
    // Investor user
    prisma.user.create({
      data: {
        email: 'investor@girlspreneur.com',
        password: hashPassword('investor123'),
        firstName: 'Michael',
        lastName: 'Chen',
        role: 'investor',
        bio: 'Angel investor focused on women-led startups in tech and sustainability',
        location: 'New York, NY',
        businessStage: 'established',
        industry: 'Finance',
        skills: JSON.stringify(['investing', 'finance', 'strategy']),
        interests: JSON.stringify(['startups', 'technology', 'sustainability']),
        isVerified: true,
        emailVerifiedAt: new Date()
      }
    }),
    // Additional entrepreneur
    prisma.user.create({
      data: {
        email: 'emma@girlspreneur.com',
        password: hashPassword('emma123'),
        firstName: 'Emma',
        lastName: 'Wilson',
        role: 'entrepreneur',
        bio: 'Founder of a health tech startup focused on women\'s health',
        location: 'Boston, MA',
        businessStage: 'startup',
        industry: 'Healthcare',
        skills: JSON.stringify(['healthcare', 'technology', 'product']),
        interests: JSON.stringify(['health', 'technology', 'innovation']),
        isVerified: true,
        emailVerifiedAt: new Date()
      }
    }),
    // Additional mentor
    prisma.user.create({
      data: {
        email: 'lisa@girlspreneur.com',
        password: hashPassword('lisa123'),
        firstName: 'Lisa',
        lastName: 'Garcia',
        role: 'mentor',
        bio: 'Marketing expert with experience in brand building and digital strategy',
        location: 'Los Angeles, CA',
        businessStage: 'established',
        industry: 'Marketing',
        skills: JSON.stringify(['marketing', 'branding', 'digital', 'strategy']),
        interests: JSON.stringify(['marketing', 'branding', 'digital']),
        isVerified: true,
        emailVerifiedAt: new Date()
      }
    })
  ])

  // Create business profiles
  const businessProfiles = await Promise.all([
    prisma.businessProfile.create({
      data: {
        userId: demoUsers[0].id,
        businessName: 'EcoFashion Co.',
        businessEmail: 'hello@ecofashion.com',
        businessPhone: '+1-555-0123',
        businessAddress: '123 Market St, San Francisco, CA',
        businessWebsite: 'https://ecofashion.com',
        businessType: 'llc',
        industry: 'Fashion',
        description: 'Sustainable fashion brand creating eco-friendly clothing',
        mission: 'To make sustainable fashion accessible and stylish',
        vision: 'A world where fashion doesn\'t cost the earth',
        foundedDate: new Date('2022-01-15'),
        employeeCount: 5,
        annualRevenue: 250000,
        targetMarket: 'Eco-conscious consumers aged 25-45',
        isRegistered: true,
        registrationDate: new Date('2022-01-20')
      }
    }),
    prisma.businessProfile.create({
      data: {
        userId: demoUsers[3].id,
        businessName: 'HealthTech Solutions',
        businessEmail: 'info@healthtech.com',
        businessPhone: '+1-555-0456',
        businessAddress: '456 Innovation Dr, Boston, MA',
        businessWebsite: 'https://healthtech.com',
        businessType: 'corporation',
        industry: 'Healthcare',
        description: 'Women\'s health technology platform',
        mission: 'Empowering women through accessible health technology',
        vision: 'Revolutionizing women\'s healthcare through innovation',
        foundedDate: new Date('2023-03-10'),
        employeeCount: 8,
        annualRevenue: 500000,
        targetMarket: 'Women aged 18-65',
        isRegistered: true,
        registrationDate: new Date('2023-03-15')
      }
    })
  ])

  // Create mentor profiles
  const mentorProfiles = await Promise.all([
    prisma.mentorProfile.create({
      data: {
        userId: demoUsers[1].id,
        expertise: JSON.stringify(['startups', 'technology', 'fundraising', 'leadership']),
        experience: 12,
        company: 'TechVentures Inc.',
        position: 'CEO & Founder',
        education: 'MBA from Stanford University',
        certifications: JSON.stringify(['PMP', 'Certified Scrum Master']),
        bio: 'Helping entrepreneurs build scalable tech businesses',
        hourlyRate: 150,
        availability: 'available',
        mentorshipType: JSON.stringify(['one-on-one', 'group', 'coaching']),
        isVerified: true,
        rating: 4.8,
        reviewCount: 25
      }
    }),
    prisma.mentorProfile.create({
      data: {
        userId: demoUsers[4].id,
        expertise: JSON.stringify(['marketing', 'branding', 'digital', 'strategy']),
        experience: 8,
        company: 'Brand Masters Agency',
        position: 'Creative Director',
        education: 'BA in Marketing from UCLA',
        certifications: JSON.stringify(['Google Ads Certified', 'Facebook Blueprint']),
        bio: 'Building powerful brands in the digital age',
        hourlyRate: 120,
        availability: 'available',
        mentorshipType: JSON.stringify(['one-on-one', 'group']),
        isVerified: true,
        rating: 4.6,
        reviewCount: 18
      }
    })
  ])

  // Create courses
  const courses = await Promise.all([
    prisma.course.create({
      data: {
        title: 'Starting Your First Business',
        description: 'A comprehensive guide to launching your first business as a woman entrepreneur',
        category: 'business',
        level: 'beginner',
        duration: 20,
        price: 99.99,
        thumbnail: '/images/courses/business-basics.jpg',
        instructorId: demoUsers[1].id,
        isPublished: true,
        isFeatured: true,
        enrollmentCount: 150,
        rating: 4.7,
        reviewCount: 45
      }
    }),
    prisma.course.create({
      data: {
        title: 'Digital Marketing for Entrepreneurs',
        description: 'Learn essential digital marketing strategies to grow your business',
        category: 'marketing',
        level: 'intermediate',
        duration: 15,
        price: 79.99,
        thumbnail: '/images/courses/digital-marketing.jpg',
        instructorId: demoUsers[4].id,
        isPublished: true,
        isFeatured: true,
        enrollmentCount: 120,
        rating: 4.5,
        reviewCount: 32
      }
    }),
    prisma.course.create({
      data: {
        title: 'Leadership Skills for Women',
        description: 'Develop essential leadership skills and advance your career',
        category: 'leadership',
        level: 'intermediate',
        duration: 12,
        price: 89.99,
        thumbnail: '/images/courses/leadership.jpg',
        instructorId: demoUsers[1].id,
        isPublished: true,
        enrollmentCount: 95,
        rating: 4.8,
        reviewCount: 28
      }
    })
  ])

  // Create lessons for courses
  const lessons = await Promise.all([
    // Lessons for Starting Your First Business
    prisma.lesson.create({
      data: {
        courseId: courses[0].id,
        title: 'Introduction to Entrepreneurship',
        content: 'Learn what it takes to be a successful entrepreneur',
        duration: 30,
        order: 1,
        isPreview: true
      }
    }),
    prisma.lesson.create({
      data: {
        courseId: courses[0].id,
        title: 'Business Planning Basics',
        content: 'How to create a solid business plan',
        duration: 45,
        order: 2,
        isPreview: false
      }
    }),
    prisma.lesson.create({
      data: {
        courseId: courses[0].id,
        title: 'Market Research and Validation',
        content: 'Understanding your target market and validating your idea',
        duration: 40,
        order: 3,
        isPreview: false
      }
    }),
    // Lessons for Digital Marketing
    prisma.lesson.create({
      data: {
        courseId: courses[1].id,
        title: 'Marketing Fundamentals',
        content: 'Core concepts of digital marketing',
        duration: 35,
        order: 1,
        isPreview: true
      }
    }),
    prisma.lesson.create({
      data: {
        courseId: courses[1].id,
        title: 'Social Media Marketing',
        content: 'Leveraging social media for business growth',
        duration: 50,
        order: 2,
        isPreview: false
      }
    })
  ])

  // Create course enrollments
  const enrollments = await Promise.all([
    prisma.courseEnrollment.create({
      data: {
        userId: demoUsers[0].id,
        courseId: courses[0].id,
        progress: 75,
        enrolledAt: new Date('2024-01-15')
      }
    }),
    prisma.courseEnrollment.create({
      data: {
        userId: demoUsers[0].id,
        courseId: courses[1].id,
        progress: 40,
        enrolledAt: new Date('2024-02-01')
      }
    }),
    prisma.courseEnrollment.create({
      data: {
        userId: demoUsers[3].id,
        courseId: courses[0].id,
        progress: 100,
        completedAt: new Date('2024-01-30'),
        enrolledAt: new Date('2024-01-10')
      }
    })
  ])

  // Create mentorships
  const mentorships = await Promise.all([
    prisma.mentorship.create({
      data: {
        mentorId: demoUsers[1].id,
        menteeId: demoUsers[0].id,
        status: 'accepted',
        type: 'one-on-one',
        focusAreas: JSON.stringify(['business strategy', 'fundraising']),
        goals: 'Scale EcoFashion Co. to $1M revenue',
        duration: 12,
        price: 1800,
        scheduledAt: new Date('2024-01-20'),
        createdAt: new Date('2024-01-15')
      }
    }),
    prisma.mentorship.create({
      data: {
        mentorId: demoUsers[4].id,
        menteeId: demoUsers[3].id,
        status: 'pending',
        type: 'coaching',
        focusAreas: JSON.stringify(['marketing', 'branding']),
        goals: 'Build brand awareness for HealthTech Solutions',
        duration: 6,
        price: 720,
        createdAt: new Date('2024-02-01')
      }
    })
  ])

  // Create funding requests
  const fundingRequests = await Promise.all([
    prisma.fundingRequest.create({
      data: {
        userId: demoUsers[0].id,
        businessName: 'EcoFashion Co.',
        description: 'Seeking funding to expand sustainable fashion line and enter new markets',
        industry: 'Fashion',
        fundingType: 'equity',
        amount: 500000,
        valuation: 2500000,
        equityOffered: 20,
        useOfFunds: 'Product development, marketing, and team expansion',
        businessPlan: 'https://ecofashion.com/business-plan.pdf',
        pitchDeck: 'https://ecofashion.com/pitch-deck.pdf',
        status: 'under-review',
        deadline: new Date('2024-03-31')
      }
    }),
    prisma.fundingRequest.create({
      data: {
        userId: demoUsers[3].id,
        businessName: 'HealthTech Solutions',
        description: 'Series A funding to scale women\'s health platform',
        industry: 'Healthcare',
        fundingType: 'equity',
        amount: 2000000,
        valuation: 10000000,
        equityOffered: 20,
        useOfFunds: 'Technology development, team expansion, and market expansion',
        businessPlan: 'https://healthtech.com/business-plan.pdf',
        pitchDeck: 'https://healthtech.com/pitch-deck.pdf',
        status: 'submitted',
        deadline: new Date('2024-04-15')
      }
    })
  ])

  // Create investments
  const investments = await Promise.all([
    prisma.investment.create({
      data: {
        fundingRequestId: fundingRequests[0].id,
        investorId: demoUsers[2].id,
        amount: 250000,
        equity: 10,
        terms: '10% equity with board seat',
        status: 'proposed'
      }
    })
  ])

  // Create community posts
  const communityPosts = await Promise.all([
    prisma.communityPost.create({
      data: {
        userId: demoUsers[0].id,
        title: 'How I built my sustainable fashion brand',
        content: 'Sharing my journey of creating EcoFashion Co. and the challenges I faced...',
        category: 'success-story',
        tags: JSON.stringify(['sustainability', 'fashion', 'entrepreneurship']),
        likes: 45,
        views: 320
      }
    }),
    prisma.communityPost.create({
      data: {
        userId: demoUsers[1].id,
        title: 'Top 5 mistakes new entrepreneurs make',
        content: 'Based on my experience mentoring startups, here are the most common mistakes...',
        category: 'discussion',
        tags: JSON.stringify(['entrepreneurship', 'advice', 'mistakes']),
        likes: 78,
        views: 540
      }
    }),
    prisma.communityPost.create({
      data: {
        userId: demoUsers[3].id,
        title: 'Looking for feedback on my health tech startup',
        content: 'I\'m working on a women\'s health platform and would love to get feedback...',
        category: 'question',
        tags: JSON.stringify(['healthcare', 'technology', 'feedback']),
        likes: 23,
        views: 180
      }
    })
  ])

  // Create community comments
  const communityComments = await Promise.all([
    prisma.communityComment.create({
      data: {
        userId: demoUsers[1].id,
        postId: communityPosts[0].id,
        content: 'Great story! Love what you\'re doing with sustainable fashion.'
      }
    }),
    prisma.communityComment.create({
      data: {
        userId: demoUsers[2].id,
        postId: communityPosts[1].id,
        content: 'Excellent insights! I\'ve seen these mistakes many times in my investing career.'
      }
    }),
    prisma.communityComment.create({
      data: {
        userId: demoUsers[4].id,
        postId: communityPosts[2].id,
        content: 'This sounds like a great idea! Have you considered user testing?'
      }
    })
  ])

  // Create events
  const events = await Promise.all([
    prisma.event.create({
      data: {
        title: 'Women in Tech Summit 2024',
        description: 'Annual summit bringing together women in technology for networking and learning',
        type: 'conference',
        category: 'technology',
        location: 'San Francisco, CA',
        isOnline: false,
        maxAttendees: 500,
        price: 299.99,
        thumbnail: '/images/events/tech-summit.jpg',
        organizerId: demoUsers[1].id,
        startDate: new Date('2024-06-15T09:00:00'),
        endDate: new Date('2024-06-15T17:00:00'),
        isPublished: true
      }
    }),
    prisma.event.create({
      data: {
        title: 'Digital Marketing Masterclass',
        description: 'Learn advanced digital marketing strategies from industry experts',
        type: 'workshop',
        category: 'marketing',
        location: 'Online',
        isOnline: true,
        maxAttendees: 100,
        price: 49.99,
        thumbnail: '/images/events/marketing-workshop.jpg',
        organizerId: demoUsers[4].id,
        startDate: new Date('2024-03-20T14:00:00'),
        endDate: new Date('2024-03-20T16:00:00'),
        isPublished: true
      }
    })
  ])

  // Create event attendance
  const eventAttendance = await Promise.all([
    prisma.eventAttendance.create({
      data: {
        userId: demoUsers[0].id,
        eventId: events[0].id,
        status: 'registered'
      }
    }),
    prisma.eventAttendance.create({
      data: {
        userId: demoUsers[3].id,
        eventId: events[0].id,
        status: 'registered'
      }
    }),
    prisma.eventAttendance.create({
      data: {
        userId: demoUsers[0].id,
        eventId: events[1].id,
        status: 'registered'
      }
    })
  ])

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        userId: demoUsers[0].id,
        name: 'Eco-Friendly T-Shirt',
        description: 'Sustainable cotton t-shirt made from recycled materials',
        category: 'Clothing',
        price: 29.99,
        images: JSON.stringify(['/images/products/tshirt-1.jpg', '/images/products/tshirt-2.jpg']),
        tags: JSON.stringify(['sustainable', 'cotton', 'casual']),
        inventory: 50,
        sku: 'ECO-TS-001',
        isDigital: false,
        isPublished: true,
        isFeatured: true,
        viewCount: 120,
        salesCount: 15,
        rating: 4.5,
        reviewCount: 8
      }
    }),
    prisma.product.create({
      data: {
        userId: demoUsers[3].id,
        name: 'Business Planning Template',
        description: 'Comprehensive business plan template for startups',
        category: 'Digital Products',
        price: 19.99,
        images: JSON.stringify(['/images/products/template.jpg']),
        tags: JSON.stringify(['business', 'planning', 'template']),
        inventory: 999,
        sku: 'HT-BP-001',
        isDigital: true,
        digitalFile: 'https://healthtech.com/business-plan-template.pdf',
        isPublished: true,
        viewCount: 85,
        salesCount: 32,
        rating: 4.8,
        reviewCount: 12
      }
    })
  ])

  // Create orders
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        userId: demoUsers[3].id,
        totalAmount: 29.99,
        status: 'delivered',
        paymentMethod: 'credit_card',
        paymentId: 'pay_123456789',
        shippingAddress: '456 Innovation Dr, Boston, MA'
      }
    }),
    prisma.order.create({
      data: {
        userId: demoUsers[0].id,
        totalAmount: 19.99,
        status: 'paid',
        paymentMethod: 'paypal',
        paymentId: 'pay_987654321'
      }
    })
  ])

  // Create order items
  const orderItems = await Promise.all([
    prisma.orderItem.create({
      data: {
        orderId: orders[0].id,
        productId: products[0].id,
        quantity: 1,
        price: 29.99
      }
    }),
    prisma.orderItem.create({
      data: {
        orderId: orders[1].id,
        productId: products[1].id,
        quantity: 1,
        price: 19.99
      }
    })
  ])

  // Create product reviews
  const productReviews = await Promise.all([
    prisma.productReview.create({
      data: {
        userId: demoUsers[3].id,
        productId: products[0].id,
        rating: 5,
        comment: 'Love the quality and sustainability of this t-shirt!'
      }
    }),
    prisma.productReview.create({
      data: {
        userId: demoUsers[0].id,
        productId: products[1].id,
        rating: 4,
        comment: 'Very helpful template, saved me a lot of time.'
      }
    })
  ])

  // Create course reviews
  const courseReviews = await Promise.all([
    prisma.courseReview.create({
      data: {
        userId: demoUsers[0].id,
        courseId: courses[0].id,
        rating: 5,
        comment: 'Excellent course! Very practical and informative.'
      }
    }),
    prisma.courseReview.create({
      data: {
        userId: demoUsers[3].id,
        courseId: courses[0].id,
        rating: 4,
        comment: 'Great content, but could use more real-world examples.'
      }
    })
  ])

  // Create tasks
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        userId: demoUsers[0].id,
        title: 'Complete business plan Q1 review',
        description: 'Review and update business plan for Q1 2024',
        category: 'business',
        priority: 'high',
        status: 'in-progress',
        dueDate: new Date('2024-03-15')
      }
    }),
    prisma.task.create({
      data: {
        userId: demoUsers[0].id,
        title: 'Schedule mentorship meeting',
        description: 'Coordinate next meeting with Jennifer Liu',
        category: 'personal',
        priority: 'medium',
        status: 'pending',
        dueDate: new Date('2024-02-28')
      }
    }),
    prisma.task.create({
      data: {
        userId: demoUsers[3].id,
        title: 'Finish product development roadmap',
        description: 'Complete Q2 product development roadmap',
        category: 'business',
        priority: 'high',
        status: 'pending',
        dueDate: new Date('2024-03-01')
      }
    })
  ])

  // Create certificates
  const certificates = await Promise.all([
    prisma.certificate.create({
      data: {
        userId: demoUsers[3].id,
        courseId: courses[0].id,
        certificateUrl: 'https://girlspreneur.com/certificates/cert-123.pdf',
        issuedAt: new Date('2024-01-30'),
        expiresAt: new Date('2026-01-30')
      }
    })
  ])

  // Create AI conversations
  const aiConversations = await Promise.all([
    prisma.aIConversation.create({
      data: {
        userId: demoUsers[0].id,
        title: 'Business Strategy Discussion',
        messages: JSON.stringify([
          { role: 'user', content: 'How can I improve my business strategy?' },
          { role: 'assistant', content: 'Here are some key areas to focus on...' }
        ]),
        context: 'Business strategy and growth planning'
      }
    }),
    prisma.aIConversation.create({
      data: {
        userId: demoUsers[3].id,
        title: 'Marketing Advice',
        messages: JSON.stringify([
          { role: 'user', content: 'What marketing channels work best for health tech?' },
          { role: 'assistant', content: 'For health tech startups, consider these channels...' }
        ]),
        context: 'Digital marketing for health technology'
      }
    })
  ])

  // Create referrals
  const referrals = await Promise.all([
    prisma.referral.create({
      data: {
        referrerId: demoUsers[1].id,
        referredId: demoUsers[0].id
      }
    }),
    prisma.referral.create({
      data: {
        referrerId: demoUsers[0].id,
        referredId: demoUsers[3].id
      }
    })
  ])

  // Create affiliate earnings
  const affiliateEarnings = await Promise.all([
    prisma.affiliateEarning.create({
      data: {
        userId: demoUsers[1].id,
        source: 'course',
        sourceId: courses[0].id,
        amount: 99.99,
        commission: 10.00,
        status: 'approved'
      }
    }),
    prisma.affiliateEarning.create({
      data: {
        userId: demoUsers[0].id,
        source: 'product',
        sourceId: products[1].id,
        amount: 19.99,
        commission: 2.00,
        status: 'pending'
      }
    })
  ])

  console.log('Database seeded successfully!')
  console.log(`Created ${demoUsers.length} users`)
  console.log(`Created ${businessProfiles.length} business profiles`)
  console.log(`Created ${mentorProfiles.length} mentor profiles`)
  console.log(`Created ${courses.length} courses`)
  console.log(`Created ${lessons.length} lessons`)
  console.log(`Created ${enrollments.length} enrollments`)
  console.log(`Created ${mentorships.length} mentorships`)
  console.log(`Created ${fundingRequests.length} funding requests`)
  console.log(`Created ${investments.length} investments`)
  console.log(`Created ${communityPosts.length} community posts`)
  console.log(`Created ${communityComments.length} community comments`)
  console.log(`Created ${events.length} events`)
  console.log(`Created ${eventAttendance.length} event attendance records`)
  console.log(`Created ${products.length} products`)
  console.log(`Created ${orders.length} orders`)
  console.log(`Created ${orderItems.length} order items`)
  console.log(`Created ${productReviews.length} product reviews`)
  console.log(`Created ${courseReviews.length} course reviews`)
  console.log(`Created ${tasks.length} tasks`)
  console.log(`Created ${certificates.length} certificates`)
  console.log(`Created ${aiConversations.length} AI conversations`)
  console.log(`Created ${referrals.length} referrals`)
  console.log(`Created ${affiliateEarnings.length} affiliate earnings`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })