"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { PeopleSubNav } from "@/components/people/people-sub-nav";

interface Employee { id: string; name: string; }
interface Balance { type: string; allocation: string | number; used: number; remaining: string | number; minAdvanceDays: number; maxConsecutive: number; }
interface Holiday { date: string; name: string; }

const LEAVE_TYPES = [
  { value: "CASUAL", label: "Casual" }, { value: "SICK", label: "Sick" },
  { value: "EARNED", label: "Earned" }, { value: "UNPAID", label: "Unpaid" },
  { value: "COMP_OFF", label: "Comp Off" },
];

const ic = "w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400";

export default function NewLeavePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmp, setSelectedEmp] = useState("");
  const [balances, setBalances] = useState<Balance[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [leaveType, setLeaveType] = useState("CASUAL");
  const [halfDayType, setHalfDayType] = useState("FULL_DAY");
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [overlap, setOverlap] = useState(false);

  useEffect(() => {
    fetch("/api/employees?status=ACTIVE").then((r) => r.json()).then(setEmployees).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedEmp) {
      fetch(`/api/leave/balance?employeeId=${selectedEmp}`).then((r) => r.json()).then(setBalances).catch(() => {});
    }
  }, [selectedEmp]);

  // Fetch holidays for date range
  useEffect(() => {
    if (startDate && endDate) {
      fetch(`/api/holidays?from=${startDate}&to=${endDate}`).then((r) => r.json()).then(setHolidays).catch(() => {});
    }
  }, [startDate, endDate]);

  // Check overlap
  useEffect(() => {
    if (selectedEmp && startDate && endDate) {
      fetch(`/api/leave/check-overlap?employeeId=${selectedEmp}&startDate=${startDate}&endDate=${endDate}`)
        .then((r) => r.json()).then((d) => setOverlap(d.hasOverlap)).catch(() => {});
    }
  }, [selectedEmp, startDate, endDate]);

  function calcDays(): number {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    const holidayDates = new Set(holidays.map((h) => h.date.slice(0, 10)));
    let days = 0;
    const d = new Date(s);
    while (d <= e) {
      const dow = d.getDay();
      const dateStr = d.toISOString().slice(0, 10);
      if (dow !== 0 && dow !== 6 && !holidayDates.has(dateStr)) days++;
      d.setDate(d.getDate() + 1);
    }
    if (halfDayType !== "FULL_DAY" && days === 1) return 0.5;
    return days;
  }

  const days = calcDays();
  const selectedBalance = balances.find((b) => b.type === leaveType);
  const isSingleDay = startDate && endDate && startDate === endDate;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedEmp) { setError("Select an employee"); return; }
    if (days <= 0) { setError("Invalid date range"); return; }
    if (overlap) { setError("Dates overlap with existing leave"); return; }

    setSaving(true);
    setError("");

    const body = {
      employeeId: selectedEmp, leaveType, halfDayType: isSingleDay ? halfDayType : "FULL_DAY",
      startDate, endDate, days,
      reason: (e.currentTarget.elements.namedItem("reason") as HTMLTextAreaElement)?.value || "",
    };

    const res = await fetch("/api/leave", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });

    if (res.ok) router.push("/people/leave");
    else {
      const data = await res.json();
      setError(data.error || "Failed to submit leave");
      setSaving(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <PeopleSubNav />
      <Link href="/people/leave" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Leave
      </Link>
      <h1 className="text-2xl font-bold text-zinc-900 mb-6">Apply for Leave</h1>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4 text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Employee *</label>
            <select value={selectedEmp} onChange={(e) => setSelectedEmp(e.target.value)} className={ic} required>
              <option value="">Select employee...</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>

          {balances.length > 0 && (
            <div className="grid grid-cols-5 gap-2">
              {balances.map((b) => (
                <div key={b.type} className={`rounded-lg p-2 text-center ${b.type === leaveType ? "bg-zinc-900 text-white" : "bg-zinc-50"}`}>
                  <p className={`text-[10px] uppercase ${b.type === leaveType ? "text-zinc-300" : "text-zinc-400"}`}>{b.type.replace("_", " ")}</p>
                  <p className={`text-sm font-bold ${b.type === leaveType ? "text-white" : "text-zinc-900"}`}>{typeof b.remaining === "number" ? b.remaining : b.remaining}</p>
                  <p className={`text-[10px] ${b.type === leaveType ? "text-zinc-300" : "text-zinc-400"}`}>remaining</p>
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Leave Type *</label>
            <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} className={ic} required>
              {LEAVE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            {selectedBalance && selectedBalance.minAdvanceDays > 0 && (
              <p className="text-xs text-zinc-400 mt-1">Requires {selectedBalance.minAdvanceDays} days advance notice</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Start Date *</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={ic} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">End Date *</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={ic} required />
            </div>
          </div>

          {isSingleDay && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Duration</label>
              <div className="flex gap-3">
                {[
                  { value: "FULL_DAY", label: "Full Day" },
                  { value: "FIRST_HALF", label: "First Half" },
                  { value: "SECOND_HALF", label: "Second Half" },
                ].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 text-sm text-zinc-700">
                    <input type="radio" name="halfDay" checked={halfDayType === opt.value} onChange={() => setHalfDayType(opt.value)} className="border-zinc-300" />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          )}

          {days > 0 && (
            <div className="flex items-center gap-4 text-sm">
              <span className="text-zinc-600">Working days: <span className="font-bold">{days}</span></span>
              {holidays.length > 0 && (
                <span className="text-zinc-400">({holidays.length} holiday{holidays.length > 1 ? "s" : ""} excluded)</span>
              )}
            </div>
          )}

          {overlap && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm text-amber-700">
              <AlertTriangle className="w-4 h-4 shrink-0" /> These dates overlap with an existing leave request
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Reason</label>
            <textarea name="reason" rows={2} placeholder="Reason for leave" className={ic} />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving || overlap} className="bg-zinc-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-800 disabled:opacity-50">{saving ? "Submitting..." : "Submit Leave"}</button>
          <Link href="/people/leave" className="px-5 py-2.5 rounded-lg text-sm font-medium border border-zinc-300 text-zinc-600 hover:bg-zinc-50">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
