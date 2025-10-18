#!/bin/bash

# Domain and SSL Configuration Script for GirlsPreneur
# This script sets up domain configuration and SSL certificates

set -e

# Configuration
DOMAIN="girlspreneur.com"
STAGING_DOMAIN="staging.girlspreneur.com"
API_DOMAIN="api.girlspreneur.com"
CDN_DOMAIN="cdn.girlspreneur.com"
EMAIL="admin@girlspreneur.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   error "This script must be run as root"
   exit 1
fi

# Install required packages
install_packages() {
    log "Installing required packages..."
    
    # Update package list
    apt-get update
    
    # Install required packages
    apt-get install -y \
        nginx \
        certbot \
        python3-certbot-nginx \
        curl \
        wget \
        software-properties-common \
        ufw
    
    log "Packages installed successfully"
}

# Configure firewall
configure_firewall() {
    log "Configuring firewall..."
    
    # Allow SSH, HTTP, and HTTPS
    ufw allow ssh
    ufw allow http
    ufw allow https
    
    # Enable firewall
    ufw --force enable
    
    log "Firewall configured successfully"
}

# Create nginx configuration
create_nginx_config() {
    log "Creating nginx configuration..."
    
    # Create main domain configuration
    cat > /etc/nginx/sites-available/girlspreneur.com << EOF
server {
    listen 80;
    server_name girlspreneur.com www.girlspreneur.com;
    
    # Redirect to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name girlspreneur.com www.girlspreneur.com;
    
    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/girlspreneur.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/girlspreneur.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Root directory
    root /var/www/girlspreneur.com;
    index index.html index.htm;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
    
    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=login:10m rate=5r/m;
    
    # Static files
    location /_next/static/ {
        alias /var/www/girlspreneur.com/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Public files
    location /public/ {
        alias /var/www/girlspreneur.com/public/;
        expires 1y;
        add_header Cache-Control "public";
    }
    
    # API routes
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Auth routes
    location /api/auth/ {
        limit_req zone=login burst=10 nodelay;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # All other requests
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Health check
    location /health {
        access_log off;
        proxy_pass http://localhost:3000/api/health;
    }
}
EOF

    # Create staging domain configuration
    cat > /etc/nginx/sites-available/staging.girlspreneur.com << EOF
server {
    listen 80;
    server_name staging.girlspreneur.com;
    
    # Redirect to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name staging.girlspreneur.com;
    
    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/staging.girlspreneur.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/staging.girlspreneur.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Root directory
    root /var/www/staging.girlspreneur.com;
    index index.html index.htm;
    
    # Similar configuration to main domain but for staging
    # ... (same proxy and static file configuration as above)
    
    # All other requests
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

    # Create API domain configuration
    cat > /etc/nginx/sites-available/api.girlspreneur.com << EOF
server {
    listen 80;
    server_name api.girlspreneur.com;
    
    # Redirect to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.girlspreneur.com;
    
    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/api.girlspreneur.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.girlspreneur.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # CORS configuration
    add_header Access-Control-Allow-Origin "https://girlspreneur.com" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization" always;
    
    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=100r/s;
    limit_req zone=api burst=200 nodelay;
    
    # API routes
    location / {
        limit_req zone=api burst=200 nodelay;
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Health check
    location /health {
        access_log off;
        proxy_pass http://localhost:3000/api/health;
    }
}
EOF

    # Enable sites
    ln -sf /etc/nginx/sites-available/girlspreneur.com /etc/nginx/sites-enabled/
    ln -sf /etc/nginx/sites-available/staging.girlspreneur.com /etc/nginx/sites-enabled/
    ln -sf /etc/nginx/sites-available/api.girlspreneur.com /etc/nginx/sites-enabled/
    
    # Remove default site
    rm -f /etc/nginx/sites-enabled/default
    
    log "Nginx configuration created successfully"
}

# Obtain SSL certificates
obtain_ssl_certificates() {
    log "Obtaining SSL certificates..."
    
    # Stop nginx temporarily
    systemctl stop nginx
    
    # Obtain certificate for main domain
    certbot certonly --standalone -d girlspreneur.com -d www.girlspreneur.com --email $EMAIL --agree-tos --non-interactive
    
    # Obtain certificate for staging domain
    certbot certonly --standalone -d staging.girlspreneur.com --email $EMAIL --agree-tos --non-interactive
    
    # Obtain certificate for API domain
    certbot certonly --standalone -d api.girlspreneur.com --email $EMAIL --agree-tos --non-interactive
    
    # Start nginx
    systemctl start nginx
    
    log "SSL certificates obtained successfully"
}

# Setup auto-renewal for SSL certificates
setup_ssl_renewal() {
    log "Setting up SSL auto-renewal..."
    
    # Add renewal cron job
    cat > /etc/cron.d/certbot-renewal << EOF
# SSL certificate renewal
0 3 * * * root /usr/bin/certbot renew --quiet --post-hook "systemctl reload nginx"
EOF
    
    # Test renewal
    certbot renew --dry-run
    
    log "SSL auto-renewal setup completed"
}

# Setup DNS records (manual step)
setup_dns_records() {
    log "DNS Records Configuration"
    log "Please configure the following DNS records:"
    log ""
    log "Main Domain (girlspreneur.com):"
    log "  A Record: @ -> YOUR_SERVER_IP"
    log "  A Record: www -> YOUR_SERVER_IP"
    log "  MX Record: @ -> your-mail-server.com"
    log "  TXT Record: @ -> v=spf1 include:_spf.google.com ~all"
    log ""
    log "Staging Domain (staging.girlspreneur.com):"
    log "  A Record: staging -> YOUR_SERVER_IP"
    log ""
    log "API Domain (api.girlspreneur.com):"
    log "  A Record: api -> YOUR_SERVER_IP"
    log ""
    log "CDN Domain (cdn.girlspreneur.com):"
    log "  CNAME Record: cdn -> your-cdn-provider.com"
    log ""
    log "After configuring DNS records, press Enter to continue..."
    read
}

# Create web directories
create_web_directories() {
    log "Creating web directories..."
    
    mkdir -p /var/www/girlspreneur.com
    mkdir -p /var/www/staging.girlspreneur.com
    
    # Set permissions
    chown -R www-data:www-data /var/www/girlspreneur.com
    chown -R www-data:www-data /var/www/staging.girlspreneur.com
    chmod -R 755 /var/www/girlspreneur.com
    chmod -R 755 /var/www/staging.girlspreneur.com
    
    log "Web directories created successfully"
}

# Test nginx configuration
test_nginx_config() {
    log "Testing nginx configuration..."
    
    if nginx -t; then
        log "Nginx configuration test passed"
    else
        error "Nginx configuration test failed"
        exit 1
    fi
}

# Restart services
restart_services() {
    log "Restarting services..."
    
    systemctl restart nginx
    systemctl enable nginx
    
    log "Services restarted successfully"
}

# Main installation process
main() {
    log "Starting GirlsPreneur domain and SSL configuration..."
    
    install_packages
    configure_firewall
    create_web_directories
    create_nginx_config
    setup_dns_records
    obtain_ssl_certificates
    setup_ssl_renewal
    test_nginx_config
    restart_services
    
    log "Domain and SSL configuration completed successfully!"
    log ""
    log "Next steps:"
    log "1. Deploy your application to /var/www/girlspreneur.com"
    log "2. Configure your application to use the correct domains"
    log "3. Test all domains in your browser"
    log "4. Set up monitoring and alerts"
    log ""
    log "Domains configured:"
    log "  - https://girlspreneur.com"
    log "  - https://staging.girlspreneur.com"
    log "  - https://api.girlspreneur.com"
}

# Run main function
main "$@"