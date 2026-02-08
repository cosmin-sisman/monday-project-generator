import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const projectId = params.id;

    // Get the most recent backup version
    const { data: latestVersion, error: versionError } = await supabase
      .from('project_versions')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (versionError || !latestVersion) {
      return NextResponse.json(
        { error: 'No backup version found' },
        { status: 404 }
      );
    }

    const snapshot = latestVersion.snapshot as any;

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

    // Delete the version we just restored (so we don't undo twice)
    await supabase
      .from('project_versions')
      .delete()
      .eq('id', latestVersion.id);

    return NextResponse.json({
      success: true,
      message: 'Project restored to previous version',
      restored_at: latestVersion.created_at,
    });
  } catch (error) {
    console.error('Error in undo:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to undo' },
      { status: 500 }
    );
  }
}
