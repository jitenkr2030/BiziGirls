# GirlsPreneur Deployment Guide

This comprehensive guide covers the deployment process for the GirlsPreneur platform, including infrastructure setup, application deployment, monitoring, and maintenance procedures.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Infrastructure Setup](#infrastructure-setup)
4. [Application Deployment](#application-deployment)
5. [Database Configuration](#database-configuration)
6. [Environment Configuration](#environment-configuration)
7. [SSL and Domain Setup](#ssl-and-domain-setup)
8. [Monitoring and Logging](#monitoring-and-logging)
9. [Backup and Recovery](#backup-and-recovery)
10. [Scaling and Performance](#scaling-and-performance)
11. [Security Configuration](#security-configuration)
12. [Maintenance Procedures](#maintenance-procedures)
13. [Troubleshooting](#troubleshooting)
14. [Disaster Recovery](#disaster-recovery)

## Architecture Overview

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   CDN (Cloudflare)│    │   DNS Provider  │
│    (Nginx)      │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Application    │    │   API Server    │    │   Staging Env   │
│  (Next.js)      │    │   (Next.js)     │    │                 │
│   Port 3000     │    │   Port 3001     │    │   Port 3002     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Database      │    │     Redis       │    │   File Storage  │
│  (PostgreSQL)   │    │   (Cache)       │    │   (AWS S3)      │
│   Port 5432     │    │   Port 6379     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack
- **Frontend**: Next.js 15 with TypeScript
- **Backend**: Next.js API Routes with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Storage**: AWS S3 (or compatible)
- **Load Balancer**: Nginx
- **SSL**: Let's Encrypt
- **Monitoring**: Custom monitoring + Sentry
- **CI/CD**: GitHub Actions
- **Container**: Docker
- **Process Management**: PM2

## Prerequisites

### System Requirements
- **Server**: Ubuntu 20.04 LTS or later
- **CPU**: Minimum 2 cores, recommended 4+ cores
- **RAM**: Minimum 4GB, recommended 8GB+ 
- **Storage**: Minimum 50GB SSD, recommended 100GB+
- **Network**: Stable internet connection with static IP

### Software Requirements
- Node.js 18.x or later
- PostgreSQL 14 or later
- Redis 6 or later
- Nginx 1.18 or later
- Docker 20.10 or later
- PM2 5.0 or later

### Domain Requirements
- Registered domain name (e.g., girlspreneur.com)
- Access to DNS management
- SSL certificate (automated via Let's Encrypt)

### Cloud Services
- AWS Account (for S3, CloudFront, Route 53)
- Cloudflare Account (recommended for DNS and CDN)
- GitHub Account (for CI/CD)
- Sentry Account (for error monitoring)

## Infrastructure Setup

### 1. Server Preparation

#### Update System
```bash
# Update package lists
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git build-essential

# Set timezone
sudo timedatectl set-timezone UTC
```

#### Create Application User
```bash
# Create dedicated user for application
sudo useradd -m -s /bin/bash girlspreneur
sudo usermod -aG sudo girlspreneur

# Switch to application user
sudo su - girlspreneur
```

#### Install Node.js
```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### Install PostgreSQL
```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres createuser --interactive
sudo -u postgres createdb girlspreneur_production
```

#### Install Redis
```bash
# Install Redis
sudo apt install -y redis-server

# Configure Redis
sudo sed -i 's/supervised no/supervised systemd/g' /etc/redis/redis.conf

# Start and enable Redis
sudo systemctl start redis
sudo systemctl enable redis
```

#### Install Nginx
```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### Install Docker
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker girlspreneur

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### Install PM2
```bash
# Install PM2 globally
sudo npm install -g pm2

# Install PM2 startup script
pm2 startup
pm2 save
```

### 2. Firewall Configuration
```bash
# Configure UFW firewall
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw allow 3000/tcp  # Application
sudo ufw allow 3001/tcp  # API
sudo ufw allow 3002/tcp  # Staging
sudo ufw allow 5432/tcp  # PostgreSQL
sudo ufw allow 6379/tcp  # Redis

# Enable firewall
sudo ufw --force enable
```

### 3. Directory Structure
```bash
# Create application directories
sudo mkdir -p /var/www/girlspreneur.com
sudo mkdir -p /var/www/staging.girlspreneur.com
sudo mkdir -p /var/www/api.girlspreneur.com
sudo mkdir -p /var/log/girlspreneur
sudo mkdir -p /var/backups/girlspreneur

# Set permissions
sudo chown -R girlspreneur:girlspreneur /var/www/girlspreneur.com
sudo chown -R girlspreneur:girlspreneur /var/www/staging.girlspreneur.com
sudo chown -R girlspreneur:girlspreneur /var/www/api.girlspreneur.com
sudo chown -R girlspreneur:girlspreneur /var/log/girlspreneur
sudo chown -R girlspreneur:girlspreneur /var/backups/girlspreneur

sudo chmod -R 755 /var/www/girlspreneur.com
sudo chmod -R 755 /var/www/staging.girlspreneur.com
sudo chmod -R 755 /var/www/api.girlspreneur.com
```

## Application Deployment

### 1. Clone Repository
```bash
# Clone the repository
cd /var/www/girlspreneur.com
git clone https://github.com/your-username/girlspreneur.git .

# Switch to production branch
git checkout main

# Install dependencies
npm ci
```

### 2. Environment Configuration
```bash
# Copy environment files
cp .env.production .env

# Edit environment variables
nano .env
```

Required environment variables:
```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://girlspreneur.com
NEXT_PUBLIC_API_URL=https://api.girlspreneur.com/api
DATABASE_URL=postgresql://username:password@localhost:5432/girlspreneur_production
NEXTAUTH_URL=https://girlspreneur.com
NEXTAUTH_SECRET=your-secret-key-here
REDIS_URL=redis://localhost:6379
# ... other environment variables
```

### 3. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Seed database (if needed)
npx prisma db seed
```

### 4. Build Application
```bash
# Build the application
npm run build

# Build standalone version for Docker
npm run build:standalone
```

### 5. Start Application with PM2
```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'girlspreneur',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/girlspreneur.com',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/var/log/girlspreneur/error.log',
      out_file: '/var/log/girlspreneur/out.log',
      log_file: '/var/log/girlspreneur/combined.log',
      time: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
}
EOF

# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
```

### 6. Setup Staging Environment
```bash
# Clone repository for staging
cd /var/www/staging.girlspreneur.com
git clone https://github.com/your-username/girlspreneur.git .

# Switch to staging branch
git checkout develop

# Install dependencies
npm ci

# Copy staging environment
cp .env.staging .env

# Build and start staging
npm run build
pm2 start npm --name "girlspreneur-staging" -- start
```

### 7. Setup API Server
```bash
# Clone repository for API
cd /var/www/api.girlspreneur.com
git clone https://github.com/your-username/girlspreneur.git .

# Switch to main branch
git checkout main

# Install dependencies
npm ci

# Copy environment
cp .env.production .env

# Build and start API
npm run build
pm2 start npm --name "girlspreneur-api" -- start
```

## Database Configuration

### 1. PostgreSQL Configuration
```bash
# Edit PostgreSQL configuration
sudo nano /etc/postgresql/14/main/postgresql.conf

# Recommended settings:
# shared_buffers = 256MB
# effective_cache_size = 1GB
# maintenance_work_mem = 64MB
# checkpoint_completion_target = 0.9
# wal_buffers = 16MB
# default_statistics_target = 100
# random_page_cost = 1.1
# effective_io_concurrency = 200
# work_mem = 4MB
# min_wal_size = 1GB
# max_wal_size = 4GB
# max_worker_processes = 4
# max_parallel_workers_per_gather = 2
# max_parallel_workers = 4
# max_parallel_maintenance_workers = 2

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### 2. Database Security
```bash
# Edit pg_hba.conf
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Add secure configuration:
# local   all             all                                     scram-sha-256
# host    all             all             127.0.0.1/32            scram-sha-256
# host    all             all             ::1/128                 scram-sha-256

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### 3. Database Backup Setup
```bash
# Create backup script
cat > /var/backups/girlspreneur/backup-db.sh << EOF
#!/bin/bash

BACKUP_DIR="/var/backups/girlspreneur"
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="\$BACKUP_DIR/girlspreneur_\$DATE.sql"

# Create backup
pg_dump girlspreneur_production > \$BACKUP_FILE

# Compress backup
gzip \$BACKUP_FILE

# Keep only last 7 days of backups
find \$BACKUP_DIR -name "girlspreneur_*.sql.gz" -mtime +7 -delete

echo "Database backup completed: \$BACKUP_FILE.gz"
EOF

# Make script executable
chmod +x /var/backups/girlspreneur/backup-db.sh

# Add to crontab
echo "0 2 * * * /var/backups/girlspreneur/backup-db.sh" | crontab -
```

## Environment Configuration

### 1. Production Environment
```bash
# Create production environment file
cat > /var/www/girlspreneur.com/.env.production << EOF
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://girlspreneur.com
NEXT_PUBLIC_API_URL=https://api.girlspreneur.com/api
DATABASE_URL=postgresql://girlspreneur:your-password@localhost:5432/girlspreneur_production
NEXTAUTH_URL=https://girlspreneur.com
NEXTAUTH_SECRET=your-very-secure-secret-key
REDIS_URL=redis://localhost:6379

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# Email Service
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@girlspreneur.com

# Cloud Storage
CLOUD_PROVIDER=aws
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=girlspreneur-production

# Payment Processing
STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-key
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Analytics
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
SENTRY_DSN=https://your-sentry-dsn

# Security
CSRF_SECRET=your-csrf-secret
ENCRYPTION_KEY=your-encryption-key
EOF
```

### 2. Staging Environment
```bash
# Create staging environment file
cat > /var/www/staging.girlspreneur.com/.env.staging << EOF
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://staging.girlspreneur.com
NEXT_PUBLIC_API_URL=https://staging.girlspreneur.com/api
DATABASE_URL=postgresql://girlspreneur_staging:your-password@localhost:5432/girlspreneur_staging
NEXTAUTH_URL=https://staging.girlspreneur.com
NEXTAUTH_SECRET=your-staging-secret-key
REDIS_URL=redis://localhost:6379

# Use staging credentials for all services
GOOGLE_CLIENT_ID=your-staging-google-client-id
GOOGLE_CLIENT_SECRET=your-staging-google-client-secret
# ... other staging credentials
EOF
```

### 3. Environment Management
```bash
# Create environment management script
cat > /usr/local/bin/manage-env << EOF
#!/bin/bash

ACTION=\$1
ENVIRONMENT=\$2

case \$ACTION in
  "deploy")
    echo "Deploying to \$ENVIRONMENT..."
    cd /var/www/\$ENVIRONMENT
    git pull origin main
    npm ci
    npm run build
    pm2 restart girlspreneur
    ;;
  "rollback")
    echo "Rolling back \$ENVIRONMENT..."
    cd /var/www/\$ENVIRONMENT
    git log --oneline -10
    read -p "Enter commit hash to rollback to: " COMMIT
    git checkout \$COMMIT
    npm run build
    pm2 restart girlspreneur
    ;;
  "logs")
    echo "Showing logs for \$ENVIRONMENT..."
    pm2 logs girlspreneur
    ;;
  "status")
    echo "Checking status of \$ENVIRONMENT..."
    pm2 status girlspreneur
    ;;
  *)
    echo "Usage: \$0 {deploy|rollback|logs|status} {environment}"
    exit 1
    ;;
esac
EOF

# Make script executable
chmod +x /usr/local/bin/manage-env
```

## SSL and Domain Setup

### 1. Run Domain Setup Script
```bash
# Make the setup script executable
chmod +x /home/girlspreneur/girlspreneur/scripts/setup-domain-ssl.sh

# Run the setup script
sudo ./scripts/setup-domain-ssl.sh
```

### 2. Verify SSL Configuration
```bash
# Test SSL certificate
openssl s_client -connect girlspreneur.com:443

# Check SSL configuration
https://www.ssllabs.com/ssltest/
```

### 3. Configure HSTS
```bash
# Add HSTS header to Nginx configuration
sudo nano /etc/nginx/sites-available/girlspreneur.com

# Add to server block:
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

# Reload Nginx
sudo systemctl reload nginx
```

## Monitoring and Logging

### 1. Application Monitoring
```bash
# Start monitoring service
pm2 start monitoring-service.js --name "monitoring"

# Start health check service
pm2 start health-check-service.js --name "health-check"
```

### 2. Log Management
```bash
# Configure log rotation
sudo nano /etc/logrotate.d/girlspreneur

# Add configuration:
/var/log/girlspreneur/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 girlspreneur girlspreneur
    postrotate
        pm2 reload girlspreneur
    endscript
}
```

### 3. System Monitoring
```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Create system monitoring script
cat > /usr/local/bin/system-monitor << EOF
#!/bin/bash

# System resource monitoring
echo "=== System Information ==="
uname -a
echo ""

echo "=== CPU Usage ==="
top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1"%"}'
echo ""

echo "=== Memory Usage ==="
free -h
echo ""

echo "=== Disk Usage ==="
df -h
echo ""

echo "=== Network Connections ===
netstat -tuln | grep LISTEN
echo ""

echo "=== Application Status ==="
pm2 status
echo ""

echo "=== Database Status ==="
systemctl status postgresql
echo ""

echo "=== Redis Status ==="
systemctl status redis
EOF

# Make script executable
chmod +x /usr/local/bin/system-monitor
```

## Backup and Recovery

### 1. Automated Backups
```bash
# Start backup service
pm2 start backup-service.js --name "backup-service"

# Create comprehensive backup script
cat > /var/backups/girlspreneur/full-backup.sh << EOF
#!/bin/bash

BACKUP_DIR="/var/backups/girlspreneur"
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="\$BACKUP_DIR/full_backup_\$DATE.tar.gz"

echo "Starting full backup..."

# Backup database
pg_dump girlspreneur_production > /tmp/db_backup.sql

# Backup application files
tar -czf \$BACKUP_FILE \
    /var/www/girlspreneur.com \
    /var/www/staging.girlspreneur.com \
    /var/www/api.girlspreneur.com \
    /etc/nginx/sites-available/ \
    /etc/letsencrypt/ \
    /tmp/db_backup.sql

# Upload to cloud storage (if configured)
# aws s3 cp \$BACKUP_FILE s3://your-backup-bucket/

# Clean up temporary files
rm /tmp/db_backup.sql

# Keep only last 30 days of backups
find \$BACKUP_DIR -name "full_backup_*.tar.gz" -mtime +30 -delete

echo "Full backup completed: \$BACKUP_FILE"
EOF

# Make script executable
chmod +x /var/backups/girlspreneur/full-backup.sh

# Add to crontab for weekly backups
echo "0 3 * * 0 /var/backups/girlspreneur/full-backup.sh" | crontab -
```

### 2. Recovery Procedures
```bash
# Create recovery script
cat > /var/backups/girlspreneur/recover.sh << EOF
#!/bin/bash

BACKUP_FILE=\$1

if [ -z "\$BACKUP_FILE" ]; then
    echo "Usage: \$0 <backup-file>"
    exit 1
fi

echo "Starting recovery from \$BACKUP_FILE..."

# Stop services
pm2 stop all
sudo systemctl stop nginx
sudo systemctl stop postgresql
sudo systemctl stop redis

# Extract backup
tar -xzf \$BACKUP_FILE -C /tmp

# Restore application files
sudo cp -r /tmp/var/www/girlspreneur.com/* /var/www/girlspreneur.com/
sudo cp -r /tmp/var/www/staging.girlspreneur.com/* /var/www/staging.girlspreneur.com/
sudo cp -r /tmp/var/www/api.girlspreneur.com/* /var/www/api.girlspreneur.com/

# Restore configuration
sudo cp -r /tmp/etc/nginx/sites-available/* /etc/nginx/sites-available/
sudo cp -r /tmp/etc/letsencrypt/* /etc/letsencrypt/

# Restore database
sudo -u postgres dropdb girlspreneur_production
sudo -u postgres createdb girlspreneur_production
sudo -u postgres psql girlspreneur_production < /tmp/db_backup.sql

# Set permissions
sudo chown -R girlspreneur:girlspreneur /var/www/girlspreneur.com
sudo chown -R girlspreneur:girlspreneur /var/www/staging.girlspreneur.com
sudo chown -R girlspreneur:girlspreneur /var/www/api.girlspreneur.com

# Start services
sudo systemctl start postgresql
sudo systemctl start redis
sudo systemctl start nginx
pm2 restart all

# Clean up
rm -rf /tmp/var
rm -f /tmp/db_backup.sql

echo "Recovery completed successfully"
EOF

# Make script executable
chmod +x /var/backups/girlspreneur/recover.sh
```

## Scaling and Performance

### 1. Application Scaling
```bash
# Scale application instances
pm2 scale girlspreneur +2

# Configure load balancing
pm2 reload girlspreneur --update-env
```

### 2. Database Optimization
```bash
# Create database optimization script
cat > /usr/local/bin/optimize-db << EOF
#!/bin/bash

echo "Optimizing database..."

# Vacuum and analyze
sudo -u postgres psql girlspreneur_production -c "VACUUM ANALYZE;"

# Update statistics
sudo -u postgres psql girlspreneur_production -c "ANALYZE;"

# Reindex
sudo -u postgres psql girlspreneur_production -c "REINDEX DATABASE girlspreneur_production;"

echo "Database optimization completed"
EOF

# Make script executable
chmod +x /usr/local/bin/optimize-db

# Add to crontab for weekly optimization
echo "0 4 * * 0 /usr/local/bin/optimize-db" | crontab -
```

### 3. Performance Monitoring
```bash
# Start performance monitoring
pm2 start performance-monitor.js --name "performance-monitor"

# Create performance report script
cat > /usr/local/bin/performance-report << EOF
#!/bin/bash

echo "=== Performance Report ==="
date
echo ""

echo "=== Application Performance ==="
pm2 info girlspreneur
echo ""

echo "=== Database Performance ==="
sudo -u postgres psql girlspreneur_production -c "SELECT * FROM pg_stat_activity;"
echo ""

echo "=== System Performance ==="
uptime
free -h
df -h
echo ""

echo "=== Network Performance ===
netstat -s | grep "packets"
EOF

# Make script executable
chmod +x /usr/local/bin/performance-report
```

## Security Configuration

### 1. System Security
```bash
# Configure system security
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Configure automatic updates
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 2. Application Security
```bash
# Configure application security
sudo nano /etc/nginx/sites-available/girlspreneur.com

# Add security headers:
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

# Reload Nginx
sudo systemctl reload nginx
```

### 3. Database Security
```bash
# Configure database security
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Ensure secure authentication:
# local   all             all                                     scram-sha-256
# host    all             all             127.0.0.1/32            scram-sha-256
# host    all             all             ::1/128                 scram-sha-256

# Restart PostgreSQL
sudo systemctl restart postgresql
```

## Maintenance Procedures

### 1. Regular Maintenance
```bash
# Create maintenance script
cat > /usr/local/bin/maintenance << EOF
#!/bin/bash

echo "Starting maintenance procedures..."

# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Node.js packages
cd /var/www/girlspreneur.com && npm update
cd /var/www/staging.girlspreneur.com && npm update
cd /var/www/api.girlspreneur.com && npm update

# Clean up logs
sudo journalctl --vacuum-time=7d
sudo find /var/log -name "*.log.*" -mtime +30 -delete

# Clean up temporary files
sudo find /tmp -type f -mtime +7 -delete

# Optimize database
/usr/local/bin/optimize-db

# Restart services
sudo systemctl restart nginx
pm2 restart all

echo "Maintenance completed"
EOF

# Make script executable
chmod +x /usr/local/bin/maintenance

# Add to crontab for monthly maintenance
echo "0 2 1 * * /usr/local/bin/maintenance" | crontab -
```

### 2. Log Rotation
```bash
# Configure log rotation for application logs
sudo nano /etc/logrotate.d/girlspreneur-app

# Add configuration:
/var/log/girlspreneur/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 girlspreneur girlspreneur
    postrotate
        pm2 reload girlspreneur
    endscript
}
```

### 3. Health Checks
```bash
# Create health check script
cat > /usr/local/bin/health-check << EOF
#!/bin/bash

# Check application health
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "Application: OK"
else
    echo "Application: FAILED"
    exit 1
fi

# Check database health
if sudo -u postgres psql girlspreneur_production -c "SELECT 1;" > /dev/null 2>&1; then
    echo "Database: OK"
else
    echo "Database: FAILED"
    exit 1
fi

# Check Redis health
if redis-cli ping > /dev/null 2>&1; then
    echo "Redis: OK"
else
    echo "Redis: FAILED"
    exit 1
fi

# Check Nginx health
if systemctl is-active nginx > /dev/null 2>&1; then
    echo "Nginx: OK"
else
    echo "Nginx: FAILED"
    exit 1
fi

echo "All services: OK"
EOF

# Make script executable
chmod +x /usr/local/bin/health-check

# Add to crontab for regular health checks
echo "*/5 * * * * /usr/local/bin/health-check" | crontab -
```

## Troubleshooting

### 1. Common Issues

#### Application Not Starting
```bash
# Check application logs
pm2 logs girlspreneur

# Check system resources
htop
free -h

# Check port availability
netstat -tuln | grep 3000

# Restart application
pm2 restart girlspreneur
```

#### Database Connection Issues
```bash
# Check PostgreSQL status
systemctl status postgresql

# Check database logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log

# Test database connection
sudo -u postgres psql girlspreneur_production

# Restart PostgreSQL
sudo systemctl restart postgresql
```

#### SSL Certificate Issues
```bash
# Check SSL certificate status
sudo certbot certificates

# Renew SSL certificate
sudo certbot renew --dry-run

# Force renew SSL certificate
sudo certbot renew --force-renewal

# Check Nginx configuration
sudo nginx -t
sudo systemctl reload nginx
```

### 2. Performance Issues
```bash
# Check system performance
top
htop
iotop

# Check application performance
pm2 info girlspreneur
pm2 monit

# Check database performance
sudo -u postgres psql girlspreneur_production -c "SELECT * FROM pg_stat_activity;"

# Check network performance
netstat -s
nethogs
```

### 3. Memory Issues
```bash
# Check memory usage
free -h
cat /proc/meminfo

# Check application memory usage
pm2 info girlspreneur

# Restart application if memory leak
pm2 restart girlspreneur

# Check for memory leaks
node --inspect app.js
```

## Disaster Recovery

### 1. Backup Strategy
```bash
# Create comprehensive backup strategy
cat > /usr/local/bin/disaster-recovery << EOF
#!/bin/bash

BACKUP_DIR="/var/backups/girlspreneur"
DATE=\$(date +%Y%m%d_%H%M%S)
OFFSITE_BACKUP="your-offsite-location"

echo "Starting disaster recovery backup..."

# Create full backup
/var/backups/girlspreneur/full-backup.sh

# Upload to offsite location
# rsync -avz \$BACKUP_DIR/ \$OFFSITE_BACKUP/

# Create recovery documentation
cat > \$BACKUP_DIR/recovery_instructions_\$DATE.txt << EORECOVERY
Disaster Recovery Instructions
============================
Date: \$(date)
Backup File: full_backup_\$DATE.tar.gz

Recovery Steps:
1. Restore from backup: /var/backups/girlspreneur/recover.sh full_backup_\$DATE.tar.gz
2. Restart services: pm2 restart all
3. Verify functionality: /usr/local/bin/health-check

Contact Information:
- System Administrator: admin@girlspreneur.com
- Emergency Contact: +1-555-0123
EORECOVERY

echo "Disaster recovery backup completed"
EOF

# Make script executable
chmod +x /usr/local/bin/disaster-recovery

# Add to crontab for daily disaster recovery backups
echo "0 1 * * * /usr/local/bin/disaster-recovery" | crontab -
```

### 2. Recovery Procedures
```bash
# Create comprehensive recovery documentation
cat > /var/backups/girlspreneur/RECOVERY_PLAN.md << EOF
# GirlsPreneur Disaster Recovery Plan

## Immediate Actions
1. Assess the situation and determine the scope of the disaster
2. Notify stakeholders and emergency contacts
3. Initiate recovery procedures

## Recovery Steps

### Phase 1: System Recovery
1. **Restore from backup**
   \`\`\`bash
   /var/backups/girlspreneur/recover.sh /path/to/backup/file.tar.gz
   \`\`\`

2. **Start services**
   \`\`\`bash
   sudo systemctl start postgresql
   sudo systemctl start redis
   sudo systemctl start nginx
   pm2 restart all
   \`\`\`

3. **Verify functionality**
   \`\`\`bash
   /usr/local/bin/health-check
   \`\`\`

### Phase 2: Data Recovery
1. **Verify database integrity**
   \`\`\`bash
   sudo -u postgres psql girlspreneur_production -c "SELECT COUNT(*) FROM users;"
   \`\`\`

2. **Check application data**
   \`\`\`bash
   curl https://girlspreneur.com/api/health
   \`\`\`

3. **Verify file storage**
   \`\`\`bash
   aws s3 ls s3://girlspreneur-production/
   \`\`\`

### Phase 3: Service Restoration
1. **Restore user access**
   - Verify authentication is working
   - Test user login functionality
   - Check user data integrity

2. **Restore payment processing**
   - Verify Stripe connectivity
   - Test payment processing
   - Check transaction history

3. **Restore email services**
   - Verify email delivery
   - Test notification systems
   - Check email queues

## Emergency Contacts
- System Administrator: admin@girlspreneur.com
- Emergency Phone: +1-555-0123
- Hosting Provider: support@hosting.com
- DNS Provider: support@dns.com

## Backup Locations
- Local: /var/backups/girlspreneur/
- Offsite: your-offsite-location/
- Cloud: s3://your-backup-bucket/

## Testing Procedures
Regular testing of recovery procedures:
1. Monthly: Test backup restoration
2. Quarterly: Full disaster recovery drill
3. Annually: Complete infrastructure recovery test

## Documentation Updates
This recovery plan should be reviewed and updated:
- Monthly: Review contact information
- Quarterly: Update recovery procedures
- Annually: Complete plan review and testing
EOF
```

### 3. Testing Recovery Procedures
```bash
# Create recovery testing script
cat > /usr/local/bin/test-recovery << EOF
#!/bin/bash

echo "Starting recovery test..."

# Create test backup
/var/backups/girlspreneur/full-backup.sh

# Find latest backup
LATEST_BACKUP=\$(ls -t /var/backups/girlspreneur/full_backup_*.tar.gz | head -1)

echo "Testing recovery with: \$LATEST_BACKUP"

# Test backup integrity
tar -tzf \$LATEST_BACKUP > /dev/null

if [ \$? -eq 0 ]; then
    echo "Backup integrity test: PASSED"
else
    echo "Backup integrity test: FAILED"
    exit 1
fi

# Test database backup extraction
tar -xzf \$LATEST_BACKUP -C /tmp db_backup.sql
if [ -f /tmp/db_backup.sql ]; then
    echo "Database backup test: PASSED"
    rm /tmp/db_backup.sql
else
    echo "Database backup test: FAILED"
    exit 1
fi

# Test application files
tar -xzf \$LATEST_BACKUP -C /tmp var/www/girlspreneur.com/package.json
if [ -f /tmp/var/www/girlspreneur.com/package.json ]; then
    echo "Application files test: PASSED"
    rm -rf /tmp/var
else
    echo "Application files test: FAILED"
    exit 1
fi

echo "Recovery test completed successfully"
EOF

# Make script executable
chmod +x /usr/local/bin/test-recovery

# Add to crontab for monthly recovery testing
echo "0 3 1 * * /usr/local/bin/test-recovery" | crontab -
```

## Final Steps

### 1. Verify Deployment
```bash
# Run comprehensive verification
/usr/local/bin/health-check
/usr/local/bin/system-monitor
/usr/local/bin/performance-report
```

### 2. Setup Monitoring Alerts
```bash
# Configure monitoring alerts
# - Set up email alerts for health check failures
# - Configure Slack notifications for critical issues
# - Setup SMS alerts for emergency situations
```

### 3. Documentation
```bash
# Create deployment documentation
cat > /var/www/girlspreneur.com/DEPLOYMENT.md << EOF
# GirlsPreneur Deployment Information

## Deployment Date: $(date)
## Version: $(git rev-parse --short HEAD)
## Environment: Production

## Access URLs
- Main Application: https://girlspreneur.com
- API: https://api.girlspreneur.com
- Staging: https://staging.girlspreneur.com
- Health Check: https://girlspreneur.com/api/health

## Server Information
- IP Address: $(curl -s ifconfig.me)
- Hostname: $(hostname)
- OS: $(lsb_release -d)
- Node.js: $(node --version)
- PostgreSQL: $(psql --version)
- Nginx: $(nginx -v 2>&1 | cut -d' ' -f3)

## Services Status
$(pm2 status)

## Database Information
- Database: girlspreneur_production
- User: girlspreneur
- Port: 5432

## Backup Information
- Local Backup: /var/backups/girlspreneur/
- Backup Schedule: Daily at 2 AM
- Retention: 30 days

## Monitoring
- Application Logs: /var/log/girlspreneur/
- System Logs: journalctl -u girlspreneur
- Performance: pm2 monit

## Maintenance Commands
- Health Check: /usr/local/bin/health-check
- System Monitor: /usr/local/bin/system-monitor
- Performance Report: /usr/local/bin/performance-report
- Backup: /var/backups/girlspreneur/full-backup.sh
- Recovery: /var/backups/girlspreneur/recover.sh

## Emergency Contacts
- System Administrator: admin@girlspreneur.com
- Emergency Phone: +1-555-0123
EOF
```

### 4. Final Security Check
```bash
# Run security audit
sudo apt install -y lynis
sudo lynis audit system

# Check for vulnerabilities
sudo apt install -y clamav
sudo freshclam
sudo clamscan -r /var/www/girlspreneur.com

# Update system
sudo apt update && sudo apt upgrade -y
```

## Conclusion

This comprehensive deployment guide provides all the necessary steps to deploy, configure, and maintain the GirlsPreneur platform in a production environment. The guide covers infrastructure setup, application deployment, database configuration, security hardening, monitoring, backup procedures, and disaster recovery.

Regular maintenance and monitoring are essential for ensuring the platform remains secure, performant, and reliable. Always keep documentation updated and test recovery procedures regularly to ensure business continuity.

For additional support or questions, please refer to the project documentation or contact the system administrator.