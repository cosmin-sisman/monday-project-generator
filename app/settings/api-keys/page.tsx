"use client";

import { useState, useEffect } from "react";
import { LayoutWithSidebar } from "@/app/layout-with-sidebar";
import { toast } from "sonner";
import { Save, Eye, EyeOff, Key } from "lucide-react";

export default function APIKeysPage() {
  const [keys, setKeys] = useState({
    openai: "",
    monday: "",
    supabase_url: "",
    supabase_anon: "",
  });
  
  const [showKeys, setShowKeys] = useState({
    openai: false,
    monday: false,
    supabase_anon: false,
  });
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load from env or localStorage
    setKeys({
      openai: process.env.NEXT_PUBLIC_OPENAI_KEY || localStorage.getItem("openai_key") || "",
      monday: process.env.NEXT_PUBLIC_MONDAY_TOKEN || localStorage.getItem("monday_token") || "",
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      supabase_anon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    });
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    try {
      if (keys.openai) localStorage.setItem("openai_key", keys.openai);
      if (keys.monday) localStorage.setItem("monday_token", keys.monday);
      toast.success("API keys saved! Refresh the page to apply changes.");
    } catch (error) {
      toast.error("Failed to save API keys");
    } finally {
      setIsSaving(false);
    }
  };

  const maskKey = (key: string) => {
    if (!key || key.length < 8) return key;
    return key.substring(0, 8) + "•".repeat(20);
  };

  return (
    <LayoutWithSidebar>
      <div className="min-h-screen">
        <div className="border-b bg-white px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">API Keys</h1>
          <p className="mt-2 text-gray-600">
            Manage your API credentials for integrations
          </p>
        </div>

        <div className="container mx-auto px-8 py-8">
          <div className="max-w-3xl space-y-6">
            {/* OpenAI API Key */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <Key className="h-5 w-5 text-blue-600" />
                    <span>OpenAI API Key</span>
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Required for AI project generation
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <input
                  type={showKeys.openai ? "text" : "password"}
                  value={showKeys.openai ? keys.openai : maskKey(keys.openai)}
                  onChange={(e) => setKeys({ ...keys, openai: e.target.value })}
                  placeholder="sk-proj-..."
                  className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
                <button
                  onClick={() => setShowKeys({ ...showKeys, openai: !showKeys.openai })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showKeys.openai ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block"
              >
                Get your OpenAI API key →
              </a>
            </div>

            {/* Monday.com Token */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <Key className="h-5 w-5 text-purple-600" />
                    <span>Monday.com API Token</span>
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Required for syncing projects to Monday.com
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <input
                  type={showKeys.monday ? "text" : "password"}
                  value={showKeys.monday ? keys.monday : maskKey(keys.monday)}
                  onChange={(e) => setKeys({ ...keys, monday: e.target.value })}
                  placeholder="eyJhbGci..."
                  className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
                <button
                  onClick={() => setShowKeys({ ...showKeys, monday: !showKeys.monday })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showKeys.monday ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              <a
                href="https://monday.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block"
              >
                Get your Monday.com token →
              </a>
            </div>

            {/* Supabase (Read-only) */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Key className="h-5 w-5 text-green-600" />
                  <span>Supabase Configuration</span>
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Database connection (configured in .env.local)
                </p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project URL
                  </label>
                  <input
                    type="text"
                    value={keys.supabase_url}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-mono text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Anon Key
                  </label>
                  <input
                    type="password"
                    value={maskKey(keys.supabase_anon)}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors font-medium"
            >
              <Save className="h-5 w-5" />
              <span>{isSaving ? "Saving..." : "Save API Keys"}</span>
            </button>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-1">Security Notice</h4>
              <p className="text-sm text-yellow-800">
                API keys are stored locally in your browser. Never share your keys publicly.
                For production use, configure keys in environment variables on the server.
              </p>
            </div>
          </div>
        </div>
      </div>
    </LayoutWithSidebar>
  );
}
