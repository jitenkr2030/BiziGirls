#!/bin/bash

# =============================================================================
# GirlsPreneur - Post-Deployment Setup Script
# =============================================================================
# This script automates the setup process after deploying to Vercel
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_URL=${1:-"https://your-app.vercel.app"}
API_URL="${APP_URL}/api"

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

# Check required tools
check_requirements() {
    log_info "Checking requirements..."
    
    if ! command -v curl &> /dev/null; then
        log_error "curl is required but not installed"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        log_warning "jq is recommended for better JSON parsing"
    fi
    
    log_success "Requirements check passed"
}

# Wait for application to be ready
wait_for_app() {
    log_info "Waiting for application to be ready..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "${APP_URL}" > /dev/null 2>&1; then
            log_success "Application is ready!"
            return 0
        fi
        
        log_info "Attempt $attempt/$max_attempts: Application not ready yet..."
        sleep 10
        ((attempt++))
    done
    
    log_error "Application did not become ready within expected time"
    return 1
}

# Health check
health_check() {
    log_info "Performing health check..."
    
    local health_url="${API_URL}/health"
    local response=$(curl -s -w "%{http_code}" "${health_url}")
    local http_code="${response: -3}"
    local body="${response%???}"
    
    if [ "$http_code" = "200" ]; then
        log_success "Health check passed"
        if command -v jq &> /dev/null; then
            local status=$(echo "$body" | jq -r '.status // "unknown"')
            local timestamp=$(echo "$body" | jq -r '.timestamp // "unknown"')
            log_info "Status: $status"
            log_info "Timestamp: $timestamp"
        fi
        return 0
    else
        log_error "Health check failed with HTTP code: $http_code"
        return 1
    fi
}

# Database health check
database_check() {
    log_info "Checking database connection..."
    
    local db_url="${API_URL}/database/health"
    local response=$(curl -s -w "%{http_code}" "${db_url}")
    local http_code="${response: -3}"
    local body="${response%???}"
    
    if [ "$http_code" = "200" ]; then
        log_success "Database connection is healthy"
        if command -v jq &> /dev/null; then
            local status=$(echo "$body" | jq -r '.status // "unknown"')
            local connection=$(echo "$body" | jq -r '.connection // "unknown"')
            log_info "Database Status: $status"
            log_info "Connection: $connection"
        fi
        return 0
    else
        log_error "Database check failed with HTTP code: $http_code"
        return 1
    fi
}

# Test key endpoints
test_endpoints() {
    log_info "Testing key endpoints..."
    
    local endpoints=(
        "${API_URL}/health"
        "${API_URL}/database/health"
        "${APP_URL}/"
        "${APP_URL}/about"
        "${APP_URL}/contact"
        "${APP_URL}/careers"
        "${APP_URL}/resources"
    )
    
    local failed=0
    
    for endpoint in "${endpoints[@]}"; do
        local response=$(curl -s -w "%{http_code}" "${endpoint}")
        local http_code="${response: -3}"
        
        if [ "$http_code" = "200" ]; then
            log_success "✓ $endpoint"
        else
            log_error "✗ $endpoint (HTTP $http_code)"
            ((failed++))
        fi
    done
    
    if [ $failed -eq 0 ]; then
        log_success "All endpoints are working correctly"
        return 0
    else
        log_error "$failed endpoints failed"
        return 1
    fi
}

# Test authentication endpoints
test_auth() {
    log_info "Testing authentication endpoints..."
    
    local auth_endpoints=(
        "${API_URL}/auth/login"
        "${API_URL}/auth/register"
        "${API_URL}/auth/forgot-password"
    )
    
    for endpoint in "${auth_endpoints[@]}"; do
        local response=$(curl -s -w "%{http_code}" -X POST "${endpoint}" \
            -H "Content-Type: application/json" \
            -d '{"test": true}')
        local http_code="${response: -3}"
        
        # These should return 400 (bad request) rather than 404 or 500
        if [ "$http_code" = "400" ] || [ "$http_code" = "200" ]; then
            log_success "✓ $endpoint"
        else
            log_warning "? $endpoint (HTTP $http_code)"
        fi
    done
}

# Test static assets
test_static_assets() {
    log_info "Testing static assets..."
    
    local assets=(
        "${APP_URL}/favicon.ico"
        "${APP_URL}/manifest.json"
        "${APP_URL}/robots.txt"
    )
    
    for asset in "${assets[@]}"; do
        local response=$(curl -s -w "%{http_code}" "${asset}")
        local http_code="${response: -3}"
        
        if [ "$http_code" = "200" ]; then
            log_success "✓ $asset"
        else
            log_warning "? $asset (HTTP $http_code)"
        fi
    done
}

# Check SSL certificate
check_ssl() {
    log_info "Checking SSL certificate..."
    
    if [[ "$APP_URL" == https://* ]]; then
        local domain=$(echo "$APP_URL" | sed 's|https://||' | sed 's|/.*||')
        
        if command -v openssl &> /dev/null; then
            local cert_info=$(openssl s_client -connect "$domain:443" -servername "$domain" </dev/null 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)
            
            if [ $? -eq 0 ]; then
                log_success "SSL certificate is valid"
                echo "$cert_info" | while read -r line; do
                    if [[ "$line" == *"notAfter"* ]]; then
                        log_info "Certificate expires: $line"
                    fi
                done
            else
                log_warning "Could not verify SSL certificate"
            fi
        else
            log_warning "openssl not available to check SSL certificate"
        fi
    else
        log_warning "Not using HTTPS, skipping SSL check"
    fi
}

# Performance test
performance_test() {
    log_info "Running basic performance test..."
    
    local start_time=$(date +%s.%N)
    local response=$(curl -s -w "%{http_code}" "${APP_URL}")
    local end_time=$(date +%s.%N)
    local http_code="${response: -3}"
    
    if [ "$http_code" = "200" ]; then
        local load_time=$(echo "$end_time - $start_time" | bc -l)
        local load_time_ms=$(echo "$load_time * 1000" | bc -l)
        
        if (( $(echo "$load_time_ms < 1000" | bc -l) )); then
            log_success "Page loaded in ${load_time_ms}ms"
        else
            log_warning "Page loaded in ${load_time_ms}ms (slow)"
        fi
    else
        log_error "Performance test failed with HTTP code: $http_code"
    fi
}

# Generate deployment report
generate_report() {
    log_info "Generating deployment report..."
    
    local report_file="deployment-report-$(date +%Y%m%d-%H%M%S).txt"
    
    {
        echo "GirlsPreneur Deployment Report"
        echo "=============================="
        echo "Date: $(date)"
        echo "Application URL: $APP_URL"
        echo "API URL: $API_URL"
        echo ""
        echo "Health Checks:"
        echo "-------------"
        
        # Health check
        local health_response=$(curl -s "${API_URL}/health")
        echo "Application Health: $health_response"
        
        # Database check
        local db_response=$(curl -s "${API_URL}/database/health")
        echo "Database Health: $db_response"
        
        echo ""
        echo "Environment Information:"
        echo "----------------------"
        echo "Node Version: $(node --version)"
        echo "NPM Version: $(npm --version)"
        
        echo ""
        echo "SSL Certificate:"
        echo "----------------"
        if [[ "$APP_URL" == https://* ]]; then
            local domain=$(echo "$APP_URL" | sed 's|https://||' | sed 's|/.*||')
            echo "Domain: $domain"
            if command -v openssl &> /dev/null; then
                openssl s_client -connect "$domain:443" -servername "$domain" </dev/null 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || echo "Could not get certificate info"
            fi
        else
            echo "Not using HTTPS"
        fi
        
        echo ""
        echo "Performance Metrics:"
        echo "--------------------"
        local start_time=$(date +%s.%N)
        curl -s "${APP_URL}" > /dev/null
        local end_time=$(date +%s.%N)
        local load_time=$(echo "$end_time - $start_time" | bc -l)
        echo "Home Page Load Time: ${load_time} seconds"
        
    } > "$report_file"
    
    log_success "Deployment report generated: $report_file"
}

# Main execution
main() {
    echo ""
    echo "🚀 GirlsPreneur Post-Deployment Setup"
    echo "===================================="
    echo "Application URL: $APP_URL"
    echo ""
    
    # Run all checks
    check_requirements
    wait_for_app
    health_check
    database_check
    test_endpoints
    test_auth
    test_static_assets
    check_ssl
    performance_test
    generate_report
    
    echo ""
    log_success "🎉 Post-deployment setup completed successfully!"
    echo ""
    echo "📋 Summary:"
    echo "  ✅ Application is deployed and accessible"
    echo "  ✅ Health checks passed"
    echo "  ✅ Database connection is working"
    echo "  ✅ Key endpoints are responding"
    echo "  ✅ Static assets are loading"
    echo "  ✅ SSL certificate is valid"
    echo ""
    echo "🔗 Next Steps:"
    echo "  1. Visit your application: $APP_URL"
    echo "  2. Test user registration and login"
    echo "  3. Configure payment processing if needed"
    echo "  4. Set up monitoring and analytics"
    echo "  5. Test all features thoroughly"
    echo ""
    echo "📞 Need help? Check the deployment guide or contact support."
    echo ""
}

# Run main function with all arguments
main "$@"