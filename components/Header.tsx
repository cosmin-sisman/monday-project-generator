"use client";

import Link from "next/link";
import { Layers } from "lucide-react";

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Layers className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">
              Monday Generator
            </span>
          </Link>
          
          <nav>
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Home
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
