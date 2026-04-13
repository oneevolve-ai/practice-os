"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, UserCheck, Clock, UserX, Users } from "lucide-react";
import { properCase } from "@/lib/proper-case";

interface Visitor { id: string; name: string; company: string | null; phone: string | null; purpose: string | null; hostName: string | null; expectedTime: string | null; checkIn: string | null; checkOut: string | null; status: string; }

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/visitors").then(r => r.json()).then(setVisitors).catch(() => {});
  }, []);

  const today = new Date().toDateString();
  const todayVisitors = visitors.filter(v => v.expectedTime && new Date(v.expectedTime).toDateString() === today);
  const checkedIn = visitors.filter(v => v.status === "CHECKED_IN").length;
  const expected = visitors.filter(v => v.status === "EXPECTED").length;
  const noShow = visitors.filter(v => v.status === "NO_SHOW").length;

  const filtered = filter === "ALL" ? visitors : visitors.filter(v => v.status === filter);

  const statusColor: Record<string, string> = {
    EXPECTED: "bg-blue-100 text-blue-700",
    CHECKED_IN: "bg-green-100 text-green-700",
    CHECKED_OUT: "bg-zinc-100 text-zinc-600",
    NO_SHOW: "bg-red-100 text-red-700",
    CANCELLED: "bg-zinc-100 text-zinc-400",
  };

  async function checkIn(id: string) {
    const res = await fetch(`/api/visitors/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "CHECKED_IN", checkIn: new Date() }) });
    if (res.ok) setVisitors(visitors.map(v => v.id === id ? { ...v, status: "CHECKED_IN", checkIn: new Date().toISOString() } : v));
  }

  async function checkOut(id: string) {
    const res = await fetch(`/api/visitors/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "CHECKED_OUT", checkOut: new Date() }) });
    if (res.ok) setVisitors(visitors.map(v => v.id === id ? { ...v, status: "CHECKED_OUT" } : v));
  }

  async function markNoShow(id: string) {
    const res = await fetch(`/api/visitors/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "NO_SHOW" }) });
    if (res.ok) setVisitors(visitors.map(v => v.id === id ? { ...v, status: "NO_SHOW" } : v));
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Visitors</h1>
          <p className="text-zinc-500 text-sm">{todayVisitors.length} expected today</p>
        </div>
        <Link href="/visitors/new" className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-zinc-700">
          <Plus className="w-4 h-4" /> Register Visitor
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Visitors", value: visitors.length, icon: Users, color: "text-zinc-700" },
          { label: "Expected Today", value: expected, icon: Clock, color: "text-blue-600" },
          { label: "Checked In", value: checkedIn, icon: UserCheck, color: "text-green-600" },
          { label: "No Show", value: noShow, icon: UserX, color: "text-red-600" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-zinc-200 p-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-zinc-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {["ALL","EXPECTED","CHECKED_IN","CHECKED_OUT","NO_SHOW"].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter === s ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}>
            {s === "ALL" ? "All" : properCase(s)}
          </button>
        ))}
      </div>

      {/* Visitors Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-zinc-400">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No visitors found</p>
            <Link href="/visitors/new" className="text-blue-600 text-sm mt-2 inline-block">Register a visitor</Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                {["Visitor","Company","Purpose","Host","Expected","Check In","Status","Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map(v => (
                <tr key={v.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-900">{v.name}</p>
                    {v.phone && <p className="text-xs text-zinc-400">{v.phone}</p>}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{v.company || "—"}</td>
                  <td className="px-4 py-3 text-zinc-500">{v.purpose || "—"}</td>
                  <td className="px-4 py-3 text-zinc-500">{v.hostName || "—"}</td>
                  <td className="px-4 py-3 text-zinc-500">{v.expectedTime ? new Date(v.expectedTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : "—"}</td>
                  <td className="px-4 py-3 text-zinc-500">{v.checkIn ? new Date(v.checkIn).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[v.status]}`}>{properCase(v.status)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {v.status === "EXPECTED" && (
                        <>
                          <button onClick={() => checkIn(v.id)} className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">Check In</button>
                          <button onClick={() => markNoShow(v.id)} className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200">No Show</button>
                        </>
                      )}
                      {v.status === "CHECKED_IN" && (
                        <button onClick={() => checkOut(v.id)} className="text-xs bg-zinc-900 text-white px-2 py-1 rounded hover:bg-zinc-700">Check Out</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
