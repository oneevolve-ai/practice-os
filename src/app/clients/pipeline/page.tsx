"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { properCase } from "@/lib/proper-case";
import { Plus, X } from "lucide-react";

interface Deal { id: string; title: string; stage: string; value: number | null; clientId: string; clientName: string; createdAt: string; }

const STAGES = ["LEAD","SHORTLISTED","PRESENTATION","PROJECT_DEAL","PROPOSAL_SENT","WON","LOST","ON_HOLD"];
const STAGE_LABELS: Record<string,string> = { LEAD:"Lead", SHORTLISTED:"Shortlisted", PRESENTATION:"Presentation", PROJECT_DEAL:"Project Deal", PROPOSAL_SENT:"Proposal Sent", WON:"Won", LOST:"Lost", ON_HOLD:"On Hold" };
const STAGE_COLORS: Record<string,string> = { LEAD:"bg-zinc-100 border-zinc-200", SHORTLISTED:"bg-blue-50 border-blue-200", PRESENTATION:"bg-purple-50 border-purple-200", PROJECT_DEAL:"bg-indigo-50 border-indigo-200", PROPOSAL_SENT:"bg-yellow-50 border-yellow-200", WON:"bg-green-50 border-green-200", LOST:"bg-red-50 border-red-200", ON_HOLD:"bg-orange-50 border-orange-200" };
const BADGE_COLORS: Record<string,string> = { LEAD:"bg-zinc-100 text-zinc-600", SHORTLISTED:"bg-blue-100 text-blue-700", PRESENTATION:"bg-purple-100 text-purple-700", PROJECT_DEAL:"bg-indigo-100 text-indigo-700", PROPOSAL_SENT:"bg-yellow-100 text-yellow-700", WON:"bg-green-100 text-green-700", LOST:"bg-red-100 text-red-700", ON_HOLD:"bg-orange-100 text-orange-700" };

export default function PipelinePage() {
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [clients, setClients] = useState<{id: string; name: string}[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ clientId: "", title: "", stage: "LEAD", value: "" });
  const [loading, setLoading] = useState(false);
  const ic = "w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400";

  useEffect(() => {
    fetch("/api/deals").then(r => r.json()).then(setDeals).catch(() => {});
    fetch("/api/clients").then(r => r.json()).then(setClients).catch(() => {});
  }, []);

  async function addDeal() {
    if (!form.clientId || !form.title) return;
    setLoading(true);
    const res = await fetch("/api/deals", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, value: form.value ? Number(form.value) : null }),
    });
    if (res.ok) {
      const deal = await res.json();
      setDeals([...deals, deal]);
      setShowForm(false);
      setForm({ clientId: "", title: "", stage: "LEAD", value: "" });
    }
    setLoading(false);
  }

  async function moveStage(dealId: string, stage: string) {
    const res = await fetch(`/api/deals/${dealId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage }),
    });
    if (res.ok) setDeals(deals.map(d => d.id === dealId ? { ...d, stage } : d));
  }

  const fmt = (n: number) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${n.toLocaleString("en-IN")}`;
  const stageDeals = (stage: string) => deals.filter(d => d.stage === stage);
  const stageValue = (stage: string) => deals.filter(d => d.stage === stage).reduce((s, d) => s + (d.value || 0), 0);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">BD Pipeline</h1>
          <p className="text-zinc-500 text-sm">{deals.length} deals · ₹{deals.reduce((s,d) => s+(d.value||0),0).toLocaleString("en-IN")} total</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-zinc-700">
          <Plus className="w-4 h-4" /> Add Deal
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-zinc-900">New Deal</h2>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-zinc-400" /></button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Organisation *</label>
              <select value={form.clientId} onChange={e => setForm({...form, clientId: e.target.value})} className={ic}>
                <option value="">Select organisation</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Stage</label>
              <select value={form.stage} onChange={e => setForm({...form, stage: e.target.value})} className={ic}>
                {STAGES.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-zinc-700 mb-1">Deal Title *</label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className={ic} placeholder="e.g. Spatial OS — Cloudnine Whitefield" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Value (₹)</label>
              <input type="number" value={form.value} onChange={e => setForm({...form, value: e.target.value})} className={ic} placeholder="0" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={addDeal} disabled={loading} className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">{loading ? "Saving..." : "Add Deal"}</button>
            <button onClick={() => setShowForm(false)} className="border border-zinc-300 text-zinc-700 px-4 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map(stage => (
          <div key={stage} className="flex-shrink-0 w-64">
            <div className="flex items-center justify-between mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${BADGE_COLORS[stage]}`}>{STAGE_LABELS[stage]}</span>
              <span className="text-xs text-zinc-400">{stageDeals(stage).length}{stageValue(stage) > 0 ? ` · ${fmt(stageValue(stage))}` : ""}</span>
            </div>
            <div className={`min-h-32 rounded-xl border p-2 space-y-2 ${STAGE_COLORS[stage]}`}>
              {stageDeals(stage).map(deal => (
                <div key={deal.id} className="bg-white rounded-lg border border-zinc-200 p-3 shadow-sm">
                  <p className="text-sm font-medium text-zinc-900 mb-1">{deal.title}</p>
                  <p className="text-xs text-zinc-500 mb-2">{deal.clientName}</p>
                  {deal.value && <p className="text-xs font-medium text-blue-600 mb-2">{fmt(deal.value)}</p>}
                  <div className="flex gap-1 flex-wrap">
                    {STAGES.filter(s => s !== deal.stage).slice(0, 2).map(s => (
                      <button key={s} onClick={() => moveStage(deal.id, s)} className="text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded hover:bg-zinc-200">
                        → {STAGE_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {stageDeals(stage).length === 0 && <div className="text-center py-4 text-xs text-zinc-300">No deals</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
