import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function POST() {
  try {
    console.log('📦 Setting up database tables via REST API...');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }
    
    // Read SQL schema
    const schemaPath = join(process.cwd(), 'supabase', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    
    console.log('📝 Executing SQL via PostgREST...');
    
    // Use Supabase REST API to execute SQL through a custom function
    // We'll use the /rest/v1/rpc endpoint
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_raw_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ sql: schema }),
    });
    
    if (!response.ok) {
      // If the RPC function doesn't exist, we need to create tables via fetch directly
      console.log('⚠️ RPC function not available, trying direct table creation...');
      
      // Let's try to create tables one by one using fetch to REST API
      const results = [];
      
      // Split SQL into individual CREATE statements
      const statements = schema
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && (s.toUpperCase().includes('CREATE TABLE') || s.toUpperCase().includes('CREATE INDEX') || s.toUpperCase().includes('CREATE TRIGGER') || s.toUpperCase().includes('CREATE OR REPLACE FUNCTION')));
      
      for (const statement of statements) {
        try {
          // Extract table name from CREATE TABLE statement
          const match = statement.match(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(\w+)/i);
          if (match) {
            const tableName = match[1];
            console.log(`Creating table: ${tableName}`);
            results.push({ table: tableName, status: 'attempted' });
          }
        } catch (err) {
          console.error('Error parsing statement:', err);
        }
      }
      
      return NextResponse.json({
        success: false,
        message: 'Cannot execute raw SQL directly. Please use Supabase Dashboard SQL Editor.',
        attempted: results,
        instructions: [
          '1. Visit: https://supabase.com/dashboard/project/viqhvdnvwekujkmypimx/sql/new',
          '2. The SQL schema is already in your clipboard (pasted below)',
          '3. Paste and click "Run"',
        ],
        sql_schema: schema,
      });
    }
    
    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      message: '✅ Database tables created successfully!',
      result,
    });
    
  } catch (error) {
    console.error('Error in database setup:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to setup database',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log('🔍 Checking if database tables exist...');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }
    
    // Check if tables exist by trying to query them
    const tables = ['projects', 'project_groups', 'project_tasks', 'project_versions', 'ai_conversations'];
    const results: Record<string, boolean> = {};
    
    for (const table of tables) {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=id&limit=0`, {
          method: 'GET',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        });
        
        results[table] = response.ok;
      } catch (err) {
        results[table] = false;
      }
    }
    
    const allTablesExist = Object.values(results).every(v => v);
    
    if (allTablesExist) {
      return NextResponse.json({
        success: true,
        message: '✅ All database tables exist!',
        tables: results,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: '⚠️ Some tables are missing. Run POST to this endpoint to create them.',
        tables: results,
        missing: Object.entries(results).filter(([_, exists]) => !exists).map(([name]) => name),
        instructions: [
          'Option 1: Send a POST request to /api/setup-db',
          'Option 2: Visit https://supabase.com/dashboard/project/viqhvdnvwekujkmypimx/sql/new and run the schema',
        ],
      });
    }
    
  } catch (error) {
    console.error('Error checking database:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to check database',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
