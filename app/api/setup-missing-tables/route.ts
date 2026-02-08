import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    console.log('🔧 Creating missing tables...');
    
    const supabase = await createClient();
    
    // SQL pentru tabelele lipsă
    const sql = `
-- Versioning for project backups (undo functionality)
CREATE TABLE IF NOT EXISTS project_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  snapshot JSONB NOT NULL,
  change_description TEXT,
  created_by TEXT DEFAULT 'ai_assistant',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI Conversation history
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  actions_performed JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_project_versions_project_id ON project_versions(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_project_id ON ai_conversations(project_id, created_at ASC);
`;

    // Încercăm să executăm SQL-ul folosind Supabase client
    // Notă: Acest lucru ar putea să nu funcționeze din cauza restricțiilor de securitate
    // În acest caz, utilizatorul trebuie să ruleze manual SQL-ul
    
    try {
      // Încercăm să testăm dacă tabela există deja
      const { error: testError } = await supabase
        .from('ai_conversations')
        .select('id')
        .limit(1);
      
      if (!testError) {
        return NextResponse.json({
          success: true,
          message: '✅ Tables already exist!',
          tables: ['project_versions', 'ai_conversations'],
        });
      }
      
      // Dacă ajungem aici, tabelele nu există
      return NextResponse.json({
        success: false,
        message: '⚠️ Tables need to be created manually in Supabase SQL Editor',
        instructions: [
          '1. Open: https://supabase.com/dashboard/project/viqhvdnvwekujkmypimx/sql/new',
          '2. Copy the SQL below',
          '3. Paste and Run',
        ],
        sql,
      });
      
    } catch (err) {
      return NextResponse.json({
        success: false,
        message: 'Cannot execute SQL automatically. Manual setup required.',
        sql,
      });
    }
    
  } catch (error) {
    console.error('Error in setup:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Setup failed' },
      { status: 500 }
    );
  }
}
