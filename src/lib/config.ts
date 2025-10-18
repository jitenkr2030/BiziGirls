import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'staging']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().or(z.string().default('http://localhost:3000')),
  NEXT_PUBLIC_API_URL: z.string().url().or(z.string().default('http://localhost:3000/api')),
  DATABASE_URL: z.string().url().or(z.string().default('file:./dev.db')),
  NEXTAUTH_URL: z.string().url().or(z.string().default('http://localhost:3000')),
  NEXTAUTH_SECRET: z.string().min(32).or(z.string().default('your-nextauth-secret-key-here-min-32-chars-required')),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  LINKEDIN_CLIENT_ID: z.string().optional(),
  LINKEDIN_CLIENT_SECRET: z.string().optional(),
  EMAIL_SERVER_HOST: z.string().optional(),
  EMAIL_SERVER_PORT: z.coerce.number().optional(),
  EMAIL_SERVER_USER: z.string().optional(),
  EMAIL_SERVER_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().email().or(z.string().default('noreply@localhost')),
  REDIS_URL: z.string().url().or(z.string().default('redis://localhost:6379')),
  CLOUD_PROVIDER: z.enum(['local', 'aws', 'cloudinary']).default('local'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  ZOOM_API_KEY: z.string().optional(),
  ZOOM_API_SECRET: z.string().optional(),
  ZOOM_WEBHOOK_SECRET: z.string().optional(),
  GOOGLE_ANALYTICS_ID: z.string().optional(),
  POSTHOG_API_KEY: z.string().optional(),
  POSTHOG_HOST: z.string().url().optional(),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  CSRF_SECRET: z.string().min(32).or(z.string().default('your-csrf-secret-key-here-min-32-chars-required')),
  ENCRYPTION_KEY: z.string().min(32).or(z.string().default('your-encryption-key-here-min-32-chars-required')),
  SENTRY_DSN: z.string().url().optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  MAX_FILE_SIZE: z.coerce.number().default(10485760),
  ALLOWED_FILE_TYPES: z.string().default('jpg,jpeg,png,pdf,doc,docx'),
  ENABLE_DEV_TOOLS: z.coerce.boolean().default(false),
  ENABLE_MOCK_DATA: z.coerce.boolean().default(false),
  ENABLE_DEBUG_LOGS: z.coerce.boolean().default(false),
})

export function validateEnv() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    console.error('Environment validation failed:', error)
    process.exit(1)
  }
}

export const env = validateEnv()

export const isDevelopment = env.NODE_ENV === 'development'
export const isProduction = env.NODE_ENV === 'production'
export const isStaging = env.NODE_ENV === 'staging'

export const config = {
  app: {
    url: env.NEXT_PUBLIC_APP_URL,
    apiUrl: env.NEXT_PUBLIC_API_URL,
    env: env.NODE_ENV,
  },
  database: {
    url: env.DATABASE_URL,
  },
  auth: {
    url: env.NEXTAUTH_URL,
    secret: env.NEXTAUTH_SECRET,
    bcryptRounds: 12,
    jwtSecret: env.NEXTAUTH_SECRET,
    jwtExpiresIn: '7d',
  },
  oauth: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
    linkedin: {
      clientId: env.LINKEDIN_CLIENT_ID,
      clientSecret: env.LINKEDIN_CLIENT_SECRET,
    },
  },
  email: {
    host: env.EMAIL_SERVER_HOST,
    port: env.EMAIL_SERVER_PORT,
    user: env.EMAIL_SERVER_USER,
    password: env.EMAIL_SERVER_PASSWORD,
    from: env.EMAIL_FROM,
  },
  redis: {
    url: env.REDIS_URL,
  },
  cloud: {
    provider: env.CLOUD_PROVIDER,
    aws: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      region: env.AWS_REGION,
      bucket: env.AWS_S3_BUCKET,
    },
  },
  payments: {
    stripe: {
      publishableKey: env.STRIPE_PUBLISHABLE_KEY,
      secretKey: env.STRIPE_SECRET_KEY,
      webhookSecret: env.STRIPE_WEBHOOK_SECRET,
    },
  },
  video: {
    zoom: {
      apiKey: env.ZOOM_API_KEY,
      apiSecret: env.ZOOM_API_SECRET,
      webhookSecret: env.ZOOM_WEBHOOK_SECRET,
    },
  },
  analytics: {
    googleAnalyticsId: env.GOOGLE_ANALYTICS_ID,
    posthog: {
      apiKey: env.POSTHOG_API_KEY,
      host: env.POSTHOG_HOST,
    },
  },
  ai: {
    openai: {
      apiKey: env.OPENAI_API_KEY,
    },
    anthropic: {
      apiKey: env.ANTHROPIC_API_KEY,
    },
  },
  security: {
    csrfSecret: env.CSRF_SECRET,
    encryptionKey: env.ENCRYPTION_KEY,
  },
  monitoring: {
    sentryDsn: env.SENTRY_DSN,
    logLevel: env.LOG_LEVEL,
  },
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },
  upload: {
    maxFileSize: env.MAX_FILE_SIZE,
    allowedFileTypes: env.ALLOWED_FILE_TYPES.split(','),
  },
  features: {
    devTools: env.ENABLE_DEV_TOOLS,
    mockData: env.ENABLE_MOCK_DATA,
    debugLogs: env.ENABLE_DEBUG_LOGS,
  },
}

// Export configuration getter functions
export function getCacheConfig() {
  return {
    defaultTtl: 3600, // 1 hour
    maxEntries: 1000,
    strategy: 'lru',
  }
}

export function getUploadConfig() {
  return {
    maxFileSize: env.MAX_FILE_SIZE,
    allowedFileTypes: env.ALLOWED_FILE_TYPES.split(','),
    provider: env.CLOUD_PROVIDER,
    s3: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      region: env.AWS_REGION,
      bucket: env.AWS_S3_BUCKET,
    },
    cloudinary: {
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      apiKey: env.CLOUDINARY_API_KEY,
      apiSecret: env.CLOUDINARY_API_SECRET,
    },
  }
}

export function getEmailConfig() {
  return {
    smtp: {
      host: env.EMAIL_SERVER_HOST,
      port: env.EMAIL_SERVER_PORT,
      user: env.EMAIL_SERVER_USER,
      password: env.EMAIL_SERVER_PASSWORD,
      from: env.EMAIL_FROM,
    },
  }
}