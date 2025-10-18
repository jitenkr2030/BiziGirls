#!/bin/bash

# =============================================================================
# GirlsPreneur - One-Click Vercel Deployment Script
# =============================================================================
# This script automates the entire deployment process to Vercel
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
VERCEL_ORG=""  # Leave empty for personal account
FRAMEWORK="nextjs"

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

log_code() {
    echo -e "${CYAN}[CODE]${NC} $1"
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

# Check if project is already linked to Vercel
check_project_link() {
    log_step "Checking project link status..."
    
    if [ -f ".vercel" ]; then
        log_success "Project is already linked to Vercel"
        return 0
    else
        log_info "Project is not linked to Vercel"
        return 1
    fi
}

# Link project to Vercel
link_project() {
    log_step "Linking project to Vercel..."
    
    vercel link
    
    if [ $? -eq 0 ]; then
        log_success "Project linked successfully"
    else
        log_error "Failed to link project"
        exit 1
    fi
}

# Check environment variables
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
    
    # Check if this is the first deployment
    if [ ! -f ".vercel/project.json" ]; then
        log_info "First deployment detected. Setting up project..."
        
        # Deploy with project setup
        vercel --prod --yes
        
        if [ $? -eq 0 ]; then
            log_success "Project deployed successfully"
        else
            log_error "Failed to deploy project"
            exit 1
        fi
    else
        # Regular deployment
        vercel --prod
        
        if [ $? -eq 0 ]; then
            log_success "Project deployed successfully"
        else
            log_error "Failed to deploy project"
            exit 1
        fi
    fi
}

# Get deployment URL
get_deployment_url() {
    log_step "Getting deployment URL..."
    
    if [ -f ".vercel/project.json" ]; then
        local project_id=$(jq -r '.projectId' .vercel/project.json 2>/dev/null || echo "")
        local org_id=$(jq -r '.orgId' .vercel/project.json 2>/dev/null || echo "")
        
        if [ ! -z "$project_id" ]; then
            # Try to get the production URL
            local deployment_url=$(vercel ls --prod 2>/dev/null | grep "$PROJECT_NAME" | head -1 | awk '{print $2}')
            
            if [ ! -z "$deployment_url" ]; then
                DEPLOYMENT_URL="$deployment_url"
                log_success "Deployment URL: $DEPLOYMENT_URL"
                return 0
            fi
        fi
    fi
    
    log_warning "Could not determine deployment URL automatically"
    return 1
}

# Run post-deployment checks
run_post_deployment_checks() {
    log_step "Running post-deployment checks..."
    
    if [ ! -z "$DEPLOYMENT_URL" ]; then
        log_info "Running post-deployment setup script..."
        
        if [ -f "scripts/post-deployment-setup.sh" ]; then
            chmod +x scripts/post-deployment-setup.sh
            ./scripts/post-deployment-setup.sh "$DEPLOYMENT_URL"
        else
            log_warning "Post-deployment setup script not found"
        fi
    else
        log_warning "No deployment URL available for post-deployment checks"
    fi
}

# Display deployment summary
display_summary() {
    echo ""
    echo "🎉 Deployment Summary"
    echo "=================="
    echo ""
    echo "✅ Project: $PROJECT_NAME"
    echo "✅ Framework: $FRAMEWORK"
    echo "✅ Build: Successful"
    echo "✅ Deployment: Complete"
    echo ""
    
    if [ ! -z "$DEPLOYMENT_URL" ]; then
        echo "🌐 Deployment URL: $DEPLOYMENT_URL"
        echo ""
        echo "🔗 Quick Links:"
        echo "  • Application: $DEPLOYMENT_URL"
        echo "  • API: ${DEPLOYMENT_URL}/api"
        echo "  • Health Check: ${DEPLOYMENT_URL}/api/health"
        echo ""
    fi
    
    echo "📋 Next Steps:"
    echo "  1. Visit your application URL above"
    echo "  2. Configure environment variables in Vercel dashboard"
    echo "  3. Set up your database connection"
    echo "  4. Test all features thoroughly"
    echo "  5. Configure custom domain (optional)"
    echo ""
    echo "🔧 Environment Variables to Configure:"
    echo "  • NEXT_PUBLIC_APP_URL"
    echo "  • NEXTAUTH_URL"
    echo "  • NEXTAUTH_SECRET"
    echo "  • DATABASE_URL"
    echo "  • EMAIL_FROM"
    echo "  • CSRF_SECRET"
    echo "  • ENCRYPTION_KEY"
    echo ""
    echo "📚 Documentation:"
    echo "  • Deployment Guide: docs/vercel-deployment-guide.md"
    echo "  • Environment Variables: .env.example"
    echo ""
    echo "🚀 Happy deploying!"
    echo ""
}

# Main deployment function
main() {
    echo ""
    echo "🚀 GirlsPreneur - One-Click Vercel Deployment"
    echo "=========================================="
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
        link_project
    fi
    
    run_migrations
    build_application
    deploy_to_vercel
    get_deployment_url
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
        echo "  deploy    Full deployment (default)"
        echo ""
        echo "Examples:"
        echo "  $0              # Full deployment"
        echo "  $0 setup        # Only setup environment"
        echo "  $0 build        # Only build application"
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
    *)
        main
        ;;
esac