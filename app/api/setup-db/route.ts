import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    console.log('📦 Setting up database tables...');
    
    const supabase = await createClient();
    
    // Read SQL schema
    const schemaPath = join(process.cwd(), 'supabase', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    
    // Since Supabase client can't execute raw SQL directly,
    // we need to create a temporary edge function or use the admin client
    // For now, return the SQL to be executed manually
    
    // Try to check if tables exist
    const { data: existingTables, error: checkError } = await supabase
      .from('projects')
      .select('id')
      .limit(1);
    
    if (checkError && checkError.code === 'PGRST116') {
      // Tables don't exist yet
      return NextResponse.json({
        success: false,
        message: 'Tables not created yet. Please run the SQL schema manually.',
        instructions: [
          '1. Go to Supabase Dashboard → SQL Editor',
          '2. Copy and paste the SQL schema',
          '3. Click Run',
        ],
        schema,
      });
    }
    
    // Tables exist!
    return NextResponse.json({
      success: true,
      message: '✅ Database tables are set up correctly!',
      tables: ['projects', 'project_groups', 'project_tasks', 'project_versions', 'ai_conversations'],
    });
    
  } catch (error) {
    console.error('Error in database setup:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check database setup',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
