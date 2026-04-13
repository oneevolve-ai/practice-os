"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Timesheet { id: string; employeeName: string | null; date: string; hours: number; description: string | null; billable: boolean; project: { name: string }; }

export default function TimesheetsPage() {
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);

  useEffect(() => {
    fetch("/api/timesheets").then(r => r.json()).then(setTimesheets).catch(() => {});
  }, []);

  const totalHours = timesheets.reduce((s, t) => s + t.hours, 0);
  const billableHours = timesheets.filter(t => t.billable).reduce((s, t) => s + t.hours, 0);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Timesheets</h1>
          <p className="text-zinc-500 text-sm">{totalHours.toFixed(1)}h total · {billableHours.toFixed(1)}h billable</p>
        </div>
        <Link href="/projects" className="text-sm text-zinc-500 hover:text-zinc-700">← Back to Projects</Link>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        {timesheets.length === 0 ? (
          <div className="text-center py-16 text-zinc-400"><p>No time entries yet</p></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                {["Date","Person","Project","Hours","Description","Billable"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {timesheets.map(t => (
                <tr key={t.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3 text-zinc-500">{new Date(t.date).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3 text-zinc-800">{t.employeeName || "—"}</td>
                  <td className="px-4 py-3 text-zinc-600">{t.project.name}</td>
                  <td className="px-4 py-3 font-medium text-zinc-900">{t.hours}h</td>
                  <td className="px-4 py-3 text-zinc-500">{t.description || "—"}</td>
                  <td className="px-4 py-3">{t.billable ? <span className="text-green-600 text-xs">Billable</span> : <span className="text-zinc-400 text-xs">Non-billable</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
