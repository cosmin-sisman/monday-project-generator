import { config } from 'dotenv';
import { Client } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load .env.local
config({ path: '.env.local' });

async function setupDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('📦 Connecting to Supabase...\n');
    await client.connect();
    console.log('✅ Connected!\n');

    // Read SQL schema
    const schemaPath = join(process.cwd(), 'supabase', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');

    console.log('📝 Executing SQL schema...\n');
    await client.query(schema);
    
    console.log('\n✨ Database setup complete!');
    console.log('🎉 All tables created successfully!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupDatabase();
