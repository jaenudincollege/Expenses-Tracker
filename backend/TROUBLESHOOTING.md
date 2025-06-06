# Vercel Deployment Troubleshooting Guide

If you're experiencing issues with your Vercel deployment, follow this guide to diagnose and fix the problems.

## 1. Environment Variables

The most common cause of deployment failures is missing or incorrect environment variables.

### Required Environment Variables:
- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT token signing
- `NODE_ENV`: Should be set to "production"

### How to Check:
1. Visit your Vercel dashboard: https://vercel.com/dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Verify all three variables are present

### How to Fix:
1. Add any missing variables
2. Verify your DATABASE_URL is correct and accessible
3. Redeploy your application

## 2. Database Connection Issues

If your app is deployed but fails when trying to access the database:

### Common Causes:
- Your database doesn't allow connections from Vercel's IP addresses
- Incorrect DATABASE_URL format
- Database credentials have changed

### How to Check:
1. Visit your deployed app's root endpoint (e.g., https://backend-beta-blue-17.vercel.app/)
2. Check the response for database connection errors
3. Look at Vercel logs for detailed error messages

### How to Fix:
- Ensure your PostgreSQL database allows external connections
- If using a service like ElephantSQL, Supabase, or Neon, check their connection settings
- Update your DATABASE_URL if needed
- If using a local database, switch to a cloud-hosted option

## 3. Build Issues

If Vercel can't build your project:

### How to Check:
1. Look at the build logs in Vercel dashboard
2. Check for TypeScript errors or missing dependencies

### How to Fix:
1. Fix any TypeScript errors
2. Ensure all dependencies are in package.json (not devDependencies if needed at runtime)
3. Update tsconfig.json if needed

## 4. Runtime Issues

If your app builds but crashes or behaves incorrectly:

### How to Check:
1. Visit your app endpoints and check responses
2. Look at Vercel Function Logs for error messages

### How to Fix:
1. Test locally with NODE_ENV=production
2. Check for server-side code that might behave differently in production
3. Ensure your app handles serverless constraints (like read-only filesystem except for /tmp)

## 5. Advanced Debugging

For deeper debugging:

1. **Check Vercel Logs:**
   - Go to your project in Vercel Dashboard
   - Click on the latest deployment
   - Navigate to "Functions" tab to see function logs
   - Look for error messages

2. **Test Database Connection:**
   - The root endpoint of your API now includes database connection status
   - If it shows an error, troubleshoot your database connection

3. **Database Access Control:**
   - For PostgreSQL, you might need to configure pg_hba.conf to allow connections
   - Cloud services often have IP whitelisting - you may need to allow all IPs for Vercel

## Getting More Help

If you've tried everything and still have issues:

1. Check Vercel documentation: https://vercel.com/docs
2. Ask for help on Vercel forums: https://github.com/vercel/vercel/discussions
3. Contact your database provider's support if the issue is database-related
