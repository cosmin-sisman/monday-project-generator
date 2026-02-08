"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Sparkles, Upload, X, FileText } from "lucide-react";

export function ProjectInput() {
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; text: string }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/parse-file", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to parse ${file.name}`);
        }

        const data = await response.json();
        setUploadedFiles((prev) => [
          ...prev,
          { name: file.name, text: data.text },
        ]);
        toast.success(`${file.name} uploaded successfully`);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload file"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!input.trim() && uploadedFiles.length === 0) {
      toast.error("Please enter a project description or upload files");
      return;
    }

    setIsGenerating(true);

    try {
      // Combine user input with file contents
      let combinedInput = input;
      
      if (uploadedFiles.length > 0) {
        combinedInput += "\n\n--- Additional Context from Files ---\n\n";
        uploadedFiles.forEach((file) => {
          combinedInput += `\n## ${file.name}\n\n${file.text}\n\n`;
        });
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: combinedInput }),
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
          disabled={isGenerating || isUploading}
        />
      </div>

      {/* File Upload Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload files for additional context (optional)
        </label>
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <Upload className="h-5 w-5 text-gray-600" />
            <span className="text-sm text-gray-700">
              {isUploading ? "Uploading..." : "Upload CSV, XLSX, PDF, DOCX, TXT"}
            </span>
            <input
              type="file"
              multiple
              accept=".csv,.xlsx,.xls,.pdf,.docx,.doc,.txt"
              onChange={handleFileUpload}
              disabled={isGenerating || isUploading}
              className="hidden"
            />
          </label>
          {isUploading && <Loader2 className="h-5 w-5 animate-spin text-blue-600" />}
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="mt-3 space-y-2">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2"
              >
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-700">{file.name}</span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  disabled={isGenerating}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleGenerate}
        disabled={isGenerating || isUploading || (!input.trim() && uploadedFiles.length === 0)}
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
