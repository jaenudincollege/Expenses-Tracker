# Standard Node.js Deployment Guide

This guide explains how to deploy your Express API as a standard Node.js application.

## Deployment Options

Your Express API can be deployed to various platforms as a standard Node.js application:

1. **Render**: [https://render.com](https://render.com)
2. **Railway**: [https://railway.app](https://railway.app)
3. **DigitalOcean App Platform**: [https://www.digitalocean.com/products/app-platform](https://www.digitalocean.com/products/app-platform)
4. **Heroku**: [https://heroku.com](https://heroku.com)
5. **Vercel**: Can be configured to run as a standard Node.js app

## Pre-Deployment Steps

1. **Build your application**:

   ```bash
   pnpm build
   ```

   This will create the `dist` folder with the compiled JavaScript.

2. **Test your build locally**:
   ```bash
   pnpm start
   ```
   Make sure everything works as expected.

## Deployment Instructions

### Environment Variables

Make sure to set up these environment variables on your deployment platform:

- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `NODE_ENV`: Set to "production"
- `PORT`: Some platforms will provide this automatically

### Render Deployment

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Choose "Node" as the environment
4. Set build command: `npm install && npm run build`
5. Set start command: `npm start`
6. Add environment variables
7. Deploy

### Railway Deployment

1. Create a new project on Railway
2. Connect your GitHub repository
3. Add environment variables
4. Railway will automatically detect Node.js and deploy

### Vercel (Standard Mode)

1. Go to Vercel and create a new project
2. Connect your GitHub repository
3. Set output directory to `dist`
4. Override build command to: `npm install && npm run build`
5. Override start command to: `npm start`
6. Add environment variables
7. Deploy

## Database Considerations

1. Make sure your PostgreSQL database is accessible from your hosting provider
2. Consider using a managed database service like:
   - Neon (https://neon.tech)
   - ElephantSQL (https://www.elephantsql.com)
   - Supabase (https://supabase.com)
   - Railway PostgreSQL (https://railway.app)

## Monitoring and Scaling

Once deployed, you can:

1. Set up application monitoring with services like New Relic or Datadog
2. Configure auto-scaling if your platform supports it
3. Set up database backups and monitoring
