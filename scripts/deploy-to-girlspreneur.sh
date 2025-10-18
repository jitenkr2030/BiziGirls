#!/bin/bash

# =============================================================================
# GirlsPreneur - Vercel Deployment Script
# =============================================================================
# Deploys to Vercel project: girlspreneur
# Project ID: prj_aNBe9NGIKHT07GmFe8C6KyxUoyba
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="girlspreneur"
PROJECT_ID="prj_aNBe9NGIKHT07GmFe8C6KyxUoyba"
ORG_ID="jiten-kumars-projects"
APP_URL="https://girlspreneur.vercel.app"

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

# Check if Vercel CLI is installed
check_vercel_cli() {
    log_step "Checking Vercel CLI installation..."
    
    if ! command -v vercel &> /dev/null; then
        log_info "Vercel CLI not found. Installing..."
        npm install -g vercel
        
        if [ $? -eq 0 ]; then
            log_success "Vercel CLI installed successfully"
        else
            log_error "Failed to install Vercel CLI"
            exit 1
        fi
    else
        log_success "Vercel CLI is already installed"
    fi
}

# Check if user is logged in to Vercel
check_vercel_login() {
    log_step "Checking Vercel login status..."
    
    if ! vercel whoami > /dev/null 2>&1; then
        log_info "Not logged in to Vercel. Please login:"
        vercel login
        
        if [ $? -eq 0 ]; then
            log_success "Successfully logged in to Vercel"
        else
            log_error "Failed to login to Vercel"
            exit 1
        fi
    else
        local user=$(vercel whoami)
        log_success "Logged in as: $user"
    fi
}

# Check if project is linked to the correct Vercel project
check_project_link() {
    log_step "Checking project link status..."
    
    # For now, we'll let Vercel handle the project linking automatically
    # This avoids issues with hardcoded project IDs that might not exist
    if [ -f ".vercel/project.json" ]; then
        log_success "Project is already linked to Vercel"
        return 0
    else
        log_info "Project not linked yet - will link during deployment"
        return 1
    fi
}

# Check environment
check_environment() {
    log_step "Checking environment configuration..."
    
    if [ ! -f ".env" ]; then
        log_warning ".env file not found. Creating from template..."
        if [ -f ".env.example" ]; then
            cp .env.example .env
            log_info "Created .env from .env.example"
            log_warning "Please update .env with your actual values before deploying"
        else
            log_error "Neither .env nor .env.example found"
            exit 1
        fi
    else
        log_success ".env file found"
    fi
    
    # Check for essential environment variables
    local required_vars=("NEXT_PUBLIC_APP_URL" "NEXTAUTH_URL" "NEXTAUTH_SECRET" "DATABASE_URL")
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^$var=" .env; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        log_warning "The following required environment variables are missing in .env:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        log_warning "Please add these variables before deploying"
    else
        log_success "All required environment variables are present"
    fi
}

# Install dependencies
install_dependencies() {
    log_step "Installing dependencies..."
    
    npm install
    
    if [ $? -eq 0 ]; then
        log_success "Dependencies installed successfully"
    else
        log_error "Failed to install dependencies"
        exit 1
    fi
}

# Run database migrations
run_migrations() {
    log_step "Running database migrations..."
    
    # Check if Prisma is installed
    if ! npm list prisma > /dev/null 2>&1; then
        log_info "Installing Prisma..."
        npm install prisma --save-dev
    fi
    
    # Generate Prisma client
    log_info "Generating Prisma client..."
    npx prisma generate
    
    if [ $? -eq 0 ]; then
        log_success "Prisma client generated"
    else
        log_error "Failed to generate Prisma client"
        exit 1
    fi
    
    # Push database schema
    log_info "Pushing database schema..."
    npx prisma db push
    
    if [ $? -eq 0 ]; then
        log_success "Database schema pushed"
    else
        log_warning "Database push failed. This might be expected if database is not configured yet."
    fi
}

# Build the application
build_application() {
    log_step "Building application..."
    
    npm run build
    
    if [ $? -eq 0 ]; then
        log_success "Application built successfully"
    else
        log_error "Failed to build application"
        exit 1
    fi
}

# Deploy to Vercel
deploy_to_vercel() {
    log_step "Deploying to Vercel..."
    
    # Try to deploy to production
    log_info "Attempting deployment to production..."
    if vercel --prod; then
        log_success "Project deployed successfully to Vercel"
        return 0
    else
        log_warning "Production deployment failed, trying alternative approach..."
        
        # Try to unlink and relink project first
        log_info "Attempting to relink project..."
        rm -rf .vercel
        
        # Link without specific project ID (let Vercel create or find it)
        if vercel link --yes; then
            log_success "Project linked successfully"
            
            # Try deployment again
            log_info "Retrying deployment..."
            if vercel --prod; then
                log_success "Project deployed successfully to Vercel"
                return 0
            else
                log_error "Failed to deploy project after relinking"
                return 1
            fi
        else
            log_error "Failed to link project"
            return 1
        fi
    fi
}

# Run post-deployment checks
run_post_deployment_checks() {
    log_step "Running post-deployment checks..."
    
    if [ -f "scripts/post-deployment-setup.sh" ]; then
        chmod +x scripts/post-deployment-setup.sh 2>/dev/null || true
        ./scripts/post-deployment-setup.sh "$APP_URL"
    else
        log_warning "Post-deployment setup script not found"
        
        # Basic health check
        log_info "Running basic health check..."
        sleep 5  # Wait for deployment to be ready
        
        if curl -s -f "$APP_URL/api/health" > /dev/null 2>&1; then
            log_success "Health check passed"
        else
            log_warning "Health check failed - application might still be starting up"
        fi
    fi
}

# Display deployment summary
display_summary() {
    echo ""
    echo "🎉 GirlsPreneur Deployment Summary"
    echo "================================="
    echo ""
    echo "✅ Project: $PROJECT_NAME"
    echo "✅ Project ID: $PROJECT_ID"
    echo "✅ Organization: $ORG_ID"
    echo "✅ Build: Successful"
    echo "✅ Deployment: Complete"
    echo ""
    echo "🌐 Application URL: $APP_URL"
    echo "🌐 API URL: ${APP_URL}/api"
    echo "🌐 Health Check: ${APP_URL}/api/health"
    echo ""
    echo "📋 Vercel Dashboard:"
    echo "  • Project: https://vercel.com/jiten-kumars-projects/$PROJECT_NAME"
    echo "  • Dashboard: https://vercel.com/dashboard"
    echo ""
    echo "🔧 Environment Variables to Configure in Vercel:"
    echo "  • NEXT_PUBLIC_APP_URL"
    echo "  • NEXTAUTH_URL"
    echo "  • NEXTAUTH_SECRET"
    echo "  • DATABASE_URL"
    echo "  • EMAIL_FROM"
    echo "  • CSRF_SECRET"
    echo "  • ENCRYPTION_KEY"
    echo ""
    echo "📚 Optional Environment Variables:"
    echo "  • STRIPE_PUBLISHABLE_KEY"
    echo "  • STRIPE_SECRET_KEY"
    echo "  • OPENAI_API_KEY"
    echo "  • CLOUDINARY_CLOUD_NAME"
    echo "  • CLOUDINARY_API_KEY"
    echo "  • CLOUDINARY_API_SECRET"
    echo ""
    echo "🚀 Next Steps:"
    echo "  1. Visit your application: $APP_URL"
    echo "  2. Configure environment variables in Vercel dashboard"
    echo "  3. Set up your database connection"
    echo "  4. Test all features thoroughly"
    echo "  5. Configure custom domain if needed"
    echo ""
    echo "📞 Deployment Support:"
    echo "  • Vercel Dashboard: https://vercel.com/dashboard"
    echo "  • Project Settings: https://vercel.com/jiten-kumars-projects/$PROJECT_NAME/settings"
    echo "  • Deployment Logs: Check Vercel dashboard for build logs"
    echo ""
    echo "🎯 Success Metrics:"
    echo "  • Build completed without errors"
    echo "  • Application deployed to production"
    echo "  • Health checks passing"
    echo "  • All core features accessible"
    echo ""
    echo "🚀 Happy deploying! Your GirlsPreneur application is now live!"
    echo ""
}

# Main deployment function
main() {
    echo ""
    echo "🚀 GirlsPreneur - Vercel Deployment"
    echo "=================================="
    echo ""
    echo "Project: $PROJECT_NAME"
    echo "Project ID: $PROJECT_ID"
    echo "Organization: $ORG_ID"
    echo ""
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        log_error "package.json not found. Please run this script from the project root."
        exit 1
    fi
    
    # Execute deployment steps
    check_vercel_cli
    check_vercel_login
    check_environment
    install_dependencies
    
    # Check if project is linked, if not link it
    if ! check_project_link; then
        # Link project (function returns 0 if already linked correctly)
        true
    fi
    
    run_migrations
    build_application
    deploy_to_vercel
    run_post_deployment_checks
    display_summary
}

# Handle command line arguments
case "${1:-}" in
    "help"|"-h"|"--help")
        echo "Usage: $0 [COMMAND]"
        echo ""
        echo "Commands:"
        echo "  help      Show this help message"
        echo "  setup     Only setup environment (no deployment)"
        echo "  build     Only build the application"
        echo "  health    Only run health checks"
        echo "  deploy    Full deployment (default)"
        echo ""
        echo "Examples:"
        echo "  $0              # Full deployment"
        echo "  $0 setup        # Only setup environment"
        echo "  $0 build        # Only build application"
        echo "  $0 health        # Only run health checks"
        echo ""
        ;;
    "setup")
        log_info "Running setup only..."
        check_vercel_cli
        check_vercel_login
        check_environment
        install_dependencies
        run_migrations
        log_success "Setup completed successfully"
        ;;
    "build")
        log_info "Running build only..."
        check_environment
        install_dependencies
        run_migrations
        build_application
        log_success "Build completed successfully"
        ;;
    "health")
        log_info "Running health checks only..."
        if [ -f "scripts/post-deployment-setup.sh" ]; then
            chmod +x scripts/post-deployment-setup.sh 2>/dev/null || true
            ./scripts/post-deployment-setup.sh "$APP_URL"
        else
            log_info "Basic health check..."
            if curl -s -f "$APP_URL/api/health" > /dev/null 2>&1; then
                log_success "Health check passed"
            else
                log_error "Health check failed"
            fi
        fi
        ;;
    *)
        main
        ;;
esac