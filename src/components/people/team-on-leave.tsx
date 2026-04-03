"use client";

import { CalendarOff } from "lucide-react";

interface LeaveEntry {
  employee: { name: string; designation: string | null };
  leaveType: string;
}

const typeColors: Record<string, string> = {
  CASUAL: "bg-blue-100 text-blue-700", SICK: "bg-red-100 text-red-700",
  EARNED: "bg-green-100 text-green-700", UNPAID: "bg-zinc-100 text-zinc-600",
  COMP_OFF: "bg-purple-100 text-purple-700",
};

export function TeamOnLeave({ entries }: { entries: LeaveEntry[] }) {
  if (!entries || entries.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <CalendarOff className="w-4 h-4 text-zinc-500" />
        <h3 className="text-sm font-semibold text-zinc-900">On Leave Today ({entries.length})</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {entries.map((e, i) => (
          <div key={i} className="flex items-center gap-2 bg-zinc-50 rounded-lg px-3 py-1.5">
            <span className="text-sm font-medium text-zinc-900">{e.employee.name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${typeColors[e.leaveType] || "bg-zinc-100 text-zinc-500"}`}>{e.leaveType}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
