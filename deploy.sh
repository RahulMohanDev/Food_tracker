#!/bin/bash

# Food Tracker Deployment Script
# This script handles deployment on the DigitalOcean server

set -e

echo "🚀 Starting deployment..."

# Check if running as root or with sudo
if [ "$EUID" -eq 0 ]; then
  echo "⚠️  Please do not run this script as root"
  exit 1
fi

# Pull latest changes
echo "📥 Pulling latest code from git..."
git pull origin main

# Check if .env file exists
if [ ! -f .env ]; then
  echo "⚠️  .env file not found. Please create one based on .env.example"
  exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build new images
echo "🔨 Building Docker images..."
docker-compose build --no-cache

# Start containers
echo "▶️  Starting containers..."
docker-compose up -d

# Wait for health check
echo "⏳ Waiting for application to be healthy..."
sleep 10

# Check container status
echo "📊 Container status:"
docker-compose ps

# Clean up old images
echo "🧹 Cleaning up old Docker images..."
docker image prune -f

echo "✅ Deployment complete!"
echo "📝 Application is running at http://localhost:3000"
