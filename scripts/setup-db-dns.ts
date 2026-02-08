import { config } from 'dotenv';
import { Client } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Resolver } from 'dns/promises';

// Load .env.local
config({ path: '.env.local' });

async function resolveWithCloudflare(hostname: string): Promise<string> {
  console.log(`🔍 Resolving ${hostname} using Cloudflare DNS (1.1.1.1)...`);
  
  const resolver = new Resolver();
  resolver.setServers(['1.1.1.1', '1.0.0.1']); // Cloudflare DNS
  
  try {
    // Try IPv4 first
    const addresses = await resolver.resolve4(hostname);
    if (addresses.length > 0) {
      console.log(`✅ Resolved to IPv4: ${addresses[0]}`);
      return addresses[0];
    }
  } catch (err) {
    console.log('⚠️ IPv4 not found, trying IPv6...');
  }
  
  try {
    // Try IPv6
    const addresses = await resolver.resolve6(hostname);
    if (addresses.length > 0) {
      console.log(`✅ Resolved to IPv6: ${addresses[0]}`);
      return addresses[0];
    }
  } catch (err) {
    throw new Error(`Failed to resolve ${hostname}`);
  }
  
  throw new Error(`No addresses found for ${hostname}`);
}

async function setupDatabase() {
  try {
    console.log('📦 Setting up Supabase database with Cloudflare DNS...\n');
    
    // Parse the DATABASE_URL to extract hostname
    const dbUrl = process.env.DATABASE_URL!;
    const urlMatch = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    
    if (!urlMatch) {
      throw new Error('Invalid DATABASE_URL format');
    }
    
    const [, user, password, hostname, port, database] = urlMatch;
    
    console.log(`Original hostname: ${hostname}`);
    
    // Resolve hostname using Cloudflare DNS
    let resolvedHost = hostname;
    try {
      resolvedHost = await resolveWithCloudflare(hostname);
      console.log(`Using resolved IP: ${resolvedHost}\n`);
    } catch (err) {
      console.log(`⚠️ DNS resolution failed, trying with original hostname...\n`);
    }
    
    // Create connection with resolved IP
    const client = new Client({
      host: resolvedHost,
      port: parseInt(port),
      user,
      password,
      database: database.split('?')[0], // Remove query params
      ssl: {
        rejectUnauthorized: false, // Supabase uses self-signed certs
      },
    });

    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!\n');

    // Read SQL schema
    const schemaPath = join(process.cwd(), 'supabase', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');

    console.log('📝 Executing SQL schema...\n');
    await client.query(schema);
    
    console.log('\n✨ Database setup complete!');
    console.log('🎉 All tables created successfully!\n');

    // Verify tables
    console.log('🔍 Verifying tables...');
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('\n📋 Created tables:');
    result.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });

    await client.end();
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

setupDatabase();
