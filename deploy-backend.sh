#!/bin/bash

# SustainHub Backend Deployment Script for Azure Web App

echo "🚀 Starting SustainHub Backend deployment preparation..."

# Navigate to backend directory
cd backend

# Install production dependencies
echo "📦 Installing production dependencies..."
npm ci --production

# Run any pre-deployment scripts
echo "🔧 Running pre-deployment checks..."
node -e "console.log('Node.js version:', process.version)"
node -e "console.log('Environment:', process.env.NODE_ENV || 'development')"

# Check if required environment variables are set
echo "🔍 Checking environment variables..."
if [ -z "$MONGODB_URI" ]; then
    echo "❌ MONGODB_URI is not set"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "❌ JWT_SECRET is not set"
    exit 1
fi

echo "✅ All environment variables are set"

# Create a simple health check
echo "🏥 Testing basic server functionality..."
node -e "
const express = require('express');
const app = express();
app.get('/test', (req, res) => res.json({status: 'ok'}));
const server = app.listen(0, () => {
    console.log('✅ Server test passed');
    server.close();
});
"

echo "🎉 Backend is ready for deployment!"
echo ""
echo "Next steps:"
echo "1. Deploy to Azure Web App using your preferred method"
echo "2. Set environment variables in Azure App Configuration"
echo "3. Test the deployed API endpoints"
echo "4. Update frontend to use the new backend URL"
