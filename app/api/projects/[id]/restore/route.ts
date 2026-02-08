import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const resolvedParams = await params;
    const projectId = resolvedParams.id;
    const { versionId } = await request.json();

    if (!versionId) {
      return NextResponse.json(
        { error: 'Version ID is required' },
        { status: 400 }
      );
    }

    // Get the specific version
    const { data: version, error: versionError } = await supabase
      .from('project_versions')
      .select('*')
      .eq('id', versionId)
      .eq('project_id', projectId)
      .single();

    if (versionError || !version) {
      return NextResponse.json(
        { error: 'Version not found' },
        { status: 404 }
      );
    }

    const snapshot = version.snapshot as any;

    // Create a backup of current state before restoring
    const { data: currentProject } = await supabase
      .from('projects')
      .select(`
        *,
        groups:project_groups (
          *,
          tasks:project_tasks (*)
        )
      `)
      .eq('id', projectId)
      .single();

    if (currentProject) {
      await supabase.from('project_versions').insert({
        project_id: projectId,
        snapshot: {
          title: currentProject.title,
          groups: currentProject.groups,
          timestamp: new Date().toISOString(),
        },
        change_description: 'Backup before restore',
        created_by: 'system',
      });
    }

    // Restore project title
    await supabase
      .from('projects')
      .update({ title: snapshot.title })
      .eq('id', projectId);

    // Delete all current groups and tasks (CASCADE will handle tasks)
    await supabase
      .from('project_groups')
      .delete()
      .eq('project_id', projectId);

    // Restore groups and tasks from snapshot
    for (const group of snapshot.groups) {
      const { data: newGroup } = await supabase
        .from('project_groups')
        .insert({
          project_id: projectId,
          title: group.title,
          color: group.color,
          position: group.position,
        })
        .select()
        .single();

      if (newGroup && group.tasks) {
        const tasksData = group.tasks.map((task: any) => ({
          group_id: newGroup.id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          estimated_hours: task.estimated_hours,
          position: task.position,
          status: task.status,
        }));

        await supabase.from('project_tasks').insert(tasksData);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Project restored successfully',
      restored_at: version.created_at,
    });
  } catch (error) {
    console.error('Error in restore:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to restore' },
      { status: 500 }
    );
  }
}
