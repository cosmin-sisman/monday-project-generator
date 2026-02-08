"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";

export function ProjectInput() {
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast.error("Please enter a project description");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate project");
      }

      const data = await response.json();
      toast.success("Project generated successfully!");
      router.push(`/projects/${data.project.id}`);
    } catch (error) {
      console.error("Error generating project:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate project"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="mb-6">
        <label
          htmlFor="project-input"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Describe your project
        </label>
        <textarea
          id="project-input"
          rows={10}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Example: I need to build a mobile app for food delivery. It should include user registration, restaurant browsing, order placement, real-time tracking, payment integration, and a review system. The project needs to be completed in 3 months with a team of 5 developers."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isGenerating}
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={isGenerating || !input.trim()}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Generating Project Structure...</span>
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" />
            <span>Generate Project with AI</span>
          </>
        )}
      </button>

      <div className="mt-6 text-sm text-gray-500">
        <p className="font-medium mb-2">Tips for best results:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Include project goals and objectives</li>
          <li>Mention key features or deliverables</li>
          <li>Specify timeline if known</li>
          <li>Add any technical requirements or constraints</li>
        </ul>
      </div>
    </div>
  );
}
