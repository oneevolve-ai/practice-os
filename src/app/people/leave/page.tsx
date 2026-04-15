"use client";
import { BackButton } from "@/components/back-button";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, CalendarOff, CheckCircle, XCircle, Clock, CalendarCheck, CalendarPlus, Users, Settings } from "lucide-react";
import { format } from "date-fns";
import { TeamOnLeave } from "@/components/people/team-on-leave";

interface Leave {
  id: string; leaveType: string; halfDayType: string; startDate: string; endDate: string;
  days: number; status: string; reason: string | null;
  employee: { name: string; department: { name: string } | null };
}

interface Stats { pending: number; approvedThisMonth: number; upcoming: number; onLeaveToday: { employee: { name: string; designation: string | null }; leaveType: string }[]; }

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700", APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700", CANCELLED: "bg-zinc-200 text-zinc-500",
};
const typeLabels: Record<string, string> = { CASUAL: "Casual", SICK: "Sick", EARNED: "Earned", UNPAID: "Unpaid", COMP_OFF: "Comp Off" };
const ic = "border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400";

export default function LeavePage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [stats, setStats] = useState<Stats>({ pending: 0, approvedThisMonth: 0, upcoming: 0, onLeaveToday: [] });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const fetchLeaves = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (typeFilter) params.set("leaveType", typeFilter);
    fetch(`/api/leave?${params}`).then((r) => r.json()).then(setLeaves).finally(() => setLoading(false));
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    fetch("/api/leave/stats").then((r) => r.json()).then(setStats).catch(() => {});
  }, []);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  async function quickAction(id: string, status: string) {
    await fetch(`/api/leave/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reviewedBy: "Manager" }),
    });
    fetchLeaves();
    fetch("/api/leave/stats").then((r) => r.json()).then(setStats).catch(() => {});
  }

  return (
    <div className="p-8">
      <BackButton href="/people" />
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-zinc-900">Leave Management</h1><p className="text-zinc-500 mt-1">Manage leave applications</p></div>
        <div className="flex items-center gap-2">
          <Link href="/people/leave/policy" className="inline-flex items-center gap-2 border border-zinc-300 text-zinc-600 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-50">
            <Settings className="w-4 h-4" /> Policy
          </Link>
          <Link href="/people/leave/new" className="inline-flex items-center gap-2 bg-zinc-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-800">
            <Plus className="w-4 h-4" /> Apply Leave
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-amber-200 p-4">
          <div className="flex items-center gap-3"><div className="p-2 bg-amber-100 rounded-lg"><Clock className="w-5 h-5 text-amber-600" /></div>
            <div><p className="text-2xl font-bold text-amber-700">{stats.pending}</p><p className="text-xs text-zinc-500">Pending Approval</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-green-200 p-4">
          <div className="flex items-center gap-3"><div className="p-2 bg-green-100 rounded-lg"><CalendarCheck className="w-5 h-5 text-green-600" /></div>
            <div><p className="text-2xl font-bold text-green-700">{stats.approvedThisMonth}</p><p className="text-xs text-zinc-500">Approved (This Month)</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-blue-200 p-4">
          <div className="flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-lg"><CalendarPlus className="w-5 h-5 text-blue-600" /></div>
            <div><p className="text-2xl font-bold text-blue-700">{stats.upcoming}</p><p className="text-xs text-zinc-500">Upcoming</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-purple-200 p-4">
          <div className="flex items-center gap-3"><div className="p-2 bg-purple-100 rounded-lg"><Users className="w-5 h-5 text-purple-600" /></div>
            <div><p className="text-2xl font-bold text-purple-700">{stats.onLeaveToday.length}</p><p className="text-xs text-zinc-500">On Leave Today</p></div>
          </div>
        </div>
      </div>

      <TeamOnLeave entries={stats.onLeaveToday} />

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={ic}>
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option><option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option><option value="CANCELLED">Cancelled</option>
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={ic}>
          <option value="">All Types</option>
          {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {loading ? <div className="text-center py-12 text-zinc-400">Loading...</div>
      : leaves.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-zinc-200">
          <CalendarOff className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-zinc-600">No leave requests</h3>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-zinc-100 bg-zinc-50">
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Employee</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Type</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Dates</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Days</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Status</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Actions</th>
            </tr></thead>
            <tbody>
              {leaves.map((l) => (
                <tr key={l.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                  <td className="px-4 py-3">
                    <Link href={`/people/leave/${l.id}`} className="font-medium text-zinc-900 hover:underline">{l.employee.name}</Link>
                    <p className="text-xs text-zinc-400">{l.employee.department?.name}</p>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {typeLabels[l.leaveType]}
                    {l.halfDayType !== "FULL_DAY" && <span className="text-xs text-zinc-400 ml-1">({l.halfDayType === "FIRST_HALF" ? "1st half" : "2nd half"})</span>}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{format(new Date(l.startDate), "MMM d")} — {format(new Date(l.endDate), "MMM d, yyyy")}</td>
                  <td className="px-4 py-3 text-zinc-600">{l.days}</td>
                  <td className="px-4 py-3"><span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusColors[l.status]}`}>{l.status}</span></td>
                  <td className="px-4 py-3">
                    {l.status === "PENDING" && (
                      <div className="flex gap-1">
                        <button onClick={() => quickAction(l.id, "APPROVED")} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Approve"><CheckCircle className="w-4 h-4" /></button>
                        <button onClick={() => quickAction(l.id, "REJECTED")} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Reject"><XCircle className="w-4 h-4" /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
