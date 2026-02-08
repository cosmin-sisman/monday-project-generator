"use client";

import { useEffect, useState } from "react";
import { LayoutWithSidebar } from "../layout-with-sidebar";
import { Loader2, FolderOpen, Clock, CheckCircle, AlertCircle, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface Project {
  id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
  groups_count: number;
  tasks_count: number;
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      if (!response.ok) throw new Error("Failed to fetch projects");
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "synced":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "validated":
        return <AlertCircle className="h-5 w-5 text-blue-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "synced":
        return "Synced to Monday";
      case "validated":
        return "Validated";
      default:
        return "Draft";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ro-RO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (isLoading) {
    return (
      <LayoutWithSidebar>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </LayoutWithSidebar>
    );
  }

  return (
    <LayoutWithSidebar>
      <div className="min-h-screen bg-gray-50">
        <div className="border-b bg-white px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Projects</h1>
              <p className="mt-2 text-gray-600">
                {projects.length} {projects.length === 1 ? "project" : "projects"} in total
              </p>
            </div>
            <button
              onClick={() => router.push("/")}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>New Project</span>
            </button>
          </div>
        </div>

        <div className="container mx-auto px-8 py-8">
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-600 mb-6">Create your first project to get started</p>
              <button
                onClick={() => router.push("/")}
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Create Project</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => router.push(`/projects/${project.id}`)}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1 mr-2">
                      {project.title}
                    </h3>
                    {getStatusIcon(project.status)}
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center justify-between">
                      <span>Status:</span>
                      <span className="font-medium">{getStatusLabel(project.status)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Groups:</span>
                      <span className="font-medium">{project.groups_count}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Tasks:</span>
                      <span className="font-medium">{project.tasks_count}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 space-y-1">
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      Created: {formatDate(project.created_at)}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      Updated: {formatDate(project.updated_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </LayoutWithSidebar>
  );
}
