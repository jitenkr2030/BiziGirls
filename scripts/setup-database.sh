#!/bin/bash

# GirlsPreneur Production Database Setup Script
# This script sets up and configures PostgreSQL for production use

set -e

# Configuration
DB_NAME="girlspreneur_production"
DB_USER="girlspreneur"
DB_PASSWORD="your-secure-password-here"
DB_HOST="localhost"
DB_PORT="5432"

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

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    error "PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

# Create database user
create_database_user() {
    log "Creating database user..."
    
    # Check if user already exists
    if sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1; then
        warn "Database user '$DB_USER' already exists"
    else
        sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD' NOSUPERUSER NOCREATEDB NOCREATEROLE;"
        log "Database user '$DB_USER' created successfully"
    fi
}

# Create database
create_database() {
    log "Creating database..."
    
    # Check if database already exists
    if sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1; then
        warn "Database '$DB_NAME' already exists"
    else
        sudo -u postgres createdb -O $DB_USER $DB_NAME
        log "Database '$DB_NAME' created successfully"
    fi
}

# Install PostgreSQL extensions
install_extensions() {
    log "Installing PostgreSQL extensions..."
    
    # Install required extensions
    sudo -u postgres psql -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
    sudo -u postgres psql -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS \"pgcrypto\";"
    sudo -u postgres psql -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS \"pg_stat_statements\";"
    sudo -u postgres psql -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS \"auto_explain\";"
    sudo -u postgres psql -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS \"pg_trgm\";"
    sudo -u postgres psql -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS \"btree_gin\";"
    sudo -u postgres psql -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS \"btree_gist\";"
    
    log "PostgreSQL extensions installed successfully"
}

# Configure PostgreSQL
configure_postgresql() {
    log "Configuring PostgreSQL..."
    
    # Backup original configuration
    cp /etc/postgresql/14/main/postgresql.conf /etc/postgresql/14/main/postgresql.conf.backup
    
    # Copy production configuration
    cp /home/girlspreneur/girlspreneur/config/postgresql-production.conf /etc/postgresql/14/main/postgresql.conf
    
    # Configure pg_hba.conf for secure access
    cat > /etc/postgresql/14/main/pg_hba.conf << EOF
# PostgreSQL Client Authentication Configuration File
# ===================================================
#
# DO NOT DISABLE!
# If you change this first entry you will need to make sure that
# the database superuser can access the database using some other method.
# Noninteractive access to all databases is required during automatic
# maintenance (custom daily cronjobs, replication, and similar tasks).
#
# Database administrative login by Unix domain socket
local   all             postgres                                scram-sha-256

# TYPE  DATABASE        USER            ADDRESS                 METHOD

# Local connections
local   all             all                                     scram-sha-256

# IPv4 local connections:
host    all             all             127.0.0.1/32            scram-sha-256

# IPv6 local connections:
host    all             all             ::1/128                 scram-sha-256

# Allow replication connections from localhost, by a user with the
# replication privilege.
local   replication     all                                     scram-sha-256
host    replication     all             127.0.0.1/32            scram-sha-256
host    replication     all             ::1/128                 scram-sha-256

# Add secure remote access if needed (uncomment and configure)
# host    all             all             0.0.0.0/0               scram-sha-256
EOF

    # Create necessary directories
    mkdir -p /var/backups/postgresql/archive
    mkdir -p /var/log/postgresql
    chown -R postgres:postgres /var/backups/postgresql
    chown -R postgres:postgres /var/log/postgresql
    
    # Set proper permissions
    chmod 700 /var/backups/postgresql/archive
    chmod 750 /var/log/postgresql
    
    log "PostgreSQL configuration completed"
}

# Create database functions and procedures
create_database_functions() {
    log "Creating database functions..."
    
    # Create function for generating UUIDs
    sudo -u postgres psql -d $DB_NAME -c "
    CREATE OR REPLACE FUNCTION generate_uuid()
    RETURNS UUID AS $$
    BEGIN
        RETURN uuid_generate_v4();
    END;
    $$ LANGUAGE plpgsql;
    "
    
    # Create function for updating updated_at timestamp
    sudo -u postgres psql -d $DB_NAME -c "
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    "
    
    # Create function for soft delete
    sudo -u postgres psql -d $DB_NAME -c "
    CREATE OR REPLACE FUNCTION soft_delete()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.deleted_at = NOW();
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    "
    
    log "Database functions created successfully"
}

# Create database indexes for performance
create_database_indexes() {
    log "Creating database indexes..."
    
    # Create indexes for common queries
    sudo -u postgres psql -d $DB_NAME -c "
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
    CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
    
    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
    
    CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
    CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at);
    CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON courses(instructor_id);
    
    CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
    CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
    CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);
    
    CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
    CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
    CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
    
    CREATE INDEX IF NOT EXISTS idx_mentorships_mentor_id ON mentorships(mentor_id);
    CREATE INDEX IF NOT EXISTS idx_mentorships_mentee_id ON mentorships(mentee_id);
    CREATE INDEX IF NOT EXISTS idx_mentorships_status ON mentorships(status);
    "
    
    log "Database indexes created successfully"
}

# Setup database monitoring
setup_database_monitoring() {
    log "Setting up database monitoring..."
    
    # Create monitoring views
    sudo -u postgres psql -d $DB_NAME -c "
    CREATE OR REPLACE VIEW database_stats AS
    SELECT 
        schemaname,
        tablename,
        attname,
        n_distinct,
        correlation
    FROM pg_stats
    WHERE schemaname = 'public';
    "
    
    # Create slow query log table
    sudo -u postgres psql -d $DB_NAME -c "
    CREATE TABLE IF NOT EXISTS slow_queries (
        id UUID PRIMARY KEY DEFAULT generate_uuid(),
        query_text TEXT,
        execution_time INTEGER,
        query_start TIMESTAMP,
        user_name VARCHAR(255),
        database_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
    );
    "
    
    # Create index on slow_queries
    sudo -u postgres psql -d $DB_NAME -c "
    CREATE INDEX IF NOT EXISTS idx_slow_queries_created_at ON slow_queries(created_at);
    CREATE INDEX IF NOT EXISTS idx_slow_queries_execution_time ON slow_queries(execution_time);
    "
    
    log "Database monitoring setup completed"
}

# Setup database backup procedures
setup_backup_procedures() {
    log "Setting up backup procedures..."
    
    # Create backup directory structure
    mkdir -p /var/backups/postgresql/daily
    mkdir -p /var/backups/postgresql/weekly
    mkdir -p /var/backups/postgresql/monthly
    
    # Set permissions
    chown -R postgres:postgres /var/backups/postgresql
    chmod -R 750 /var/backups/postgresql
    
    # Create backup script
    cat > /usr/local/bin/backup-postgresql << EOF
#!/bin/bash

# GirlsPreneur PostgreSQL Backup Script
BACKUP_DIR="/var/backups/postgresql"
DB_NAME="$DB_NAME"
DB_USER="$DB_USER"
DATE=\$(date +%Y%m%d_%H%M%S)
DOW=\$(date +%A)
DOM=\$(date +%d)

# Create daily backup
pg_dump -h localhost -U \$DB_USER -d \$DB_NAME -F c -f \$BACKUP_DIR/daily/\${DB_NAME}_\${DATE}.dump

# Create weekly backup on Sunday
if [ "\$DOW" = "Sunday" ]; then
    cp \$BACKUP_DIR/daily/\${DB_NAME}_\${DATE}.dump \$BACKUP_DIR/weekly/\${DB_NAME}_\${DATE}.dump
fi

# Create monthly backup on 1st of month
if [ "\$DOM" = "01" ]; then
    cp \$BACKUP_DIR/daily/\${DB_NAME}_\${DATE}.dump \$BACKUP_DIR/monthly/\${DB_NAME}_\${DATE}.dump
fi

# Clean up old backups
find \$BACKUP_DIR/daily -name "*.dump" -mtime +7 -delete
find \$BACKUP_DIR/weekly -name "*.dump" -mtime +30 -delete
find \$BACKUP_DIR/monthly -name "*.dump" -mtime +365 -delete

# Compress old backups
find \$BACKUP_DIR/daily -name "*.dump" -mtime +1 -exec gzip {} \;
find \$BACKUP_DIR/weekly -name "*.dump" -mtime +7 -exec gzip {} \;
find \$BACKUP_DIR/monthly -name "*.dump" -mtime +30 -exec gzip {} \;

echo "Backup completed: \$BACKUP_DIR/daily/\${DB_NAME}_\${DATE}.dump"
EOF

    # Make backup script executable
    chmod +x /usr/local/bin/backup-postgresql
    
    # Add to crontab
    echo "0 2 * * * /usr/local/bin/backup-postgresql" | crontab -
    
    log "Backup procedures setup completed"
}

# Setup database security
setup_database_security() {
    log "Setting up database security..."
    
    # Remove default postgres password if set
    sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD NULL;"
    
    # Create security roles
    sudo -u postgres psql -d $DB_NAME -c "
    CREATE ROLE IF NOT EXISTS read_only;
    GRANT CONNECT ON DATABASE $DB_NAME TO read_only;
    GRANT USAGE ON SCHEMA public TO read_only;
    GRANT SELECT ON ALL TABLES IN SCHEMA public TO read_only;
    GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO read_only;
    
    CREATE ROLE IF NOT EXISTS read_write;
    GRANT CONNECT ON DATABASE $DB_NAME TO read_write;
    GRANT USAGE ON SCHEMA public TO read_write;
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO read_write;
    GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO read_write;
    
    CREATE ROLE IF NOT EXISTS ddl_admin;
    GRANT CONNECT ON DATABASE $DB_NAME TO ddl_admin;
    GRANT USAGE ON SCHEMA public TO ddl_admin;
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ddl_admin;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ddl_admin;
    GRANT CREATE ON SCHEMA public TO ddl_admin;
    "
    
    # Set up row-level security example
    sudo -u postgres psql -d $DB_NAME -c "
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY user_isolation ON users
        FOR ALL
        USING (id = current_user_id());
    "
    
    log "Database security setup completed"
}

# Restart PostgreSQL
restart_postgresql() {
    log "Restarting PostgreSQL..."
    
    systemctl restart postgresql
    systemctl enable postgresql
    
    # Wait for PostgreSQL to start
    sleep 5
    
    # Check if PostgreSQL is running
    if systemctl is-active --quiet postgresql; then
        log "PostgreSQL restarted successfully"
    else
        error "PostgreSQL failed to restart"
        exit 1
    fi
}

# Test database connection
test_database_connection() {
    log "Testing database connection..."
    
    # Test connection as postgres user
    if sudo -u postgres psql -d $DB_NAME -c "SELECT 1;" > /dev/null 2>&1; then
        log "Database connection test successful (postgres user)"
    else
        error "Database connection test failed (postgres user)"
        exit 1
    fi
    
    # Test connection as application user
    if PGPASSWORD="$DB_PASSWORD" psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" > /dev/null 2>&1; then
        log "Database connection test successful (application user)"
    else
        error "Database connection test failed (application user)"
        exit 1
    fi
}

# Generate database configuration summary
generate_summary() {
    log "Generating database configuration summary..."
    
    cat > /var/backups/postgresql/database-setup-summary.txt << EOF
GirlsPreneur Database Setup Summary
===================================
Date: $(date)
Database: $DB_NAME
User: $DB_USER
Host: $DB_HOST
Port: $DB_PORT

Configuration Files:
- PostgreSQL Config: /etc/postgresql/14/main/postgresql.conf
- Authentication Config: /etc/postgresql/14/main/pg_hba.conf
- Backup Script: /usr/local/bin/backup-postgresql

Backup Schedule:
- Daily: 2:00 AM
- Weekly: Sunday 2:00 AM
- Monthly: 1st of month 2:00 AM

Backup Locations:
- Daily: /var/backups/postgresql/daily/
- Weekly: /var/backups/postgresql/weekly/
- Monthly: /var/backups/postgresql/monthly/

Monitoring:
- Slow Query Log: Enabled
- Performance Stats: Enabled
- Auto-explain: Enabled

Security:
- SSL: Enabled
- Row Level Security: Enabled
- Custom Roles: read_only, read_write, ddl_admin

Extensions Installed:
- uuid-ossp
- pgcrypto
- pg_stat_statements
- auto_explain
- pg_trgm
- btree_gin
- btree_gist

Database Functions:
- generate_uuid()
- update_updated_at_column()
- soft_delete()

Database Indexes:
- Users: email, created_at, status
- Sessions: user_id, expires_at
- Courses: status, created_at, instructor_id
- Enrollments: user_id, course_id, status
- Payments: user_id, status, created_at
- Mentorships: mentor_id, mentee_id, status

Next Steps:
1. Update application configuration with database credentials
2. Run database migrations
3. Test application functionality
4. Set up monitoring alerts
5. Schedule regular maintenance

EOF

    log "Database configuration summary generated"
}

# Main setup process
main() {
    log "Starting GirlsPreneur production database setup..."
    
    create_database_user
    create_database
    install_extensions
    configure_postgresql
    create_database_functions
    create_database_indexes
    setup_database_monitoring
    setup_backup_procedures
    setup_database_security
    restart_postgresql
    test_database_connection
    generate_summary
    
    log "GirlsPreneur production database setup completed successfully!"
    log ""
    log "Database Information:"
    log "  Name: $DB_NAME"
    log "  User: $DB_USER"
    log "  Host: $DB_HOST"
    log "  Port: $DB_PORT"
    log ""
    log "Next Steps:"
    log "1. Update your application configuration with database credentials"
    log "2. Run database migrations using Prisma"
    log "3. Test application functionality"
    log "4. Set up monitoring and alerts"
    log "5. Review security configuration"
}

# Run main function
main "$@"