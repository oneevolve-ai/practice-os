"use client";
import { BackButton } from "@/components/back-button";

import { useEffect, useState } from "react";
import { Download, BarChart3 } from "lucide-react";

interface ReportRow {
  name: string; department: string; casual: number; sick: number;
  earned: number; unpaid: number; compOff: number; total: number;
}

export default function LeaveReportsPage() {
  const [report, setReport] = useState<ReportRow[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leave/report?year=${year}`).then((r) => r.json()).then(setReport).finally(() => setLoading(false));
  }, [year]);

  return (
    <div className="p-8">
      <BackButton href="/people" />
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-zinc-900">Leave Reports</h1><p className="text-zinc-500 mt-1">Annual leave usage by employee</p></div>
        <div className="flex items-center gap-2">
          <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="border border-zinc-300 rounded-lg px-3 py-2.5 text-sm">
            {[2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <a href={`/api/leave/export?year=${year}`} className="inline-flex items-center gap-2 border border-zinc-300 text-zinc-600 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-50">
            <Download className="w-4 h-4" /> Export CSV
          </a>
        </div>
      </div>

      {loading ? <div className="text-center py-12 text-zinc-400">Loading...</div> : report.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-zinc-200">
          <BarChart3 className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-zinc-600">No leave data for {year}</h3>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-zinc-100 bg-zinc-50">
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Employee</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Department</th>
              <th className="text-center px-4 py-3 font-medium text-blue-500">Casual</th>
              <th className="text-center px-4 py-3 font-medium text-red-500">Sick</th>
              <th className="text-center px-4 py-3 font-medium text-green-500">Earned</th>
              <th className="text-center px-4 py-3 font-medium text-zinc-500">Unpaid</th>
              <th className="text-center px-4 py-3 font-medium text-purple-500">Comp Off</th>
              <th className="text-center px-4 py-3 font-medium text-zinc-900">Total</th>
            </tr></thead>
            <tbody>
              {report.map((r) => (
                <tr key={r.name} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                  <td className="px-4 py-3 font-medium text-zinc-900">{r.name}</td>
                  <td className="px-4 py-3 text-zinc-500">{r.department}</td>
                  <td className="px-4 py-3 text-center text-zinc-600">{r.casual || "—"}</td>
                  <td className="px-4 py-3 text-center text-zinc-600">{r.sick || "—"}</td>
                  <td className="px-4 py-3 text-center text-zinc-600">{r.earned || "—"}</td>
                  <td className="px-4 py-3 text-center text-zinc-600">{r.unpaid || "—"}</td>
                  <td className="px-4 py-3 text-center text-zinc-600">{r.compOff || "—"}</td>
                  <td className="px-4 py-3 text-center font-bold text-zinc-900">{r.total || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
