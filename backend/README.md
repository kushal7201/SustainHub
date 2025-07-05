# SustainHub Backend - Azure Web App Deployment

## Prerequisites

1. Azure account with an active subscription
2. Node.js 18.x or higher
3. MongoDB Atlas database (or Azure Cosmos DB)
4. Cloudinary account for image uploads

## Environment Variables

Set these environment variables in Azure Web App Configuration:

```
NODE_ENV=production
PORT=80
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## Deployment Steps

### Method 1: GitHub Actions (Recommended)

1. Fork this repository to your GitHub account
2. In Azure Portal, create a new Web App:
   - Runtime stack: Node 18 LTS
   - Operating System: Linux (recommended) or Windows
3. Go to Deployment Center in your Web App
4. Select GitHub as source
5. Authorize and select your repository
6. Azure will automatically create a GitHub Actions workflow
7. Set environment variables in Configuration > Application settings

### Method 2: Local Git Deployment

1. In Azure Portal, go to Deployment Center
2. Select Local Git
3. Set deployment credentials
4. Add Azure remote to your local git:
   ```bash
   git remote add azure https://<app-name>.scm.azurewebsites.net:443/<app-name>.git
   ```
5. Push to Azure:
   ```bash
   git push azure main
   ```

### Method 3: ZIP Deployment

1. Create a production build:
   ```bash
   npm install --production
   ```
2. Create a ZIP file of the backend folder
3. Use Azure CLI or Kudu to deploy:
   ```bash
   az webapp deployment source config-zip --resource-group <group-name> --name <app-name> --src <zip-file-path>
   ```

## Post-Deployment

1. Check Application Insights for logs
2. Verify health check endpoint: `https://your-app.azurewebsites.net/api/health`
3. Test API endpoints
4. Update frontend CORS settings to include your Azure Web App URL

## Troubleshooting

- Check Application Logs in Azure Portal
- Ensure all environment variables are set correctly
- Verify MongoDB connection string
- Check Node.js version compatibility

## Performance Optimization

- Enable Application Insights for monitoring
- Use Azure CDN for static assets if needed
- Consider Azure Front Door for global distribution
- Set up auto-scaling based on CPU/memory usage

## Security

- Enable HTTPS only
- Set up custom domain with SSL certificate
- Use Azure Key Vault for sensitive environment variables
- Enable IP restrictions if needed
