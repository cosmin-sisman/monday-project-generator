export interface Project {
  id: string;
  title: string;
  original_input: string;
  status: 'draft' | 'validated' | 'synced';
  monday_board_id: string | null;
  monday_workspace_id: string | null;
  created_at: string;
  updated_at: string;
  groups?: ProjectGroup[];
}

export interface ProjectGroup {
  id: string;
  project_id: string;
  title: string;
  color: string;
  position: number;
  monday_group_id: string | null;
  created_at: string;
  tasks?: ProjectTask[];
}

export interface ProjectTask {
  id: string;
  group_id: string;
  title: string;
  description: string | null;
  status: string;
  priority: 'low' | 'medium' | 'high';
  estimated_hours: number | null;
  position: number;
  monday_item_id: string | null;
  created_at: string;
}

export interface MondayWorkspace {
  id: string;
  name: string;
  is_default_workspace?: boolean;
}

export interface MondayBoard {
  id: string;
  name: string;
}

export interface GenerateProjectInput {
  input: string;
}

export interface GenerateProjectResponse {
  project: Project;
}

export interface SyncToMondayInput {
  projectId: string;
  workspaceId: string;
  boardId?: string;
  newBoardName?: string;
}
