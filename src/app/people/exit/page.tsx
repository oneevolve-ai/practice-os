"use client";
import { BackButton } from "@/components/back-button";
import { useEffect, useState } from "react";
import { Plus, X, CheckCircle2, Circle, LogOut } from "lucide-react";

interface Employee { id: string; name: string; designation: string | null; department: { name: string } | null; }
interface Exit {
  id: string; employeeId: string; resignationDate: string; lastWorkingDay: string;
  noticePeriod: number; reason: string | null; exitType: string; status: string;
  interviewDone: boolean; interviewNotes: string | null; clearance: Record<string, boolean>;
  fnfAmount: number | null; fnfStatus: string;
  employee: { name: string; designation: string | null; department: { name: string } | null };
}

const EXIT_TYPES = ["RESIGNATION", "TERMINATION", "RETIREMENT", "CONTRACT_END", "ABSCONDING"];
const STATUS_COLORS: Record<string, string> = {
  NOTICE_PERIOD: "bg-amber-100 text-amber-700",
  CLEARANCE: "bg-blue-100 text-blue-700",
  FNF_PENDING: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-green-100 text-green-700",
};

const CLEARANCE_ITEMS: Record<string, string> = {
  laptop: "Laptop returned",
  idCard: "ID card returned",
  accessCard: "Access card returned",
  emailDeactivated: "Email deactivated",
  documentHandover: "Document handover done",
  financeCleared: "Finance clearance",
  hrCleared: "HR clearance",
};

export default function ExitPage() {
  const [exits, setExits] = useState<Exit[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Exit | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    employeeId: "", resignationDate: "", lastWorkingDay: "",
    noticePeriod: "60", reason: "", exitType: "RESIGNATION",
  });
  const ic = "w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400";
  const fmt = (n: number) => `Rs.${Number(n).toLocaleString("en-IN")}`;

  useEffect(() => {
    fetch("/api/exit").then(r => r.json()).then(d => setExits(Array.isArray(d) ? d : [])).catch(() => {});
    fetch("/api/employees").then(r => r.json()).then(setEmployees).catch(() => {});
  }, []);

  async function handleSubmit() {
    if (!form.employeeId || !form.resignationDate || !form.lastWorkingDay) return;
    setLoading(true);
    const res = await fetch("/api/exit", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      setExits([data, ...exits]);
      setShowForm(false);
      setForm({ employeeId: "", resignationDate: "", lastWorkingDay: "", noticePeriod: "60", reason: "", exitType: "RESIGNATION" });
    }
    setLoading(false);
  }

  async function updateClearance(exitId: string, key: string, value: boolean) {
    if (!selected) return;
    const newClearance = { ...selected.clearance, [key]: value };
    const allCleared = Object.values(newClearance).every(Boolean);
    const res = await fetch(`/api/exit/${exitId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clearance: newClearance, status: allCleared ? "FNF_PENDING" : "CLEARANCE" }),
    });
    if (res.ok) {
      const updated = { ...selected, clearance: newClearance, status: allCleared ? "FNF_PENDING" : "CLEARANCE" };
      setSelected(updated);
      setExits(exits.map(e => e.id === exitId ? updated : e));
    }
  }

  async function updateFNF(exitId: string, fnfAmount: string, fnfStatus: string) {
    const res = await fetch(`/api/exit/${exitId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fnfAmount: Number(fnfAmount), fnfStatus, status: fnfStatus === "PAID" ? "COMPLETED" : "FNF_PENDING" }),
    });
    if (res.ok) {
      const updated = { ...selected!, fnfAmount: Number(fnfAmount), fnfStatus, status: fnfStatus === "PAID" ? "COMPLETED" : "FNF_PENDING" };
      setSelected(updated);
      setExits(exits.map(e => e.id === exitId ? updated : e));
    }
  }

  return (
    <div className="p-8">
      <BackButton href="/people" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Exit Management</h1>
          <p className="text-zinc-500 text-sm">{exits.length} exit records · Manage offboarding</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-zinc-700">
          <Plus className="w-4 h-4" /> New Exit
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-zinc-900">Initiate Exit Process</h2>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-zinc-400" /></button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-zinc-700 mb-1">Employee *</label>
              <select value={form.employeeId} onChange={e => setForm({...form, employeeId: e.target.value})} className={ic}>
                <option value="">Select employee</option>
                {employees.filter(e => !exits.find(x => x.employeeId === e.id)).map(e => (
                  <option key={e.id} value={e.id}>{e.name} — {e.designation || "—"}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Exit Type</label>
              <select value={form.exitType} onChange={e => setForm({...form, exitType: e.target.value})} className={ic}>
                {EXIT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Notice Period (days)</label>
              <input type="number" value={form.noticePeriod} onChange={e => setForm({...form, noticePeriod: e.target.value})} className={ic} />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Resignation Date *</label>
              <input type="date" value={form.resignationDate} onChange={e => setForm({...form, resignationDate: e.target.value})} className={ic} />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Last Working Day *</label>
              <input type="date" value={form.lastWorkingDay} onChange={e => setForm({...form, lastWorkingDay: e.target.value})} className={ic} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-zinc-700 mb-1">Reason</label>
              <textarea value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} className={ic} rows={2} placeholder="Reason for exit..." />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSubmit} disabled={loading} className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">{loading ? "Saving..." : "Initiate Exit"}</button>
            <button onClick={() => setShowForm(false)} className="border border-zinc-300 text-zinc-700 px-4 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Exit List */}
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          {exits.length === 0 ? (
            <div className="text-center py-16 text-zinc-400">
              <LogOut className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No exit records</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {exits.map(e => (
                <button key={e.id} onClick={() => setSelected(selected?.id === e.id ? null : e)}
                  className={`w-full text-left px-4 py-4 hover:bg-zinc-50 ${selected?.id === e.id ? "bg-zinc-50" : ""}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-zinc-900">{e.employee.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[e.status] || "bg-zinc-100 text-zinc-600"}`}>{e.status.replace("_", " ")}</span>
                  </div>
                  <p className="text-xs text-zinc-500">{e.employee.designation} · {e.exitType}</p>
                  <p className="text-xs text-zinc-400 mt-1">Last day: {new Date(e.lastWorkingDay).toLocaleDateString("en-IN")}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Exit Detail */}
        {selected && (
          <div className="space-y-4">
            {/* Info */}
            <div className="bg-white rounded-xl border border-zinc-200 p-4">
              <h3 className="font-semibold text-zinc-900 mb-3">{selected.employee.name}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><p className="text-zinc-500 text-xs">Exit Type</p><p className="font-medium">{selected.exitType}</p></div>
                <div><p className="text-zinc-500 text-xs">Notice Period</p><p className="font-medium">{selected.noticePeriod} days</p></div>
                <div><p className="text-zinc-500 text-xs">Resignation Date</p><p className="font-medium">{new Date(selected.resignationDate).toLocaleDateString("en-IN")}</p></div>
                <div><p className="text-zinc-500 text-xs">Last Working Day</p><p className="font-medium">{new Date(selected.lastWorkingDay).toLocaleDateString("en-IN")}</p></div>
              </div>
              {selected.reason && <p className="text-xs text-zinc-500 mt-2 bg-zinc-50 p-2 rounded">Reason: {selected.reason}</p>}
            </div>

            {/* Clearance */}
            <div className="bg-white rounded-xl border border-zinc-200 p-4">
              <h3 className="font-semibold text-zinc-900 mb-3">Exit Clearance</h3>
              <div className="space-y-2">
                {Object.entries(CLEARANCE_ITEMS).map(([key, label]) => (
                  <button key={key} onClick={() => updateClearance(selected.id, key, !selected.clearance[key])}
                    className="w-full flex items-center gap-3 py-2 hover:bg-zinc-50 rounded-lg px-2">
                    {selected.clearance[key]
                      ? <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      : <Circle className="w-5 h-5 text-zinc-300 shrink-0" />}
                    <span className={`text-sm ${selected.clearance[key] ? "line-through text-zinc-400" : "text-zinc-700"}`}>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* FnF */}
            <div className="bg-white rounded-xl border border-zinc-200 p-4">
              <h3 className="font-semibold text-zinc-900 mb-3">Full & Final Settlement</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">FnF Amount (Rs.)</label>
                  <input type="number" defaultValue={selected.fnfAmount || ""} onBlur={e => updateFNF(selected.id, e.target.value, selected.fnfStatus)}
                    className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. 50000" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">FnF Status</label>
                  <select defaultValue={selected.fnfStatus} onChange={e => updateFNF(selected.id, String(selected.fnfAmount || 0), e.target.value)}
                    className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm">
                    {["PENDING","PROCESSING","PAID"].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              {selected.fnfAmount && (
                <div className="mt-3 bg-zinc-50 rounded-lg p-3 flex justify-between">
                  <span className="text-sm text-zinc-500">Total FnF Amount</span>
                  <span className="font-bold text-zinc-900">{fmt(selected.fnfAmount)}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
