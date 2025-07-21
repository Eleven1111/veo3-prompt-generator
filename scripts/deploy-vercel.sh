#!/bin/bash

# Vercel Deployment Script for Veo3 Prompt Generator

set -euo pipefail

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Check if Vercel CLI is installed
check_vercel_cli() {
    if ! command -v vercel >/dev/null 2>&1; then
        error "Vercel CLI is not installed. Install it with: npm i -g vercel"
    fi
    log "Vercel CLI found"
}

# Setup environment variables
setup_env_vars() {
    log "Setting up environment variables..."
    
    echo "Please set up the following environment variables in Vercel:"
    echo "1. Go to your Vercel dashboard"
    echo "2. Select your project"
    echo "3. Go to Settings > Environment Variables"
    echo "4. Add the following variables:"
    echo ""
    echo "GEMINI_API_KEY=your_gemini_api_key_here"
    echo "NODE_ENV=production"
    echo "NEXT_PUBLIC_API_URL=https://your-domain.vercel.app"
    echo ""
    
    read -p "Have you set up the environment variables? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        error "Please set up environment variables first"
    fi
}

# Prepare for deployment
prepare_deployment() {
    log "Preparing for deployment..."
    
    # Move to client directory for Vercel deployment
    cd client
    
    # Install dependencies
    log "Installing dependencies..."
    npm install
    
    # Build the project
    log "Building the project..."
    npm run build
    
    log "Build completed successfully"
}

# Deploy to Vercel
deploy_to_vercel() {
    log "Deploying to Vercel..."
    
    # Deploy
    vercel --prod
    
    log "Deployment completed!"
}

# Main deployment function
main() {
    log "Starting Vercel deployment for Veo3 Prompt Generator..."
    
    check_vercel_cli
    setup_env_vars
    prepare_deployment
    deploy_to_vercel
    
    log "🎉 Deployment successful!"
    echo ""
    echo "Your Veo3 Prompt Generator is now live on Vercel!"
    echo "Don't forget to:"
    echo "1. Test all functionality"
    echo "2. Set up custom domain (optional)"
    echo "3. Configure analytics (optional)"
    echo "4. Set up monitoring"
}

# Show usage
usage() {
    echo "Usage: $0"
    echo ""
    echo "This script will deploy the Veo3 Prompt Generator to Vercel."
    echo "Make sure you have:"
    echo "1. Vercel CLI installed (npm i -g vercel)"
    echo "2. Vercel account set up"
    echo "3. Google Gemini API key ready"
}

# Handle arguments
case "${1:-}" in
    "-h"|"--help")
        usage
        exit 0
        ;;
    *)
        main
        ;;
esac