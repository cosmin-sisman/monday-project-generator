"use client";

import { useState } from "react";
import { Check, X, Loader2, Database, ExternalLink } from "lucide-react";

export default function SetupPage() {
  const [isChecking, setIsChecking] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [checkResult, setCheckResult] = useState<any>(null);
  const [createResult, setCreateResult] = useState<any>(null);

  const checkDatabase = async () => {
    setIsChecking(true);
    setCheckResult(null);
    try {
      const response = await fetch("/api/setup-db");
      const data = await response.json();
      setCheckResult(data);
    } catch (error) {
      setCheckResult({ success: false, error: "Failed to check database" });
    } finally {
      setIsChecking(false);
    }
  };

  const createTables = async () => {
    setIsCreating(true);
    setCreateResult(null);
    try {
      const response = await fetch("/api/setup-db", { method: "POST" });
      const data = await response.json();
      setCreateResult(data);
      
      // Recheck after creation
      if (data.success) {
        setTimeout(() => checkDatabase(), 1000);
      }
    } catch (error) {
      setCreateResult({ success: false, error: "Failed to create tables" });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Database className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Database Setup</h1>
          </div>

          <p className="text-gray-600 mb-8">
            Setup your Supabase database tables for the Monday Project Generator.
          </p>

          {/* Check Database Button */}
          <div className="space-y-4">
            <button
              onClick={checkDatabase}
              disabled={isChecking}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {isChecking ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <Database className="h-5 w-5" />
                  <span>Check Database Status</span>
                </>
              )}
            </button>

            {/* Check Results */}
            {checkResult && (
              <div className={`p-4 rounded-lg border-2 ${checkResult.success ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <div className="flex items-center space-x-2 mb-3">
                  {checkResult.success ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-yellow-600" />
                  )}
                  <span className="font-medium">{checkResult.message}</span>
                </div>

                {checkResult.tables && (
                  <div className="space-y-2 mt-4">
                    <p className="text-sm font-medium text-gray-700">Tables:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(checkResult.tables).map(([table, exists]) => (
                        <div key={table} className="flex items-center space-x-2 text-sm">
                          {exists ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-red-600" />
                          )}
                          <span className={exists ? 'text-green-700' : 'text-red-700'}>
                            {table}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {checkResult.missing && checkResult.missing.length > 0 && (
                  <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800">Missing tables:</p>
                    <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                      {checkResult.missing.map((table: string) => (
                        <li key={table}>• {table}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Create Tables Button */}
            {checkResult && !checkResult.success && (
              <>
                <button
                  onClick={createTables}
                  disabled={isCreating}
                  className="w-full flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Creating Tables...</span>
                    </>
                  ) : (
                    <>
                      <Database className="h-5 w-5" />
                      <span>Create Missing Tables</span>
                    </>
                  )}
                </button>

                {/* Manual Instructions */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Or create manually:</h3>
                  <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                    <li>
                      Open{" "}
                      <a
                        href="https://supabase.com/dashboard/project/viqhvdnvwekujkmypimx/sql/new"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 underline"
                      >
                        Supabase SQL Editor
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </li>
                    <li>Paste the SQL schema (already in clipboard)</li>
                    <li>Click "Run"</li>
                  </ol>
                </div>
              </>
            )}

            {/* Create Results */}
            {createResult && (
              <div className={`p-4 rounded-lg border-2 ${createResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center space-x-2">
                  {createResult.success ? (
                    <>
                      <Check className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">{createResult.message}</span>
                    </>
                  ) : (
                    <>
                      <X className="h-5 w-5 text-red-600" />
                      <span className="font-medium text-red-800">{createResult.message || createResult.error}</span>
                    </>
                  )}
                </div>

                {createResult.instructions && (
                  <div className="mt-4 p-3 bg-white rounded border">
                    <p className="text-sm font-medium text-gray-700 mb-2">Manual Setup Required:</p>
                    <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                      {createResult.instructions.map((instruction: string, i: number) => (
                        <li key={i}>{instruction}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}

            {/* Success - Go to App */}
            {checkResult && checkResult.success && (
              <div className="mt-6 text-center">
                <a
                  href="/"
                  className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <Check className="h-5 w-5" />
                  <span>Go to App →</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-white rounded-lg p-6 shadow">
          <h3 className="font-medium text-gray-900 mb-2">What this does:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>✓ Creates projects, project_groups, and project_tasks tables</li>
            <li>✓ Creates project_versions table for backup/undo functionality</li>
            <li>✓ Creates ai_conversations table for persistent chat</li>
            <li>✓ Sets up indexes and triggers for performance</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
