"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, CheckCircle2, ExternalLink } from "lucide-react";
import { MondayWorkspace, MondayBoard } from "@/lib/types";

interface MondaySelectorProps {
  projectId: string;
}

export function MondaySelector({ projectId }: MondaySelectorProps) {
  const [workspaces, setWorkspaces] = useState<MondayWorkspace[]>([]);
  const [boards, setBoards] = useState<MondayBoard[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>("");
  const [selectedBoard, setSelectedBoard] = useState<string>("");
  const [newBoardName, setNewBoardName] = useState<string>("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);
  const [isLoadingBoards, setIsLoadingBoards] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedBoardUrl, setSyncedBoardUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    if (selectedWorkspace) {
      fetchBoards(selectedWorkspace);
    } else {
      setBoards([]);
    }
  }, [selectedWorkspace]);

  const fetchWorkspaces = async () => {
    try {
      const response = await fetch("/api/monday/workspaces");
      if (!response.ok) throw new Error("Failed to fetch workspaces");
      const data = await response.json();
      setWorkspaces(data.workspaces);
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      toast.error("Failed to load Monday.com workspaces");
    } finally {
      setIsLoadingWorkspaces(false);
    }
  };

  const fetchBoards = async (workspaceId: string) => {
    setIsLoadingBoards(true);
    try {
      const response = await fetch(
        `/api/monday/boards?workspace_id=${workspaceId}`
      );
      if (!response.ok) throw new Error("Failed to fetch boards");
      const data = await response.json();
      setBoards(data.boards);
    } catch (error) {
      console.error("Error fetching boards:", error);
      toast.error("Failed to load boards");
    } finally {
      setIsLoadingBoards(false);
    }
  };

  const handleSync = async () => {
    if (!selectedWorkspace) {
      toast.error("Please select a workspace");
      return;
    }

    if (!isCreatingNew && !selectedBoard) {
      toast.error("Please select a board or create a new one");
      return;
    }

    if (isCreatingNew && !newBoardName.trim()) {
      toast.error("Please enter a board name");
      return;
    }

    setIsSyncing(true);

    try {
      const response = await fetch("/api/monday/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          workspaceId: selectedWorkspace,
          boardId: isCreatingNew ? undefined : selectedBoard,
          newBoardName: isCreatingNew ? newBoardName : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to sync project");
      }

      const data = await response.json();
      setSyncedBoardUrl(data.boardUrl);
      toast.success("Project synced to Monday.com successfully!");
    } catch (error) {
      console.error("Error syncing project:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to sync project"
      );
    } finally {
      setIsSyncing(false);
    }
  };

  if (syncedBoardUrl) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-semibold text-green-900">
            Project Synced Successfully!
          </h3>
        </div>
        <p className="text-green-700 mb-4">
          Your project has been created in Monday.com. You can now view and
          manage it there.
        </p>
        <a
          href={syncedBoardUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <span>Open in Monday.com</span>
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Sync to Monday.com
      </h2>

      <div className="space-y-6">
        {/* Workspace Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Workspace
          </label>
          {isLoadingWorkspaces ? (
            <div className="flex items-center space-x-2 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading workspaces...</span>
            </div>
          ) : (
            <select
              value={selectedWorkspace}
              onChange={(e) => {
                setSelectedWorkspace(e.target.value);
                setSelectedBoard("");
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Choose a workspace</option>
              {workspaces.map((workspace) => (
                <option key={workspace.id} value={workspace.id}>
                  {workspace.name}
                  {workspace.is_default_workspace ? " (Main)" : ""}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Board Selection Toggle */}
        {selectedWorkspace && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Board Selection
            </label>
            <div className="flex space-x-4 mb-4">
              <button
                onClick={() => setIsCreatingNew(false)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  !isCreatingNew
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Use Existing Board
              </button>
              <button
                onClick={() => setIsCreatingNew(true)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isCreatingNew
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Create New Board
              </button>
            </div>

            {isCreatingNew ? (
              <input
                type="text"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                placeholder="Enter new board name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <>
                {isLoadingBoards ? (
                  <div className="flex items-center space-x-2 text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading boards...</span>
                  </div>
                ) : (
                  <select
                    value={selectedBoard}
                    onChange={(e) => setSelectedBoard(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choose a board</option>
                    {boards.map((board) => (
                      <option key={board.id} value={board.id}>
                        {board.name}
                      </option>
                    ))}
                  </select>
                )}
              </>
            )}
          </div>
        )}

        {/* Sync Button */}
        <button
          onClick={handleSync}
          disabled={isSyncing || !selectedWorkspace}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          {isSyncing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Syncing to Monday.com...</span>
            </>
          ) : (
            <span>Sync to Monday.com</span>
          )}
        </button>
      </div>
    </div>
  );
}
