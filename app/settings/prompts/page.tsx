"use client";

import { useState, useEffect } from "react";
import { LayoutWithSidebar } from "@/app/layout-with-sidebar";
import { toast } from "sonner";
import { Save, RefreshCw, FileText } from "lucide-react";

const DEFAULT_SYSTEM_PROMPT = `You are an expert project manager. Your task is to analyze project descriptions and create structured project plans suitable for Monday.com boards.

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

export default function PromptsPage() {
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("system_prompt");
    if (saved) {
      setSystemPrompt(saved);
    }
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    try {
      localStorage.setItem("system_prompt", systemPrompt);
      toast.success("System prompt saved successfully!");
    } catch (error) {
      toast.error("Failed to save prompt");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSystemPrompt(DEFAULT_SYSTEM_PROMPT);
    toast.success("Reset to default prompt");
  };

  return (
    <LayoutWithSidebar>
      <div className="min-h-screen">
        <div className="border-b bg-white px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Prompts & Flows</h1>
          <p className="mt-2 text-gray-600">
            Customize how AI generates and structures projects
          </p>
        </div>

        <div className="container mx-auto px-8 py-8">
          <div className="max-w-5xl">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  System Prompt
                </h3>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                This prompt instructs the AI on how to structure projects. Modify it to
                change the AI's behavior, output format, or focus areas.
              </p>

              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={20}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
                placeholder="Enter system prompt..."
              />

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSaving ? "Saving..." : "Save Prompt"}</span>
                </button>
                
                <button
                  onClick={handleReset}
                  className="flex items-center space-x-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Reset to Default</span>
                </button>
              </div>
            </div>

            {/* Prompt Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-medium text-blue-900 mb-3">Prompt Engineering Tips</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Be specific about the JSON structure you expect</li>
                <li>• Include examples of good outputs</li>
                <li>• Specify the number of groups and tasks per group</li>
                <li>• Define clear guidelines for priorities and estimations</li>
                <li>• Add industry-specific instructions if needed</li>
                <li>• Use temperature and top_p to control creativity</li>
              </ul>
            </div>

            {/* Color Presets */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Color Presets for Groups
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 rounded" style={{ backgroundColor: "#579BFC" }}></div>
                  <div>
                    <p className="font-medium text-sm">Blue #579BFC</p>
                    <p className="text-xs text-gray-500">Planning, Discovery</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 rounded" style={{ backgroundColor: "#FDAB3D" }}></div>
                  <div>
                    <p className="font-medium text-sm">Orange #FDAB3D</p>
                    <p className="text-xs text-gray-500">Design, UX</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 rounded" style={{ backgroundColor: "#00C875" }}></div>
                  <div>
                    <p className="font-medium text-sm">Green #00C875</p>
                    <p className="text-xs text-gray-500">Development</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 rounded" style={{ backgroundColor: "#E2445C" }}></div>
                  <div>
                    <p className="font-medium text-sm">Red #E2445C</p>
                    <p className="text-xs text-gray-500">Testing, QA</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 rounded" style={{ backgroundColor: "#784BD1" }}></div>
                  <div>
                    <p className="font-medium text-sm">Purple #784BD1</p>
                    <p className="text-xs text-gray-500">Deployment</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 rounded" style={{ backgroundColor: "#FF5AC4" }}></div>
                  <div>
                    <p className="font-medium text-sm">Pink #FF5AC4</p>
                    <p className="text-xs text-gray-500">Marketing</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutWithSidebar>
  );
}
