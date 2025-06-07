# Frontend Deployment Guide

This guide provides instructions for deploying the Finance Tracker frontend to various hosting platforms.

## Build the Application

To build the application for production, run:

```bash
npm run build
# or
pnpm run build
```

This will create a `dist` directory with the production build.

## Deployment Options

### Option 1: Local Testing with Vite Preview

```bash
npm run serve
# or
pnpm run serve
```

Access at http://localhost:3000

### Option 2: Netlify

Netlify automatically recognizes the `_redirects` file in the public directory. Just connect your GitHub repository and configure the build command as:

- Build command: `npm run build` or `pnpm run build`
- Publish directory: `dist`

### Option 3: Vercel

Vercel automatically uses the `vercel.json` file at the project root. Connect your GitHub repository and configure:

- Framework preset: Vite
- Build command: `npm run build` or `pnpm run build`
- Output directory: `dist`

### Option 4: Apache Server

Upload the contents of the `dist` directory to your web server. Make sure the `.htaccess` file is included to handle SPA routing.

### Option 5: IIS Server

Upload the contents of the `dist` directory to your IIS server. The `web.config` file will handle URL rewriting for SPA routing.

### Option 6: Static File Server (like serve)

If you're using the `serve` package:

```bash
npm install -g serve
serve -s dist
```

## Troubleshooting

If you encounter 404 errors after deployment when refreshing pages:

1. Ensure the appropriate configuration file for your hosting platform is in place
2. Verify that the server is configured to redirect all requests to index.html
3. Check server logs for potential routing errors
