import { NextResponse } from 'next/server';
import { getWorkspaces } from '@/lib/monday';

export async function GET() {
  try {
    const workspaces = await getWorkspaces();
    return NextResponse.json({ workspaces });
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workspaces from Monday.com' },
      { status: 500 }
    );
  }
}
