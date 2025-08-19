#!/bin/bash

# Production Deployment Checklist Script
echo "🚀 KazRPG Production Deployment Checklist"
echo "=========================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check environment variable
check_env_var() {
    if [ -z "${!1}" ]; then
        echo -e "${RED}❌ Missing environment variable: $1${NC}"
        return 1
    else
        echo -e "${GREEN}✅ $1 is set${NC}"
        return 0
    fi
}

# Function to check service status
check_service() {
    if systemctl is-active --quiet $1; then
        echo -e "${GREEN}✅ $1 is running${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 is not running${NC}"
        return 1
    fi
}

echo ""
echo "1. Environment Variables Check"
echo "------------------------------"

ENV_VARS=(
    "NODE_ENV"
    "DATABASE_URL" 
    "NEXTAUTH_URL"
    "NEXTAUTH_SECRET"
    "SMTP_HOST"
    "SMTP_USER"
    "SMTP_PASSWORD"
    "REDIS_URL"
    "AWS_ACCESS_KEY_ID"
    "AWS_SECRET_ACCESS_KEY"
    "KAZKOM_MERCHANT_ID"
    "KAZKOM_SECRET_KEY"
)

for var in "${ENV_VARS[@]}"; do
    check_env_var $var
done

echo ""
echo "2. Required Services Check"
echo "-------------------------"

# Check if running in Docker
if [ -f /.dockerenv ]; then
    echo -e "${YELLOW}⚠️  Running in Docker container${NC}"
else
    # Check system services
    SERVICES=("postgresql" "redis" "nginx")
    for service in "${SERVICES[@]}"; do
        check_service $service
    done
fi

echo ""
echo "3. Database Connectivity"
echo "------------------------"

# Test database connection
if command_exists psql; then
    if psql $DATABASE_URL -c "SELECT 1" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Database connection successful${NC}"
    else
        echo -e "${RED}❌ Database connection failed${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  psql not available for testing${NC}"
fi

echo ""
echo "4. SSL Certificate Check"
echo "------------------------"

if [ -f "/etc/nginx/ssl/kazrpg.crt" ]; then
    # Check certificate expiry
    EXPIRY=$(openssl x509 -enddate -noout -in /etc/nginx/ssl/kazrpg.crt | cut -d= -f2)
    EXPIRY_TIMESTAMP=$(date -d "$EXPIRY" +%s)
    CURRENT_TIMESTAMP=$(date +%s)
    DAYS_UNTIL_EXPIRY=$(( (EXPIRY_TIMESTAMP - CURRENT_TIMESTAMP) / 86400 ))
    
    if [ $DAYS_UNTIL_EXPIRY -gt 30 ]; then
        echo -e "${GREEN}✅ SSL certificate valid (expires in $DAYS_UNTIL_EXPIRY days)${NC}"
    elif [ $DAYS_UNTIL_EXPIRY -gt 0 ]; then
        echo -e "${YELLOW}⚠️  SSL certificate expires in $DAYS_UNTIL_EXPIRY days${NC}"
    else
        echo -e "${RED}❌ SSL certificate has expired${NC}"
    fi
else
    echo -e "${RED}❌ SSL certificate not found${NC}"
fi

echo ""
echo "5. Application Health Check"
echo "---------------------------"

# Health check endpoint
if command_exists curl; then
    if curl -f -s "http://localhost:3000/api/health" >/dev/null; then
        echo -e "${GREEN}✅ Application health check passed${NC}"
    else
        echo -e "${RED}❌ Application health check failed${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  curl not available for health check${NC}"
fi

echo ""
echo "6. Performance Checks"
echo "--------------------"

# Check available disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -lt 80 ]; then
    echo -e "${GREEN}✅ Disk usage: ${DISK_USAGE}%${NC}"
else
    echo -e "${YELLOW}⚠️  High disk usage: ${DISK_USAGE}%${NC}"
fi

# Check available memory
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ $MEMORY_USAGE -lt 80 ]; then
    echo -e "${GREEN}✅ Memory usage: ${MEMORY_USAGE}%${NC}"
else
    echo -e "${YELLOW}⚠️  High memory usage: ${MEMORY_USAGE}%${NC}"
fi

echo ""
echo "7. Security Checks"
echo "------------------"

# Check for security headers
if command_exists curl; then
    SECURITY_HEADERS=("X-Frame-Options" "X-Content-Type-Options" "X-XSS-Protection")
    for header in "${SECURITY_HEADERS[@]}"; do
        if curl -I -s "http://localhost:3000" | grep -i "$header" >/dev/null; then
            echo -e "${GREEN}✅ $header header present${NC}"
        else
            echo -e "${RED}❌ $header header missing${NC}"
        fi
    done
fi

echo ""
echo "8. Backup Verification"
echo "---------------------"

# Check if backup files exist
if [ -d "/var/backups/kazrpg" ]; then
    LATEST_BACKUP=$(ls -t /var/backups/kazrpg/*.sql.gz 2>/dev/null | head -1)
    if [ -n "$LATEST_BACKUP" ]; then
        BACKUP_AGE=$(( ($(date +%s) - $(stat -c %Y "$LATEST_BACKUP")) / 86400 ))
        if [ $BACKUP_AGE -le 1 ]; then
            echo -e "${GREEN}✅ Recent backup found (${BACKUP_AGE} days old)${NC}"
        else
            echo -e "${YELLOW}⚠️  Latest backup is ${BACKUP_AGE} days old${NC}"
        fi
    else
        echo -e "${RED}❌ No backups found${NC}"
    fi
else
    echo -e "${RED}❌ Backup directory not found${NC}"
fi

echo ""
echo "9. Monitoring Setup"
echo "------------------"

# Check if monitoring is configured
if [ -f "/var/log/kazrpg/app.log" ]; then
    echo -e "${GREEN}✅ Application logging configured${NC}"
else
    echo -e "${YELLOW}⚠️  Application logging not found${NC}"
fi

# Check log rotation
if [ -f "/etc/logrotate.d/kazrpg" ]; then
    echo -e "${GREEN}✅ Log rotation configured${NC}"
else
    echo -e "${YELLOW}⚠️  Log rotation not configured${NC}"
fi

echo ""
echo "10. Final Checks"
echo "---------------"

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_NODE_VERSION="18.0.0"
if [ "$(printf '%s\n' "$REQUIRED_NODE_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_NODE_VERSION" ]; then
    echo -e "${GREEN}✅ Node.js version: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js version $NODE_VERSION is below required $REQUIRED_NODE_VERSION${NC}"
fi

# Check if application is ready
if curl -f -s "http://localhost:3000" >/dev/null; then
    echo -e "${GREEN}✅ Application is responding${NC}"
else
    echo -e "${RED}❌ Application is not responding${NC}"
fi

echo ""
echo "=========================================="
echo "✨ Production checklist completed!"
echo "Review any warnings or errors above before going live."
echo "=========================================="