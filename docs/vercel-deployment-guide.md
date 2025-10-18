# GirlsPreneur - Vercel Deployment Guide

## 🚀 Quick Start Deployment

### **Prerequisites**
- [x] Git repository with your code
- [x] Vercel account (free tier available)
- [x] GitHub account (for automatic deployments)
- [x] Database (PostgreSQL recommended for production)

---

## 📋 Step 1: Connect to Vercel

### **Method 1: Vercel CLI (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy your project
vercel

# Follow the prompts to configure your project
```

### **Method 2: GitHub Integration**
1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Select your GitHub repository
5. Click "Import"

---

## 🔧 Step 2: Configure Environment Variables

### **Required Environment Variables**
Go to your Vercel project → Settings → Environment Variables and add:

#### **Core Application**
```bash
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_API_URL=https://your-app.vercel.app/api
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-super-secret-key-min-32-chars
```

#### **Database**
```bash
DATABASE_URL=postgresql://user:password@host:port/database
```

#### **Email (Optional)**
```bash
EMAIL_FROM=noreply@your-domain.com
EMAIL_SERVER_HOST=smtp.your-email-provider.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email-username
EMAIL_SERVER_PASSWORD=your-email-password
```

#### **Security**
```bash
CSRF_SECRET=your-super-secret-csrf-key-min-32-chars
ENCRYPTION_KEY=your-super-secret-encryption-key-min-32-chars
```

---

## 🗄️ Step 3: Set Up Database

### **Option 1: Vercel Postgres (Easiest)**
1. In Vercel Dashboard → Storage
2. Click "Create Database"
3. Select "Postgres"
4. Choose your region
5. Copy the connection string to `DATABASE_URL`

### **Option 2: External Database**
```bash
# Example for ElephantSQL
DATABASE_URL=postgresql://user:password@tulip.db.elephantsql.com/database

# Example for Supabase
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.supabase.co:5432/postgres
```

### **Run Database Migrations**
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# (Optional) Seed database
npx prisma db seed
```

---

## 🔌 Step 4: Configure Integrations (Optional)

### **Stripe (Payments)**
```bash
STRIPE_PUBLISHABLE_KEY=pk_test_your-key
STRIPE_SECRET_KEY=sk_test_your-key
STRIPE_WEBHOOK_SECRET=whsec_your-key
```

### **OpenAI (AI Assistant)**
```bash
OPENAI_API_KEY=sk-your-openai-key
```

### **Cloudinary (File Storage)**
```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### **Google OAuth**
```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

## 🎯 Step 5: Deploy

### **Automatic Deployment**
If using GitHub integration, Vercel will automatically deploy on every push to your main branch.

### **Manual Deployment**
```bash
# Deploy to production
vercel --prod

# Deploy to preview URL
vercel
```

---

## 🧪 Step 6: Post-Deployment Setup

### **1. Verify Deployment**
```bash
# Check your deployment
curl https://your-app.vercel.app/api/health

# Check database connection
curl https://your-app.vercel.app/api/database/health
```

### **2. Set Up Webhooks**
- **Stripe**: Configure webhook endpoint at `https://your-app.vercel.app/api/webhooks/stripe`
- **OAuth**: Update callback URLs in Google/LinkedIn developer consoles

### **3. Configure Domain**
1. In Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Follow DNS instructions
4. Wait for SSL certificate issuance

### **4. Test Key Features**
- [ ] User registration and login
- [ ] Email notifications
- [ ] Payment processing
- [ ] File uploads
- [ ] AI assistant
- [ ] Video calls

---

## 📊 Monitoring & Analytics

### **Vercel Analytics**
1. Go to Analytics tab in Vercel Dashboard
2. Enable analytics
3. Add tracking code if needed

### **Error Tracking**
```bash
# Optional: Add Sentry for error tracking
SENTRY_DSN=https://your-sentry-dsn
```

### **Performance Monitoring**
Vercel provides built-in performance monitoring. Check the "Functions" tab for:
- Response times
- Error rates
- Invocation counts

---

## 🔒 Security Best Practices

### **Environment Variables**
- Never commit `.env` files to version control
- Use Vercel's environment variable management
- Rotate secrets regularly
- Use different values for development and production

### **SSL/HTTPS**
- Vercel automatically provides SSL certificates
- Force HTTPS redirects are configured in `vercel.json`

### **Rate Limiting**
```bash
# Configure rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### **CORS Configuration**
CORS is properly configured for API routes in the application.

---

## 🚨 Troubleshooting

### **Common Issues**

#### **1. Build Failures**
```bash
# Check build logs in Vercel dashboard
# Ensure all dependencies are in package.json
# Check for TypeScript errors
```

#### **2. Database Connection Issues**
```bash
# Verify DATABASE_URL is correct
# Check database server status
# Ensure firewall allows Vercel IP addresses
```

#### **3. Environment Variables Not Loading**
```bash
# Double-check variable names
# Ensure variables are set in correct environment (Production/Preview/Development)
# Restart deployment after adding variables
```

#### **4. Authentication Issues**
```bash
# Verify NEXTAUTH_URL matches your deployment URL
# Check NEXTAUTH_SECRET is properly set
# Ensure OAuth callback URLs are correct
```

#### **5. File Upload Issues**
```bash
# Verify Cloudinary credentials
# Check file size limits
# Ensure proper CORS configuration
```

---

## 🔄 CI/CD Pipeline

### **Automatic Deployments**
Vercel automatically creates deployments for:
- Every push to main branch (Production)
- Every push to other branches (Preview)
- Every pull request (Preview)

### **Deployment Hooks**
```bash
# Add to package.json scripts
{
  "scripts": {
    "vercel-build": "npm run build",
    "postbuild": "echo 'Build completed successfully'"
  }
}
```

### **Custom Build Commands**
If you need custom build steps, create `vercel-build.sh`:
```bash
#!/bin/bash
npm install
npx prisma generate
npx prisma db push
npm run build
```

---

## 📈 Performance Optimization

### **Vercel Edge Functions**
Configure routes to run on the edge:
```json
{
  "functions": {
    "app/api/**/*": {
      "maxDuration": 30,
      "runtime": "nodejs18.x"
    }
  }
}
```

### **Caching Strategy**
Vercel automatically caches static assets. Configure custom caching:
```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }
      ]
    }
  ]
}
```

### **Image Optimization**
Vercel automatically optimizes images. Use Next.js Image component:
```jsx
import Image from 'next/image'

<Image
  src="/path/to/image.jpg"
  alt="Description"
  width={500}
  height={300}
  priority
/>
```

---

## 🎛️ Advanced Configuration

### **Custom Domains**
1. Add domain in Vercel Dashboard
2. Configure DNS records
3. Wait for SSL certificate
4. Test domain resolution

### **Multi-Environment Setup**
```bash
# Production
NEXT_PUBLIC_APP_URL=https://your-domain.com
DATABASE_URL=postgresql://prod-db...

# Staging
NEXT_PUBLIC_APP_URL=https://staging.your-domain.com
DATABASE_URL=postgresql://staging-db...

# Development
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgresql://dev-db...
```

### **Feature Flags**
```bash
# Enable/disable features per environment
ENABLE_AI_ASSISTANT=true
ENABLE_VIDEO_CALLS=false
ENABLE_MARKETPLACE=true
```

---

## 📞 Support

### **Vercel Support**
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Status](https://vercel-status.com/)
- [Vercel Community](https://vercel.com/community)

### **GirlsPreneur Support**
- Check the application's built-in health check: `/api/health`
- Review logs in Vercel Dashboard
- Monitor function performance in Analytics tab

---

## 🎉 Success!

Your GirlsPreneur application is now deployed on Vercel! 🚀

### **Next Steps**
1. [ ] Set up custom domain
2. [ ] Configure monitoring and analytics
3. [ ] Test all features thoroughly
4. [ ] Set up backup and recovery procedures
5. [ ] Configure team access and permissions

### **Useful Links**
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Your Application URL](https://your-app.vercel.app)
- [Analytics Dashboard](https://vercel.com/analytics)
- [Project Settings](https://vercel.com/dashboard/settings)

---

**📧 Need Help?**
- Check the troubleshooting section above
- Review Vercel documentation
- Contact your development team

---

**🎯 Pro Tips:**
- Use preview deployments for testing new features
- Monitor performance metrics regularly
- Keep your dependencies updated
- Test deployments in a staging environment first

Happy deploying! 🚀✨