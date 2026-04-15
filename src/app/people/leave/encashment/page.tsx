"use client";
import { BackButton } from "@/components/back-button";
import { useEffect, useState } from "react";
import { Plus, X, DollarSign } from "lucide-react";

interface Employee { id: string; name: string; basicSalary: number | null; department: { name: string } | null; }
interface Encashment { id: string; employeeId: string; leaveType: string; days: number; perDayAmount: number; totalAmount: number; year: number; status: string; notes: string | null; employee: { name: string; department: { name: string } | null }; }

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-green-100 text-green-700",
  PAID: "bg-blue-100 text-blue-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function LeaveEncashmentPage() {
  const [encashments, setEncashments] = useState<Encashment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ employeeId: "", leaveType: "PRIVILEGE", days: "", year: new Date().getFullYear(), notes: "" });
  const ic = "w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400";
  const fmt = (n: number) => `Rs.${Number(n).toLocaleString("en-IN")}`;

  useEffect(() => {
    fetch("/api/leave/encashment").then(r => r.json()).then(d => setEncashments(Array.isArray(d) ? d : [])).catch(() => {});
    fetch("/api/employees").then(r => r.json()).then(setEmployees).catch(() => {});
  }, []);

  const selectedEmp = employees.find(e => e.id === form.employeeId);
  const perDay = selectedEmp?.basicSalary ? Math.round(selectedEmp.basicSalary / 26) : 0;
  const total = perDay * (parseInt(form.days) || 0);

  async function handleSubmit() {
    if (!form.employeeId || !form.days) return;
    setLoading(true);
    const res = await fetch("/api/leave/encashment", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, perDayAmount: perDay, totalAmount: total }),
    });
    if (res.ok) {
      const data = await res.json();
      setEncashments([data, ...encashments]);
      setShowForm(false);
      setForm({ employeeId: "", leaveType: "PRIVILEGE", days: "", year: new Date().getFullYear(), notes: "" });
    }
    setLoading(false);
  }

  return (
    <div className="p-8">
      <BackButton href="/people" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Leave Encashment</h1>
          <p className="text-zinc-500 text-sm">Convert unused leave to cash</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-zinc-700">
          <Plus className="w-4 h-4" /> New Encashment
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-zinc-900">New Leave Encashment</h2>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-zinc-400" /></button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-zinc-700 mb-1">Employee *</label>
              <select value={form.employeeId} onChange={e => setForm({...form, employeeId: e.target.value})} className={ic}>
                <option value="">Select employee</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name} {e.basicSalary ? `— Rs.${e.basicSalary.toLocaleString("en-IN")}/mo` : "(no salary)"}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Leave Type</label>
              <select value={form.leaveType} onChange={e => setForm({...form, leaveType: e.target.value})} className={ic}>
                {["PRIVILEGE","EARNED","COMP_OFF"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Year</label>
              <input type="number" value={form.year} onChange={e => setForm({...form, year: Number(e.target.value)})} className={ic} />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Days to Encash *</label>
              <input type="number" value={form.days} onChange={e => setForm({...form, days: e.target.value})} className={ic} placeholder="e.g. 5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Notes</label>
              <input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className={ic} placeholder="Optional" />
            </div>
          </div>

          {/* Summary */}
          {form.employeeId && form.days && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="bg-zinc-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-zinc-900">{fmt(perDay)}</p>
                <p className="text-xs text-zinc-500">Per Day Rate</p>
              </div>
              <div className="bg-zinc-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-zinc-900">{form.days} days</p>
                <p className="text-xs text-zinc-500">Days to Encash</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-green-600">{fmt(total)}</p>
                <p className="text-xs text-zinc-500">Total Encashment</p>
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button onClick={handleSubmit} disabled={loading} className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">{loading ? "Saving..." : "Submit Encashment"}</button>
            <button onClick={() => setShowForm(false)} className="border border-zinc-300 text-zinc-700 px-4 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        {encashments.length === 0 ? (
          <div className="text-center py-16 text-zinc-400">
            <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No encashment records yet</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                {["Employee","Department","Leave Type","Days","Per Day","Total","Year","Status"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {encashments.map(e => (
                <tr key={e.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3 font-medium text-zinc-900">{e.employee.name}</td>
                  <td className="px-4 py-3 text-zinc-500">{e.employee.department?.name || "—"}</td>
                  <td className="px-4 py-3 text-zinc-500">{e.leaveType}</td>
                  <td className="px-4 py-3 text-zinc-700">{e.days}</td>
                  <td className="px-4 py-3 text-zinc-500">{fmt(e.perDayAmount)}</td>
                  <td className="px-4 py-3 font-bold text-green-600">{fmt(e.totalAmount)}</td>
                  <td className="px-4 py-3 text-zinc-500">{e.year}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[e.status] || "bg-zinc-100 text-zinc-600"}`}>{e.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
