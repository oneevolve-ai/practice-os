"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  Users, DollarSign, Building2, FolderKanban,
  LayoutDashboard, Settings
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const linkClass = (href: string) => clsx(
    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
    isActive(href) ? "bg-zinc-700/60 text-white" : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
  );

  return (
    <aside className="flex flex-col w-64 bg-zinc-900 text-white min-h-screen">
      <div className="p-6 border-b border-zinc-800">
        <h1 className="text-xl font-bold tracking-tight">Practice OS</h1>
        <p className="text-xs text-zinc-400 mt-1">OneEvolve.AI</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <Link href="/" className={linkClass("/")}>
          <LayoutDashboard className="w-5 h-5 shrink-0" />
          <span>Dashboard</span>
        </Link>

        <Link href="/people" className={linkClass("/people")}>
          <Users className="w-5 h-5 shrink-0" />
          <span>HRMS</span>
        </Link>

        <Link href="/administration" className={linkClass("/administration")}>
          <Settings className="w-5 h-5 shrink-0" />
          <span>Administration</span>
        </Link>

        <Link href="/clients" className={linkClass("/clients")}>
          <Building2 className="w-5 h-5 shrink-0" />
          <span>CRM</span>
        </Link>

        <Link href="/money" className={linkClass("/money")}>
          <DollarSign className="w-5 h-5 shrink-0" />
          <span>Finance</span>
        </Link>

        <Link href="/projects" className={linkClass("/projects")}>
          <FolderKanban className="w-5 h-5 shrink-0" />
          <span>Work Orders</span>
        </Link>
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <p className="text-xs text-zinc-500">practice-os.ai v0.1.0</p>
      </div>
    </aside>
  );
}
