"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  Plane,
  Users,
  DollarSign,
  Building2,
  FolderKanban,
  FileText,
  LayoutDashboard,
} from "lucide-react";

const modules = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, active: true },
  { name: "Travel", href: "/travel", icon: Plane, active: true },
  { name: "HRMS", href: "/people", icon: Users, active: true },
  { name: "Money", href: "/money", icon: DollarSign, active: true },
  { name: "Clients", href: "/clients", icon: Building2, active: true },
  { name: "Projects", href: "/projects", icon: FolderKanban, active: false },
  { name: "Docs", href: "/docs", icon: FileText, active: false },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-64 bg-zinc-900 text-white min-h-screen">
      <div className="p-6 border-b border-zinc-800">
        <h1 className="text-xl font-bold tracking-tight">Practice OS</h1>
        <p className="text-xs text-zinc-400 mt-1">OneEvolve.AI</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {modules.map((mod) => {
          const Icon = mod.icon;
          const isCurrent =
            mod.href === "/"
              ? pathname === "/"
              : pathname.startsWith(mod.href);

          return (
            <Link
              key={mod.name}
              href={mod.active ? mod.href : "#"}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isCurrent && mod.active
                  ? "bg-zinc-700/60 text-white"
                  : mod.active
                    ? "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    : "text-zinc-600 cursor-not-allowed"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{mod.name}</span>
              {!mod.active && (
                <span className="ml-auto text-[10px] bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded">
                  Soon
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <p className="text-xs text-zinc-500">practice-os.ai v0.1.0</p>
      </div>
    </aside>
  );
}
