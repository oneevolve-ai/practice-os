"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, FolderKanban, Clock, CheckCircle, Search } from "lucide-react";
import { properCase } from "@/lib/proper-case";

interface Project {
  id: string;
  name: string;
  code: string | null;
  clientName: string | null;
  type: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  budget: number | null;
  billingType: string;
  timesheets: { hours: number; billable: boolean }[];
  milestones: { completed: boolean }[];
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/projects").then(r => r.json()).then(setProjects).catch(() => {});
  }, []);

  const filtered = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.clientName?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "ALL" || p.status === filter;
    return matchSearch && matchFilter;
  });

  const totalBillableHours = projects.reduce((s, p) => s + p.timesheets.filter(t => t.billable).reduce((a, t) => a + t.hours, 0), 0);
  const activeCount = projects.filter(p => p.status === "ACTIVE").length;
  const completedCount = projects.filter(p => p.status === "COMPLETED").length;

  const statusColor: Record<string, string> = {
    PLANNING: "bg-zinc-100 text-zinc-600",
    ACTIVE: "bg-green-100 text-green-700",
    ON_HOLD: "bg-orange-100 text-orange-700",
    COMPLETED: "bg-blue-100 text-blue-700",
    ARCHIVED: "bg-zinc-100 text-zinc-400",
  };

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Projects</h1>
          <p className="text-zinc-500 text-sm">{projects.length} total projects</p>
        </div>
        <Link href="/projects/new" className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-zinc-700">
          <Plus className="w-4 h-4" /> New Project
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Projects", value: projects.length, icon: FolderKanban, color: "text-zinc-700" },
          { label: "Active", value: activeCount, icon: Clock, color: "text-green-600" },
          { label: "Completed", value: completedCount, icon: CheckCircle, color: "text-blue-600" },
          { label: "Billable Hours", value: `${totalBillableHours.toFixed(1)}h`, icon: Clock, color: "text-purple-600" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-zinc-200 p-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-zinc-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..." className="w-full pl-9 pr-4 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400" />
        </div>
        <div className="flex gap-2">
          {["ALL","PLANNING","ACTIVE","ON_HOLD","COMPLETED"].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter === s ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}>
              {s === "ALL" ? "All" : properCase(s)}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-zinc-400">
            <FolderKanban className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No projects found</p>
            <Link href="/projects/new" className="text-blue-600 text-sm mt-2 inline-block">Create your first project</Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                {["Project","Client","Type","Status","Budget","Hours","Progress",""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map(p => {
                const totalHours = p.timesheets.reduce((s, t) => s + t.hours, 0);
                const completedMilestones = p.milestones.filter(m => m.completed).length;
                const progress = p.milestones.length > 0 ? Math.round((completedMilestones / p.milestones.length) * 100) : 0;
                return (
                  <tr key={p.id} className="hover:bg-zinc-50">
                    <td className="px-4 py-3">
                      <Link href={`/projects/${p.id}`} className="font-medium text-blue-600 hover:underline">{p.name}</Link>
                      {p.code && <p className="text-xs text-zinc-400">{p.code}</p>}
                    </td>
                    <td className="px-4 py-3 text-zinc-500">{p.clientName || "—"}</td>
                    <td className="px-4 py-3 text-zinc-500">{p.type}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[p.status]}`}>{properCase(p.status)}</span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">{p.budget ? fmt(p.budget) : "—"}</td>
                    <td className="px-4 py-3 text-zinc-500">{totalHours.toFixed(1)}h</td>
                    <td className="px-4 py-3">
                      {p.milestones.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-zinc-200 rounded-full">
                            <div className="h-1.5 bg-green-500 rounded-full" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="text-xs text-zinc-400">{progress}%</span>
                        </div>
                      ) : <span className="text-xs text-zinc-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/projects/${p.id}`} className="text-xs text-zinc-500 hover:text-zinc-700">View</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick link to timesheets */}
      <div className="mt-4 text-center">
        <Link href="/projects/timesheets" className="text-sm text-zinc-500 hover:text-zinc-700">View all timesheets →</Link>
      </div>
    </div>
  );
}
