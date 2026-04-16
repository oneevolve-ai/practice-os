"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, DollarSign, Building2, FolderKanban, FileText, Plane, UserCheck, TrendingUp, Clock, Calendar } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    employees: 0, clients: 0, projects: 0, visitors: 0,
    pendingLeave: 0, activeProjects: 0, totalInvoiced: 0, pendingInvoices: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  useEffect(() => {
    // Fetch all stats in parallel
    Promise.all([
      fetch("/api/employees/stats").then(r => r.json()).catch(() => ({})),
      fetch("/api/clients").then(r => r.json()).catch(() => []),
      fetch("/api/projects").then(r => r.json()).catch(() => []),
      fetch("/api/visitors").then(r => r.json()).catch(() => []),
      fetch("/api/invoices").then(r => r.json()).catch(() => []),
    ]).then(([empStats, clients, projects, visitors, invoices]) => {
      const today = new Date().toDateString();
      setStats({
        employees: empStats.total || 0,
        clients: Array.isArray(clients) ? clients.length : 0,
        projects: Array.isArray(projects) ? projects.length : 0,
        visitors: Array.isArray(visitors) ? visitors.filter((v: any) => new Date(v.expectedTime || v.createdAt).toDateString() === today).length : 0,
        pendingLeave: empStats.pendingLeave || 0,
        activeProjects: Array.isArray(projects) ? projects.filter((p: any) => p.status === "ACTIVE").length : 0,
        totalInvoiced: Array.isArray(invoices) ? invoices.reduce((s: number, i: any) => s + (i.total || 0), 0) : 0,
        pendingInvoices: Array.isArray(invoices) ? invoices.filter((i: any) => i.status === "SENT").length : 0,
      });
    });
  }, []);

  const fmt = (n: number) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${n.toLocaleString("en-IN")}`;

  const modules = [
    { name: "Travel", desc: "Requests & approvals", icon: Plane, href: "/travel", color: "text-blue-600", bg: "bg-blue-50" },
    { name: "HRMS", desc: `${stats.employees} employees`, icon: Users, href: "/people/employees", color: "text-purple-600", bg: "bg-purple-50" },
    { name: "Money", desc: `${stats.pendingInvoices} pending invoices`, icon: DollarSign, href: "/money", color: "text-green-600", bg: "bg-green-50" },
    { name: "Clients", desc: `${stats.clients} organisations`, icon: Building2, href: "/clients", color: "text-orange-600", bg: "bg-orange-50" },
    { name: "Projects", desc: `${stats.activeProjects} active`, icon: FolderKanban, href: "/projects", color: "text-indigo-600", bg: "bg-indigo-50" },
    { name: "Visitors", desc: `${stats.visitors} today`, icon: UserCheck, href: "/visitors", color: "text-teal-600", bg: "bg-teal-50" },
    { name: "Docs", desc: "Document library", icon: FileText, href: "/docs", color: "text-zinc-600", bg: "bg-zinc-50" },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Good morning! 👋</h1>
        <p className="text-zinc-500 mt-1">{today}</p>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Employees", value: stats.employees, icon: Users, color: "text-purple-600", href: "/people/employees" },
          { label: "Organisations", value: stats.clients, icon: Building2, color: "text-orange-600", href: "/clients" },
          { label: "Active Projects", value: stats.activeProjects, icon: FolderKanban, color: "text-indigo-600", href: "/projects" },
          { label: "Total Invoiced", value: fmt(stats.totalInvoiced), icon: TrendingUp, color: "text-green-600", href: "/money" },
        ].map(s => (
          <Link key={s.label} href={s.href} className="bg-white rounded-xl border border-zinc-200 p-5 hover:shadow-md transition-shadow">
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-zinc-500 mt-1">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Alerts */}
      {(stats.pendingLeave > 0 || stats.pendingInvoices > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {stats.pendingLeave > 0 && (
            <Link href="/people/leave" className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 hover:bg-amber-100 transition-colors">
              <Clock className="w-5 h-5 text-amber-600" />
              <div>
                <p className="text-sm font-medium text-amber-900">{stats.pendingLeave} leave request{stats.pendingLeave > 1 ? "s" : ""} pending</p>
                <p className="text-xs text-amber-600">Tap to review</p>
              </div>
            </Link>
          )}
          {stats.pendingInvoices > 0 && (
            <Link href="/money" className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3 hover:bg-blue-100 transition-colors">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">{stats.pendingInvoices} invoice{stats.pendingInvoices > 1 ? "s" : ""} awaiting payment</p>
                <p className="text-xs text-blue-600">Tap to review</p>
              </div>
            </Link>
          )}
        </div>
      )}

      {/* Module Grid */}
      <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Modules</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {modules.map(m => (
          <Link key={m.name} href={m.href} className="bg-white rounded-xl border border-zinc-200 p-5 hover:shadow-md transition-shadow group">
            <div className={`w-10 h-10 ${m.bg} rounded-lg flex items-center justify-center mb-3`}>
              <m.icon className={`w-5 h-5 ${m.color}`} />
            </div>
            <p className="font-semibold text-zinc-900 text-sm">{m.name}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{m.desc}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Add Employee", href: "/people/employees", color: "bg-purple-600" },
          { label: "New Invoice", href: "/money/invoices/new", color: "bg-green-600" },
          { label: "Register Visitor", href: "/visitors/new", color: "bg-teal-600" },
          { label: "New Project", href: "/projects/new", color: "bg-indigo-600" },
          { label: "Add Organisation", href: "/clients/organisations/new", color: "bg-orange-600" },
          { label: "Log Travel", href: "/travel/new", color: "bg-blue-600" },
          { label: "Add Document", href: "/docs/new", color: "bg-zinc-600" },
          { label: "New Proposal", href: "/clients/proposals", color: "bg-pink-600" },
        ].map(a => (
          <Link key={a.label} href={a.href} className={`${a.color} text-white rounded-xl p-3 text-xs font-medium text-center hover:opacity-90 transition-opacity`}>
            {a.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
