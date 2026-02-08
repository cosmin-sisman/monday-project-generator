"use client";

import { useEffect, useState } from "react";
import { LayoutWithSidebar } from "@/app/layout-with-sidebar";
import { ProjectStructure } from "@/components/ProjectStructure";
import { MondaySelector } from "@/components/MondaySelector";
import { AIChat } from "@/components/AIChat";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { Project } from "@/lib/types";

export default function ProjectPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${id}`);
      if (!response.ok) throw new Error("Failed to fetch project");
      const data = await response.json();
      setProject(data.project);
    } catch (error) {
      console.error("Error fetching project:", error);
    } finally {
      setIsLoading(false);
    }
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

  if (!project) {
    return (
      <LayoutWithSidebar>
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-600">Project not found</p>
        </div>
      </LayoutWithSidebar>
    );
  }

  return (
    <LayoutWithSidebar>
      <div className="min-h-screen">
        <div className="border-b bg-white px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Project Editor</h1>
          <p className="mt-1 text-gray-600">Edit and refine your project structure</p>
        </div>

        <div className="container mx-auto px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Project Structure */}
            <div className="lg:col-span-2">
              <ProjectStructure initialProject={project} />

              <div className="mt-8">
                <MondaySelector projectId={project.id} />
              </div>
            </div>

            {/* Right: AI Chat */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <AIChat projectId={project.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutWithSidebar>
  );
}

