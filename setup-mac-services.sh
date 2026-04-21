#!/bin/bash

# Setup script for Mac mini deployment with launchd services
# This script installs and configures the IBC platform to auto-start on reboot

set -e

echo "=========================================="
echo "Mac Mini Deployment Setup"
echo "Inspired Benevolence Cybersecurity"
echo "=========================================="
echo ""

# Get current directory
INSTALL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "Installation directory: $INSTALL_DIR"
echo ""

# Check if serve is installed
if ! command -v serve &> /dev/null; then
    echo "📦 Installing 'serve' globally for frontend hosting..."
    npm install -g serve
    echo "✅ 'serve' installed"
else
    echo "✅ 'serve' already installed"
fi

# Create log directories
echo "📁 Creating log directories..."
mkdir -p "$INSTALL_DIR/backend/logs"
mkdir -p "$INSTALL_DIR/frontend/logs"
echo "✅ Log directories created"
echo ""

# Update plist files with correct paths
echo "📝 Updating plist files with installation path..."

# Update backend plist
sed "s|/Users/william/factory/inspired-benevolence-cybersecurity|$INSTALL_DIR|g" \
    "$INSTALL_DIR/com.ibc.backend.plist" > /tmp/com.ibc.backend.plist

# Update frontend plist
sed "s|/Users/william/factory/inspired-benevolence-cybersecurity|$INSTALL_DIR|g" \
    "$INSTALL_DIR/com.ibc.frontend.plist" > /tmp/com.ibc.frontend.plist

# Detect node path
NODE_PATH=$(which node)
echo "Detected Node.js path: $NODE_PATH"

# Update node path in backend plist
sed -i '' "s|/usr/local/bin/node|$NODE_PATH|g" /tmp/com.ibc.backend.plist

# Detect serve path
SERVE_PATH=$(which serve)
echo "Detected serve path: $SERVE_PATH"

# Update serve path in frontend plist
sed -i '' "s|/usr/local/bin/serve|$SERVE_PATH|g" /tmp/com.ibc.frontend.plist

echo "✅ Plist files updated"
echo ""

# Copy to LaunchAgents
LAUNCH_DIR="$HOME/Library/LaunchAgents"
mkdir -p "$LAUNCH_DIR"

echo "📋 Installing launchd services..."

# Unload existing services if they exist
launchctl unload "$LAUNCH_DIR/com.ibc.backend.plist" 2>/dev/null || true
launchctl unload "$LAUNCH_DIR/com.ibc.frontend.plist" 2>/dev/null || true

# Copy plist files
cp /tmp/com.ibc.backend.plist "$LAUNCH_DIR/"
cp /tmp/com.ibc.frontend.plist "$LAUNCH_DIR/"

# Set correct permissions
chmod 644 "$LAUNCH_DIR/com.ibc.backend.plist"
chmod 644 "$LAUNCH_DIR/com.ibc.frontend.plist"

echo "✅ Services installed"
echo ""

# Build the application
echo "🔨 Building application..."

# Build backend
cd "$INSTALL_DIR/backend"
echo "  Building backend..."
npm run build
cd "$INSTALL_DIR"

# Build frontend
cd "$INSTALL_DIR/frontend"
echo "  Building frontend..."
npm run build
cd "$INSTALL_DIR"

echo "✅ Build complete"
echo ""

# Load services
echo "🚀 Starting services..."

launchctl load "$LAUNCH_DIR/com.ibc.backend.plist"
launchctl load "$LAUNCH_DIR/com.ibc.frontend.plist"

# Give services a moment to start
sleep 3

# Check service status
echo ""
echo "📊 Service Status:"
launchctl list | grep com.ibc || echo "⚠️  Services not found in launchctl list"

echo ""
echo "=========================================="
echo "Setup Complete! 🎉"
echo "=========================================="
echo ""
echo "Services installed and started:"
echo "  ✅ Backend API (port 3001)"
echo "  ✅ Frontend UI (port 3000)"
echo ""
echo "Access the application:"
echo "  http://localhost:3000"
echo ""
echo "Service Management:"
echo "  View logs:    tail -f $INSTALL_DIR/backend/logs/backend.log"
echo "  Stop backend: launchctl stop com.ibc.backend"
echo "  Start backend: launchctl start com.ibc.backend"
echo "  Stop frontend: launchctl stop com.ibc.frontend"
echo "  Start frontend: launchctl start com.ibc.frontend"
echo ""
echo "The services will automatically start on reboot."
echo ""
