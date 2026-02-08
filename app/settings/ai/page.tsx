"use client";

import { useState, useEffect } from "react";
import { LayoutWithSidebar } from "@/app/layout-with-sidebar";
import { toast } from "sonner";
import { Save, RefreshCw } from "lucide-react";

export default function AIConfigPage() {
  const [config, setConfig] = useState({
    model: "gpt-4o",
    temperature: 0.7,
    maxTokens: 4000,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  });
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load saved config from localStorage
    const saved = localStorage.getItem("ai_config");
    if (saved) {
      setConfig(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    try {
      localStorage.setItem("ai_config", JSON.stringify(config));
      toast.success("AI configuration saved successfully!");
    } catch (error) {
      toast.error("Failed to save configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setConfig({
      model: "gpt-4o",
      temperature: 0.7,
      maxTokens: 4000,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
    });
    toast.success("Reset to default values");
  };

  return (
    <LayoutWithSidebar>
      <div className="min-h-screen">
        <div className="border-b bg-white px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">AI Configuration</h1>
          <p className="mt-2 text-gray-600">
            Configure OpenAI model and generation parameters
          </p>
        </div>

        <div className="container mx-auto px-8 py-8">
          <div className="max-w-3xl">
            <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
              {/* Model Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OpenAI Model
                </label>
                <select
                  value={config.model}
                  onChange={(e) => setConfig({ ...config, model: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="gpt-4o">GPT-4o (Recommended)</option>
                  <option value="gpt-4o-mini">GPT-4o Mini (Faster, cheaper)</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Choose the AI model for project generation
                </p>
              </div>

              {/* Temperature */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature: {config.temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={config.temperature}
                  onChange={(e) =>
                    setConfig({ ...config, temperature: parseFloat(e.target.value) })
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Focused</span>
                  <span>Balanced</span>
                  <span>Creative</span>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Higher values make output more random, lower values more focused
                </p>
              </div>

              {/* Max Tokens */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Tokens: {config.maxTokens}
                </label>
                <input
                  type="range"
                  min="1000"
                  max="8000"
                  step="100"
                  value={config.maxTokens}
                  onChange={(e) =>
                    setConfig({ ...config, maxTokens: parseInt(e.target.value) })
                  }
                  className="w-full"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Maximum length of generated response
                </p>
              </div>

              {/* Top P */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Top P: {config.topP}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={config.topP}
                  onChange={(e) =>
                    setConfig({ ...config, topP: parseFloat(e.target.value) })
                  }
                  className="w-full"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Controls diversity via nucleus sampling (0.1 = conservative, 1.0 = diverse)
                </p>
              </div>

              {/* Frequency Penalty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency Penalty: {config.frequencyPenalty}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={config.frequencyPenalty}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      frequencyPenalty: parseFloat(e.target.value),
                    })
                  }
                  className="w-full"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Reduces repetition of token sequences
                </p>
              </div>

              {/* Presence Penalty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Presence Penalty: {config.presencePenalty}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={config.presencePenalty}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      presencePenalty: parseFloat(e.target.value),
                    })
                  }
                  className="w-full"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Encourages new topics in the response
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSaving ? "Saving..." : "Save Configuration"}</span>
                </button>
                
                <button
                  onClick={handleReset}
                  className="flex items-center space-x-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Reset to Defaults</span>
                </button>
              </div>
            </div>

            {/* Info Card */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Configuration Tips</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use GPT-4o for best quality and structured outputs</li>
                <li>• Keep temperature at 0.7 for balanced creativity</li>
                <li>• Increase max tokens for more detailed projects</li>
                <li>• Adjust penalties to control repetition and variety</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </LayoutWithSidebar>
  );
}
