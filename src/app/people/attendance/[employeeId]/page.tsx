"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, format, isSameMonth, isSameDay } from "date-fns";
import { PeopleSubNav } from "@/components/people/people-sub-nav";

interface AttRecord { date: string; status: string; checkIn: string | null; checkOut: string | null; workHours: number | null; lateArrival: boolean; }
interface EmployeeInfo { name: string; department: { name: string } | null; }
interface Stats { present: number; absent: number; halfDay: number; wfh: number; onLeave: number; lateCount: number; totalWorkHours: number; avgWorkHours: number; }

const statusColors: Record<string, string> = {
  PRESENT: "bg-green-200", ABSENT: "bg-red-200", HALF_DAY: "bg-amber-200",
  WFH: "bg-blue-200", ON_LEAVE: "bg-purple-200",
};
const statusLabels: Record<string, string> = { PRESENT: "P", ABSENT: "A", HALF_DAY: "H", WFH: "W", ON_LEAVE: "L" };

export default function EmployeeAttendancePage() {
  const { employeeId } = useParams();
  const [month, setMonth] = useState(new Date());
  const [records, setRecords] = useState<AttRecord[]>([]);
  const [employee, setEmployee] = useState<EmployeeInfo | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const m = month.getMonth() + 1;
    const y = month.getFullYear();
    fetch(`/api/attendance/employee/${employeeId}?month=${m}&year=${y}`)
      .then((r) => r.json())
      .then((data) => { setRecords(data.records); setEmployee(data.employee); setStats(data.stats); })
      .catch(() => {});
  }, [employeeId, month]);

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(monthStart);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days: Date[] = [];
  let d = calStart;
  while (d <= calEnd) { days.push(d); d = addDays(d, 1); }

  function getRecord(date: Date) {
    return records.find((r) => isSameDay(new Date(r.date), date));
  }

  return (
    <div className="p-8">
      <PeopleSubNav />
      <Link href="/people/attendance" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Attendance
      </Link>

      <h1 className="text-2xl font-bold text-zinc-900">{employee?.name || "Employee"}</h1>
      <p className="text-zinc-500 mt-1 mb-6">{employee?.department?.name || ""} — Attendance History</p>

      <div className="grid grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="col-span-2 bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
            <button onClick={() => setMonth(subMonths(month, 1))} className="p-1 hover:bg-zinc-100 rounded"><ChevronLeft className="w-5 h-5" /></button>
            <h3 className="text-sm font-semibold text-zinc-900">{format(month, "MMMM yyyy")}</h3>
            <button onClick={() => setMonth(addMonths(month, 1))} className="p-1 hover:bg-zinc-100 rounded"><ChevronRight className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-7">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="px-2 py-2 text-center text-xs font-medium text-zinc-400 border-b border-zinc-100">{d}</div>
            ))}
            {days.map((day, i) => {
              const inMonth = isSameMonth(day, monthStart);
              const isToday = isSameDay(day, new Date());
              const rec = getRecord(day);
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;

              return (
                <div key={i} className={`min-h-[60px] border-b border-r border-zinc-100 p-1 ${!inMonth ? "bg-zinc-50" : isWeekend ? "bg-zinc-50/50" : "bg-white"}`}>
                  <p className={`text-xs text-right ${isToday ? "bg-zinc-900 text-white w-5 h-5 rounded-full flex items-center justify-center ml-auto" : inMonth ? "text-zinc-700" : "text-zinc-300"}`}>
                    {format(day, "d")}
                  </p>
                  {rec && inMonth && (
                    <div className={`mt-1 rounded px-1 py-0.5 text-center ${statusColors[rec.status] || "bg-zinc-100"}`}>
                      <span className="text-[10px] font-bold">{statusLabels[rec.status]}</span>
                      {rec.lateArrival && <span className="text-[8px] text-red-600 block">LATE</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 px-4 py-3 bg-zinc-50 border-t border-zinc-100 text-[10px] text-zinc-500">
            {Object.entries(statusColors).map(([k, v]) => (
              <div key={k} className="flex items-center gap-1"><div className={`w-3 h-3 rounded ${v}`} />{statusLabels[k]} = {k.replace("_", " ")}</div>
            ))}
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-4">
          {stats && [
            { label: "Present", value: stats.present, color: "text-green-700" },
            { label: "Absent", value: stats.absent, color: "text-red-700" },
            { label: "Half Day", value: stats.halfDay, color: "text-amber-700" },
            { label: "WFH", value: stats.wfh, color: "text-blue-700" },
            { label: "On Leave", value: stats.onLeave, color: "text-purple-700" },
            { label: "Late Arrivals", value: stats.lateCount, color: "text-red-600" },
            { label: "Total Work Hours", value: `${stats.totalWorkHours}h`, color: "text-zinc-900" },
            { label: "Avg Work Hours", value: `${stats.avgWorkHours}h`, color: "text-zinc-900" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-zinc-200 px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-zinc-500">{s.label}</span>
              <span className={`text-lg font-bold ${s.color}`}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
