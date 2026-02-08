"use client";

import { useState } from "react";
import { ProjectGroup } from "@/lib/types";
import { TaskCard } from "./TaskCard";
import { ChevronDown, ChevronRight, Pencil, Save, X } from "lucide-react";

interface GroupCardProps {
  group: ProjectGroup;
  onUpdate: (group: ProjectGroup) => void;
}

export function GroupCard({ group, onUpdate }: GroupCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(group.title);

  const handleSaveTitle = () => {
    onUpdate({ ...group, title: editedTitle });
    setIsEditingTitle(false);
  };

  const handleCancelTitle = () => {
    setEditedTitle(group.title);
    setIsEditingTitle(false);
  };

  const handleTaskUpdate = (updatedTask: any) => {
    const updatedTasks = group.tasks?.map((t) =>
      t.id === updatedTask.id ? updatedTask : t
    );
    onUpdate({ ...group, tasks: updatedTasks });
  };

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden mb-4">
      <div
        className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ borderLeft: `4px solid ${group.color}` }}
      >
        <div className="flex items-center space-x-3 flex-1">
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-500" />
          )}
          
          {isEditingTitle ? (
            <div
              className="flex-1 flex items-center space-x-2"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Group title"
                autoFocus
              />
              <button
                onClick={handleSaveTitle}
                className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Save className="h-4 w-4" />
              </button>
              <button
                onClick={handleCancelTitle}
                className="p-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-gray-900">
                {group.title}
              </h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingTitle(true);
                }}
                className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
        
        <div className="text-sm text-gray-500">
          {group.tasks?.length || 0} tasks
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 py-4 bg-white">
          {group.tasks && group.tasks.length > 0 ? (
            <div>
              {group.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onUpdate={handleTaskUpdate}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No tasks yet</p>
          )}
        </div>
      )}
    </div>
  );
}
