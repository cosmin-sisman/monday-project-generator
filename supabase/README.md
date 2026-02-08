# Supabase Setup

## Database Schema Setup

To set up the database schema, run the SQL from `schema.sql` in the Supabase SQL Editor:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `monday-pm`
3. Navigate to SQL Editor
4. Copy and paste the contents of `schema.sql`
5. Click "Run"

## Connection Details

- **Project URL**: https://viqhvdnvwekujkmypimx.supabase.co
- **Project Ref**: viqhvdnvwekujkmypimx
- **Database**: PostgreSQL 15

## Environment Variables

Make sure the following are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://viqhvdnvwekujkmypimx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_DB_PASSWORD=your-db-password
```

## Tables

- `projects` - Stores generated projects
- `project_groups` - Stores groups within projects
- `project_tasks` - Stores tasks within groups
