"use client";

import { ProjectInput } from "@/components/ProjectInput";
import { LayoutWithSidebar } from "./layout-with-sidebar";

export default function Home() {
  return (
    <LayoutWithSidebar>
      <div className="min-h-screen">
        <div className="border-b bg-white px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Monday Project Generator
          </h1>
          <p className="mt-2 text-gray-600">
            Transform your ideas into structured Monday.com projects with AI
          </p>
        </div>
        
        <div className="container mx-auto px-8 py-8">
          <div className="max-w-4xl">
            <ProjectInput />
          </div>
        </div>
      </div>
    </LayoutWithSidebar>
  );
}
