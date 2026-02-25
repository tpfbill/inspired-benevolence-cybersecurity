#!/bin/bash

# ManageEngine Integration Setup Script

echo "=========================================="
echo "ManageEngine Integration Setup"
echo "=========================================="
echo ""

# Check if backend/.env exists
if [ ! -f backend/.env ]; then
    echo "❌ backend/.env not found. Please run ./install.sh first."
    exit 1
fi

echo "This script will help you configure ManageEngine integration."
echo ""

# Ask for ManageEngine details
read -p "Enable ManageEngine integration? (y/n): " enable_me

if [[ ! $enable_me =~ ^[Yy]$ ]]; then
    echo "ℹ️  ManageEngine integration will remain disabled."
    exit 0
fi

read -p "Enter ManageEngine API URL (e.g., https://your-instance.manageengine.com): " me_url
read -p "Enter ManageEngine API Key: " me_key

# Update .env file
echo "" >> backend/.env
echo "# ManageEngine Integration (Added $(date))" >> backend/.env
echo "MANAGEENGINE_ENABLED=true" >> backend/.env
echo "MANAGEENGINE_API_URL=$me_url" >> backend/.env
echo "MANAGEENGINE_API_KEY=$me_key" >> backend/.env

echo ""
echo "✅ Configuration saved to backend/.env"
echo ""

# Test connection
echo "Testing connection to ManageEngine..."
echo ""

# Need to restart backend first
read -p "Backend server needs to restart. Continue? (y/n): " restart

if [[ $restart =~ ^[Yy]$ ]]; then
    echo "⚠️  Please restart your backend server manually:"
    echo ""
    echo "   1. Stop the current backend (Ctrl+C or kill process)"
    echo "   2. Restart with: cd backend && npm run dev"
    echo ""
    echo "   Then test the connection with:"
    echo "   curl -X POST http://localhost:3001/api/integrations/manageengine/test \\"
    echo "        -H 'Authorization: Bearer YOUR_TOKEN'"
    echo ""
fi

echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Restart backend server"
echo "2. Test connection (see command above)"
echo "3. Import alerts: POST /api/integrations/manageengine/import"
echo "4. Set up automated import (cron job)"
echo ""
echo "See INCIDENTS_ALERTS_GUIDE.md for detailed instructions."
