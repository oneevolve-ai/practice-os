"use client";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Leave {
  id: string;
  startDate: string;
  endDate: string;
  leaveType: string;
  status: string;
  employee: { name: string };
}

const TYPE_COLORS: Record<string, string> = {
  CASUAL: "bg-blue-100 text-blue-700 border-blue-200",
  SICK: "bg-red-100 text-red-700 border-red-200",
  PRIVILEGE: "bg-purple-100 text-purple-700 border-purple-200",
  EARNED: "bg-green-100 text-green-700 border-green-200",
  UNPAID: "bg-zinc-100 text-zinc-600 border-zinc-200",
  COMP_OFF: "bg-orange-100 text-orange-700 border-orange-200",
};

const STATUS_FILTER = ["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function LeaveCalendarPage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState("APPROVED");

  useEffect(() => {
    fetch("/api/leave").then(r => r.json()).then(setLeaves).catch(() => {});
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function getLeavesForDay(day: number) {
    const date = new Date(year, month, day);
    return leaves.filter(l => {
      if (statusFilter !== "ALL" && l.status !== statusFilter) return false;
      const start = new Date(l.startDate);
      const end = new Date(l.endDate);
      start.setHours(0,0,0,0); end.setHours(23,59,59,999);
      return date >= start && date <= end;
    });
  }

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Leave Calendar</h1>
          <p className="text-zinc-500 text-sm">Team leave overview</p>
        </div>
        <div className="flex items-center gap-3">
          {STATUS_FILTER.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${statusFilter === s ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-300 text-zinc-600 hover:bg-zinc-50"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 hover:bg-zinc-100 rounded-lg">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h2 className="text-lg font-semibold text-zinc-900">{MONTHS[month]} {year}</h2>
        <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 hover:bg-zinc-100 rounded-lg">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-zinc-200">
          {DAYS.map(d => (
            <div key={d} className="py-2 text-center text-xs font-medium text-zinc-500">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            const dayLeaves = day ? getLeavesForDay(day) : [];
            const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
            return (
              <div key={idx} className={`min-h-24 p-2 border-b border-r border-zinc-100 ${!day ? "bg-zinc-50" : ""}`}>
                {day && (
                  <>
                    <span className={`text-xs font-medium inline-flex w-6 h-6 items-center justify-center rounded-full ${isToday ? "bg-zinc-900 text-white" : "text-zinc-500"}`}>
                      {day}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {dayLeaves.slice(0, 3).map(l => (
                        <div key={l.id} className={`text-xs px-1.5 py-0.5 rounded border truncate ${TYPE_COLORS[l.leaveType] || "bg-zinc-100 text-zinc-600"}`}>
                          {l.employee.name.split(" ")[0]} · {l.leaveType.slice(0,3)}
                        </div>
                      ))}
                      {dayLeaves.length > 3 && (
                        <div className="text-xs text-zinc-400 pl-1">+{dayLeaves.length - 3} more</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-4 mt-4">
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded border ${color}`} />
            <span className="text-xs text-zinc-500">{type.replace("_", " ")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
