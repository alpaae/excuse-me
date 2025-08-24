# Deployment Guide

## Quick Deploy

### Option 1: Vercel CLI (Limited to 100 deploys/day)
```bash
vercel --prod
```

### Option 2: GitHub Actions (Recommended)

1. **Setup GitHub Secrets** (Required for auto-deploy):
   - Go to your GitHub repository → Settings → Secrets and variables → Actions
   - Add the following secrets:

   ```
   VERCEL_TOKEN=your_vercel_token
   VERCEL_ORG_ID=pavlo-berlizov-s-projects
   VERCEL_PROJECT_ID=prj_bHStkCoufxI8vbyXLfQ7ZGoYyq55
   ```

2. **Get Vercel Token**:
   ```bash
   vercel login
   vercel whoami
   # Then go to https://vercel.com/account/tokens
   # Create a new token with "Full Account" scope
   ```

3. **Auto-deploy on push to main**:
   - Push to `main` branch
   - GitHub Actions will automatically deploy to Vercel

### Option 3: Manual Deploy via GitHub Actions

1. Go to your GitHub repository
2. Navigate to Actions → "Deploy to Vercel"
3. Click "Run workflow" → "Run workflow"

## Environment Variables

Make sure these are set in Vercel:

### Required
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE`
- `OPENAI_API_KEY`

### Optional
- `NEXT_PUBLIC_BASE_URL` (auto-detected)
- `NEXT_PUBLIC_FEATURE_PAYMENTS`
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_PRO_MONTHLY`
- `STRIPE_WEBHOOK_SECRET`
- `TG_BOT_TOKEN`

## Current Status

- **Project**: excuse-me
- **URL**: https://excuse-me-pavlo-berlizov-s-projects.vercel.app
- **Project ID**: prj_bHStkCoufxI8vbyXLfQ7ZGoYyq55
- **Org ID**: pavlo-berlizov-s-projects

## Troubleshooting

### CLI Deploy Limit Reached
If you see "Resource is limited - try again in 6 hours", use GitHub Actions instead.

### Build Errors
1. Check environment variables are set correctly
2. Ensure all dependencies are installed
3. Verify TypeScript compilation passes locally

### Runtime Errors
1. Check Vercel function logs
2. Verify API endpoints are working
3. Check Supabase connection
