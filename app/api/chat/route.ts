import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { projectId, message, conversationHistory } = await request.json();

    if (!projectId || !message) {
      return NextResponse.json(
        { error: 'projectId and message are required' },
        { status: 400 }
      );
    }

    // Fetch current project structure
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
      .eq('id', projectId)
      .single();

    if (error || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Build context for AI
    const projectContext = `
Current Project: ${project.title}

Groups and Tasks:
${project.groups.map((group: any, i: number) => `
${i + 1}. ${group.title} (${group.color})
${group.tasks.map((task: any, j: number) => `
   ${i + 1}.${j + 1} ${task.title}
   - Description: ${task.description || 'N/A'}
   - Priority: ${task.priority}
   - Estimated hours: ${task.estimated_hours || 'N/A'}
`).join('')}
`).join('\n')}
`;

    const systemPrompt = `You are an AGENTIC project management assistant. You don't just suggest changes - you EXECUTE them.

${projectContext}

When the user asks you to modify the project, you must:
1. Understand their request
2. Return a JSON response with BOTH:
   - A friendly message explaining what you did
   - The complete updated project structure with ALL changes applied

RESPONSE FORMAT (YOU MUST FOLLOW THIS):
{
  "message": "I've added 3 new tasks to the Development group and increased the priority of the API Integration task.",
  "actions_performed": ["Added task: X", "Modified priority: Y", "Removed group: Z"],
  "updated_project": {
    "title": "Project Title",
    "groups": [
      {
        "id": "existing-id-or-null-for-new",
        "title": "Group Name",
        "color": "#579BFC",
        "position": 0,
        "tasks": [
          {
            "id": "existing-id-or-null-for-new",
            "title": "Task Name",
            "description": "Full description",
            "priority": "high|medium|low",
            "estimated_hours": 8,
            "position": 0,
            "status": "pending"
          }
        ]
      }
    ]
  }
}

IMPORTANT:
- If adding NEW groups/tasks, set "id" to null
- If modifying EXISTING groups/tasks, keep their existing "id"
- If removing groups/tasks, simply omit them from the updated structure
- ALWAYS return the COMPLETE updated project structure, not just the changes
- Be proactive and make the changes the user requests

Examples:
- "Add 2 tasks to Development" → Actually add them with proper descriptions
- "Remove Planning group" → Remove it from the structure
- "Change this to high priority" → Update the priority in the structure
- "Make descriptions more detailed" → Rewrite descriptions with more details

You are an ACTION-TAKING assistant. Execute, don't just suggest!`;

    // Call OpenAI with JSON mode
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...(conversationHistory || []),
      { role: 'user' as const, content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    });

    const aiResponse = completion.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    // Parse AI response
    const parsed = JSON.parse(aiResponse);

    // If AI provided an updated project structure, save it
    if (parsed.updated_project && parsed.updated_project.groups) {
      const updatedProject = parsed.updated_project;

      // Update project title if changed
      if (updatedProject.title && updatedProject.title !== project.title) {
        await supabase
          .from('projects')
          .update({ title: updatedProject.title })
          .eq('id', projectId);
      }

      // Handle groups
      for (const group of updatedProject.groups) {
        if (group.id) {
          // Update existing group
          await supabase
            .from('project_groups')
            .update({
              title: group.title,
              color: group.color,
              position: group.position,
            })
            .eq('id', group.id);

          // Handle tasks in this group
          if (group.tasks) {
            for (const task of group.tasks) {
              if (task.id) {
                // Update existing task
                await supabase
                  .from('project_tasks')
                  .update({
                    title: task.title,
                    description: task.description,
                    priority: task.priority,
                    estimated_hours: task.estimated_hours,
                    position: task.position,
                    status: task.status || 'pending',
                  })
                  .eq('id', task.id);
              } else {
                // Insert new task
                await supabase
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
              }
            }
          }
        } else {
          // Insert new group
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

          // Insert tasks for new group
          if (newGroup && group.tasks) {
            const tasksData = group.tasks.map((task: any, index: number) => ({
              group_id: newGroup.id,
              title: task.title,
              description: task.description,
              priority: task.priority,
              estimated_hours: task.estimated_hours,
              position: task.position || index,
              status: task.status || 'pending',
            }));

            await supabase.from('project_tasks').insert(tasksData);
          }
        }
      }

      // Remove groups that are no longer in the updated structure
      const updatedGroupIds = updatedProject.groups
        .filter((g: any) => g.id)
        .map((g: any) => g.id);
      
      const existingGroupIds = project.groups.map((g: any) => g.id);
      const groupsToDelete = existingGroupIds.filter((id: string) => !updatedGroupIds.includes(id));
      
      if (groupsToDelete.length > 0) {
        await supabase
          .from('project_groups')
          .delete()
          .in('id', groupsToDelete);
      }

      // Remove tasks that are no longer in the updated structure
      for (const group of updatedProject.groups.filter((g: any) => g.id)) {
        const updatedTaskIds = (group.tasks || [])
          .filter((t: any) => t.id)
          .map((t: any) => t.id);
        
        const existingTasks = project.groups
          .find((g: any) => g.id === group.id)?.tasks || [];
        
        const existingTaskIds = existingTasks.map((t: any) => t.id);
        const tasksToDelete = existingTaskIds.filter((id: string) => !updatedTaskIds.includes(id));
        
        if (tasksToDelete.length > 0) {
          await supabase
            .from('project_tasks')
            .delete()
            .in('id', tasksToDelete);
        }
      }
    }

    return NextResponse.json({
      message: parsed.message,
      actions: parsed.actions_performed || [],
      response: parsed.message,
      updated: !!parsed.updated_project,
      conversationHistory: [
        ...(conversationHistory || []),
        { role: 'user', content: message },
        { role: 'assistant', content: parsed.message },
      ],
    });
  } catch (error) {
    console.error('Error in chat:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process chat' },
      { status: 500 }
    );
  }
}
