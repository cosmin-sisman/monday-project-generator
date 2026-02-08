import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch all projects with group and task counts
    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        id,
        title,
        status,
        created_at,
        updated_at,
        groups:project_groups(count),
        tasks:project_groups(
          project_tasks(count)
        )
      `)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    // Process to add counts
    const processedProjects = projects?.map((project: any) => {
      const groups_count = project.groups?.[0]?.count || 0;
      
      // Count total tasks across all groups
      let tasks_count = 0;
      if (project.tasks && Array.isArray(project.tasks)) {
        project.tasks.forEach((group: any) => {
          if (group.project_tasks && Array.isArray(group.project_tasks)) {
            tasks_count += group.project_tasks.length;
          }
        });
      }

      return {
        id: project.id,
        title: project.title,
        status: project.status,
        created_at: project.created_at,
        updated_at: project.updated_at,
        groups_count,
        tasks_count,
      };
    });

    return NextResponse.json({
      projects: processedProjects || [],
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}
