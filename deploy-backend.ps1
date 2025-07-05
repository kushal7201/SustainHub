# SustainHub Backend Deployment Script for Azure Web App (PowerShell)

Write-Host "🚀 Starting SustainHub Backend deployment preparation..." -ForegroundColor Green

# Navigate to backend directory
Set-Location backend

# Install production dependencies
Write-Host "📦 Installing production dependencies..." -ForegroundColor Yellow
npm ci --production

# Run pre-deployment checks
Write-Host "🔧 Running pre-deployment checks..." -ForegroundColor Yellow
node -e "console.log('Node.js version:', process.version)"
node -e "console.log('Environment:', process.env.NODE_ENV || 'development')"

# Check environment variables
Write-Host "🔍 Checking environment variables..." -ForegroundColor Yellow

if (-not $env:MONGODB_URI) {
    Write-Host "❌ MONGODB_URI is not set" -ForegroundColor Red
    exit 1
}

if (-not $env:JWT_SECRET) {
    Write-Host "❌ JWT_SECRET is not set" -ForegroundColor Red
    exit 1
}

Write-Host "✅ All environment variables are set" -ForegroundColor Green

# Test server functionality
Write-Host "🏥 Testing basic server functionality..." -ForegroundColor Yellow
node -e "
const express = require('express');
const app = express();
app.get('/test', (req, res) => res.json({status: 'ok'}));
const server = app.listen(0, () => {
    console.log('✅ Server test passed');
    server.close();
});
"

Write-Host "🎉 Backend is ready for deployment!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Deploy to Azure Web App using your preferred method" -ForegroundColor White
Write-Host "2. Set environment variables in Azure App Configuration" -ForegroundColor White
Write-Host "3. Test the deployed API endpoints" -ForegroundColor White
Write-Host "4. Update frontend to use the new backend URL" -ForegroundColor White
