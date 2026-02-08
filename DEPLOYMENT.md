# Deployment Guide

## Prerequisites

Before deploying, make sure you have:

1. Created a GitHub repository
2. Set up your Supabase database (run the SQL from `supabase/schema.sql`)
3. Have all your API keys ready (Monday.com, OpenAI, Supabase)

## Step 1: Push to GitHub

```bash
# If you haven't created a GitHub repo yet, create one at https://github.com/new

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push your code
git push -u origin main
```

## Step 2: Deploy to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Sign in with GitHub
3. Click "Import Project"
4. Select your repository: `app-monday-project-generator`
5. Configure your project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

6. Add Environment Variables (click "Add" for each):

```
MONDAY_API_TOKEN=your_monday_token_here
OPENAI_API_KEY=your_openai_key_here
NEXT_PUBLIC_SUPABASE_URL=https://viqhvdnvwekujkmypimx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

7. Click "Deploy"
8. Wait for deployment to complete (~2-3 minutes)

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts and add environment variables when asked

# For production deployment
vercel --prod
```

## Step 3: Set Up Environment Variables in Vercel

If you didn't add them during deployment:

1. Go to your project in Vercel Dashboard
2. Click "Settings" → "Environment Variables"
3. Add each variable:
   - `MONDAY_API_TOKEN`
   - `OPENAI_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click "Save"
5. Redeploy: Go to "Deployments" → Click "..." on latest → "Redeploy"

## Step 4: Verify Deployment

1. Visit your Vercel URL (e.g., `https://your-project.vercel.app`)
2. Test the homepage loads correctly
3. Try generating a project with AI
4. Test syncing to Monday.com

## Troubleshooting

### Build Errors

- **Module not found**: Check that all dependencies are in `package.json`
- **Environment variables**: Ensure all env vars are set in Vercel
- **TypeScript errors**: Run `npm run build` locally first to catch issues

### Runtime Errors

- **API calls failing**: Check environment variables are set correctly
- **CORS errors**: Vercel should handle this automatically for Next.js
- **Database connection**: Verify Supabase credentials are correct

### Monday.com Integration Issues

- **401 Unauthorized**: Check your Monday API token is valid
- **GraphQL errors**: Ensure your token has proper permissions (boards:write)

### OpenAI Issues

- **Rate limits**: You may hit OpenAI rate limits on free tier
- **API errors**: Verify your OpenAI API key is active and has credits

## Post-Deployment

### Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

### Monitoring

- Check Vercel Analytics for usage stats
- Monitor Vercel Functions logs for errors
- Set up alerts in Vercel for deployment failures

### Updates

To deploy updates:

```bash
git add .
git commit -m "Your update message"
git push origin main
```

Vercel will automatically deploy on push to main branch.

## Security Reminders

1. **Never commit `.env.local`** - It's in `.gitignore` by default
2. **Rotate API keys regularly** - Especially if exposed
3. **Use environment variables** - Never hardcode secrets
4. **Enable Vercel Authentication** - For private apps

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [GitHub Issues](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/issues)
