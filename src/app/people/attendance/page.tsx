"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Clock, Save, LogIn, Users, UserX, Home, CalendarOff, AlertCircle } from "lucide-react";
import Link from "next/link";

interface Employee { id: string; name: string; department: { name: string } | null; }
interface AttRecord { id: string; employeeId: string; status: string; checkIn: string | null; checkOut: string | null; workHours: number | null; notes: string | null; isLeave: boolean; lateArrival: boolean; }
interface Holiday { name: string; type: string; }

const STATUSES = ["PRESENT", "ABSENT", "HALF_DAY", "WFH", "ON_LEAVE"];
const statusLabels: Record<string, string> = { PRESENT: "Present", ABSENT: "Absent", HALF_DAY: "Half Day", WFH: "WFH", ON_LEAVE: "On Leave" };
const ic = "border border-zinc-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-400";

interface RowState { status: string; checkIn: string; checkOut: string; notes: string; isLeave: boolean; }

export default function AttendancePage() {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [records, setRecords] = useState<AttRecord[]>([]);
  const [rowStates, setRowStates] = useState<Record<string, RowState>>({});
  const [saving, setSaving] = useState(false);
  const [holiday, setHoliday] = useState<Holiday | null>(null);
  const [summary, setSummary] = useState({ present: 0, absent: 0, wfh: 0, onLeave: 0 });

  useEffect(() => {
    fetch("/api/employees?status=ACTIVE").then((r) => r.json()).then(setEmployees).catch(() => {});
  }, []);

  useEffect(() => {
    if (!date) return;

    // Fetch attendance
    fetch(`/api/attendance?date=${date}`).then((r) => r.json()).then((recs: AttRecord[]) => {
      setRecords(recs);
      const states: Record<string, RowState> = {};
      recs.forEach((r) => {
        states[r.employeeId] = { status: r.status, checkIn: r.checkIn || "", checkOut: r.checkOut || "", notes: r.notes || "", isLeave: r.isLeave };
      });
      setRowStates(states);

      // Summary
      setSummary({
        present: recs.filter((r) => r.status === "PRESENT").length,
        absent: recs.filter((r) => r.status === "ABSENT").length,
        wfh: recs.filter((r) => r.status === "WFH").length,
        onLeave: recs.filter((r) => r.status === "ON_LEAVE").length,
      });
    }).catch(() => {});

    // Check holiday
    fetch(`/api/holidays?from=${date}&to=${date}`).then((r) => r.json()).then((h) => {
      setHoliday(h.length > 0 ? h[0] : null);
    }).catch(() => {});
  }, [date]);

  function updateRow(empId: string, field: keyof RowState, value: string) {
    setRowStates((prev) => ({
      ...prev,
      [empId]: { ...(prev[empId] || { status: "PRESENT", checkIn: "", checkOut: "", notes: "", isLeave: false }), [field]: value },
    }));
  }

  async function saveAll() {
    setSaving(true);
    const promises = employees.map((emp) => {
      const state = rowStates[emp.id];
      if (!state || state.isLeave) return null;
      return fetch("/api/attendance", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: emp.id, date, status: state.status, checkIn: state.checkIn || null, checkOut: state.checkOut || null, notes: state.notes || null }),
      });
    }).filter(Boolean);
    await Promise.all(promises);
    setSaving(false);

    // Refresh
    const res = await fetch(`/api/attendance?date=${date}`);
    const recs = await res.json();
    setRecords(recs);
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-zinc-900">Attendance</h1><p className="text-zinc-500 mt-1">Daily attendance tracking</p></div>
        <div className="flex items-center gap-3">
          <Link href="/people/attendance/check-in" className="inline-flex items-center gap-2 border border-zinc-300 text-zinc-600 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-50">
            <LogIn className="w-4 h-4" /> Self Check-In
          </Link>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400" />
          <button onClick={saveAll} disabled={saving} className="inline-flex items-center gap-2 bg-zinc-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-800 disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save All"}
          </button>
        </div>
      </div>

      {/* Holiday Banner */}
      {holiday && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4 text-sm text-amber-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span><strong>Holiday:</strong> {holiday.name} ({holiday.type})</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Present", value: summary.present, icon: Users, color: "green" },
          { label: "Absent", value: summary.absent, icon: UserX, color: "red" },
          { label: "WFH", value: summary.wfh, icon: Home, color: "blue" },
          { label: "On Leave", value: summary.onLeave, icon: CalendarOff, color: "purple" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`bg-white rounded-xl border border-${s.color}-200 p-4`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 bg-${s.color}-100 rounded-lg`}><Icon className={`w-5 h-5 text-${s.color}-600`} /></div>
                <div><p className="text-2xl font-bold text-zinc-900">{s.value}</p><p className="text-xs text-zinc-500">{s.label}</p></div>
              </div>
            </div>
          );
        })}
      </div>

      {employees.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-zinc-200">
          <Clock className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-zinc-600">No active employees</h3>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-zinc-100 bg-zinc-50">
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Employee</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Status</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Check In</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Check Out</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Hours</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Notes</th>
            </tr></thead>
            <tbody>
              {employees.map((emp) => {
                const state = rowStates[emp.id] || { status: "PRESENT", checkIn: "", checkOut: "", notes: "", isLeave: false };
                const rec = records.find((r) => r.employeeId === emp.id);
                const isOnLeave = state.isLeave;
                const hours = state.checkIn && state.checkOut ? (() => {
                  const [inH, inM] = state.checkIn.split(":").map(Number);
                  const [outH, outM] = state.checkOut.split(":").map(Number);
                  return Math.round(((outH * 60 + outM) - (inH * 60 + inM)) / 60 * 100) / 100;
                })() : (rec?.workHours || null);

                return (
                  <tr key={emp.id} className={`border-b border-zinc-50 ${isOnLeave ? "bg-purple-50/50" : ""}`}>
                    <td className="px-4 py-3">
                      <Link href={`/people/attendance/${emp.id}`} className="font-medium text-zinc-900 hover:underline">{emp.name}</Link>
                      <p className="text-xs text-zinc-400">{emp.department?.name}</p>
                    </td>
                    <td className="px-4 py-2">
                      {isOnLeave ? (
                        <span className="text-xs text-purple-600 font-medium">On Approved Leave</span>
                      ) : (
                        <select value={state.status} onChange={(e) => updateRow(emp.id, "status", e.target.value)} className={ic}>
                          {STATUSES.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {isOnLeave ? "—" : <input type="time" value={state.checkIn} onChange={(e) => updateRow(emp.id, "checkIn", e.target.value)} className={ic} />}
                    </td>
                    <td className="px-4 py-2">
                      {isOnLeave ? "—" : <input type="time" value={state.checkOut} onChange={(e) => updateRow(emp.id, "checkOut", e.target.value)} className={ic} />}
                    </td>
                    <td className="px-4 py-3">
                      {hours ? (
                        <span className={hours < 8 ? "text-red-600 font-medium" : "text-zinc-600"}>{hours}h</span>
                      ) : "—"}
                      {rec?.lateArrival && <span className="text-red-500 text-[10px] ml-1">LATE</span>}
                    </td>
                    <td className="px-4 py-2">
                      {isOnLeave ? "—" : <input type="text" value={state.notes} onChange={(e) => updateRow(emp.id, "notes", e.target.value)} placeholder="Notes" className={`${ic} w-full`} />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
