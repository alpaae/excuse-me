# Manual Deployment Guide

Since we've reached the CLI deployment limit (100/day), here's how to deploy manually:

## Option 1: Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**:
   - Visit: https://vercel.com/dashboard
   - Find your project: `excuse-me`

2. **Trigger Manual Deploy**:
   - Click on your project
   - Go to "Deployments" tab
   - Click "Redeploy" on the latest deployment
   - Or click "Deploy" to create a new deployment

3. **Check Environment Variables**:
   - Go to "Settings" → "Environment Variables"
   - Ensure all required variables are set:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE`
     - `OPENAI_API_KEY`

## Option 2: GitHub Integration

1. **Connect GitHub Repository**:
   - In Vercel Dashboard → Project Settings → Git
   - Connect your GitHub repository
   - Enable "Auto Deploy" for main branch

2. **Push to Trigger Deploy**:
   ```bash
   git push origin main
   ```

## Option 3: Wait for CLI Limit Reset

The CLI limit resets every 6 hours. You can check when it resets by running:
```bash
vercel --prod
```

## Current Project Info

- **Project Name**: excuse-me
- **URL**: https://excuse-me-pavlo-berlizov-s-projects.vercel.app
- **Project ID**: prj_bHStkCoufxI8vbyXLfQ7ZGoYyq55

## Quick Status Check

To check if your app is working:
1. Visit: https://excuse-me-pavlo-berlizov-s-projects.vercel.app
2. Test the main functionality
3. Check Vercel function logs if there are issues

## Troubleshooting

### Build Errors
- Check Vercel build logs
- Verify all environment variables are set
- Ensure TypeScript compilation passes locally

### Runtime Errors
- Check Vercel function logs
- Verify Supabase connection
- Test API endpoints individually
