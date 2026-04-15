"use client";
import { useEffect, useState } from "react";
import { Plus, X, Star, ChevronDown, ChevronUp, Trash2 } from "lucide-react";

interface Employee { id: string; name: string; designation: string | null; department: { name: string } | null; }
interface KRA { id: string; title: string; weight: number; target: string; achievement: string; rating: number; }
interface Review {
  id: string; employeeId: string; period: string; year: number;
  overallRating: number | null; status: string; notes: string | null; kras: KRA[];
  employee: { name: string; designation: string | null; department: { name: string } | null };
}

const PERIODS = ["Q1 (Jan-Mar)", "Q2 (Apr-Jun)", "Q3 (Jul-Sep)", "Q4 (Oct-Dec)", "Annual"];
const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-zinc-100 text-zinc-600",
  IN_REVIEW: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-green-100 text-green-700",
};

const DEFAULT_KRAS: KRA[] = [
  { id: "1", title: "Project Delivery", weight: 30, target: "Deliver projects on time", achievement: "", rating: 0 },
  { id: "2", title: "Quality of Work", weight: 25, target: "Zero rework instances", achievement: "", rating: 0 },
  { id: "3", title: "Teamwork & Collaboration", weight: 20, target: "Positive team feedback", achievement: "", rating: 0 },
  { id: "4", title: "Learning & Development", weight: 15, target: "Complete 2 training modules", achievement: "", rating: 0 },
  { id: "5", title: "Attendance & Punctuality", weight: 10, target: "95% attendance", achievement: "", rating: 0 },
];

function StarRating({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(s => (
        <button key={s} onClick={() => onChange(s)} className={s <= value ? "text-amber-400" : "text-zinc-200"}>
          <Star className="w-4 h-4 fill-current" />
        </button>
      ))}
    </div>
  );
}

export default function PerformancePage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Review | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ employeeId: "", period: "Q2 (Apr-Jun)", year: new Date().getFullYear(), notes: "", status: "DRAFT" });
  const [kras, setKras] = useState<KRA[]>(DEFAULT_KRAS);
  const ic = "w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400";

  useEffect(() => {
    fetch("/api/performance").then(r => r.json()).then(d => setReviews(Array.isArray(d) ? d : [])).catch(() => {});
    fetch("/api/employees").then(r => r.json()).then(setEmployees).catch(() => {});
  }, []);

  const overallRating = kras.reduce((s, k) => s + (k.rating * k.weight / 100), 0);

  async function handleSubmit() {
    if (!form.employeeId) return;
    setLoading(true);
    const res = await fetch("/api/performance", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, kras, overallRating: Math.round(overallRating * 10) / 10 }),
    });
    if (res.ok) {
      const data = await res.json();
      setReviews([data, ...reviews]);
      setShowForm(false);
      setKras(DEFAULT_KRAS);
      setForm({ employeeId: "", period: "Q2 (Apr-Jun)", year: new Date().getFullYear(), notes: "", status: "DRAFT" });
    }
    setLoading(false);
  }

  async function updateReview(id: string, updates: Partial<Review>) {
    await fetch(`/api/performance/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setReviews(reviews.map(r => r.id === id ? { ...r, ...updates } : r));
    if (selected?.id === id) setSelected({ ...selected, ...updates });
  }

  async function deleteReview(id: string) {
    await fetch(`/api/performance/${id}`, { method: "DELETE" });
    setReviews(reviews.filter(r => r.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Performance Reviews</h1>
          <p className="text-zinc-500 text-sm">{reviews.length} reviews · KRA-based evaluation</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-zinc-700">
          <Plus className="w-4 h-4" /> New Review
        </button>
      </div>

      {/* New Review Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-zinc-900">New Performance Review</h2>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-zinc-400" /></button>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="col-span-3">
              <label className="block text-sm font-medium text-zinc-700 mb-1">Employee *</label>
              <select value={form.employeeId} onChange={e => setForm({...form, employeeId: e.target.value})} className={ic}>
                <option value="">Select employee</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name} — {e.designation || "—"}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Period</label>
              <select value={form.period} onChange={e => setForm({...form, period: e.target.value})} className={ic}>
                {PERIODS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Year</label>
              <input type="number" value={form.year} onChange={e => setForm({...form, year: Number(e.target.value)})} className={ic} />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className={ic}>
                {["DRAFT","IN_REVIEW","COMPLETED"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* KRAs */}
          <h3 className="font-medium text-zinc-900 mb-3">KRAs</h3>
          <div className="space-y-3 mb-4">
            {kras.map((kra, idx) => (
              <div key={kra.id} className="bg-zinc-50 rounded-lg p-4">
                <div className="grid grid-cols-4 gap-3 mb-2">
                  <div className="col-span-2">
                    <label className="text-xs text-zinc-500">KRA Title</label>
                    <input value={kra.title} onChange={e => setKras(kras.map((k,i) => i===idx ? {...k, title: e.target.value} : k))} className="w-full border border-zinc-200 rounded px-2 py-1 text-sm mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500">Weight (%)</label>
                    <input type="number" value={kra.weight} onChange={e => setKras(kras.map((k,i) => i===idx ? {...k, weight: Number(e.target.value)} : k))} className="w-full border border-zinc-200 rounded px-2 py-1 text-sm mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500">Rating</label>
                    <div className="mt-1.5">
                      <StarRating value={kra.rating} onChange={r => setKras(kras.map((k,i) => i===idx ? {...k, rating: r} : k))} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-500">Target</label>
                    <input value={kra.target} onChange={e => setKras(kras.map((k,i) => i===idx ? {...k, target: e.target.value} : k))} className="w-full border border-zinc-200 rounded px-2 py-1 text-sm mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500">Achievement</label>
                    <input value={kra.achievement} onChange={e => setKras(kras.map((k,i) => i===idx ? {...k, achievement: e.target.value} : k))} className="w-full border border-zinc-200 rounded px-2 py-1 text-sm mt-1" placeholder="What was achieved?" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Overall Rating */}
          <div className="flex items-center justify-between bg-zinc-900 text-white rounded-lg p-4 mb-4">
            <span className="font-medium">Overall Rating (Weighted)</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{overallRating.toFixed(1)}</span>
              <span className="text-zinc-400">/ 5</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className={ic} rows={3} placeholder="Overall feedback and notes..." />
          </div>

          <div className="flex gap-2 mt-4">
            <button onClick={handleSubmit} disabled={loading} className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">{loading ? "Saving..." : "Save Review"}</button>
            <button onClick={() => setShowForm(false)} className="border border-zinc-300 text-zinc-700 px-4 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        {reviews.length === 0 ? (
          <div className="text-center py-16 text-zinc-400">
            <Star className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No performance reviews yet</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                {["Employee","Department","Period","Year","Rating","Status","Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {reviews.map(r => (
                <tr key={r.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3 font-medium text-zinc-900">{r.employee.name}</td>
                  <td className="px-4 py-3 text-zinc-500">{r.employee.department?.name || "—"}</td>
                  <td className="px-4 py-3 text-zinc-500">{r.period}</td>
                  <td className="px-4 py-3 text-zinc-500">{r.year}</td>
                  <td className="px-4 py-3">
                    {r.overallRating ? (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="font-medium">{r.overallRating}</span>
                        <span className="text-zinc-400 text-xs">/5</span>
                      </div>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[r.status] || "bg-zinc-100 text-zinc-600"}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setSelected(selected?.id === r.id ? null : r)} className="text-xs text-blue-600 hover:underline">
                        {selected?.id === r.id ? "Close" : "View"}
                      </button>
                      <button onClick={() => deleteReview(r.id)} className="text-zinc-400 hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Review Detail */}
      {selected && (
        <div className="mt-6 bg-white rounded-xl border border-zinc-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-zinc-900">{selected.employee.name} — {selected.period} {selected.year}</h2>
            <button onClick={() => setSelected(null)}><X className="w-4 h-4 text-zinc-400" /></button>
          </div>
          <div className="space-y-3">
            {(Array.isArray(selected.kras) ? selected.kras : []).map((kra: KRA) => (
              <div key={kra.id} className="bg-zinc-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-zinc-900">{kra.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">Weight: {kra.weight}%</span>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= kra.rating ? "text-amber-400 fill-amber-400" : "text-zinc-200 fill-zinc-200"}`} />)}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-zinc-500">Target: {kra.target}</p>
                {kra.achievement && <p className="text-xs text-zinc-700 mt-1">Achievement: {kra.achievement}</p>}
              </div>
            ))}
          </div>
          {selected.notes && (
            <div className="mt-4 bg-zinc-50 rounded-lg p-4">
              <p className="text-sm text-zinc-500 font-medium mb-1">Notes</p>
              <p className="text-sm text-zinc-700">{selected.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
