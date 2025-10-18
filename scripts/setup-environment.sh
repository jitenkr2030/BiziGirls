#!/bin/bash

# GirlsPreneur Production Environment Variables Setup Script
# This script generates and manages environment variables for production deployment

set -e

# Configuration
ENVIRONMENT="production"
APP_DOMAIN="girlspreneur.com"
API_DOMAIN="api.girlspreneur.com"
STAGING_DOMAIN="staging.girlspreneur.com"
ADMIN_EMAIL="admin@girlspreneur.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   error "This script must be run as root"
   exit 1
fi

# Generate secure random values
generate_secure_value() {
    local length=${1:-32}
    openssl rand -hex $length | tr -d '\n'
}

# Generate secure random string
generate_secure_string() {
    local length=${1:-32}
    openssl rand -base64 $length | tr -d '\n' | tr -d '/' | tr -d '+' | cut -c1-$length
}

# Generate environment file
generate_environment_file() {
    local env_type=$1
    local output_file=$2
    
    log "Generating $env_type environment file..."
    
    case $env_type in
        "production")
            generate_production_env $output_file
            ;;
        "staging")
            generate_staging_env $output_file
            ;;
        "development")
            generate_development_env $output_file
            ;;
        *)
            error "Unknown environment type: $env_type"
            exit 1
            ;;
    esac
}

# Generate production environment
generate_production_env() {
    local output_file=$1
    
    # Generate secure values
    local nextauth_secret=$(generate_secure_string 64)
    local csrf_secret=$(generate_secure_string 32)
    local encryption_key=$(generate_secure_string 32)
    local database_password=$(generate_secure_string 24)
    local redis_password=$(generate_secure_string 16)
    local stripe_secret_key="sk_live_$(generate_secure_string 24)"
    local stripe_webhook_secret="whsec_$(generate_secure_string 32)"
    local google_client_id="google-client-id-$(generate_secure_string 16)"
    local google_client_secret=$(generate_secure_string 24)
    local linkedin_client_id="linkedin-client-id-$(generate_secure_string 16)"
    local linkedin_client_secret=$(generate_secure_string 24)
    local zoom_api_key=$(generate_secure_string 16)
    local zoom_api_secret=$(generate_secure_string 24)
    local zoom_webhook_secret=$(generate_secure_string 32)
    local openai_api_key="sk-$(generate_secure_string 48)"
    local anthropic_api_key="sk-ant-$(generate_secure_string 32)"
    local aws_access_key_id=$(generate_secure_string 20)
    local aws_secret_access_key=$(generate_secure_string 40)
    local sentry_dsn="https://$(generate_secure_string 32)@sentry.io/$(generate_secure_string 16)"
    
    cat > "$output_file" << EOF
# GirlsPreneur Production Environment Variables
# Generated on: $(date)
# Environment: production

# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://$APP_DOMAIN
NEXT_PUBLIC_API_URL=https://$API_DOMAIN/api
NEXT_PUBLIC_ENVIRONMENT=production
PORT=3000

# Database Configuration
DATABASE_URL=postgresql://girlspreneur:$database_password@localhost:5432/girlspreneur_production
DATABASE_SSL=true
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Authentication Configuration
NEXTAUTH_URL=https://$APP_DOMAIN
NEXTAUTH_SECRET=$nextauth_secret
NEXTAUTH_DEBUG=false

# Security Configuration
CSRF_SECRET=$csrf_secret
ENCRYPTION_KEY=$encryption_key
SESSION_SECRET=$(generate_secure_string 32)
JWT_SECRET=$(generate_secure_string 32)
BCRYPT_ROUNDS=12

# Redis Configuration
REDIS_URL=redis://:$redis_password@localhost:6379
REDIS_PASSWORD=$redis_password
REDIS_DB=0
REDIS_TLS=false

# Email Configuration
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=noreply@$APP_DOMAIN
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@$APP_DOMAIN
EMAIL_REPLY_TO=support@$APP_DOMAIN

# OAuth Providers
GOOGLE_CLIENT_ID=$google_client_id
GOOGLE_CLIENT_SECRET=$google_client_secret
LINKEDIN_CLIENT_ID=$linkedin_client_id
LINKEDIN_CLIENT_SECRET=$linkedin_client_secret

# Payment Processing
STRIPE_PUBLISHABLE_KEY=pk_live_$(generate_secure_string 24)
STRIPE_SECRET_KEY=$stripe_secret_key
STRIPE_WEBHOOK_SECRET=$stripe_webhook_secret
STRIPE_WEBHOOK_ENDPOINT=https://$API_DOMAIN/api/webhooks/stripe
CURRENCY=USD

# Video Conferencing
ZOOM_API_KEY=$zoom_api_key
ZOOM_API_SECRET=$zoom_api_secret
ZOOM_WEBHOOK_SECRET=$zoom_webhook_secret
ZOOM_WEBHOOK_ENDPOINT=https://$API_DOMAIN/api/webhooks/zoom

# Cloud Storage
CLOUD_PROVIDER=aws
AWS_ACCESS_KEY_ID=$aws_access_key_id
AWS_SECRET_ACCESS_KEY=$aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=girlspreneur-production
AWS_CLOUDFRONT_DISTRIBUTION_ID=$(generate_secure_string 14)

# AI Services
OPENAI_API_KEY=$openai_api_key
ANTHROPIC_API_KEY=$anthropic_api_key
AI_MODEL=gpt-4
AI_MAX_TOKENS=4000
AI_TEMPERATURE=0.7

# Analytics and Monitoring
GOOGLE_ANALYTICS_ID=G-$(generate_secure_string(10))
GOOGLE_TAG_MANAGER_ID=GTM-$(generate_secure_string(8))
POSTHOG_API_KEY=$(generate_secure_string(32))
POSTHOG_HOST=https://app.posthog.com
SENTRY_DSN=$sentry_dsn
SENTRY_ENVIRONMENT=production
LOG_LEVEL=warn

# Security Features
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ENABLED=true
CORS_ORIGIN=https://$APP_DOMAIN
HELMET_ENABLED=true
CSP_ENABLED=true

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx,mp4,mp3
UPLOAD_PATH=./public/uploads
CLOUDINARY_CLOUD_NAME=$(generate_secure_string(16))
CLOUDINARY_API_KEY=$(generate_secure_string(20))
CLOUDINARY_API_SECRET=$(generate_secure_string(32))

# API Configuration
API_RATE_LIMIT=1000
API_TIMEOUT=30000
API_VERSION=v1
API_DOCS_ENABLED=false

# Cache Configuration
CACHE_TTL=3600
CACHE_MAX_SIZE=1000
CACHE_STRATEGY=redis
CDN_ENABLED=true
CDN_URL=https://cdn.$APP_DOMAIN

# Database Optimization
DB_LOGGING=false
DB_SLOW_QUERY_THRESHOLD=1000
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_IDLE_TIMEOUT=30000

# Performance Optimization
ENABLE_COMPRESSION=true
ENABLE_BROTLI=true
ENABLE_CACHING=true
ENABLE_LAZY_LOADING=true
ENABLE_CODE_SPLITTING=true

# Monitoring and Logging
ENABLE_METRICS=true
ENABLE_HEALTH_CHECKS=true
ENABLE_PERFORMANCE_MONITORING=true
LOG_FORMAT=json
LOG_LEVEL=warn

# Security Headers
CONTENT_SECURITY_POLICY=default-src 'self' https: data: blob: 'unsafe-inline'
STRICT_TRANSPORT_SECURITY=max-age=31536000; includeSubDomains; preload
X_FRAME_OPTIONS=SAMEORIGIN
X_CONTENT_TYPE_OPTIONS=nosniff
X_XSS_PROTECTION=1; mode=block
REFERRER_POLICY=strict-origin-when-cross-origin

# Feature Flags
ENABLE_NEW_FEATURES=false
ENABLE_BETA_FEATURES=false
ENABLE_DEBUG_TOOLS=false
ENABLE_MOCK_DATA=false
ENABLE_DEV_MODE=false

# Email Templates
EMAIL_TEMPLATE_DIR=./templates/email
EMAIL_VERIFICATION_TEMPLATE=email-verification
PASSWORD_RESET_TEMPLATE=password-reset
WELCOME_TEMPLATE=welcome

# SMS Configuration (if needed)
TWILIO_ACCOUNT_SID=$(generate_secure_string(32))
TWILIO_AUTH_TOKEN=$(generate_secure_string(32))
TWILIO_PHONE_NUMBER=+1234567890

# Push Notifications
FCM_SERVER_KEY=$(generate_secure_string(152))
VAPID_PUBLIC_KEY=$(generate_secure_string(88))
VAPID_PRIVATE_KEY=$(generate_secure_string(88))

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=30
BACKUP_ENCRYPTION_KEY=$(generate_secure_string(32))

# Maintenance Mode
MAINTENANCE_MODE=false
MAINTENANCE_MESSAGE="Site is under maintenance. Please check back soon."

# Legal and Compliance
GDPR_ENABLED=true
CCPA_ENABLED=true
COOKIE_CONSENT_ENABLED=true
PRIVACY_POLICY_URL=https://$APP_DOMAIN/privacy
TERMS_OF_SERVICE_URL=https://$APP_DOMAIN/terms

# Social Media
FACEBOOK_APP_ID=$(generate_secure_string(16))
FACEBOOK_APP_SECRET=$(generate_secure_string(32)
TWITTER_API_KEY=$(generate_secure_string(25))
TWITTER_API_SECRET=$(generate_secure_string(50))
INSTAGRAM_ACCESS_TOKEN=$(generate_secure_string(64))

# Third-party Integrations
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/$(generate_secure_string(64))
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/$(generate_secure_string(64))
WEBHOOK_SECRET=$(generate_secure_string(32))

# Environment-specific settings
DEPLOYMENT_ENVIRONMENT=production
DEBUG=false
VERBOSE_LOGGING=false
ENABLE_PROFILING=false
ENABLE_STACK_TRACES=false
EOF

    # Set secure permissions
    chmod 600 "$output_file"
    chown girlspreneur:girlspreneur "$output_file"
    
    log "Production environment file generated: $output_file"
}

# Generate staging environment
generate_staging_env() {
    local output_file=$1
    
    # Generate secure values for staging
    local nextauth_secret=$(generate_secure_string 64)
    local csrf_secret=$(generate_secure_string 32)
    local encryption_key=$(generate_secure_string 32)
    local database_password=$(generate_secure_string 24)
    local redis_password=$(generate_secure_string 16)
    local stripe_secret_key="sk_test_$(generate_secure_string 24)"
    local stripe_webhook_secret="whsec_$(generate_secure_string 32)"
    
    cat > "$output_file" << EOF
# GirlsPreneur Staging Environment Variables
# Generated on: $(date)
# Environment: staging

# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://$STAGING_DOMAIN
NEXT_PUBLIC_API_URL=https://$STAGING_DOMAIN/api
NEXT_PUBLIC_ENVIRONMENT=staging
PORT=3001

# Database Configuration
DATABASE_URL=postgresql://girlspreneur_staging:$database_password@localhost:5432/girlspreneur_staging
DATABASE_SSL=true
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=5

# Authentication Configuration
NEXTAUTH_URL=https://$STAGING_DOMAIN
NEXTAUTH_SECRET=$nextauth_secret
NEXTAUTH_DEBUG=true

# Security Configuration
CSRF_SECRET=$csrf_secret
ENCRYPTION_KEY=$encryption_key
SESSION_SECRET=$(generate_secure_string 32)
JWT_SECRET=$(generate_secure_string 32)
BCRYPT_ROUNDS=10

# Redis Configuration
REDIS_URL=redis://:$redis_password@localhost:6379/1
REDIS_PASSWORD=$redis_password
REDIS_DB=1
REDIS_TLS=false

# Email Configuration
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=staging@$APP_DOMAIN
EMAIL_SERVER_PASSWORD=your-staging-app-password
EMAIL_FROM=staging@$APP_DOMAIN
EMAIL_REPLY_TO=support@$APP_DOMAIN

# OAuth Providers (staging credentials)
GOOGLE_CLIENT_ID=staging-google-client-id
GOOGLE_CLIENT_SECRET=staging-google-client-secret
LINKEDIN_CLIENT_ID=staging-linkedin-client-id
LINKEDIN_CLIENT_SECRET=staging-linkedin-client-secret

# Payment Processing (test mode)
STRIPE_PUBLISHABLE_KEY=pk_test_$(generate_secure_string 24)
STRIPE_SECRET_KEY=$stripe_secret_key
STRIPE_WEBHOOK_SECRET=$stripe_webhook_secret
STRIPE_WEBHOOK_ENDPOINT=https://$STAGING_DOMAIN/api/webhooks/stripe
CURRENCY=USD

# Video Conferencing (staging)
ZOOM_API_KEY=staging-zoom-api-key
ZOOM_API_SECRET=staging-zoom-api-secret
ZOOM_WEBHOOK_SECRET=staging-zoom-webhook-secret
ZOOM_WEBHOOK_ENDPOINT=https://$STAGING_DOMAIN/api/webhooks/zoom

# Cloud Storage (staging)
CLOUD_PROVIDER=aws
AWS_ACCESS_KEY_ID=staging-aws-access-key
AWS_SECRET_ACCESS_KEY=staging-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=girlspreneur-staging
AWS_CLOUDFRONT_DISTRIBUTION_ID=$(generate_secure_string 14)

# AI Services (staging)
OPENAI_API_KEY=sk-test-$(generate_secure_string 48))
ANTHROPIC_API_KEY=sk-ant-test-$(generate_secure_string 32))
AI_MODEL=gpt-3.5-turbo
AI_MAX_TOKENS=2000
AI_TEMPERATURE=0.7

# Analytics and Monitoring (staging)
GOOGLE_ANALYTICS_ID=G-STAGING$(generate_secure_string(8))
GOOGLE_TAG_MANAGER_ID=GTM-STAGING$(generate_secure_string(8))
POSTHOG_API_KEY=$(generate_secure_string(32))
POSTHOG_HOST=https://app.posthog.com
SENTRY_DSN=https://$(generate_secure_string(32))@sentry.io/$(generate_secure_string(16))
SENTRY_ENVIRONMENT=staging
LOG_LEVEL=info

# Security Features (staging)
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=200
CORS_ENABLED=true
CORS_ORIGIN=https://$STAGING_DOMAIN
HELMET_ENABLED=true
CSP_ENABLED=true

# File Upload Configuration (staging)
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx
UPLOAD_PATH=./public/uploads
CLOUDINARY_CLOUD_NAME=staging-cloudinary
CLOUDINARY_API_KEY=staging-api-key
CLOUDINARY_API_SECRET=staging-api-secret

# API Configuration (staging)
API_RATE_LIMIT=2000
API_TIMEOUT=30000
API_VERSION=v1
API_DOCS_ENABLED=true

# Cache Configuration (staging)
CACHE_TTL=1800
CACHE_MAX_SIZE=500
CACHE_STRATEGY=redis
CDN_ENABLED=true
CDN_URL=https://staging-cdn.$APP_DOMAIN

# Database Optimization (staging)
DB_LOGGING=true
DB_SLOW_QUERY_THRESHOLD=2000
DB_POOL_MIN=2
DB_POOL_MAX=5
DB_IDLE_TIMEOUT=30000

# Performance Optimization (staging)
ENABLE_COMPRESSION=true
ENABLE_BROTLI=true
ENABLE_CACHING=true
ENABLE_LAZY_LOADING=true
ENABLE_CODE_SPLITTING=true

# Monitoring and Logging (staging)
ENABLE_METRICS=true
ENABLE_HEALTH_CHECKS=true
ENABLE_PERFORMANCE_MONITORING=true
LOG_FORMAT=json
LOG_LEVEL=info

# Security Headers (staging)
CONTENT_SECURITY_POLICY=default-src 'self' https: data: blob: 'unsafe-inline'
STRICT_TRANSPORT_SECURITY=max-age=31536000; includeSubDomains
X_FRAME_OPTIONS=SAMEORIGIN
X_CONTENT_TYPE_OPTIONS=nosniff
X_XSS_PROTECTION=1; mode=block
REFERRER_POLICY=strict-origin-when-cross-origin

# Feature Flags (staging)
ENABLE_NEW_FEATURES=true
ENABLE_BETA_FEATURES=true
ENABLE_DEBUG_TOOLS=true
ENABLE_MOCK_DATA=false
ENABLE_DEV_MODE=false

# Email Templates (staging)
EMAIL_TEMPLATE_DIR=./templates/email
EMAIL_VERIFICATION_TEMPLATE=email-verification-staging
PASSWORD_RESET_TEMPLATE=password-reset-staging
WELCOME_TEMPLATE=welcome-staging

# Backup Configuration (staging)
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 3 * * *
BACKUP_RETENTION_DAYS=7
BACKUP_ENCRYPTION_KEY=$(generate_secure_string(32))

# Maintenance Mode (staging)
MAINTENANCE_MODE=false
MAINTENANCE_MESSAGE="Staging site is under maintenance. Please check back soon."

# Legal and Compliance (staging)
GDPR_ENABLED=true
CCPA_ENABLED=true
COOKIE_CONSENT_ENABLED=true
PRIVACY_POLICY_URL=https://$STAGING_DOMAIN/privacy
TERMS_OF_SERVICE_URL=https://$STAGING_DOMAIN/terms

# Environment-specific settings
DEPLOYMENT_ENVIRONMENT=staging
DEBUG=true
VERBOSE_LOGGING=true
ENABLE_PROFILING=true
ENABLE_STACK_TRACES=true
EOF

    # Set secure permissions
    chmod 600 "$output_file"
    chown girlspreneur:girlspreneur "$output_file"
    
    log "Staging environment file generated: $output_file"
}

# Generate development environment
generate_development_env() {
    local output_file=$1
    
    cat > "$output_file" << EOF
# GirlsPreneur Development Environment Variables
# Generated on: $(date)
# Environment: development

# Application Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_ENVIRONMENT=development
PORT=3000

# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/girlspreneur_dev
DATABASE_SSL=false
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=5

# Authentication Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-key-change-in-production
NEXTAUTH_DEBUG=true

# Security Configuration
CSRF_SECRET=dev-csrf-secret
ENCRYPTION_KEY=dev-encryption-key
SESSION_SECRET=dev-session-secret
JWT_SECRET=dev-jwt-secret
BCRYPT_ROUNDS=4

# Redis Configuration
REDIS_URL=redis://localhost:6379/2
REDIS_PASSWORD=
REDIS_DB=2
REDIS_TLS=false

# Email Configuration
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=dev@$APP_DOMAIN
EMAIL_SERVER_PASSWORD=dev-app-password
EMAIL_FROM=dev@$APP_DOMAIN
EMAIL_REPLY_TO=dev@$APP_DOMAIN

# OAuth Providers (development)
GOOGLE_CLIENT_ID=dev-google-client-id
GOOGLE_CLIENT_SECRET=dev-google-client-secret
LINKEDIN_CLIENT_ID=dev-linkedin-client-id
LINKEDIN_CLIENT_SECRET=dev-linkedin-client-secret

# Payment Processing (test mode)
STRIPE_PUBLISHABLE_KEY=pk_test_$(generate_secure_string 24))
STRIPE_SECRET_KEY=sk_test_$(generate_secure_string 24))
STRIPE_WEBHOOK_SECRET=whsec_$(generate_secure_string 32))
STRIPE_WEBHOOK_ENDPOINT=http://localhost:3000/api/webhooks/stripe
CURRENCY=USD

# Video Conferencing (development)
ZOOM_API_KEY=dev-zoom-api-key
ZOOM_API_SECRET=dev-zoom-api-secret
ZOOM_WEBHOOK_SECRET=dev-zoom-webhook-secret
ZOOM_WEBHOOK_ENDPOINT=http://localhost:3000/api/webhooks/zoom

# Cloud Storage (development)
CLOUD_PROVIDER=local
AWS_ACCESS_KEY_ID=dev-aws-access-key
AWS_SECRET_ACCESS_KEY=dev-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=girlspreneur-dev
AWS_CLOUDFRONT_DISTRIBUTION_ID=dev-distribution-id

# AI Services (development)
OPENAI_API_KEY=sk-test-$(generate_secure_string 48))
ANTHROPIC_API_KEY=sk-ant-test-$(generate_secure_string 32))
AI_MODEL=gpt-3.5-turbo
AI_MAX_TOKENS=1000
AI_TEMPERATURE=0.7

# Analytics and Monitoring (development)
GOOGLE_ANALYTICS_ID=G-DEV$(generate_secure_string(8))
GOOGLE_TAG_MANAGER_ID=GTM-DEV$(generate_secure_string(8))
POSTHOG_API_KEY=dev-posthog-key
POSTHOG_HOST=http://localhost:3000
SENTRY_DSN=http://localhost:3000/sentry
SENTRY_ENVIRONMENT=development
LOG_LEVEL=debug

# Security Features (development)
RATE_LIMIT_ENABLED=false
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
CORS_ENABLED=true
CORS_ORIGIN=http://localhost:3000
HELMET_ENABLED=false
CSP_ENABLED=false

# File Upload Configuration (development)
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx,mp4,mp3
UPLOAD_PATH=./public/uploads
CLOUDINARY_CLOUD_NAME=dev-cloudinary
CLOUDINARY_API_KEY=dev-api-key
CLOUDINARY_API_SECRET=dev-api-secret

# API Configuration (development)
API_RATE_LIMIT=10000
API_TIMEOUT=60000
API_VERSION=v1
API_DOCS_ENABLED=true

# Cache Configuration (development)
CACHE_TTL=300
CACHE_MAX_SIZE=100
CACHE_STRATEGY=memory
CDN_ENABLED=false
CDN_URL=http://localhost:3000

# Database Optimization (development)
DB_LOGGING=true
DB_SLOW_QUERY_THRESHOLD=5000
DB_POOL_MIN=2
DB_POOL_MAX=5
DB_IDLE_TIMEOUT=30000

# Performance Optimization (development)
ENABLE_COMPRESSION=true
ENABLE_BROTLI=true
ENABLE_CACHING=true
ENABLE_LAZY_LOADING=true
ENABLE_CODE_SPLITTING=true

# Monitoring and Logging (development)
ENABLE_METRICS=true
ENABLE_HEALTH_CHECKS=true
ENABLE_PERFORMANCE_MONITORING=true
LOG_FORMAT=pretty
LOG_LEVEL=debug

# Security Headers (development)
CONTENT_SECURITY_POLICY=default-src * 'unsafe-inline' 'unsafe-eval' data: blob:
STRICT_TRANSPORT_SECURITY=max-age=0
X_FRAME_OPTIONS=SAMEORIGIN
X_CONTENT_TYPE_OPTIONS=nosniff
X_XSS_PROTECTION=1; mode=block
REFERRER_POLICY=strict-origin-when-cross-origin

# Feature Flags (development)
ENABLE_NEW_FEATURES=true
ENABLE_BETA_FEATURES=true
ENABLE_DEBUG_TOOLS=true
ENABLE_MOCK_DATA=true
ENABLE_DEV_MODE=true

# Email Templates (development)
EMAIL_TEMPLATE_DIR=./templates/email
EMAIL_VERIFICATION_TEMPLATE=email-verification-dev
PASSWORD_RESET_TEMPLATE=password-reset-dev
WELCOME_TEMPLATE=welcome-dev

# Backup Configuration (development)
BACKUP_ENABLED=false
BACKUP_SCHEDULE=0 4 * * *
BACKUP_RETENTION_DAYS=1
BACKUP_ENCRYPTION_KEY=dev-backup-key

# Maintenance Mode (development)
MAINTENANCE_MODE=false
MAINTENANCE_MESSAGE="Development site is under maintenance."

# Legal and Compliance (development)
GDPR_ENABLED=false
CCPA_ENABLED=false
COOKIE_CONSENT_ENABLED=false
PRIVACY_POLICY_URL=http://localhost:3000/privacy
TERMS_OF_SERVICE_URL=http://localhost:3000/terms

# Environment-specific settings
DEPLOYMENT_ENVIRONMENT=development
DEBUG=true
VERBOSE_LOGGING=true
ENABLE_PROFILING=true
ENABLE_STACK_TRACES=true
EOF

    # Set permissions
    chmod 644 "$output_file"
    chown girlspreneur:girlspreneur "$output_file"
    
    log "Development environment file generated: $output_file"
}

# Create environment management script
create_environment_management() {
    log "Creating environment management script..."
    
    cat > /usr/local/bin/manage-env << 'EOF'
#!/bin/bash

# GirlsPreneur Environment Management Script

ENVIRONMENT=${1:-production}
ACTION=${2:-show}

ENV_DIR="/var/www/girlspreneur.com"
ENV_FILE="$ENV_DIR/.env.$ENVIRONMENT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

show_usage() {
    echo "Usage: $0 <environment> <action>"
    echo ""
    echo "Environments: production, staging, development"
    echo "Actions: show, edit, reload, backup, restore, validate"
    echo ""
    echo "Examples:"
    echo "  $0 production show"
    echo "  $0 staging edit"
    echo "  $0 development reload"
}

validate_environment() {
    case $ENVIRONMENT in
        production|staging|development)
            ;;
        *)
            error "Invalid environment: $ENVIRONMENT"
            echo "Valid environments: production, staging, development"
            exit 1
            ;;
    esac
}

show_environment() {
    if [[ ! -f "$ENV_FILE" ]]; then
        error "Environment file not found: $ENV_FILE"
        exit 1
    fi
    
    info "Environment variables for $ENVIRONMENT:"
    echo "=========================================="
    
    # Show non-sensitive variables
    grep -v "SECRET\|KEY\|PASSWORD\|TOKEN" "$ENV_FILE" | head -20
    
    echo ""
    info "Sensitive variables are hidden for security"
    info "Total variables: $(wc -l < "$ENV_FILE")"
}

edit_environment() {
    if [[ ! -f "$ENV_FILE" ]]; then
        error "Environment file not found: $ENV_FILE"
        exit 1
    fi
    
    if [[ "$ENVIRONMENT" == "production" ]]; then
        warn "Editing production environment variables. Please be careful!"
        read -p "Are you sure you want to continue? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            info "Cancelled"
            exit 0
        fi
    fi
    
    # Edit with nano (or your preferred editor)
    nano "$ENV_FILE"
    
    # Validate after editing
    validate_environment_file
}

reload_environment() {
    if [[ ! -f "$ENV_FILE" ]]; then
        error "Environment file not found: $ENV_FILE"
        exit 1
    fi
    
    info "Reloading $ENVIRONMENT environment..."
    
    # Reload application
    cd "$ENV_DIR"
    
    case $ENVIRONMENT in
        production)
            pm2 reload girlspreneur --update-env
            ;;
        staging)
            pm2 reload girlspreneur-staging --update-env
            ;;
        development)
            # Development typically doesn't use PM2
            info "Development environment reloaded (restart your dev server)"
            ;;
    esac
    
    log "Environment reloaded successfully"
}

backup_environment() {
    if [[ ! -f "$ENV_FILE" ]]; then
        error "Environment file not found: $ENV_FILE"
        exit 1
    fi
    
    BACKUP_DIR="/var/backups/girlspreneur/environment"
    BACKUP_FILE="$BACKUP_DIR/.env.$ENVIRONMENT.$(date +%Y%m%d_%H%M%S).backup"
    
    mkdir -p "$BACKUP_DIR"
    
    # Create encrypted backup
    openssl enc -aes-256-cbc -salt -in "$ENV_FILE" -out "$BACKUP_FILE" -k "$(openssl rand -hex 32)"
    
    chmod 600 "$BACKUP_FILE"
    
    log "Environment backup created: $BACKUP_FILE"
    
    # Keep only last 10 backups
    find "$BACKUP_DIR" -name ".env.$ENVIRONMENT.*.backup" -mtime +30 -delete
}

restore_environment() {
    BACKUP_DIR="/var/backups/girlspreneur/environment"
    
    # Find latest backup
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/.env.$ENVIRONMENT.*.backup 2>/dev/null | head -1)
    
    if [[ -z "$LATEST_BACKUP" ]]; then
        error "No backup found for environment: $ENVIRONMENT"
        exit 1
    fi
    
    info "Latest backup: $LATEST_BACKUP"
    read -p "Are you sure you want to restore this backup? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        info "Cancelled"
        exit 0
    fi
    
    # Decrypt and restore
    openssl enc -aes-256-cbc -d -in "$LATEST_BACKUP" -out "$ENV_FILE" -k "$(openssl rand -hex 32)"
    
    chmod 600 "$ENV_FILE"
    
    log "Environment restored successfully"
    
    # Reload environment
    reload_environment
}

validate_environment_file() {
    if [[ ! -f "$ENV_FILE" ]]; then
        error "Environment file not found: $ENV_FILE"
        exit 1
    fi
    
    info "Validating environment file..."
    
    # Check for required variables
    required_vars=(
        "NODE_ENV"
        "NEXT_PUBLIC_APP_URL"
        "DATABASE_URL"
        "NEXTAUTH_SECRET"
    )
    
    missing_vars=()
    for var in "${required_vars[@]}"; do
        if ! grep -q "^$var=" "$ENV_FILE"; then
            missing_vars+=("$var")
        fi
    done
    
    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        error "Missing required variables:"
        printf ' - %s\n' "${missing_vars[@]}"
        exit 1
    fi
    
    # Check for empty values
    empty_vars=()
    while IFS= read -r line; do
        if [[ $line =~ ^([^=]+)=(.*)$ ]]; then
            var="${BASH_REMATCH[1]}"
            value="${BASH_REMATCH[2]}"
            if [[ -z "$value" ]]; then
                empty_vars+=("$var")
            fi
        fi
    done < "$ENV_FILE"
    
    if [[ ${#empty_vars[@]} -gt 0 ]]; then
        warn "Variables with empty values:"
        printf ' - %s\n' "${empty_vars[@]}"
    fi
    
    # Check syntax
    if bash -n "$ENV_FILE" 2>/dev/null; then
        log "Environment file syntax is valid"
    else
        error "Environment file has syntax errors"
        exit 1
    fi
    
    log "Environment file validation completed"
}

# Main script logic
validate_environment

case $ACTION in
    show)
        show_environment
        ;;
    edit)
        edit_environment
        ;;
    reload)
        reload_environment
        ;;
    backup)
        backup_environment
        ;;
    restore)
        restore_environment
        ;;
    validate)
        validate_environment_file
        ;;
    *)
        show_usage
        exit 1
        ;;
esac
EOF

    # Make script executable
    chmod +x /usr/local/bin/manage-env
    
    log "Environment management script created: /usr/local/bin/manage-env"
}

# Create environment validation script
create_environment_validation() {
    log "Creating environment validation script..."
    
    cat > /usr/local/bin/validate-env << 'EOF'
#!/bin/bash

# GirlsPreneur Environment Validation Script

ENVIRONMENT=${1:-production}
ENV_FILE="/var/www/girlspreneur.com/.env.$ENVIRONMENT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

if [[ ! -f "$ENV_FILE" ]]; then
    error "Environment file not found: $ENV_FILE"
    exit 1
fi

info "Validating $ENVIRONMENT environment file: $ENV_FILE"
echo "=================================================="

# Check file permissions
if [[ "$(stat -c %a "$ENV_FILE")" != "600" ]]; then
    warn "Environment file should have 600 permissions"
    chmod 600 "$ENV_FILE"
fi

# Check ownership
if [[ "$(stat -c %U "$ENV_FILE")" != "girlspreneur" ]]; then
    warn "Environment file should be owned by girlspreneur user"
    chown girlspreneur:girlspreneur "$ENV_FILE"
fi

# Validate required variables
required_vars=(
    "NODE_ENV"
    "NEXT_PUBLIC_APP_URL"
    "DATABASE_URL"
    "NEXTAUTH_SECRET"
    "NEXTAUTH_URL"
)

missing_vars=()
for var in "${required_vars[@]}"; do
    if ! grep -q "^$var=" "$ENV_FILE"; then
        missing_vars+=("$var")
    fi
done

if [[ ${#missing_vars[@]} -gt 0 ]]; then
    error "Missing required variables:"
    printf ' - %s\n' "${missing_vars[@]}"
    exit 1
else
    log "All required variables are present"
fi

# Check for empty values
empty_vars=()
while IFS= read -r line; do
    if [[ $line =~ ^([^=]+)=(.*)$ ]] && [[ ! $line =~ ^# ]]; then
        var="${BASH_REMATCH[1]}"
        value="${BASH_REMATCH[2]}"
        if [[ -z "$value" ]]; then
            empty_vars+=("$var")
        fi
    fi
done < "$ENV_FILE"

if [[ ${#empty_vars[@]} -gt 0 ]]; then
    warn "Variables with empty values:"
    printf ' - %s\n' "${empty_vars[@]}"
else
    log "No empty values found"
fi

# Check for potential security issues
security_issues=()

# Check for default secrets
if grep -q "dev-secret-key\|test-secret\|default-secret" "$ENV_FILE"; then
    security_issues+=("Default secrets detected")
fi

# Check for hardcoded passwords
if grep -q "password\|secret\|key" "$ENV_FILE" | grep -v "NEXTAUTH_SECRET\|CSRF_SECRET\|ENCRYPTION_KEY"; then
    security_issues+=("Potential hardcoded passwords/secrets")
fi

# Check for weak encryption
if grep -q "BCRYPT_ROUNDS=[0-9]" "$ENV_FILE" && [[ $(grep "BCRYPT_ROUNDS=" "$ENV_FILE" | cut -d'=' -f2) -lt 10 ]]; then
    security_issues+=("Weak bcrypt rounds (should be at least 10)")
fi

# Check for debug mode in production
if [[ "$ENVIRONMENT" == "production" ]] && grep -q "DEBUG=true\|NEXTAUTH_DEBUG=true" "$ENV_FILE"; then
    security_issues+=("Debug mode enabled in production")
fi

if [[ ${#security_issues[@]} -gt 0 ]]; then
    warn "Security issues detected:"
    printf ' - %s\n' "${security_issues[@]}"
else
    log "No security issues detected"
fi

# Validate URL formats
url_vars=("NEXT_PUBLIC_APP_URL" "NEXTAUTH_URL" "DATABASE_URL")
invalid_urls=()

for var in "${url_vars[@]}"; do
    if grep -q "^$var=" "$ENV_FILE"; then
        url=$(grep "^$var=" "$ENV_FILE" | cut -d'=' -f2)
        if [[ ! $url =~ ^https?:// ]] && [[ ! $url =~ ^postgresql:// ]]; then
            invalid_urls+=("$var: $url")
        fi
    fi
done

if [[ ${#invalid_urls[@]} -gt 0 ]]; then
    warn "Invalid URL formats:"
    printf ' - %s\n' "${invalid_urls[@]}"
else
    log "All URL formats are valid"
fi

# Check database connection
if grep -q "^DATABASE_URL=" "$ENV_FILE"; then
    info "Testing database connection..."
    
    # Extract database URL
    DB_URL=$(grep "^DATABASE_URL=" "$ENV_FILE" | cut -d'=' -f2)
    
    # Test connection (this is a simplified test)
    if timeout 5 bash -c "echo 'SELECT 1;' | psql '$DB_URL' -t" >/dev/null 2>&1; then
        log "Database connection successful"
    else
        warn "Database connection failed"
    fi
fi

# Check Redis connection
if grep -q "^REDIS_URL=" "$ENV_FILE"; then
    info "Testing Redis connection..."
    
    # Extract Redis URL
    REDIS_URL=$(grep "^REDIS_URL=" "$ENV_FILE" | cut -d'=' -f2)
    
    # Test connection
    if timeout 5 redis-cli -u "$REDIS_URL" ping >/dev/null 2>&1; then
        log "Redis connection successful"
    else
        warn "Redis connection failed"
    fi
fi

echo "=================================================="
log "Environment validation completed"

# Generate report
report_file="/var/backups/girlspreneur/environment/validation-report-$(date +%Y%m%d_%H%M%S).txt"
mkdir -p "$(dirname "$report_file")"

cat > "$report_file" << REPORT
GirlsPreneur Environment Validation Report
==========================================
Date: $(date)
Environment: $ENVIRONMENT
File: $ENV_FILE

Validation Results:
- Required Variables: $([[ ${#missing_vars[@]} -eq 0 ]] && echo "PASS" || echo "FAIL")
- Empty Values: $([[ ${#empty_vars[@]} -eq 0 ]] && echo "PASS" || echo "FAIL")
- Security Issues: $([[ ${#security_issues[@]} -eq 0 ]] && echo "PASS" || echo "FAIL")
- URL Formats: $([[ ${#invalid_urls[@]} -eq 0 ]] && echo "PASS" || echo "FAIL")
- Database Connection: Tested
- Redis Connection: Tested

Issues Found:
$([[ ${#missing_vars[@]} -gt 0 ]] && echo "- Missing variables: ${missing_vars[*]}" || echo "")
$([[ ${#empty_vars[@]} -gt 0 ]] && echo "- Empty values: ${empty_vars[*]}" || echo "")
$([[ ${#security_issues[@]} -gt 0 ]] && echo "- Security issues: ${security_issues[*]}" || echo "")
$([[ ${#invalid_urls[@]} -gt 0 ]] && echo "- Invalid URLs: ${invalid_urls[*]}" || echo "")

Recommendations:
$([[ ${#security_issues[@]} -gt 0 ]] && echo "- Fix security issues before deployment" || echo "- Environment is ready for deployment")
$([[ ${#missing_vars[@]} -gt 0 ]] && echo "- Add missing variables" || echo "")
$([[ ${#empty_vars[@]} -gt 0 ]] && echo "- Provide values for empty variables" || echo "")
REPORT

log "Validation report saved to: $report_file"
EOF

    # Make script executable
    chmod +x /usr/local/bin/validate-env
    
    log "Environment validation script created: /usr/local/bin/validate-env"
}

# Create environment backup script
create_environment_backup() {
    log "Creating environment backup script..."
    
    cat > /usr/local/bin/backup-env << 'EOF'
#!/bin/bash

# GirlsPreneur Environment Backup Script

BACKUP_DIR="/var/backups/girlspreneur/environment"
ENCRYPT_KEY_FILE="/etc/girlspreneur/backup-key"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Generate or load encryption key
if [[ ! -f "$ENCRYPT_KEY_FILE" ]]; then
    mkdir -p "$(dirname "$ENCRYPT_KEY_FILE")"
    openssl rand -hex 32 > "$ENCRYPT_KEY_FILE"
    chmod 600 "$ENCRYPT_KEY_FILE"
    log "Generated new encryption key"
fi

ENCRYPT_KEY=$(cat "$ENCRYPT_KEY_FILE")

# Backup each environment
for env in production staging development; do
    env_file="/var/www/girlspreneur.com/.env.$env"
    
    if [[ -f "$env_file" ]]; then
        backup_file="$BACKUP_DIR/.env.$env.$(date +%Y%m%d_%H%M%S).enc"
        
        # Create encrypted backup
        openssl enc -aes-256-cbc -salt -in "$env_file" -out "$backup_file" -k "$ENCRYPT_KEY"
        
        chmod 600 "$backup_file"
        
        log "Backed up $env environment to $backup_file"
    else
        warn "Environment file not found: $env_file"
    fi
done

# Clean old backups (keep last 30 days)
find "$BACKUP_DIR" -name "*.enc" -mtime +30 -delete

# Create backup manifest
manifest_file="$BACKUP_DIR/manifest.$(date +%Y%m%d_%H%M%S).txt"
cat > "$manifest_file" << MANIFEST
GirlsPreneur Environment Backup Manifest
==========================================
Date: $(date)
Backup Directory: $BACKUP_DIR
Encryption Key: $ENCRYPT_KEY_FILE

Backed Up Files:
$(find "$BACKUP_DIR" -name "*.enc" -newermt "$(date -d '1 day ago')" -exec basename {} \;)

Next Steps:
1. Store the encryption key securely
2. Test backup restoration
3. Monitor backup size and retention
4. Schedule regular backups
MANIFEST

log "Backup manifest created: $manifest_file"

# Upload to cloud storage (if configured)
if [[ -n "$AWS_ACCESS_KEY_ID" ]] && [[ -n "$AWS_SECRET_ACCESS_KEY" ]]; then
    info "Uploading backups to AWS S3..."
    
    # Upload recent backups
    find "$BACKUP_DIR" -name "*.enc" -newermt "$(date -d '1 day ago')" -exec aws s3 cp {} s3://girlspreneur-backups/environment/ \;
    
    log "Backups uploaded to AWS S3"
fi

log "Environment backup completed"
EOF

    # Make script executable
    chmod +x /usr/local/bin/backup-env
    
    log "Environment backup script created: /usr/local/bin/backup-env"
}

# Setup cron jobs for environment management
setup_cron_jobs() {
    log "Setting up cron jobs for environment management..."
    
    # Add to crontab
    (crontab -l 2>/dev/null; echo "# Environment management") | crontab -
    (crontab -l 2>/dev/null; echo "0 3 * * * /usr/local/bin/backup-env") | crontab -
    (crontab -l 2>/dev/null; echo "0 4 * * 0 /usr/local/bin/validate-env production") | crontab -
    (crontab -l 2>/dev/null; echo "0 5 * * 0 /usr/local/bin/validate-env staging") | crontab -
    
    log "Cron jobs configured"
}

# Main setup process
main() {
    log "Starting GirlsPreneur environment variables setup..."
    
    # Create environment files
    generate_environment_file "production" "/var/www/girlspreneur.com/.env.production"
    generate_environment_file "staging" "/var/www/girlspreneur.com/.env.staging"
    generate_environment_file "development" "/var/www/girlspreneur.com/.env.development"
    
    # Create management scripts
    create_environment_management
    create_environment_validation
    create_environment_backup
    
    # Setup cron jobs
    setup_cron_jobs
    
    # Create symlinks for active environments
    ln -sf "/var/www/girlspreneur.com/.env.production" "/var/www/girlspreneur.com/.env"
    
    # Set proper permissions
    chmod 600 /var/www/girlspreneur.com/.env.*
    chown girlspreneur:girlspreneur /var/www/girlspreneur.com/.env.*
    
    log "GirlsPreneur environment variables setup completed successfully!"
    log ""
    log "Generated Files:"
    log "  - Production: /var/www/girlspreneur.com/.env.production"
    log "  - Staging: /var/www/girlspreneur.com/.env.staging"
    log "  - Development: /var/www/girlspreneur.com/.env.development"
    log ""
    log "Management Scripts:"
    log "  - Environment Manager: /usr/local/bin/manage-env"
    log "  - Environment Validator: /usr/local/bin/validate-env"
    log "  - Environment Backup: /usr/local/bin/backup-env"
    log ""
    log "Next Steps:"
    log "1. Review and customize environment files"
    log "2. Update actual service credentials"
    log "3. Test environment validation"
    log "4. Set up proper secret management"
    log "5. Configure automated backups"
}

# Run main function
main "$@"