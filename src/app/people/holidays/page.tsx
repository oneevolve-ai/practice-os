"use client";
import { BackButton } from "@/components/back-button";

import { useEffect, useState } from "react";
import { Calendar, Plus, Pencil, Trash2, X, Sparkles } from "lucide-react";
import { format } from "date-fns";

interface Holiday {
  id: string;
  date: string;
  name: string;
  type: string;
}

const typeColors: Record<string, string> = {
  NATIONAL: "bg-red-100 text-red-700",
  RESTRICTED: "bg-amber-100 text-amber-700",
  COMPANY: "bg-blue-100 text-blue-700",
};

const inputClass = "w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400";

export default function HolidaysPage() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  function fetchHolidays() {
    setLoading(true);
    fetch(`/api/holidays?year=${year}`)
      .then((r) => r.json())
      .then(setHolidays)
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchHolidays(); }, [year]);

  async function handleSeed() {
    if (!confirm(`Seed Indian holidays for ${year}? This won't duplicate existing ones.`)) return;
    setSeeding(true);
    const res = await fetch("/api/holidays/seed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year }),
    });
    if (res.ok) {
      const data = await res.json();
      alert(`Created ${data.created} holidays (${data.skipped} already existed)`);
      fetchHolidays();
    }
    setSeeding(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const body = { date: form.get("date"), name: form.get("name"), type: form.get("type") };

    const url = editId ? `/api/holidays/${editId}` : "/api/holidays";
    const method = editId ? "PATCH" : "POST";

    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { setShowForm(false); setEditId(null); fetchHolidays(); }
    else alert("Failed to save holiday");
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this holiday?")) return;
    await fetch(`/api/holidays/${id}`, { method: "DELETE" });
    fetchHolidays();
  }

  const editHoliday = editId ? holidays.find((h) => h.id === editId) : null;

  return (
    <div className="p-8">
      <BackButton href="/people" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Holiday Calendar</h1>
          <p className="text-zinc-500 mt-1">Manage company holidays</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="border border-zinc-300 rounded-lg px-3 py-2.5 text-sm">
            {[2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={handleSeed} disabled={seeding} className="inline-flex items-center gap-2 border border-zinc-300 text-zinc-600 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-50 disabled:opacity-50">
            <Sparkles className="w-4 h-4" /> {seeding ? "Seeding..." : `Seed ${year} Holidays`}
          </button>
          {!showForm && (
            <button onClick={() => { setShowForm(true); setEditId(null); }} className="inline-flex items-center gap-2 bg-zinc-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-800">
              <Plus className="w-4 h-4" /> Add Holiday
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-zinc-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-900">{editId ? "Edit Holiday" : "New Holiday"}</h3>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="text-zinc-400 hover:text-zinc-600"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">Date</label>
              <input name="date" type="date" required defaultValue={editHoliday ? editHoliday.date.slice(0, 10) : ""} className={inputClass} />
            </div>
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">Name</label>
              <input name="name" required defaultValue={editHoliday?.name || ""} placeholder="e.g. Republic Day" className={inputClass} />
            </div>
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">Type</label>
              <select name="type" defaultValue={editHoliday?.type || "NATIONAL"} className={inputClass}>
                <option value="NATIONAL">National</option>
                <option value="RESTRICTED">Restricted</option>
                <option value="COMPANY">Company</option>
              </select>
            </div>
          </div>
          <button type="submit" className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800">
            {editId ? "Save Changes" : "Create Holiday"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-zinc-400">Loading...</div>
      ) : holidays.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-zinc-200">
          <Calendar className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-zinc-600">No holidays for {year}</h3>
          <p className="text-sm text-zinc-400 mt-1 mb-4">Seed Indian holidays or add them manually</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-zinc-100 bg-zinc-50">
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Date</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Day</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Holiday</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Type</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Actions</th>
            </tr></thead>
            <tbody>
              {holidays.map((h) => {
                const d = new Date(h.date);
                return (
                  <tr key={h.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                    <td className="px-4 py-3 text-zinc-900">{format(d, "MMM d, yyyy")}</td>
                    <td className="px-4 py-3 text-zinc-500">{format(d, "EEEE")}</td>
                    <td className="px-4 py-3 font-medium text-zinc-900">{h.name}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${typeColors[h.type]}`}>{h.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => { setEditId(h.id); setShowForm(true); }} className="p-1 text-zinc-400 hover:text-zinc-600"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(h.id)} className="p-1 text-zinc-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-4 py-3 bg-zinc-50 border-t border-zinc-100 text-xs text-zinc-500">
            {holidays.length} holidays · {holidays.filter((h) => h.type === "NATIONAL").length} national · {holidays.filter((h) => h.type === "RESTRICTED").length} restricted · {holidays.filter((h) => h.type === "COMPANY").length} company
          </div>
        </div>
      )}
    </div>
  );
}
