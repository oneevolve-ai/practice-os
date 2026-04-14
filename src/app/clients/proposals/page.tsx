"use client";
import { useEffect, useState } from "react";
import { Plus, FileText } from "lucide-react";
import { properCase } from "@/lib/proper-case";

interface Proposal { id: string; title: string; value: number | null; status: string; sentDate: string | null; createdAt: string; client: { name: string }; }

const STATUS_COLORS: Record<string, string> = { DRAFT: "bg-zinc-100 text-zinc-600", SENT: "bg-blue-100 text-blue-700", VIEWED: "bg-purple-100 text-purple-700", WON: "bg-green-100 text-green-700", LOST: "bg-red-100 text-red-700" };

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ clientId: "", title: "", value: "", status: "DRAFT", sentDate: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/clients").then(r => r.json()).then(setClients).catch(() => {});
    fetchProposals();
  }, []);

  async function fetchProposals() {
    const clients = await fetch("/api/clients").then(r => r.json()).catch(() => []);
    const all: Proposal[] = [];
    for (const c of clients) {
      const props = await fetch(`/api/clients/${c.id}/proposals`).then(r => r.json()).catch(() => []);
      props.forEach((p: any) => all.push({ ...p, client: { name: c.name } }));
    }
    all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setProposals(all);
  }

  async function addProposal() {
    if (!form.clientId || !form.title) return;
    setLoading(true);
    const res = await fetch(`/api/clients/${form.clientId}/proposals`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, value: form.value ? Number(form.value) : null }),
    });
    if (res.ok) { setShowForm(false); setForm({ clientId: "", title: "", value: "", status: "DRAFT", sentDate: "" }); fetchProposals(); }
    setLoading(false);
  }

  const ic = "w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400";
  const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  const totalValue = proposals.filter(p => p.status === "WON").reduce((s, p) => s + (p.value || 0), 0);
  const pipeline = proposals.filter(p => ["SENT","VIEWED"].includes(p.status)).reduce((s, p) => s + (p.value || 0), 0);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Proposals</h1>
          <p className="text-zinc-500 text-sm">{proposals.length} total</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-zinc-700">
          <Plus className="w-4 h-4" /> New Proposal
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-zinc-200 p-4">
          <p className="text-2xl font-bold text-green-600">{fmt(totalValue)}</p>
          <p className="text-xs text-zinc-500 mt-1">Won Value</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-4">
          <p className="text-2xl font-bold text-blue-600">{fmt(pipeline)}</p>
          <p className="text-xs text-zinc-500 mt-1">Pipeline Value</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-4">
          <p className="text-2xl font-bold text-zinc-900">{proposals.filter(p => p.status === "WON").length}</p>
          <p className="text-xs text-zinc-500 mt-1">Won Proposals</p>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-6">
          <h2 className="font-semibold text-zinc-900 mb-4">New Proposal</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Organisation *</label>
              <select value={form.clientId} onChange={e => setForm({...form, clientId: e.target.value})} className={ic}>
                <option value="">Select organisation</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className={ic}>
                {["DRAFT","SENT","VIEWED","WON","LOST"].map(s => <option key={s} value={s}>{properCase(s)}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-zinc-700 mb-1">Proposal Title *</label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className={ic} placeholder="e.g. Spatial OS — Cloudnine Whitefield Digital Twin" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Value (₹)</label>
              <input type="number" value={form.value} onChange={e => setForm({...form, value: e.target.value})} className={ic} placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Sent Date</label>
              <input type="date" value={form.sentDate} onChange={e => setForm({...form, sentDate: e.target.value})} className={ic} />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={addProposal} disabled={loading} className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">{loading ? "Saving..." : "Save Proposal"}</button>
            <button onClick={() => setShowForm(false)} className="border border-zinc-300 text-zinc-700 px-4 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        {proposals.length === 0 ? (
          <div className="text-center py-16 text-zinc-400">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No proposals yet</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                {["Title","Organisation","Value","Status","Sent Date","Created","PDF"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {proposals.map(p => (
                <tr key={p.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3 font-medium text-zinc-900">{p.title}</td>
                  <td className="px-4 py-3 text-zinc-500">{p.client.name}</td>
                  <td className="px-4 py-3 text-zinc-500">{p.value ? fmt(p.value) : "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[p.status] || "bg-zinc-100 text-zinc-600"}`}>{properCase(p.status)}</span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{p.sentDate ? new Date(p.sentDate).toLocaleDateString("en-IN") : "—"}</td>
                  <td className="px-4 py-3 text-zinc-500">{new Date(p.createdAt).toLocaleDateString("en-IN")}</td>
                      <td className="px-4 py-3"><a href={`/api/proposals/${p.id}/pdf`} target="_blank" className="text-xs text-blue-600 hover:underline">Download PDF</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
