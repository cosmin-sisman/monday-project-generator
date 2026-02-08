import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { projectId, message } = await request.json();

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

    // Fetch conversation history from DB
    const { data: conversationHistory } = await supabase
      .from('ai_conversations')
      .select('role, content')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/7fd8b7a4-b84b-4183-a927-b59f70bf7df6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/chat/route.ts:47',message:'Project loaded from DB',data:{projectId,groupCount:project.groups?.length||0,totalGroups:project.groups?.map((g:any)=>({id:g.id,title:g.title,taskCount:g.tasks?.length||0}))},hypothesisId:'H3',timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    // Build context for AI with EXPLICIT ID mapping
    const projectContext = `
Current Project: ${project.title}

EXISTING GROUPS (YOU MUST COPY THESE EXACT IDs):
${project.groups.map((group: any, i: number) => `
${i + 1}. Group: "${group.title}"
   UUID: "${group.id}" ⚠️ COPY THIS EXACT ID!
   Color: "${group.color}"
   Position: ${i}
   Tasks:
${group.tasks.map((task: any, j: number) => `   ${i + 1}.${j + 1} "${task.title}"
      UUID: "${task.id}" ⚠️ COPY THIS EXACT ID!
      Description: ${task.description || 'N/A'}
      Priority: ${task.priority}
      Estimated hours: ${task.estimated_hours || 'N/A'}
      Position: ${j}
      Status: ${task.status}
`).join('')}
`).join('\n')}

⚠️⚠️⚠️ CRITICAL: When returning updated_project, use the EXACT UUIDs shown above! ⚠️⚠️⚠️
`;

    const systemPrompt = `You are an AGENTIC project management assistant. You don't just suggest changes - you EXECUTE them.

${projectContext}

When the user asks you to modify the project, you must:
1. Understand their request
2. Return a JSON response with BOTH:
   - A friendly message explaining what you did
   - The complete updated project structure with ALL changes applied

RESPONSE FORMAT - USE THIS EXACT STRUCTURE:
{
  "message": "I've added a new Documentation group with 2 tasks",
  "actions_performed": ["Added group: Documentation", "Added task: Task 1", "Added task: Task 2"],
  "updated_project": {
    "title": "${project.title}",
    "groups": [
${project.groups.map((group: any, idx: number) => `      {
        "id": "${group.id}",  // ⚠️ EXACT UUID from above!
        "title": "${group.title}",
        "color": "${group.color}",
        "position": ${idx},
        "tasks": [${group.tasks?.map((task: any, tidx: number) => `
          {
            "id": "${task.id}",  // ⚠️ EXACT UUID!
            "title": "${task.title}",
            "description": "${task.description || ''}",
            "priority": "${task.priority}",
            "estimated_hours": ${task.estimated_hours || 0},
            "position": ${tidx},
            "status": "${task.status}"
          }`).join(',') || ''}
        ]
      }`).join(',\n')}${project.groups.length > 0 ? ',' : ''}
      {
        "id": null,  // ⚠️ null ONLY for NEW groups!
        "title": "New Group Name",
        "color": "#FF6B6B",
        "position": ${project.groups.length},
        "tasks": []
      }
    ]
  }
}

⚠️⚠️⚠️ CRITICAL: Copy the ENTIRE structure above with ALL existing groups before adding new ones! ⚠️⚠️⚠️

🚨 CRITICAL SAFETY RULES - NEVER BREAK THESE:

1. **DEFAULT MODE = ADD ONLY** - Unless user explicitly says "delete"/"remove"/"șterge", you ONLY ADD things
2. **PRESERVE EVERYTHING** - Always copy ALL existing groups and tasks into updated_project
3. **IDs are SACRED** - Keep existing IDs EXACTLY as shown in "Current Project" above. IDs are UUIDs like "0b9f904f-07af-424d-a6b8-c7413003e715", NOT color codes like "#579BFC"!
4. **DO NOT CONFUSE COLOR WITH ID** - The "color" field contains hex codes like "#579BFC". The "id" field contains UUIDs like "a1b2c3d4-5678-90ab-cdef-1234567890ab". NEVER copy a color value into the id field!
5. **NO IMPLICIT DELETIONS** - Never remove items just because they're not mentioned

DECISION TREE FOR EVERY REQUEST:
- "adaugă X" / "add X" → ADD X to existing structure (copy ALL existing groups with their EXACT UUIDs)
- "modifică Y" / "change Y" → UPDATE Y, keep everything else (copy ALL existing groups with their EXACT UUIDs)
- "șterge Z" / "delete Z" / "remove Z" → ONLY NOW can you remove Z
- Anything else → ADD or MODIFY, NEVER DELETE

ID COPYING INSTRUCTIONS (CRITICAL):
1. Look at the "Current Project" section above
2. Find each group's ID (looks like "0b9f904f-07af-424d-a6b8-c7413003e715")
3. Copy that EXACT UUID into the "id" field of your response
4. DO NOT copy the color value (like "#579BFC") into the id field
5. For NEW groups/tasks you create, set "id": null

EXAMPLES OF CORRECT BEHAVIOR:
❌ BAD: User says "adaugă grup Documentation" → You return ONLY Documentation group
✅ GOOD: User says "adaugă grup Documentation" → You return ALL existing groups PLUS new Documentation group

❌ BAD: User says "add 2 tasks" → You create new project with only 2 tasks  
✅ GOOD: User says "add 2 tasks" → You keep ALL existing groups/tasks and ADD 2 new tasks

THE GOLDEN RULE: When in doubt, KEEP IT. Only delete if explicitly asked.`;

    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/7fd8b7a4-b84b-4183-a927-b59f70bf7df6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/chat/route.ts:122',message:'Messages sent to OpenAI',data:{messageCount:conversationHistory?.length||0,userMessage:message,contextGroupCount:project.groups?.length||0},hypothesisId:'H3,H4',timestamp:Date.now()})}).catch(()=>{});
    // #endregion

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

    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/7fd8b7a4-b84b-4183-a927-b59f70bf7df6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/chat/route.ts:143',message:'AI response parsed',data:{hasUpdatedProject:!!parsed.updated_project,groupsInResponse:parsed.updated_project?.groups?.length||0,groupsInResponseDetail:parsed.updated_project?.groups?.map((g:any)=>({id:g.id,title:g.title,taskCount:g.tasks?.length||0}))||[]},hypothesisId:'H1,H2',timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    // Save user message to conversation history
    await supabase.from('ai_conversations').insert({
      project_id: projectId,
      role: 'user',
      content: message,
    });

    // If AI provided an updated project structure, save it
    if (parsed.updated_project && parsed.updated_project.groups) {
      // CREATE BACKUP BEFORE MODIFYING
      const backupSnapshot = {
        title: project.title,
        groups: project.groups,
        timestamp: new Date().toISOString(),
      };

      await supabase.from('project_versions').insert({
        project_id: projectId,
        snapshot: backupSnapshot,
        change_description: parsed.actions_performed?.join('; ') || 'AI modification',
        created_by: 'ai_assistant',
      });
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

      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/7fd8b7a4-b84b-4183-a927-b59f70bf7df6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/chat/route.ts:243',message:'Before delete groups logic',data:{existingGroupIds:project.groups.map((g:any)=>g.id),updatedGroupIdsFromAI:updatedProject.groups.filter((g:any)=>g.id).map((g:any)=>g.id)},hypothesisId:'H4',timestamp:Date.now()})}).catch(()=>{});
      // #endregion

      // Remove groups that are no longer in the updated structure
      const updatedGroupIds = updatedProject.groups
        .filter((g: any) => g.id)
        .map((g: any) => g.id);
      
      const existingGroupIds = project.groups.map((g: any) => g.id);
      const groupsToDelete = existingGroupIds.filter((id: string) => !updatedGroupIds.includes(id));
      
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/7fd8b7a4-b84b-4183-a927-b59f70bf7df6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/chat/route.ts:254',message:'Groups marked for deletion',data:{groupsToDeleteCount:groupsToDelete.length,groupsToDeleteIds:groupsToDelete},hypothesisId:'H4',timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      
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

    // Save assistant response to conversation history
    await supabase.from('ai_conversations').insert({
      project_id: projectId,
      role: 'assistant',
      content: parsed.message,
      actions_performed: parsed.actions_performed || [],
    });

    return NextResponse.json({
      message: parsed.message,
      actions: parsed.actions_performed || [],
      response: parsed.message,
      updated: !!parsed.updated_project,
    });
  } catch (error) {
    console.error('Error in chat:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process chat' },
      { status: 500 }
    );
  }
}
