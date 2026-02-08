import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    console.log('📦 Setting up database tables...\n');
    
    // Read SQL schema
    const schemaPath = join(process.cwd(), 'supabase', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    
    // Split into individual statements
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute\n`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      // Skip comments
      if (statement.trim().startsWith('--')) continue;
      
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      
      if (error) {
        console.error(`❌ Error in statement ${i + 1}:`, error.message);
        console.error('Statement:', statement.substring(0, 100) + '...');
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`);
      }
    }
    
    console.log('\n✨ Database setup complete!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run setup
setupDatabase();
