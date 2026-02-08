import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        *,
        groups:project_groups(
          *,
          tasks:project_tasks(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    // Update project
    if (body.title) {
      const { error: projectError } = await supabase
        .from('projects')
        .update({ title: body.title })
        .eq('id', id);

      if (projectError) {
        throw new Error('Failed to update project');
      }
    }

    // Update groups if provided
    if (body.groups) {
      for (const group of body.groups) {
        if (group.id) {
          // Update existing group
          const { error: groupError } = await supabase
            .from('project_groups')
            .update({
              title: group.title,
              color: group.color,
              position: group.position,
            })
            .eq('id', group.id);

          if (groupError) {
            console.error('Error updating group:', groupError);
          }

          // Update tasks in this group
          if (group.tasks) {
            for (const task of group.tasks) {
              if (task.id) {
                // Update existing task
                const { error: taskError } = await supabase
                  .from('project_tasks')
                  .update({
                    title: task.title,
                    description: task.description,
                    priority: task.priority,
                    estimated_hours: task.estimated_hours,
                    position: task.position,
                    status: task.status,
                  })
                  .eq('id', task.id);

                if (taskError) {
                  console.error('Error updating task:', taskError);
                }
              } else {
                // Insert new task
                const { error: taskError } = await supabase
                  .from('project_tasks')
                  .insert({
                    group_id: group.id,
                    title: task.title,
                    description: task.description,
                    priority: task.priority,
                    estimated_hours: task.estimated_hours,
                    position: task.position,
                    status: task.status || 'pending',
                  });

                if (taskError) {
                  console.error('Error inserting task:', taskError);
                }
              }
            }
          }
        } else {
          // Insert new group
          const { data: newGroup, error: groupError } = await supabase
            .from('project_groups')
            .insert({
              project_id: id,
              title: group.title,
              color: group.color,
              position: group.position,
            })
            .select()
            .single();

          if (groupError || !newGroup) {
            console.error('Error inserting group:', groupError);
            continue;
          }

          // Insert tasks for new group
          if (group.tasks && group.tasks.length > 0) {
            const tasksData = group.tasks.map((task: any, index: number) => ({
              group_id: newGroup.id,
              title: task.title,
              description: task.description,
              priority: task.priority,
              estimated_hours: task.estimated_hours,
              position: task.position || index,
              status: task.status || 'pending',
            }));

            const { error: tasksError } = await supabase
              .from('project_tasks')
              .insert(tasksData);

            if (tasksError) {
              console.error('Error inserting tasks:', tasksError);
            }
          }
        }
      }
    }

    // Fetch updated project
    const { data: updatedProject, error: fetchError } = await supabase
      .from('projects')
      .select(`
        *,
        groups:project_groups(
          *,
          tasks:project_tasks(*)
        )
      `)
      .eq('id', id)
      .single();

    if (fetchError || !updatedProject) {
      throw new Error('Failed to fetch updated project');
    }

    return NextResponse.json({ project: updatedProject });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error('Failed to delete project');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
