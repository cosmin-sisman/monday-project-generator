import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const resolvedParams = await params;
    const projectId = resolvedParams.id;

    const { data: versions, error } = await supabase
      .from('project_versions')
      .select('id, created_at, change_description, created_by')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    return NextResponse.json({
      versions: versions || [],
      hasBackup: versions && versions.length > 0,
    });
  } catch (error) {
    console.error('Error fetching versions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch versions' },
      { status: 500 }
    );
  }
}
