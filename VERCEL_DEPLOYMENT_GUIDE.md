# 🚀 GirlsPreneur Vercel Deployment Guide

## **Project Configuration**
- **Project Name**: `girlspreneur`
- **Project ID**: `prj_aNBe9NGIKHT07GmFe8C6KyxUoyba`
- **Organization**: `jiten-kumars-projects`
- **Repository**: `https://github.com/jitenkr2030/BiziGirls.git`
- **Branch**: `main`

---

## **🎯 Quick Start - One Command Deployment**

```bash
# Run the automated deployment script
./scripts/deploy-to-girlspreneur.sh
```

This script will:
- ✅ Check Vercel CLI installation
- ✅ Login to Vercel (if needed)
- ✅ Link to the correct project
- ✅ Install dependencies
- ✅ Run database migrations
- ✅ Build the application
- ✅ Deploy to Vercel
- ✅ Run post-deployment health checks

---

## **🔧 Manual Deployment Steps**

### **Step 1: Install Vercel CLI**
```bash
npm install -g vercel
```

### **Step 2: Login to Vercel**
```bash
vercel login
```

### **Step 3: Link to Project**
```bash
# Link to the specific GirlsPreneur project
vercel link --project-id=prj_aNBe9NGIKHT07GmFe8C6KyxUoyba
```

### **Step 4: Set Environment Variables**
In your Vercel dashboard, add these required environment variables:

#### **Required Variables**
```bash
NEXT_PUBLIC_APP_URL=https://girlspreneur.vercel.app
NEXT_PUBLIC_API_URL=https://girlspreneur.vercel.app/api
NEXTAUTH_URL=https://girlspreneur.vercel.app
NEXTAUTH_SECRET=your-super-secret-nextauth-key-min-32-chars
DATABASE_URL=postgresql://user:password@host:port/database
EMAIL_FROM=noreply@girlspreneur.com
CSRF_SECRET=your-super-secret-csrf-key-min-32-chars
ENCRYPTION_KEY=your-super-secret-encryption-key-min-32-chars
```

#### **Optional Variables (for full features)**
```bash
# Stripe (Payments)
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# OpenAI (AI Assistant)
OPENAI_API_KEY=sk-your-openai-key

# Cloudinary (File Storage)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Redis (Caching)
REDIS_URL=redis://your-redis-host:6379
```

### **Step 5: Deploy**
```bash
# Deploy to production
vercel --prod
```

---

## **🗄️ Database Setup**

### **Option 1: Vercel Postgres (Recommended)**
1. Go to Vercel Dashboard → Storage
2. Click "Create Database" → "Postgres"
3. Choose the same region as your project
4. Copy the connection string to `DATABASE_URL`

### **Option 2: External Database**
```bash
# PostgreSQL examples
DATABASE_URL=postgresql://user:password@host:port/database
DATABASE_URL=postgres://user:password@db.example.com:5432/dbname

# SQLite (for development)
DATABASE_URL=file:./dev.db
```

### **Run Database Migrations**
```bash
# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# (Optional) Seed database
npx prisma db seed
```

---

## **🔍 Post-Deployment Checks**

### **Run Health Checks**
```bash
# Automated health check script
./scripts/post-deployment-setup.sh https://girlspreneur.vercel.app

# Manual health checks
curl https://girlspreneur.vercel.app/api/health
curl https://girlspreneur.vercel.app/api/database/health
```

### **Test Key Features**
- [ ] User registration and login
- [ ] Dashboard access
- [ ] Course browsing
- [ ] Navigation between pages
- [ ] Footer links working
- [ ] Environment variables loaded

---

## **📊 Vercel Project Details**

### **Project Information**
- **Dashboard**: https://vercel.com/jiten-kumars-projects/girlspreneur
- **Settings**: https://vercel.com/jiten-kumars-projects/girlspreneur/settings
- **Analytics**: https://vercel.com/jiten-kumars-projects/girlspreneur/analytics

### **Deployment URLs**
- **Production**: https://girlspreneur.vercel.app
- **API Base**: https://girlspreneur.vercel.app/api
- **Health Check**: https://girlspreneur.vercel.app/api/health

### **Configuration Files**
- **vercel.json**: Main Vercel configuration
- **next.config.vercel.js**: Vercel-specific Next.js config
- **vercel-project.json**: Project-specific settings

---

## **🚨 Troubleshooting**

### **Build Failures**
```bash
# Check build logs in Vercel dashboard
# Ensure all dependencies are in package.json
# Run build locally first: npm run build
```

### **Environment Variable Issues**
```bash
# Verify all required variables are set
# Check for typos in variable names
# Ensure secret keys meet minimum length requirements
```

### **Database Connection Issues**
```bash
# Verify DATABASE_URL is correct
# Check database server status
# Ensure firewall allows Vercel IP addresses
```

### **Authentication Issues**
```bash
# Verify NEXTAUTH_URL matches deployment URL
# Check NEXTAUTH_SECRET is properly set
# Ensure OAuth callback URLs are correct
```

### **Common Error Messages**
- **"Neither apiKey nor config.authenticator provided"**: Fixed with Stripe initialization updates
- **"Environment validation failed"**: Fixed with config schema updates
- **"Build failed"**: Check Vercel build logs for specific errors

---

## **🔒 Security Configuration**

### **Environment Variables Security**
- Never commit `.env` files to version control
- Use Vercel's environment variable management
- Rotate secrets regularly
- Use different values for development and production

### **Headers and Security**
The application includes security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### **SSL/HTTPS**
- Vercel automatically provides SSL certificates
- All traffic is redirected to HTTPS
- Custom domains automatically get SSL certificates

---

## **📈 Monitoring and Analytics**

### **Vercel Analytics**
1. Go to Analytics tab in Vercel Dashboard
2. Enable analytics for your project
3. Monitor performance and user behavior

### **Health Monitoring**
- Health check endpoint: `/api/health`
- Database health check: `/api/database/health`
- Automatic health checks configured in vercel.json

### **Error Tracking**
Consider adding Sentry for error tracking:
```bash
SENTRY_DSN=https://your-sentry-dsn
```

---

## **🎛️ Advanced Configuration**

### **Custom Domain**
1. In Vercel Dashboard → Settings → Domains
2. Add your custom domain (e.g., `your-domain.com`)
3. Follow DNS instructions provided by Vercel
4. Update environment variables:
   ```bash
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   NEXTAUTH_URL=https://your-domain.com
   ```

### **Environment-Specific Configurations**
```bash
# Development
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Staging
NODE_ENV=staging
NEXT_PUBLIC_APP_URL=https://staging-girlspreneur.vercel.app

# Production
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://girlspreneur.vercel.app
```

### **Feature Flags**
```bash
ENABLE_AI_ASSISTANT=true
ENABLE_VIDEO_CALLS=true
ENABLE_MARKETPLACE=true
ENABLE_MENTORSHIP=true
ENABLE_NETWORKING=true
```

---

## **🔄 CI/CD Pipeline**

### **Automatic Deployments**
The project is configured for automatic deployments:
- **Main Branch**: Auto-deploys to production
- **Pull Requests**: Creates preview deployments
- **Push to Main**: Triggers production deployment

### **GitHub Integration**
1. Repository: `https://github.com/jitenkr2030/BiziGirls`
2. Branch: `main`
3. Automatic deployment on push

### **Webhook Configuration**
- Stripe webhook: `/api/webhooks/stripe`
- Configure in Stripe dashboard with production URL

---

## **🎉 Success Checklist**

### **Post-Deployment Checklist**
- [ ] Application loads at https://girlspreneur.vercel.app
- [ ] Health checks pass (200 status)
- [ ] Database connection is working
- [ ] User registration works
- [ ] Login functionality works
- [ ] Navigation between pages works
- [ ] Footer links are functional
- [ ] Environment variables are loaded
- [ ] No console errors in browser

### **Production Readiness**
- [ ] All required environment variables set
- [ ] Database properly configured
- [ ] SSL certificate active
- [ ] Custom domain configured (optional)
- [ ] Monitoring set up
- [ ] Error tracking configured (optional)
- [ ] Backup procedures in place

---

## **📞 Support and Resources**

### **Vercel Support**
- **Dashboard**: https://vercel.com/dashboard
- **Documentation**: https://vercel.com/docs
- **Status**: https://vercel-status.com/
- **Community**: https://vercel.com/community

### **Project-Specific Support**
- **Repository**: https://github.com/jitenkr2030/BiziGirls
- **Issues**: Create GitHub issue for bugs
- **Documentation**: Check `/docs` folder
- **Scripts**: Use automated scripts in `/scripts` folder

### **Quick Commands**
```bash
# Development
npm run dev

# Build
npm run build

# Deploy
./scripts/deploy-to-girlspreneur.sh

# Health check
curl https://girlspreneur.vercel.app/api/health
```

---

## **🎯 Deployment Success!**

Your GirlsPreneur application is now deployed on Vercel! 🚀

**Next Steps**:
1. Visit https://girlspreneur.vercel.app
2. Configure all environment variables in Vercel dashboard
3. Set up your database connection
4. Test all features thoroughly
5. Configure custom domain if needed
6. Set up monitoring and analytics

**Important Links**:
- **Application**: https://girlspreneur.vercel.app
- **Vercel Dashboard**: https://vercel.com/jiten-kumars-projects/girlspreneur
- **GitHub Repository**: https://github.com/jitenkr2030/BiziGirls

**🎊 Congratulations! Your GirlsPreneur application is now live and ready for users!**