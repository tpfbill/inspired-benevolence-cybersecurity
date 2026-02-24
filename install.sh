#!/bin/bash

# Inspired Benevolence Cybersecurity Platform - Installation Script
# This script automates the installation process

set -e

echo "=========================================="
echo "Inspired Benevolence Cybersecurity"
echo "Installation Script"
echo "=========================================="
echo ""

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current: $(node -v)"
    exit 1
fi

if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL not found. Please install PostgreSQL 14+ first."
    exit 1
fi

echo "✅ Node.js $(node -v)"
echo "✅ PostgreSQL installed"
echo ""

# Install dependencies
echo "Installing dependencies..."
echo "This may take a few minutes..."
echo ""

echo "📦 Installing root dependencies..."
npm install --silent

echo "📦 Installing backend dependencies..."
cd backend && npm install --silent && cd ..

echo "📦 Installing frontend dependencies..."
cd frontend && npm install --silent && cd ..

echo "✅ Dependencies installed"
echo ""

# Setup environment files
echo "Setting up environment configuration..."

if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env from template"
    echo "⚠️  Please edit backend/.env with your database credentials"
else
    echo "ℹ️  backend/.env already exists, skipping..."
fi

if [ ! -f frontend/.env ]; then
    cp frontend/.env.example frontend/.env
    echo "✅ Created frontend/.env from template"
else
    echo "ℹ️  frontend/.env already exists, skipping..."
fi

echo ""

# Database setup
echo "Setting up database..."
read -p "Do you want to create the database 'ibc_security'? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    if createdb ibc_security 2>/dev/null; then
        echo "✅ Database 'ibc_security' created"
    else
        echo "⚠️  Database 'ibc_security' may already exist or creation failed"
        echo "   You can create it manually with: createdb ibc_security"
    fi
else
    echo "ℹ️  Skipping database creation"
    echo "   Remember to create it manually: createdb ibc_security"
fi

echo ""

# Create logs directory
mkdir -p backend/logs
echo "✅ Created logs directory"

echo ""
echo "=========================================="
echo "Installation Complete! 🎉"
echo "=========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Configure environment:"
echo "   - Edit backend/.env with your database credentials"
echo "   - Update JWT_SECRET with a secure random string"
echo ""
echo "2. Start the development servers:"
echo "   npm run dev"
echo ""
echo "3. Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo ""
echo "4. Create your first admin user:"
echo "   See QUICKSTART.md for instructions"
echo ""
echo "For detailed documentation, see:"
echo "   - QUICKSTART.md  - Quick start guide"
echo "   - SETUP.md       - Detailed setup"
echo "   - FEATURES.md    - Feature documentation"
echo ""
echo "Happy incident responding! 🛡️"
