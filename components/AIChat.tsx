"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Send, Loader2, MessageSquare, Minimize2, Maximize2, Undo2 } from "lucide-react";
import { ChatSuggestions } from "./ChatSuggestions";

interface AIChatProps {
  projectId: string;
  onProjectUpdated?: () => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AIChat({ projectId, onProjectUpdated }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUndoing, setIsUndoing] = useState(false);
  const [hasBackup, setHasBackup] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation history from DB
  useEffect(() => {
    loadConversationHistory();
    checkBackupAvailability();
  }, [projectId]);

  const loadConversationHistory = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/conversations`);
      if (!response.ok) return;
      const data = await response.json();
      setMessages(data.conversations || []);
    } catch (error) {
      console.error("Error loading conversation:", error);
    }
  };

  const checkBackupAvailability = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/versions`);
      if (!response.ok) return;
      const data = await response.json();
      setHasBackup(data.versions && data.versions.length > 0);
    } catch (error) {
      console.error("Error checking backups:", error);
    }
  };

  const handleUndo = async () => {
    if (!hasBackup) {
      toast.error("No backup available to undo");
      return;
    }

    setIsUndoing(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/undo`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to undo");

      const data = await response.json();
      toast.success("✅ " + data.message);
      
      // Reload project and check backup availability
      if (onProjectUpdated) {
        setTimeout(() => {
          onProjectUpdated();
        }, 500);
      }
      
      checkBackupAvailability();
    } catch (error) {
      console.error("Error in undo:", error);
      toast.error("Failed to undo changes");
    } finally {
      setIsUndoing(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          message: userMessage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      
      // Add AI response to messages IMMEDIATELY (before reload)
      const aiMessage = data.message || data.response || "Changes applied successfully";
      setMessages((prev) => [...prev, { 
        role: "assistant", 
        content: aiMessage
      }]);
      
      // If AI made updates to the project, show success and reload
      if (data.updated) {
        toast.success("✅ Changes applied to project!");
        
        // Show actions performed with better formatting
        if (data.actions && data.actions.length > 0) {
          const actionsText = data.actions.join("\n• ");
          toast.info(`Actions performed:\n• ${actionsText}`, { duration: 5000 });
        }
        
        // Reload project after a short delay to show the message first
        if (onProjectUpdated) {
          setTimeout(() => {
            onProjectUpdated();
          }, 2000);
        }
        
        // Check if backup is available for undo
        checkBackupAvailability();
      } else {
        // Even if no update, reload conversation to sync with DB
        setTimeout(() => loadConversationHistory(), 500);
      }
    } catch (error) {
      console.error("Error in chat:", error);
      toast.error("Failed to get AI response");
      // Remove the user message if request failed
      setMessages((prev) => prev.slice(0, -1));
      setInput(userMessage); // Restore user's input
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg ${isExpanded ? 'fixed inset-4 z-50' : ''}`}>
      <div className="border-b px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="flex items-center space-x-2 text-white">
          <MessageSquare className="h-5 w-5" />
          <h3 className="font-semibold">AI Assistant</h3>
        </div>
        <div className="flex items-center space-x-2">
          {hasBackup && (
            <button
              onClick={handleUndo}
              disabled={isUndoing}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Undo last AI change"
            >
              {isUndoing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Undo2 className="h-4 w-4" />
              )}
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
          >
            {isExpanded ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className={`flex flex-col ${isExpanded ? 'h-[calc(100vh-180px)]' : 'h-96'}`}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="space-y-4">
              <div className="text-center text-gray-500 py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm font-medium">AI Assistant - Agentic Mode</p>
                <p className="text-xs mt-2 text-gray-400">
                  I will automatically modify your project based on your requests
                </p>
              </div>
              <ChatSuggestions onSelect={(suggestion) => {
                setInput(suggestion);
              }} />
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 text-gray-900"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="flex items-center space-x-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-purple-600" />
                    <span className="text-xs font-medium text-purple-600">AI Assistant</span>
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-3">
                <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4 bg-gray-50">
          <div className="flex space-x-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask AI to add, remove, or modify groups and tasks..."
              rows={2}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
