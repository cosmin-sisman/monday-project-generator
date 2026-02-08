# Monday Project Generator

An AI-powered application that transforms text descriptions into structured Monday.com projects. Built with Next.js 16, OpenAI, and Supabase.

## Features

- **AI-Powered Generation**: Describe your project in natural language and let AI structure it into groups and tasks
- **Interactive Editing**: Edit project titles, groups, tasks, descriptions, and priorities inline
- **Monday.com Integration**: Seamlessly sync your structured projects to Monday.com boards
- **Real-time Updates**: All changes are automatically saved to Supabase
- **Modern UI**: Clean, responsive interface built with Tailwind CSS

## Tech Stack

- **Frontend & Backend**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4o
- **Integration**: Monday.com API v2 (GraphQL)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Prerequisites

Before you begin, make sure you have:

- Node.js 18+ installed
- A Supabase account and project
- A Monday.com account with API access
- An OpenAI API key
- Git installed

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd app-monday-project-generator
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Monday.com API
MONDAY_API_TOKEN=your_monday_api_token_here

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_DB_PASSWORD=your_db_password
```

#### Getting API Keys:

**Monday.com API Token:**
1. Go to Monday.com
2. Click your avatar → Admin → API
3. Generate a Personal API Token
4. Copy the token

**OpenAI API Key:**
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key

**Supabase Credentials:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy the Project URL and anon/public key

### 4. Set Up Supabase Database

1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Open `supabase/schema.sql` from this repository
4. Copy and paste the SQL into the editor
5. Run the query to create all tables and indexes

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### 1. Generate a Project

1. On the homepage, enter a detailed project description
2. Click "Generate Project with AI"
3. Wait for the AI to structure your project

### 2. Edit the Project

1. Click on any title to edit it
2. Edit tasks inline by clicking the edit icon
3. Changes are automatically saved

### 3. Sync to Monday.com

1. At the bottom of the project page, select a Monday.com workspace
2. Choose to use an existing board or create a new one
3. Click "Sync to Monday.com"
4. Your project will be created with all groups and tasks

## Project Structure

```
app-monday-project-generator/
├── app/
│   ├── api/              # API routes
│   ├── projects/         # Project pages
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Homepage
├── components/           # React components
├── lib/
│   ├── supabase/         # Supabase clients
│   ├── monday.ts         # Monday.com API client
│   ├── openai.ts         # OpenAI helper
│   ├── types.ts          # TypeScript types
│   ├── schemas.ts        # Zod validation schemas
│   └── utils.ts          # Utility functions
├── supabase/
│   ├── schema.sql        # Database schema
│   └── README.md         # Setup instructions
└── .env.local            # Environment variables (not in git)
```

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure environment variables:
   - `MONDAY_API_TOKEN`
   - `OPENAI_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click "Deploy"

## API Endpoints

- `POST /api/generate` - Generate project structure from text
- `GET /api/projects/[id]` - Fetch project details
- `PUT /api/projects/[id]` - Update project
- `GET /api/monday/workspaces` - List Monday.com workspaces
- `GET /api/monday/boards` - List boards in a workspace
- `POST /api/monday/sync` - Sync project to Monday.com

## Database Schema

The application uses three main tables:

- **projects**: Stores project metadata
- **project_groups**: Stores groups (phases/categories)
- **project_tasks**: Stores individual tasks

See `supabase/schema.sql` for the complete schema.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

## Support

For issues or questions, please open an issue on GitHub.
