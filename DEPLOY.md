# 🚀 GirlsPreneur - Quick Vercel Deployment

## **One-Command Deployment**

```bash
# Method 1: Automated Script (Recommended)
./scripts/deploy-to-vercel.sh

# Method 2: Manual Deployment
npm install
vercel login
vercel --prod
```

## **Prerequisites**

- [x] Node.js 18+ installed
- [x] Vercel account (free)
- [x] Git repository with your code

## **Environment Variables**

### **Required (Add to Vercel Dashboard)**
```bash
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-super-secret-key-min-32-chars
DATABASE_URL=postgresql://user:password@host:port/database
EMAIL_FROM=noreply@your-domain.com
CSRF_SECRET=your-super-secret-csrf-key-min-32-chars
ENCRYPTION_KEY=your-super-secret-encryption-key-min-32-chars
```

### **Optional (For Full Features)**
```bash
# Stripe (Payments)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# OpenAI (AI Assistant)
OPENAI_API_KEY=sk-...

# Cloudinary (File Storage)
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-id
GOOGLE_CLIENT_SECRET=your-google-secret
```

## **Database Setup**

### **Option 1: Vercel Postgres (Easiest)**
1. Go to Vercel Dashboard → Storage
2. Click "Create Database" → "Postgres"
3. Copy connection string to `DATABASE_URL`

### **Option 2: External Database**
```bash
# Examples:
DATABASE_URL=postgresql://user:pass@db.example.com:5432/dbname
DATABASE_URL=postgres://user:password@host:port/database
```

## **Post-Deployment**

### **Run Health Checks**
```bash
# After deployment, run the setup script
./scripts/post-deployment-setup.sh https://your-app.vercel.app
```

### **Manual Health Checks**
```bash
# Check if app is running
curl https://your-app.vercel.app/api/health

# Check database connection
curl https://your-app.vercel.app/api/database/health
```

## **Custom Domain**

1. **In Vercel Dashboard**:
   - Settings → Domains
   - Add your domain (e.g., `your-domain.com`)
   - Follow DNS instructions

2. **Update Environment Variables**:
   ```bash
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   NEXTAUTH_URL=https://your-domain.com
   ```

## **Troubleshooting**

### **Common Issues**
- **Build Failures**: Check `npm run build` locally first
- **Database Connection**: Verify `DATABASE_URL` is correct
- **Environment Variables**: Ensure all required vars are set in Vercel
- **Authentication**: Check `NEXTAUTH_URL` matches your deployment URL

### **Get Help**
- Check `docs/vercel-deployment-guide.md` for detailed guide
- Review Vercel build logs
- Test deployment locally with `vercel dev`

## **Success! 🎉**

Your GirlsPreneur application is now live! 

**Next Steps**:
1. Visit your deployment URL
2. Test user registration and login
3. Configure payment processing (if needed)
4. Set up monitoring and analytics
5. Test all features thoroughly

---

**📁 Deployment Files Created**:
- `vercel.json` - Vercel configuration
- `.env.example` - Environment variables template
- `docs/vercel-deployment-guide.md` - Detailed deployment guide
- `scripts/deploy-to-vercel.sh` - Automated deployment script
- `scripts/post-deployment-setup.sh` - Post-deployment health checks
- `next.config.vercel.js` - Vercel-specific Next.js config

**🚀 Deploy Now**: `./scripts/deploy-to-vercel.sh`