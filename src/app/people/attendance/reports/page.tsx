"use client";
import { BackButton } from "@/components/back-button";

import { useEffect, useState } from "react";
import { Download, BarChart3 } from "lucide-react";

interface ReportRow {
  name: string; department: string; present: number; absent: number;
  wfh: number; onLeave: number; halfDay: number;
  totalHours: number; avgHours: number; lateCount: number;
}

export default function AttendanceReportsPage() {
  const [report, setReport] = useState<ReportRow[]>([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/attendance/report?month=${month}&year=${year}`).then((r) => r.json()).then(setReport).finally(() => setLoading(false));
  }, [month, year]);

  return (
    <div className="p-8">
      <BackButton href="/people/attendance" />
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-zinc-900">Attendance Reports</h1><p className="text-zinc-500 mt-1">Monthly attendance summary</p></div>
        <div className="flex items-center gap-2">
          <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))} className="border border-zinc-300 rounded-lg px-3 py-2.5 text-sm">
            {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{new Date(2026, i).toLocaleString("default", { month: "long" })}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="border border-zinc-300 rounded-lg px-3 py-2.5 text-sm">
            {[2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <a href={`/api/attendance/export?month=${month}&year=${year}`} className="inline-flex items-center gap-2 border border-zinc-300 text-zinc-600 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-50">
            <Download className="w-4 h-4" /> Export CSV
          </a>
        </div>
      </div>

      {loading ? <div className="text-center py-12 text-zinc-400">Loading...</div> : report.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-zinc-200">
          <BarChart3 className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-zinc-600">No attendance data</h3>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-zinc-100 bg-zinc-50">
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Employee</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Dept</th>
              <th className="text-center px-3 py-3 font-medium text-green-600">Present</th>
              <th className="text-center px-3 py-3 font-medium text-red-600">Absent</th>
              <th className="text-center px-3 py-3 font-medium text-blue-600">WFH</th>
              <th className="text-center px-3 py-3 font-medium text-purple-600">Leave</th>
              <th className="text-center px-3 py-3 font-medium text-amber-600">Half</th>
              <th className="text-center px-3 py-3 font-medium text-zinc-500">Hours</th>
              <th className="text-center px-3 py-3 font-medium text-zinc-500">Avg</th>
              <th className="text-center px-3 py-3 font-medium text-red-500">Late</th>
            </tr></thead>
            <tbody>
              {report.map((r) => (
                <tr key={r.name} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                  <td className="px-4 py-3 font-medium text-zinc-900">{r.name}</td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{r.department}</td>
                  <td className="px-3 py-3 text-center text-zinc-600">{r.present}</td>
                  <td className="px-3 py-3 text-center text-zinc-600">{r.absent || "—"}</td>
                  <td className="px-3 py-3 text-center text-zinc-600">{r.wfh || "—"}</td>
                  <td className="px-3 py-3 text-center text-zinc-600">{r.onLeave || "—"}</td>
                  <td className="px-3 py-3 text-center text-zinc-600">{r.halfDay || "—"}</td>
                  <td className="px-3 py-3 text-center text-zinc-600">{r.totalHours || "—"}</td>
                  <td className="px-3 py-3 text-center">
                    <span className={r.avgHours > 0 && r.avgHours < 8 ? "text-red-600 font-medium" : "text-zinc-600"}>{r.avgHours || "—"}</span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    {r.lateCount > 0 ? <span className="text-red-600 font-medium">{r.lateCount}</span> : "—"}
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
