#!/bin/bash

# Veo3 Prompt Generator Deployment Script
# This script handles deployment, updates, and maintenance tasks

set -euo pipefail

# Configuration
PROJECT_NAME="veo3-prompt-generator"
BACKUP_DIR="/backups"
LOG_FILE="/var/log/veo3-deploy.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging function
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker >/dev/null 2>&1; then
        error "Docker is not installed. Please install Docker first."
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose >/dev/null 2>&1; then
        error "Docker Compose is not installed. Please install Docker Compose first."
    fi
    
    # Check if .env file exists
    if [[ ! -f .env ]]; then
        warning ".env file not found. Creating from .env.example..."
        if [[ -f .env.example ]]; then
            cp .env.example .env
            info "Please edit .env file with your configuration before continuing."
            exit 1
        else
            error ".env.example file not found. Cannot create .env file."
        fi
    fi
    
    log "Prerequisites check completed successfully"
}

# Create necessary directories
create_directories() {
    log "Creating necessary directories..."
    
    mkdir -p logs
    mkdir -p server/uploads
    mkdir -p server/logs
    mkdir -p "$BACKUP_DIR"
    mkdir -p ssl
    
    log "Directories created successfully"
}

# Generate SSL certificates (self-signed for development)
generate_ssl_certificates() {
    log "Generating SSL certificates..."
    
    if [[ ! -f ssl/cert.pem ]] || [[ ! -f ssl/key.pem ]]; then
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ssl/key.pem \
            -out ssl/cert.pem \
            -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
        
        log "SSL certificates generated successfully"
    else
        info "SSL certificates already exist"
    fi
}

# Backup database
backup_database() {
    log "Creating database backup..."
    
    local backup_file="$BACKUP_DIR/veo3_backup_$(date +%Y%m%d_%H%M%S).sql"
    
    if docker-compose ps postgres | grep -q "Up"; then
        docker-compose exec -T postgres pg_dump -U veo3_user veo3_prompts > "$backup_file"
        log "Database backup created: $backup_file"
    else
        warning "PostgreSQL container is not running. Skipping backup."
    fi
}

# Build and start services
deploy() {
    log "Starting deployment..."
    
    # Pull latest images
    log "Pulling latest Docker images..."
    docker-compose pull
    
    # Build custom images
    log "Building application images..."
    docker-compose build --no-cache
    
    # Start services
    log "Starting services..."
    docker-compose up -d
    
    # Wait for services to be healthy
    log "Waiting for services to be healthy..."
    sleep 30
    
    # Check service health
    check_service_health
    
    log "Deployment completed successfully"
}

# Check service health
check_service_health() {
    log "Checking service health..."
    
    local services=("postgres" "redis" "server" "client")
    local failed_services=()
    
    for service in "${services[@]}"; do
        if ! docker-compose ps "$service" | grep -q "Up"; then
            failed_services+=("$service")
        fi
    done
    
    if [[ ${#failed_services[@]} -gt 0 ]]; then
        error "The following services failed to start: ${failed_services[*]}"
    fi
    
    # Test API endpoint
    sleep 10
    if ! curl -f http://localhost:3001/api/health >/dev/null 2>&1; then
        error "API health check failed"
    fi
    
    # Test frontend
    if ! curl -f http://localhost:3000 >/dev/null 2>&1; then
        error "Frontend health check failed"
    fi
    
    log "All services are healthy"
}

# Update application
update() {
    log "Starting application update..."
    
    # Create backup before update
    backup_database
    
    # Pull latest code (if using git)
    if [[ -d .git ]]; then
        log "Pulling latest code..."
        git pull origin main
    fi
    
    # Rebuild and restart services
    deploy
    
    log "Application update completed successfully"
}

# Stop services
stop() {
    log "Stopping services..."
    docker-compose down
    log "Services stopped successfully"
}

# Restart services
restart() {
    log "Restarting services..."
    docker-compose restart
    log "Services restarted successfully"
}

# View logs
logs() {
    local service="${1:-}"
    
    if [[ -n "$service" ]]; then
        docker-compose logs -f "$service"
    else
        docker-compose logs -f
    fi
}

# Clean up old images and containers
cleanup() {
    log "Cleaning up old Docker images and containers..."
    
    # Remove stopped containers
    docker container prune -f
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused volumes
    docker volume prune -f
    
    # Remove unused networks
    docker network prune -f
    
    log "Cleanup completed successfully"
}

# Monitor services
monitor() {
    log "Starting monitoring..."
    
    while true; do
        clear
        echo "=== Veo3 Prompt Generator Status ==="
        echo
        
        # Show container status
        echo "Container Status:"
        docker-compose ps
        echo
        
        # Show resource usage
        echo "Resource Usage:"
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
        echo
        
        # Show recent logs
        echo "Recent Logs (last 10 lines):"
        docker-compose logs --tail=10
        
        sleep 30
    done
}

# Show usage information
usage() {
    echo "Usage: $0 {deploy|update|stop|restart|logs|cleanup|monitor|backup}"
    echo
    echo "Commands:"
    echo "  deploy   - Deploy the application (first time setup)"
    echo "  update   - Update the application with latest changes"
    echo "  stop     - Stop all services"
    echo "  restart  - Restart all services"
    echo "  logs     - View logs (optionally specify service name)"
    echo "  cleanup  - Clean up old Docker images and containers"
    echo "  monitor  - Monitor service status and logs"
    echo "  backup   - Create database backup"
    echo
    echo "Examples:"
    echo "  $0 deploy"
    echo "  $0 logs server"
    echo "  $0 update"
}

# Main function
main() {
    local command="${1:-}"
    
    case "$command" in
        "deploy")
            check_prerequisites
            create_directories
            generate_ssl_certificates
            deploy
            ;;
        "update")
            update
            ;;
        "stop")
            stop
            ;;
        "restart")
            restart
            ;;
        "logs")
            logs "${2:-}"
            ;;
        "cleanup")
            cleanup
            ;;
        "monitor")
            monitor
            ;;
        "backup")
            backup_database
            ;;
        *)
            usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"