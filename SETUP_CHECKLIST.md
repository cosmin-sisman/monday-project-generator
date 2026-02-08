# Setup Checklist

Use this checklist to ensure you've completed all setup steps correctly.

## 1. Supabase Setup

- [ ] Created Supabase project named `monday-pm`
- [ ] Ran SQL from `supabase/schema.sql` in SQL Editor
- [ ] Verified tables created: `projects`, `project_groups`, `project_tasks`
- [ ] Copied Project URL to `.env.local`
- [ ] Copied anon/public key to `.env.local`

**Test**: Run this query in Supabase SQL Editor:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```
Should return: projects, project_groups, project_tasks

## 2. Monday.com API Setup

- [ ] Logged into Monday.com
- [ ] Generated Personal API Token (Avatar → Admin → API)
- [ ] Added token to `.env.local` as `MONDAY_API_TOKEN`
- [ ] Token has proper permissions (boards:write, workspaces:read)

**Test**: Run this query in Monday.com API Playground:
```graphql
query { me { name email } }
```
Should return your user details

## 3. OpenAI API Setup

- [ ] Created OpenAI account at https://platform.openai.com
- [ ] Added payment method (required for API access)
- [ ] Generated API key
- [ ] Added key to `.env.local` as `OPENAI_API_KEY`
- [ ] Have available credits

**Test**: Check your OpenAI dashboard for API usage

## 4. Local Development Setup

- [ ] Node.js 18+ installed
- [ ] Cloned repository
- [ ] Ran `npm install`
- [ ] Created `.env.local` with all variables
- [ ] Ran `npm run dev`
- [ ] App loads at http://localhost:3000
- [ ] No console errors

## 5. Feature Testing

- [ ] Homepage loads with input form
- [ ] Can enter project description
- [ ] "Generate Project" button works
- [ ] AI generates project structure
- [ ] Redirects to project page
- [ ] Can edit project title
- [ ] Can edit group titles
- [ ] Can edit task details
- [ ] Changes save successfully
- [ ] Monday.com workspaces load
- [ ] Can select workspace and board
- [ ] Sync to Monday.com works
- [ ] Can view board in Monday.com

## 6. Git Setup

- [ ] Git initialized
- [ ] All files committed
- [ ] `.env.local` NOT in git (check with `git status`)
- [ ] Created GitHub repository
- [ ] Added GitHub remote
- [ ] Pushed to GitHub

## 7. Vercel Deployment

- [ ] Connected GitHub repo to Vercel
- [ ] Added all environment variables in Vercel
- [ ] Deployment successful
- [ ] Production URL works
- [ ] Can generate projects in production
- [ ] Can sync to Monday.com in production

## Environment Variables Checklist

Verify all these are set in both `.env.local` (local) and Vercel (production):

```
✓ MONDAY_API_TOKEN
✓ OPENAI_API_KEY
✓ NEXT_PUBLIC_SUPABASE_URL
✓ NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## Common Issues

### "Failed to fetch workspaces"
- Check Monday API token is valid
- Verify token has correct permissions
- Check token is set in environment variables

### "Failed to generate project"
- Check OpenAI API key is valid
- Verify you have credits in OpenAI account
- Check API key is set correctly

### "Project not found" or database errors
- Verify Supabase tables are created
- Check Supabase URL and anon key are correct
- Ensure tables have correct schema

### Build errors in Vercel
- Check all dependencies are in package.json
- Verify no syntax errors (run `npm run build` locally)
- Check environment variables are set in Vercel

## Next Steps

Once everything is checked:

1. Generate a test project
2. Edit it and verify changes save
3. Sync it to Monday.com
4. Share the app with your team
5. Start using it for real projects!

## Support

If you encounter issues:

1. Check console for error messages
2. Verify all checkboxes above are complete
3. Review API documentation
4. Check GitHub issues
