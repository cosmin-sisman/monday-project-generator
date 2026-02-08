"use client";

import { useState } from "react";
import { Project } from "@/lib/types";
import { GroupCard } from "./GroupCard";
import { Pencil, Save, X } from "lucide-react";
import { toast } from "sonner";

interface ProjectStructureProps {
  initialProject: Project;
}

export function ProjectStructure({
  initialProject,
}: ProjectStructureProps) {
  const [project, setProject] = useState(initialProject);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(project.title);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveTitle = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: editedTitle }),
      });

      if (!response.ok) {
        throw new Error("Failed to update project title");
      }

      const data = await response.json();
      setProject(data.project);
      setIsEditingTitle(false);
      toast.success("Project title updated");
    } catch (error) {
      console.error("Error updating title:", error);
      toast.error("Failed to update project title");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelTitle = () => {
    setEditedTitle(project.title);
    setIsEditingTitle(false);
  };

  const handleGroupUpdate = async (updatedGroup: any) => {
    setIsSaving(true);
    try {
      const updatedGroups = project.groups?.map((g) =>
        g.id === updatedGroup.id ? updatedGroup : g
      );

      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groups: updatedGroups }),
      });

      if (!response.ok) {
        throw new Error("Failed to update project");
      }

      const data = await response.json();
      setProject(data.project);
      toast.success("Changes saved");
    } catch (error) {
      console.error("Error updating group:", error);
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {isEditingTitle ? (
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="flex-1 px-4 py-2 text-2xl font-bold border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Project title"
              disabled={isSaving}
            />
            <button
              onClick={handleSaveTitle}
              disabled={isSaving}
              className="p-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300"
            >
              <Save className="h-5 w-5" />
            </button>
            <button
              onClick={handleCancelTitle}
              disabled={isSaving}
              className="p-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:bg-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              {project.title}
            </h1>
            <button
              onClick={() => setIsEditingTitle(true)}
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            >
              <Pencil className="h-5 w-5" />
            </button>
          </div>
        )}

        <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600">
          <span className="capitalize">Status: {project.status}</span>
          <span>•</span>
          <span>{project.groups?.length || 0} Groups</span>
          <span>•</span>
          <span>
            {project.groups?.reduce(
              (acc, g) => acc + (g.tasks?.length || 0),
              0
            ) || 0}{" "}
            Tasks
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {project.groups && project.groups.length > 0 ? (
          project.groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onUpdate={handleGroupUpdate}
            />
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500">No groups found</p>
          </div>
        )}
      </div>
    </div>
  );
}
