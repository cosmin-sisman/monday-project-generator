"use client";

import { Lightbulb } from "lucide-react";

interface ChatSuggestionsProps {
  onSelect: (suggestion: string) => void;
}

const suggestions = [
  "Adaugă mai multe taskuri la grupul Development",
  "Schimbă prioritatea taskurilor la high",
  "Creează un grup nou pentru Testing & QA",
  "Scrie descrieri mai detaliate pentru toate taskurile",
  "Adaugă un grup pentru Documentation",
  "Estimează mai realist orele pentru fiecare task",
  "Reorganizează taskurile după prioritate",
  "Adaugă taskuri de code review și deployment",
];

export function ChatSuggestions({ onSelect }: ChatSuggestionsProps) {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <Lightbulb className="h-4 w-4 text-purple-600" />
        <h4 className="text-sm font-medium text-purple-900">Quick Suggestions</h4>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelect(suggestion)}
            className="text-xs px-3 py-1.5 bg-white border border-purple-200 text-purple-700 rounded-full hover:bg-purple-50 hover:border-purple-300 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
