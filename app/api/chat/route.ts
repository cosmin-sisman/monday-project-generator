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

    const systemPrompt = `You are a project management assistant helping to refine and improve Monday.com projects.

${projectContext}

The user will ask you to modify the project structure. You can:
- Add new groups or tasks
- Remove groups or tasks
- Modify titles, descriptions, priorities
- Reorganize the structure
- Add more details or clarifications

When suggesting changes, provide them in a clear, actionable format. If you're adding or modifying tasks, include:
- Title
- Description
- Priority (low/medium/high)
- Estimated hours

Be conversational and helpful. Understand the user's intent and provide thoughtful recommendations.`;

    // Call OpenAI
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...(conversationHistory || []),
      { role: 'user' as const, content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    });

    const aiResponse = completion.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    return NextResponse.json({
      response: aiResponse,
      conversationHistory: [
        ...(conversationHistory || []),
        { role: 'user', content: message },
        { role: 'assistant', content: aiResponse },
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
