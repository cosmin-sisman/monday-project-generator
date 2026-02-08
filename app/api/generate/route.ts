import { NextRequest, NextResponse } from 'next/server';
import { generateProjectStructure } from '@/lib/openai';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { input } = await request.json();

    if (!input || typeof input !== 'string' || input.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid input. Please provide a project description.' },
        { status: 400 }
      );
    }

    // Generate project structure using OpenAI
    const aiProject = await generateProjectStructure(input);

    // Save to Supabase
    const supabase = await createClient();

    // Insert project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        title: aiProject.title,
        original_input: input,
        status: 'draft',
      })
      .select()
      .single();

    if (projectError || !project) {
      console.error('Error creating project:', projectError);
      throw new Error('Failed to save project');
    }

    // Insert groups
    const groupsData = aiProject.groups.map((group, index) => ({
      project_id: project.id,
      title: group.title,
      color: group.color,
      position: index,
    }));

    const { data: groups, error: groupsError } = await supabase
      .from('project_groups')
      .insert(groupsData)
      .select();

    if (groupsError || !groups) {
      console.error('Error creating groups:', groupsError);
      throw new Error('Failed to save project groups');
    }

    // Insert tasks for each group
    const tasksData = [];
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      const aiGroup = aiProject.groups[i];
      
      for (let j = 0; j < aiGroup.tasks.length; j++) {
        const task = aiGroup.tasks[j];
        tasksData.push({
          group_id: group.id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          estimated_hours: task.estimated_hours || null,
          position: j,
          status: 'pending',
        });
      }
    }

    const { error: tasksError } = await supabase
      .from('project_tasks')
      .insert(tasksData);

    if (tasksError) {
      console.error('Error creating tasks:', tasksError);
      throw new Error('Failed to save project tasks');
    }

    // Fetch the complete project with groups and tasks
    const { data: completeProject, error: fetchError } = await supabase
      .from('projects')
      .select(`
        *,
        groups:project_groups(
          *,
          tasks:project_tasks(*)
        )
      `)
      .eq('id', project.id)
      .single();

    if (fetchError || !completeProject) {
      console.error('Error fetching complete project:', fetchError);
      throw new Error('Failed to fetch complete project');
    }

    return NextResponse.json({ project: completeProject });
  } catch (error) {
    console.error('Error in /api/generate:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate project' },
      { status: 500 }
    );
  }
}
