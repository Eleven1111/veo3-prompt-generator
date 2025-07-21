#!/bin/bash

# Veo3 Prompt Generator Security Monitoring Script
# This script monitors for security threats and suspicious activities

set -euo pipefail

# Configuration
LOG_FILE="/var/log/veo3-security.log"
ALERT_EMAIL="admin@yourdomain.com"
MAX_REQUESTS_PER_MINUTE=100
SUSPICIOUS_PATTERNS=(
    "sql injection"
    "xss attack"
    "directory traversal"
    "command injection"
    "prompt injection"
    "system prompt"
    "ignore previous"
)

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Alert function
alert() {
    local message="$1"
    local severity="$2"
    
    log "ALERT [$severity]: $message"
    
    # Send email alert (requires mail command)
    if command -v mail >/dev/null 2>&1; then
        echo "$message" | mail -s "Veo3 Security Alert - $severity" "$ALERT_EMAIL"
    fi
    
    # Send to syslog
    logger -p local0.warn "Veo3 Security Alert: $message"
}

# Check for suspicious patterns in logs
check_suspicious_patterns() {
    log "Checking for suspicious patterns..."
    
    local nginx_log="/var/log/nginx/access.log"
    local app_log="/app/logs/combined.log"
    
    for pattern in "${SUSPICIOUS_PATTERNS[@]}"; do
        if [[ -f "$nginx_log" ]]; then
            local count=$(grep -i "$pattern" "$nginx_log" | wc -l)
            if [[ $count -gt 0 ]]; then
                alert "Suspicious pattern '$pattern' found $count times in nginx logs" "HIGH"
            fi
        fi
        
        if [[ -f "$app_log" ]]; then
            local count=$(grep -i "$pattern" "$app_log" | wc -l)
            if [[ $count -gt 0 ]]; then
                alert "Suspicious pattern '$pattern' found $count times in application logs" "HIGH"
            fi
        fi
    done
}

# Check for rate limit violations
check_rate_limits() {
    log "Checking rate limits..."
    
    local nginx_log="/var/log/nginx/access.log"
    if [[ -f "$nginx_log" ]]; then
        # Check requests per minute for each IP
        local current_minute=$(date '+%d/%b/%Y:%H:%M')
        local high_traffic_ips=$(grep "$current_minute" "$nginx_log" | \
            awk '{print $1}' | sort | uniq -c | \
            awk -v max="$MAX_REQUESTS_PER_MINUTE" '$1 > max {print $2 " " $1}')
        
        if [[ -n "$high_traffic_ips" ]]; then
            while read -r ip count; do
                alert "High traffic from IP $ip: $count requests in current minute" "MEDIUM"
            done <<< "$high_traffic_ips"
        fi
    fi
}

# Check system resources
check_system_resources() {
    log "Checking system resources..."
    
    # Check CPU usage
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')
    if (( $(echo "$cpu_usage > 80" | bc -l) )); then
        alert "High CPU usage: ${cpu_usage}%" "MEDIUM"
    fi
    
    # Check memory usage
    local mem_usage=$(free | grep Mem | awk '{printf("%.1f", $3/$2 * 100.0)}')
    if (( $(echo "$mem_usage > 85" | bc -l) )); then
        alert "High memory usage: ${mem_usage}%" "MEDIUM"
    fi
    
    # Check disk usage
    local disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    if [[ $disk_usage -gt 85 ]]; then
        alert "High disk usage: ${disk_usage}%" "MEDIUM"
    fi
}

# Check Docker containers health
check_docker_health() {
    log "Checking Docker containers health..."
    
    if command -v docker >/dev/null 2>&1; then
        local unhealthy_containers=$(docker ps --filter "health=unhealthy" --format "table {{.Names}}")
        if [[ $(echo "$unhealthy_containers" | wc -l) -gt 1 ]]; then
            alert "Unhealthy Docker containers detected: $unhealthy_containers" "HIGH"
        fi
        
        local stopped_containers=$(docker ps -a --filter "status=exited" --format "table {{.Names}}")
        if [[ $(echo "$stopped_containers" | wc -l) -gt 1 ]]; then
            alert "Stopped Docker containers detected: $stopped_containers" "MEDIUM"
        fi
    fi
}

# Check database connections
check_database() {
    log "Checking database health..."
    
    # Check PostgreSQL
    if command -v psql >/dev/null 2>&1; then
        if ! psql -h localhost -U veo3_user -d veo3_prompts -c "SELECT 1;" >/dev/null 2>&1; then
            alert "PostgreSQL database connection failed" "CRITICAL"
        fi
    fi
    
    # Check Redis
    if command -v redis-cli >/dev/null 2>&1; then
        if ! redis-cli ping >/dev/null 2>&1; then
            alert "Redis connection failed" "HIGH"
        fi
    fi
}

# Check SSL certificate expiration
check_ssl_certificate() {
    log "Checking SSL certificate..."
    
    local cert_file="/etc/nginx/ssl/cert.pem"
    if [[ -f "$cert_file" ]]; then
        local expiry_date=$(openssl x509 -enddate -noout -in "$cert_file" | cut -d= -f2)
        local expiry_epoch=$(date -d "$expiry_date" +%s)
        local current_epoch=$(date +%s)
        local days_until_expiry=$(( (expiry_epoch - current_epoch) / 86400 ))
        
        if [[ $days_until_expiry -lt 30 ]]; then
            alert "SSL certificate expires in $days_until_expiry days" "HIGH"
        elif [[ $days_until_expiry -lt 7 ]]; then
            alert "SSL certificate expires in $days_until_expiry days" "CRITICAL"
        fi
    fi
}

# Main monitoring function
main() {
    log "Starting security monitoring..."
    
    check_suspicious_patterns
    check_rate_limits
    check_system_resources
    check_docker_health
    check_database
    check_ssl_certificate
    
    log "Security monitoring completed"
}

# Run main function
main "$@"