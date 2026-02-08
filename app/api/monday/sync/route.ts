import { NextRequest, NextResponse } from 'next/server';
import { createBoard, createGroup, createItem } from '@/lib/monday';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { projectId, workspaceId, boardId, newBoardName } = await request.json();

    if (!projectId || !workspaceId) {
      return NextResponse.json(
        { error: 'projectId and workspaceId are required' },
        { status: 400 }
      );
    }

    if (!boardId && !newBoardName) {
      return NextResponse.json(
        { error: 'Either boardId or newBoardName is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch project with groups and tasks
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select(`
        *,
        groups:project_groups(
          *,
          tasks:project_tasks(*)
        )
      `)
      .eq('id', projectId)
      .single();

    if (fetchError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Create or use existing board
    let mondayBoardId = boardId;
    if (newBoardName) {
      const newBoard = await createBoard(newBoardName, workspaceId);
      mondayBoardId = newBoard.id;
    }

    if (!mondayBoardId) {
      return NextResponse.json(
        { error: 'Failed to create or select board' },
        { status: 500 }
      );
    }

    // Update project with Monday board info
    await supabase
      .from('projects')
      .update({
        monday_board_id: mondayBoardId,
        monday_workspace_id: workspaceId,
        status: 'synced',
      })
      .eq('id', projectId);

    // Create groups and items in Monday
    for (const group of project.groups) {
      // Create group in Monday
      const mondayGroup = await createGroup(
        mondayBoardId,
        group.title,
        group.color
      );

      // Update group with Monday group ID
      await supabase
        .from('project_groups')
        .update({ monday_group_id: mondayGroup.id })
        .eq('id', group.id);

      // Create items (tasks) in Monday
      if (group.tasks && group.tasks.length > 0) {
        for (const task of group.tasks) {
          const mondayItem = await createItem(
            mondayBoardId,
            mondayGroup.id,
            task.title
          );

          // Add description as an update to the item
          if (task.description) {
            try {
              await fetch('https://api.monday.com/v2', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': process.env.MONDAY_API_TOKEN!,
                  'API-Version': '2024-10',
                },
                body: JSON.stringify({
                  query: `mutation ($itemId: ID!, $body: String!) {
                    create_update(item_id: $itemId, body: $body) {
                      id
                    }
                  }`,
                  variables: {
                    itemId: mondayItem.id,
                    body: `📋 Description:\n\n${task.description}\n\n---\nPriority: ${task.priority}\nEstimated hours: ${task.estimated_hours || 'N/A'}`,
                  },
                }),
              });
            } catch (error) {
              console.error('Failed to add description update:', error);
            }
          }

          // Update task with Monday item ID
          await supabase
            .from('project_tasks')
            .update({ monday_item_id: mondayItem.id })
            .eq('id', task.id);
        }
      }
    }

    // Fetch updated project
    const { data: updatedProject } = await supabase
      .from('projects')
      .select(`
        *,
        groups:project_groups(
          *,
          tasks:project_tasks(*)
        )
      `)
      .eq('id', projectId)
      .single();

    return NextResponse.json({
      success: true,
      project: updatedProject,
      boardUrl: `https://monday.com/boards/${mondayBoardId}`,
    });
  } catch (error) {
    console.error('Error syncing to Monday:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sync project to Monday.com' },
      { status: 500 }
    );
  }
}
