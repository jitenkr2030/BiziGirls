import { z } from 'zod'

// User validation schemas
export const userSchema = {
  register: z.object({
    firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
    lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/\d/, 'Password must contain at least one number')
      .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
    role: z.enum(['entrepreneur', 'mentor', 'investor', 'admin']).optional().default('entrepreneur'),
  }),

  login: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),

  forgotPassword: z.object({
    email: z.string().email('Invalid email address'),
  }),

  resetPassword: z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: z.string().min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/\d/, 'Password must contain at least one number')
      .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  }),

  updateProfile: z.object({
    bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
    location: z.string().max(100, 'Location must be less than 100 characters').optional(),
    businessStage: z.enum(['idea', 'startup', 'growth', 'established']).optional(),
    industry: z.string().max(50, 'Industry must be less than 50 characters').optional(),
    phone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number').optional(),
    website: z.string().url('Invalid website URL').optional(),
    linkedin: z.string().url('Invalid LinkedIn URL').optional(),
    twitter: z.string().url('Invalid Twitter URL').optional(),
    instagram: z.string().url('Invalid Instagram URL').optional(),
    dateOfBirth: z.string().optional(),
    gender: z.enum(['female', 'male', 'non-binary', 'prefer-not-to-say']).optional(),
    skills: z.string().max(500, 'Skills must be less than 500 characters').optional(),
    interests: z.string().max(500, 'Interests must be less than 500 characters').optional(),
  }),

  changePassword: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/\d/, 'Password must contain at least one number')
      .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  }),
}

// Business profile validation schemas
export const businessProfileSchema = {
  create: z.object({
    businessName: z.string().min(1, 'Business name is required').max(100, 'Business name must be less than 100 characters'),
    businessEmail: z.string().email('Invalid business email').optional(),
    businessPhone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid business phone number').optional(),
    businessAddress: z.string().max(200, 'Business address must be less than 200 characters').optional(),
    businessWebsite: z.string().url('Invalid business website URL').optional(),
    businessType: z.enum(['sole-proprietorship', 'llc', 'corporation', 'partnership', 'non-profit']).optional(),
    industry: z.string().min(1, 'Industry is required').max(50, 'Industry must be less than 50 characters'),
    description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
    mission: z.string().max(500, 'Mission must be less than 500 characters').optional(),
    vision: z.string().max(500, 'Vision must be less than 500 characters').optional(),
    foundedDate: z.date().optional(),
    employeeCount: z.number().int().min(0, 'Employee count must be a positive number').optional(),
    annualRevenue: z.number().min(0, 'Annual revenue must be a positive number').optional(),
    targetMarket: z.string().max(200, 'Target market must be less than 200 characters').optional(),
  }),

  update: z.object({
    businessName: z.string().min(1, 'Business name is required').max(100, 'Business name must be less than 100 characters').optional(),
    businessEmail: z.string().email('Invalid business email').optional(),
    businessPhone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid business phone number').optional(),
    businessAddress: z.string().max(200, 'Business address must be less than 200 characters').optional(),
    businessWebsite: z.string().url('Invalid business website URL').optional(),
    businessType: z.enum(['sole-proprietorship', 'llc', 'corporation', 'partnership', 'non-profit']).optional(),
    industry: z.string().min(1, 'Industry is required').max(50, 'Industry must be less than 50 characters').optional(),
    description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
    mission: z.string().max(500, 'Mission must be less than 500 characters').optional(),
    vision: z.string().max(500, 'Vision must be less than 500 characters').optional(),
    foundedDate: z.date().optional(),
    employeeCount: z.number().int().min(0, 'Employee count must be a positive number').optional(),
    annualRevenue: z.number().min(0, 'Annual revenue must be a positive number').optional(),
    targetMarket: z.string().max(200, 'Target market must be less than 200 characters').optional(),
  }),
}

// Course validation schemas
export const courseSchema = {
  create: z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
    description: z.string().min(1, 'Description is required').max(2000, 'Description must be less than 2000 characters'),
    category: z.enum(['business', 'marketing', 'finance', 'leadership', 'technology', 'sales', 'operations']),
    level: z.enum(['beginner', 'intermediate', 'advanced']),
    duration: z.number().int().min(1, 'Duration must be at least 1 hour'),
    price: z.number().min(0, 'Price must be a positive number').optional(),
    thumbnail: z.string().url('Invalid thumbnail URL').optional(),
  }),

  update: z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters').optional(),
    description: z.string().min(1, 'Description is required').max(2000, 'Description must be less than 2000 characters').optional(),
    category: z.enum(['business', 'marketing', 'finance', 'leadership', 'technology', 'sales', 'operations']).optional(),
    level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    duration: z.number().int().min(1, 'Duration must be at least 1 hour').optional(),
    price: z.number().min(0, 'Price must be a positive number').optional(),
    thumbnail: z.string().url('Invalid thumbnail URL').optional(),
    isPublished: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
  }),

  lesson: z.object({
    title: z.string().min(1, 'Lesson title is required').max(100, 'Lesson title must be less than 100 characters'),
    content: z.string().min(1, 'Lesson content is required'),
    videoUrl: z.string().url('Invalid video URL').optional(),
    duration: z.number().int().min(1, 'Duration must be at least 1 minute'),
    order: z.number().int().min(0, 'Order must be a positive number'),
    isPreview: z.boolean().optional(),
  }),

  quiz: z.object({
    title: z.string().min(1, 'Quiz title is required').max(100, 'Quiz title must be less than 100 characters'),
    description: z.string().max(500, 'Description must be less than 500 characters').optional(),
    timeLimit: z.number().int().min(1, 'Time limit must be at least 1 minute').optional(),
    passingScore: z.number().min(0, 'Passing score must be between 0 and 1').max(1, 'Passing score must be between 0 and 1'),
    isRequired: z.boolean().optional(),
    order: z.number().int().min(0, 'Order must be a positive number'),
  }),

  question: z.object({
    question: z.string().min(1, 'Question is required').max(500, 'Question must be less than 500 characters'),
    type: z.enum(['multiple-choice', 'true-false', 'short-answer', 'essay']),
    options: z.array(z.string()).optional(),
    correctAnswer: z.string().optional(),
    points: z.number().int().min(1, 'Points must be at least 1'),
    order: z.number().int().min(0, 'Order must be a positive number'),
  }),

  quizAttempt: z.object({
    answers: z.array(z.object({
      questionId: z.string(),
      answer: z.string(),
    })),
    timeSpent: z.number().int().min(0, 'Time spent must be a positive number'),
  }),
}

// Mentorship validation schemas
export const mentorshipSchema = {
  request: z.object({
    mentorId: z.string().min(1, 'Mentor ID is required'),
    type: z.enum(['one-on-one', 'group', 'coaching']),
    focusAreas: z.array(z.string()).optional(),
    goals: z.string().max(500, 'Goals must be less than 500 characters').optional(),
    duration: z.number().int().min(1, 'Duration must be at least 1 week').max(52, 'Duration must be less than 52 weeks'),
    price: z.number().min(0, 'Price must be a positive number').optional(),
    scheduledAt: z.date().optional(),
  }),

  respond: z.object({
    status: z.enum(['accepted', 'rejected']),
    scheduledAt: z.date().optional(),
  }),
}

// Funding validation schemas
export const fundingSchema = {
  request: z.object({
    businessName: z.string().min(1, 'Business name is required').max(100, 'Business name must be less than 100 characters'),
    description: z.string().min(1, 'Description is required').max(2000, 'Description must be less than 2000 characters'),
    industry: z.string().min(1, 'Industry is required').max(50, 'Industry must be less than 50 characters'),
    fundingType: z.enum(['equity', 'debt', 'grant', 'loan']),
    amount: z.number().min(1, 'Amount must be at least 1'),
    valuation: z.number().min(0, 'Valuation must be a positive number').optional(),
    equityOffered: z.number().min(0, 'Equity offered must be between 0 and 100').max(100, 'Equity offered must be between 0 and 100').optional(),
    useOfFunds: z.string().max(1000, 'Use of funds must be less than 1000 characters').optional(),
    businessPlan: z.string().url('Invalid business plan URL').optional(),
    pitchDeck: z.string().url('Invalid pitch deck URL').optional(),
    deadline: z.date().optional(),
  }),

  investment: z.object({
    amount: z.number().min(1, 'Investment amount must be at least 1'),
    equity: z.number().min(0, 'Equity must be between 0 and 100').max(100, 'Equity must be between 0 and 100').optional(),
    terms: z.string().max(1000, 'Terms must be less than 1000 characters').optional(),
  }),
}

// Community validation schemas
export const communitySchema = {
  post: z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
    content: z.string().min(1, 'Content is required').max(2000, 'Content must be less than 2000 characters'),
    category: z.enum(['discussion', 'question', 'announcement', 'success-story']).optional(),
    tags: z.array(z.string()).optional(),
    image: z.string().url('Invalid image URL').optional(),
  }),

  comment: z.object({
    content: z.string().min(1, 'Comment content is required').max(1000, 'Comment must be less than 1000 characters'),
    parentId: z.string().optional(),
  }),
}

// Event validation schemas
export const eventSchema = {
  create: z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
    description: z.string().min(1, 'Description is required').max(2000, 'Description must be less than 2000 characters'),
    type: z.enum(['webinar', 'workshop', 'networking', 'conference']),
    category: z.enum(['business', 'marketing', 'finance', 'leadership', 'technology', 'sales', 'operations']),
    location: z.string().max(200, 'Location must be less than 200 characters').optional(),
    isOnline: z.boolean().default(true),
    maxAttendees: z.number().int().min(1, 'Max attendees must be at least 1').optional(),
    price: z.number().min(0, 'Price must be a positive number').optional(),
    thumbnail: z.string().url('Invalid thumbnail URL').optional(),
    startDate: z.date(),
    endDate: z.date(),
  }),

  update: z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters').optional(),
    description: z.string().min(1, 'Description is required').max(2000, 'Description must be less than 2000 characters').optional(),
    type: z.enum(['webinar', 'workshop', 'networking', 'conference']).optional(),
    category: z.enum(['business', 'marketing', 'finance', 'leadership', 'technology', 'sales', 'operations']).optional(),
    location: z.string().max(200, 'Location must be less than 200 characters').optional(),
    isOnline: z.boolean().optional(),
    maxAttendees: z.number().int().min(1, 'Max attendees must be at least 1').optional(),
    price: z.number().min(0, 'Price must be a positive number').optional(),
    thumbnail: z.string().url('Invalid thumbnail URL').optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    isPublished: z.boolean().optional(),
  }),
}

// Product validation schemas
export const productSchema = {
  create: z.object({
    name: z.string().min(1, 'Product name is required').max(100, 'Product name must be less than 100 characters'),
    description: z.string().min(1, 'Description is required').max(2000, 'Description must be less than 2000 characters'),
    category: z.string().min(1, 'Category is required').max(50, 'Category must be less than 50 characters'),
    price: z.number().min(0, 'Price must be a positive number'),
    images: z.array(z.string().url('Invalid image URL')).optional(),
    tags: z.array(z.string()).optional(),
    inventory: z.number().int().min(0, 'Inventory must be a positive number').default(0),
    sku: z.string().max(50, 'SKU must be less than 50 characters').optional(),
    isDigital: z.boolean().default(false),
    digitalFile: z.string().url('Invalid digital file URL').optional(),
  }),

  update: z.object({
    name: z.string().min(1, 'Product name is required').max(100, 'Product name must be less than 100 characters').optional(),
    description: z.string().min(1, 'Description is required').max(2000, 'Description must be less than 2000 characters').optional(),
    category: z.string().min(1, 'Category is required').max(50, 'Category must be less than 50 characters').optional(),
    price: z.number().min(0, 'Price must be a positive number').optional(),
    images: z.array(z.string().url('Invalid image URL')).optional(),
    tags: z.array(z.string()).optional(),
    inventory: z.number().int().min(0, 'Inventory must be a positive number').optional(),
    sku: z.string().max(50, 'SKU must be less than 50 characters').optional(),
    isDigital: z.boolean().optional(),
    digitalFile: z.string().url('Invalid digital file URL').optional(),
    isPublished: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
  }),
}

// Task validation schemas
export const taskSchema = {
  create: z.object({
    title: z.string().min(1, 'Task title is required').max(100, 'Task title must be less than 100 characters'),
    description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
    category: z.enum(['business', 'personal', 'learning', 'health']).optional(),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
    dueDate: z.date().optional(),
  }),

  update: z.object({
    title: z.string().min(1, 'Task title is required').max(100, 'Task title must be less than 100 characters').optional(),
    description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
    category: z.enum(['business', 'personal', 'learning', 'health']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    status: z.enum(['pending', 'in-progress', 'completed', 'cancelled']).optional(),
    dueDate: z.date().optional(),
  }),
}

// Session validation schemas
export const sessionSchema = {
  create: z.object({
    mentorshipId: z.string().min(1, 'Mentorship ID is required'),
    title: z.string().max(100, 'Title must be less than 100 characters').optional(),
    description: z.string().max(500, 'Description must be less than 500 characters').optional(),
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().min(1, 'End time is required'),
    sessionType: z.enum(['one-on-one', 'group', 'workshop']).optional().default('one-on-one'),
    location: z.string().max(200, 'Location must be less than 200 characters').optional(),
    isOnline: z.boolean().optional().default(true),
    notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  }),

  update: z.object({
    title: z.string().max(100, 'Title must be less than 100 characters').optional(),
    description: z.string().max(500, 'Description must be less than 500 characters').optional(),
    startTime: z.string().min(1, 'Start time is required').optional(),
    endTime: z.string().min(1, 'End time is required').optional(),
    sessionType: z.enum(['one-on-one', 'group', 'workshop']).optional(),
    location: z.string().max(200, 'Location must be less than 200 characters').optional(),
    isOnline: z.boolean().optional(),
    meetingUrl: z.string().url('Invalid meeting URL').optional(),
    meetingId: z.string().max(100, 'Meeting ID must be less than 100 characters').optional(),
    notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
    recordingUrl: z.string().url('Invalid recording URL').optional(),
    status: z.enum(['scheduled', 'in-progress', 'completed', 'cancelled', 'no-show']).optional(),
  }),
}

// Mentor availability validation schemas
export const mentorAvailabilitySchema = {
  create: z.object({
    dayOfWeek: z.number().int().min(0, 'Day of week must be between 0 (Sunday) and 6 (Saturday)').max(6, 'Day of week must be between 0 (Sunday) and 6 (Saturday)'),
    startTime: z.string().min(1, 'Start time is required').regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:mm format'),
    endTime: z.string().min(1, 'End time is required').regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:mm format'),
    timezone: z.string().min(1, 'Timezone is required').default('UTC'),
    isRecurring: z.boolean().optional().default(true),
    recurringUntil: z.string().optional(),
  }),
}

// Session review validation schemas
export const sessionReviewSchema = {
  create: z.object({
    sessionId: z.string().min(1, 'Session ID is required'),
    rating: z.number().int().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
    comment: z.string().max(500, 'Comment must be less than 500 characters').optional(),
    anonymous: z.boolean().optional().default(false),
  }),
}

// Mentor profile validation schemas
export const mentorProfileSchema = {
  create: z.object({
    expertise: z.array(z.string()).min(1, 'At least one expertise area is required').max(10, 'Maximum 10 expertise areas allowed'),
    experience: z.number().int().min(1, 'Experience must be at least 1 year').max(50, 'Experience must be less than 50 years'),
    company: z.string().max(100, 'Company name must be less than 100 characters').optional(),
    position: z.string().max(100, 'Position must be less than 100 characters').optional(),
    education: z.string().max(200, 'Education must be less than 200 characters').optional(),
    certifications: z.array(z.string()).max(10, 'Maximum 10 certifications allowed').optional(),
    bio: z.string().min(10, 'Bio must be at least 10 characters').max(1000, 'Bio must be less than 1000 characters'),
    hourlyRate: z.number().min(0, 'Hourly rate must be a positive number').max(1000, 'Hourly rate must be less than $1000').optional(),
    availability: z.enum(['available', 'busy', 'unavailable']).optional().default('available'),
    mentorshipType: z.array(z.enum(['one-on-one', 'group', 'coaching'])).min(1, 'At least one mentorship type is required'),
  }),

  update: z.object({
    expertise: z.array(z.string()).min(1, 'At least one expertise area is required').max(10, 'Maximum 10 expertise areas allowed').optional(),
    experience: z.number().int().min(1, 'Experience must be at least 1 year').max(50, 'Experience must be less than 50 years').optional(),
    company: z.string().max(100, 'Company name must be less than 100 characters').optional(),
    position: z.string().max(100, 'Position must be less than 100 characters').optional(),
    education: z.string().max(200, 'Education must be less than 200 characters').optional(),
    certifications: z.array(z.string()).max(10, 'Maximum 10 certifications allowed').optional(),
    bio: z.string().min(10, 'Bio must be at least 10 characters').max(1000, 'Bio must be less than 1000 characters').optional(),
    hourlyRate: z.number().min(0, 'Hourly rate must be a positive number').max(1000, 'Hourly rate must be less than $1000').optional(),
    availability: z.enum(['available', 'busy', 'unavailable']).optional(),
    mentorshipType: z.array(z.enum(['one-on-one', 'group', 'coaching'])).min(1, 'At least one mentorship type is required').optional(),
  }),
}

// Payment validation schemas
export const paymentSchema = {
  create: z.object({
    type: z.enum(['mentorship', 'session']),
    mentorshipId: z.string().optional(),
    sessionId: z.string().optional(),
    amount: z.number().min(0.01, 'Amount must be at least $0.01'),
    currency: z.string().default('USD'),
    description: z.string().max(200, 'Description must be less than 200 characters').optional(),
    returnUrl: z.string().url('Invalid return URL').optional(),
    cancelUrl: z.string().url('Invalid cancel URL').optional(),
  }).refine(data => {
      if (data.type === 'mentorship') {
        return data.mentorshipId !== undefined
      } else if (data.type === 'session') {
        return data.sessionId !== undefined
      }
      return false
    }, {
      message: 'mentorshipId is required for mentorship payments, sessionId is required for session payments',
      path: ['type']
    }),

  process: z.object({
    paymentId: z.string().min(1, 'Payment ID is required'),
    paymentMethod: z.object({
      type: z.enum(['card', 'bank_transfer', 'wallet']),
      card: z.object({
        number: z.string().min(13, 'Card number must be at least 13 digits').max(19, 'Card number must be at most 19 digits'),
        expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Expiry must be in MM/YY format'),
        cvv: z.string().min(3, 'CVV must be at least 3 digits').max(4, 'CVV must be at most 4 digits'),
        name: z.string().min(1, 'Cardholder name is required').max(100, 'Cardholder name must be less than 100 characters'),
      }).optional(),
      bankAccount: z.object({
        accountNumber: z.string().min(8, 'Account number must be at least 8 digits').max(17, 'Account number must be at most 17 digits'),
        routingNumber: z.string().min(9, 'Routing number must be 9 digits').max(9, 'Routing number must be 9 digits'),
        accountHolder: z.string().min(1, 'Account holder name is required').max(100, 'Account holder name must be less than 100 characters'),
      }).optional(),
    }).refine(data => {
      if (data.type === 'card') return data.card !== undefined
      if (data.type === 'bank_transfer') return data.bankAccount !== undefined
      return true
    }, {
      message: 'Card details are required for card payments, bank account details are required for bank transfers',
      path: ['type']
    })
  }),

  refund: z.object({
    amount: z.number().min(0.01, 'Refund amount must be at least $0.01').optional(),
  })
}

// Export all schemas
export const schemas = {
  user: userSchema,
  businessProfile: businessProfileSchema,
  course: courseSchema,
  mentorship: mentorshipSchema,
  funding: fundingSchema,
  community: communitySchema,
  event: eventSchema,
  product: productSchema,
  task: taskSchema,
  session: sessionSchema,
  mentorAvailability: mentorAvailabilitySchema,
  sessionReview: sessionReviewSchema,
  mentorProfile: mentorProfileSchema,
  payment: paymentSchema,
}