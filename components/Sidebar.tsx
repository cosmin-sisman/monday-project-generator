"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Settings, 
  Brain, 
  MessageSquare, 
  Layers,
  Key,
  FileText,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Home",
    href: "/",
    icon: Home,
  },
  {
    title: "AI Configuration",
    href: "/settings/ai",
    icon: Brain,
  },
  {
    title: "API Keys",
    href: "/settings/api-keys",
    icon: Key,
  },
  {
    title: "Prompts & Flows",
    href: "/settings/prompts",
    icon: FileText,
  },
  {
    title: "Integrations",
    href: "/settings/integrations",
    icon: Zap,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-white">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center space-x-2">
          <Layers className="h-6 w-6 text-blue-600" />
          <span className="text-lg font-bold text-gray-900">
            Monday Gen
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <div className="text-xs text-gray-500">
          <p className="font-medium">Version 1.0.0</p>
          <p className="mt-1">All systems operational</p>
        </div>
      </div>
    </div>
  );
}
