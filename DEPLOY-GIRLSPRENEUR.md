# 🚀 GirlsPreneur - Vercel Deployment Guide

## **Project Information**
- **Project Name**: girlspreneur
- **Project ID**: `prj_aNBe9NGIKHT07GmFe8C6KyxUoyba`
- **Organization**: jiten-kumars-projects
- **URL**: https://girlspreneur.vercel.app
- **Repository**: https://github.com/jitenkr2030/BiziGirls.git

---

## **🎯 Quick Deployment**

### **Method 1: Automated Script (Recommended)**
```bash
# Run the deployment script
./scripts/deploy-to-girlspreneur.sh
```

### **Method 2: Vercel CLI**
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link to project
vercel link --project-id=prj_aNBe9NGIKHT07GmFe8C6KyxUoyba

# Deploy to production
vercel --prod
```

### **Method 3: GitHub Integration (Auto-deploy)**
1. ✅ **Repository already connected**: https://github.com/jitenkr2030/BiziGirls.git
2. ✅ **Project already configured**: girlspreneur on Vercel
3. **Push changes to master branch** → Auto-deploys to Vercel

---

## **🔧 Required Environment Variables**

### **Add to Vercel Dashboard** → **Settings** → **Environment Variables**

#### **Core Application (Required)**
```bash
NEXT_PUBLIC_APP_URL=https://girlspreneur.vercel.app
NEXT_PUBLIC_API_URL=https://girlspreneur.vercel.app/api
NEXTAUTH_URL=https://girlspreneur.vercel.app
NEXTAUTH_SECRET=your-super-secret-key-min-32-chars-required
DATABASE_URL=postgresql://user:password@host:port/database
EMAIL_FROM=noreply@girlspreneur.com
CSRF_SECRET=your-super-secret-csrf-key-min-32-chars-required
ENCRYPTION_KEY=your-super-secret-encryption-key-min-32-chars-required
```

#### **Payment Features (Optional)**
```bash
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
```

#### **AI Features (Optional)**
```bash
OPENAI_API_KEY=sk-your-openai-api-key
```

#### **File Storage (Optional)**
```bash
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

#### **Social Login (Optional)**
```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
```

---

## **🗄️ Database Setup**

### **Option 1: Vercel Postgres (Recommended)**
1. Go to **Vercel Dashboard** → **Storage**
2. Click **"Create Database"**
3. Select **"Postgres"**
4. Choose your region (closest to your users)
5. Copy connection string to `DATABASE_URL`

**Example:**
```bash
DATABASE_URL=postgresql://user:password@host-identifier.region.aws.neon.tech/database?sslmode=require
```

### **Option 2: External Database**
```bash
# ElephantSQL
DATABASE_URL=postgresql://user:password@tulip.db.elephantsql.com/database

# Supabase
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.supabase.co:5432/postgres

# Railway
DATABASE_URL=postgresql://postgres:password@containers.railway.app:port/railway
```

---

## **🚀 Deployment Steps**

### **1. Initial Setup**
```bash
# Clone repository
git clone https://github.com/jitenkr2030/BiziGirls.git
cd BiziGirls

# Install dependencies
npm install

# Run deployment script
./scripts/deploy-to-girlspreneur.sh
```

### **2. Configure Environment Variables**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select **"girlspreneur"** project
3. Go to **Settings** → **Environment Variables**
4. Add all required variables from above
5. Click **"Save"** and **"Redeploy"**

### **3. Database Migration**
The deployment script automatically runs:
```bash
npx prisma generate
npx prisma db push
```

### **4. Verify Deployment**
```bash
# Check health endpoint
curl https://girlspreneur.vercel.app/api/health

# Check database connection
curl https://girlspreneur.vercel.app/api/database/health
```

---

## **🔍 Post-Deployment Verification**

### **Health Checks**
```bash
# Application health
curl https://girlspreneur.vercel.app/api/health

# Database health
curl https://girlspreneur.vercel.app/api/database/health

# Main page
curl -I https://girlspreneur.vercel.app/
```

### **Key Endpoints to Test**
- **Home Page**: https://girlspreneur.vercel.app/
- **API Health**: https://girlspreneur.vercel.app/api/health
- **Database Health**: https://girlspreneur.vercel.app/api/database/health
- **Auth Login**: https://girlspreneur.vercel.app/auth/login
- **Dashboard**: https://girlspreneur.vercel.app/dashboard
- **About Page**: https://girlspreneur.vercel.app/about
- **Contact Page**: https://girlspreneur.vercel.app/contact
- **Careers Page**: https://girlspreneur.vercel.app/careers
- **Resources Page**: https://girlspreneur.vercel.app/resources

---

## **🎨 Custom Domain Setup**

### **1. Add Domain in Vercel**
1. Go to **Vercel Dashboard** → **girlspreneur** project
2. **Settings** → **Domains**
3. Add your domain (e.g., `your-domain.com`)
4. Follow DNS instructions provided

### **2. Update Environment Variables**
```bash
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXTAUTH_URL=https://your-domain.com
```

### **3. DNS Configuration**
```
Type    Name    Value
A       @       76.76.21.21
A       www     76.76.21.21
CNAME   api     cname.vercel-dns.com
```

---

## **📊 Monitoring & Analytics**

### **Vercel Dashboard**
- **URL**: https://vercel.com/jiten-kumars-projects/girlspreneur
- **Features**: Build logs, analytics, functions, cron jobs
- **Monitoring**: Real-time metrics and error tracking

### **Health Check Endpoints**
```bash
# Application health
https://girlspreneur.vercel.app/api/health

# Database connectivity
https://girlspreneur.vercel.app/api/database/health

# System metrics
https://girlspreneur.vercel.app/api/admin/analytics (admin only)
```

### **Cron Jobs**
- **Health Check**: Every 6 hours
- **Session Cleanup**: Daily at 2 AM UTC
- **Database Backup**: Weekly on Sunday at 3 AM UTC

---

## **🚨 Troubleshooting**

### **Common Issues**

#### **Build Failures**
```bash
# Check build logs in Vercel dashboard
# Verify all dependencies are in package.json
# Check for TypeScript errors
```

#### **Database Connection Issues**
```bash
# Verify DATABASE_URL is correct
# Check database server status
# Ensure firewall allows Vercel IP addresses
```

#### **Environment Variables Not Loading**
```bash
# Double-check variable names in Vercel dashboard
# Ensure variables are set in Production environment
# Restart deployment after adding variables
```

#### **Authentication Issues**
```bash
# Verify NEXTAUTH_URL matches deployment URL
# Check NEXTAUTH_SECRET is properly set
# Ensure OAuth callback URLs are correct
```

#### **Stripe Integration Issues**
```bash
# Verify STRIPE_SECRET_KEY is correct
# Check Stripe webhook configuration
# Ensure webhook endpoint is accessible
```

### **Get Help**
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Vercel Status**: https://vercel-status.com/
- **Project Logs**: Check Vercel dashboard for build errors
- **GitHub Issues**: https://github.com/jitenkr2030/BiziGirls/issues

---

## **🔄 CI/CD Pipeline**

### **Automatic Deployments**
The project is configured for automatic deployments:
- **Push to `master`** → Deploys to **Production**
- **Push to other branches** → Creates **Preview deployments**
- **Pull requests** → Creates **Preview deployments**

### **Manual Deployment**
```bash
# Deploy to production
vercel --prod

# Deploy to preview URL
vercel
```

### **Custom Deployment Script**
```bash
# Full deployment with health checks
./scripts/deploy-to-girlspreneur.sh

# Setup only
./scripts/deploy-to-girlspreneur.sh setup

# Build only
./scripts/deploy-to-girlspreneur.sh build

# Health checks only
./scripts/deploy-to-girlspreneur.sh health
```

---

## **📈 Performance Optimization**

### **Vercel Features Enabled**
- ✅ **Edge Functions**: API routes run on edge
- ✅ **Image Optimization**: Automatic image optimization
- ✅ **Caching**: Proper cache headers configured
- ✅ **Compression**: Brotli compression enabled
- ✅ **HTTP/2**: Modern protocol support

### **Performance Tips**
1. **Images**: Use Next.js Image component
2. **Fonts**: Optimize font loading
3. **CSS**: Minimize CSS bundle size
4. **JavaScript**: Code splitting and lazy loading
5. **Database**: Use connection pooling

---

## **🔒 Security Configuration**

### **Security Headers**
- **X-Content-Type-Options**: nosniff
- **X-Frame-Options**: DENY
- **X-XSS-Protection**: 1; mode=block
- **Referrer-Policy**: strict-origin-when-cross-origin

### **Environment Security**
- ✅ **Never commit** `.env` files
- ✅ **Use Vercel** environment variable management
- ✅ **Rotate secrets** regularly
- ✅ **Different keys** for development and production

### **Rate Limiting**
```bash
# Configured in application
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

---

## **📞 Support & Resources**

### **Documentation**
- **Deployment Guide**: This file
- **API Documentation**: `/api/docs` (when enabled)
- **Environment Variables**: `.env.example`
- **Vercel Docs**: https://vercel.com/docs

### **Quick Links**
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Project URL**: https://girlspreneur.vercel.app
- **GitHub Repository**: https://github.com/jitenkr2030/BiziGirls
- **Project Settings**: https://vercel.com/jiten-kumars-projects/girlspreneur/settings

### **Contact Support**
- **Vercel Support**: https://vercel.com/support
- **GitHub Issues**: https://github.com/jitenkr2030/BiziGirls/issues
- **Email**: Configure in environment variables

---

## **🎉 Success!**

Your GirlsPreneur application is now deployed and ready for use!

### **Next Steps**
1. ✅ **Visit your application**: https://girlspreneur.vercel.app
2. ✅ **Configure environment variables** in Vercel dashboard
3. ✅ **Set up database connection**
4. ✅ **Test user registration and login**
5. ✅ **Configure payment processing** (if needed)
6. ✅ **Set up monitoring and analytics**
7. ✅ **Test all features thoroughly**

### **Deployment Checklist**
- [ ] Application builds successfully
- [ ] All environment variables configured
- [ ] Database connection working
- [ ] User authentication functional
- [ ] Core features working
- [ ] Performance optimized
- [ ] Security headers configured
- [ ] Monitoring set up
- [ ] Custom domain configured (optional)

---

**🚀 Your GirlsPreneur application is live and ready for users!**

**📧 Need help?** Check the troubleshooting section or contact support.

**🎯 Pro Tip**: Use preview deployments for testing new features before deploying to production.

---

**📊 Project Summary**:
- **Framework**: Next.js 15 with TypeScript
- **Deployment**: Vercel with automatic CI/CD
- **Database**: PostgreSQL (Vercel Postgres recommended)
- **Authentication**: NextAuth.js
- **UI**: shadcn/ui with Tailwind CSS
- **Features**: E-commerce, AI assistant, mentorship, networking, courses

**🌟 Happy deploying!** ✨