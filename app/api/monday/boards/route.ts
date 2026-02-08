import { NextRequest, NextResponse } from 'next/server';
import { getBoards } from '@/lib/monday';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const workspaceId = searchParams.get('workspace_id');

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'workspace_id is required' },
        { status: 400 }
      );
    }

    const boards = await getBoards(workspaceId);
    return NextResponse.json({ boards });
  } catch (error) {
    console.error('Error fetching boards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch boards from Monday.com' },
      { status: 500 }
    );
  }
}
