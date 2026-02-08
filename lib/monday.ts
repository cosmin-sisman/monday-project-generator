import { MondayWorkspace, MondayBoard } from './types';

const MONDAY_API_URL = 'https://api.monday.com/v2';
const MONDAY_API_VERSION = '2024-10';

async function mondayRequest<T>(query: string, variables?: Record<string, any>): Promise<T> {
  const token = process.env.MONDAY_API_TOKEN;
  
  if (!token) {
    throw new Error('MONDAY_API_TOKEN is not configured');
  }

  const response = await fetch(MONDAY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
      'API-Version': MONDAY_API_VERSION,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`Monday API request failed: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (data.errors) {
    console.error('Monday API errors:', data.errors);
    throw new Error(data.errors[0]?.message || 'Monday API request failed');
  }

  return data.data;
}

export async function getWorkspaces(): Promise<MondayWorkspace[]> {
  const query = `
    query {
      workspaces {
        id
        name
        is_default_workspace
      }
    }
  `;

  const data = await mondayRequest<{ workspaces: MondayWorkspace[] }>(query);
  return data.workspaces;
}

export async function getBoards(workspaceId: string): Promise<MondayBoard[]> {
  const query = `
    query ($workspaceIds: [ID!]) {
      boards(workspace_ids: $workspaceIds, limit: 100) {
        id
        name
      }
    }
  `;

  const data = await mondayRequest<{ boards: MondayBoard[] }>(query, {
    workspaceIds: [workspaceId],
  });
  
  return data.boards;
}

export async function createBoard(
  boardName: string,
  workspaceId: string
): Promise<{ id: string; name: string }> {
  const query = `
    mutation ($boardName: String!, $workspaceId: ID!, $boardKind: BoardKind!) {
      create_board(
        board_name: $boardName
        workspace_id: $workspaceId
        board_kind: $boardKind
        empty: true
      ) {
        id
        name
      }
    }
  `;

  const data = await mondayRequest<{ create_board: { id: string; name: string } }>(query, {
    boardName,
    workspaceId: parseInt(workspaceId),
    boardKind: 'public',
  });

  return data.create_board;
}

export async function createGroup(
  boardId: string,
  groupName: string,
  color?: string
): Promise<{ id: string; title: string }> {
  const query = `
    mutation ($boardId: ID!, $groupName: String!, $groupColor: String) {
      create_group(
        board_id: $boardId
        group_name: $groupName
        group_color: $groupColor
      ) {
        id
        title
      }
    }
  `;

  const data = await mondayRequest<{ create_group: { id: string; title: string } }>(query, {
    boardId: parseInt(boardId),
    groupName,
    groupColor: color || '#579BFC',
  });

  return data.create_group;
}

export async function createItem(
  boardId: string,
  groupId: string,
  itemName: string
): Promise<{ id: string; name: string }> {
  const query = `
    mutation ($boardId: ID!, $groupId: String!, $itemName: String!) {
      create_item(
        board_id: $boardId
        group_id: $groupId
        item_name: $itemName
      ) {
        id
        name
      }
    }
  `;

  const data = await mondayRequest<{ create_item: { id: string; name: string } }>(query, {
    boardId: parseInt(boardId),
    groupId,
    itemName,
  });

  return data.create_item;
}

export async function updateItemColumnValues(
  boardId: string,
  itemId: string,
  columnValues: Record<string, any>
): Promise<{ id: string }> {
  const query = `
    mutation ($boardId: ID!, $itemId: ID!, $columnValues: JSON!) {
      change_multiple_column_values(
        board_id: $boardId
        item_id: $itemId
        column_values: $columnValues
      ) {
        id
      }
    }
  `;

  const data = await mondayRequest<{ change_multiple_column_values: { id: string } }>(query, {
    boardId: parseInt(boardId),
    itemId: parseInt(itemId),
    columnValues: JSON.stringify(columnValues),
  });

  return data.change_multiple_column_values;
}
