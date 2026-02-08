import OpenAI from 'openai';
import { AIProjectSchema, type AIProjectOutput } from './schemas';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert project manager. Your task is to analyze project descriptions and create structured project plans suitable for Monday.com boards.

Given a project description, you must return a JSON object with the following structure:

{
  "title": "Project Name",
  "groups": [
    {
      "title": "Phase/Category Name",
      "color": "#579BFC",
      "tasks": [
        {
          "title": "Task Name",
          "description": "Detailed specifications and requirements for this task",
          "priority": "high" | "medium" | "low",
          "estimated_hours": 8
        }
      ]
    }
  ]
}

Guidelines:
1. Break down the project into logical groups (phases, categories, or work streams)
2. Each group should have 3-8 tasks
3. Task descriptions should be detailed and actionable
4. Use colors for groups: Planning/Discovery (#579BFC blue), Design (#FDAB3D orange), Development (#00C875 green), Testing (#E2445C red), Deployment (#784BD1 purple)
5. Estimate hours realistically based on task complexity
6. Set priorities based on dependencies and importance
7. Create clear, specific task titles
8. Total project should have 3-8 groups

Focus on creating a comprehensive, actionable project structure that a team can immediately start working from.`;

export async function generateProjectStructure(
  input: string
): Promise<AIProjectOutput> {
  try {
    // Load config from client (will be passed from API route)
    const config = typeof window !== 'undefined' 
      ? JSON.parse(localStorage.getItem('ai_config') || '{}')
      : {};
    
    const systemPrompt = typeof window !== 'undefined'
      ? localStorage.getItem('system_prompt') || SYSTEM_PROMPT
      : SYSTEM_PROMPT;

    const completion = await openai.chat.completions.create({
      model: config.model || 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Create a structured project plan for the following description:\n\n${input}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: config.temperature || 0.7,
      max_tokens: config.maxTokens || 4000,
      top_p: config.topP || 1,
      frequency_penalty: config.frequencyPenalty || 0,
      presence_penalty: config.presencePenalty || 0,
    });

    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const parsed = JSON.parse(content);
    
    // Validate the response using Zod schema
    const validated = AIProjectSchema.parse(parsed);
    
    return validated;
  } catch (error) {
    console.error('Error generating project structure:', error);
    throw new Error('Failed to generate project structure. Please try again.');
  }
}
