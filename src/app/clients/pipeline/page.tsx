"use client";
import { useEffect, useState } from "react";
import { properCase } from "@/lib/proper-case";
import { Plus, X, ChevronRight } from "lucide-react";

interface Deal { id: string; title: string; stage: string; value: number | null; clientId: string; clientName: string; notes: string | null; closeDate: string | null; probability: number | null; createdAt: string; }

const STAGES = ["LEAD","SHORTLISTED","PRESENTATION","PROJECT_DEAL","PROPOSAL_SENT","WON","LOST","ON_HOLD"];
const STAGE_LABELS: Record<string,string> = { LEAD:"Lead", SHORTLISTED:"Shortlisted", PRESENTATION:"Presentation", PROJECT_DEAL:"Project Deal", PROPOSAL_SENT:"Proposal Sent", WON:"Won", LOST:"Lost", ON_HOLD:"On Hold" };
const STAGE_COLORS: Record<string,string> = { LEAD:"bg-zinc-50 border-zinc-200", SHORTLISTED:"bg-blue-50 border-blue-200", PRESENTATION:"bg-purple-50 border-purple-200", PROJECT_DEAL:"bg-indigo-50 border-indigo-200", PROPOSAL_SENT:"bg-yellow-50 border-yellow-200", WON:"bg-green-50 border-green-200", LOST:"bg-red-50 border-red-200", ON_HOLD:"bg-orange-50 border-orange-200" };
const BADGE_COLORS: Record<string,string> = { LEAD:"bg-zinc-100 text-zinc-600", SHORTLISTED:"bg-blue-100 text-blue-700", PRESENTATION:"bg-purple-100 text-purple-700", PROJECT_DEAL:"bg-indigo-100 text-indigo-700", PROPOSAL_SENT:"bg-yellow-100 text-yellow-700", WON:"bg-green-100 text-green-700", LOST:"bg-red-100 text-red-700", ON_HOLD:"bg-orange-100 text-orange-700" };

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [clients, setClients] = useState<{id: string; name: string}[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [form, setForm] = useState({ clientId: "", title: "", stage: "LEAD", value: "", notes: "", closeDate: "", probability: "" });
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
      body: JSON.stringify({ ...form, value: form.value ? Number(form.value) : null, probability: form.probability ? Number(form.probability) : null }),
    });
    if (res.ok) {
      const deal = await res.json();
      setDeals([...deals, deal]);
      setShowForm(false);
      setForm({ clientId: "", title: "", stage: "LEAD", value: "", notes: "", closeDate: "", probability: "" });
    }
    setLoading(false);
  }

  async function moveStage(dealId: string, stage: string) {
    const res = await fetch(`/api/deals/${dealId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage }),
    });
    if (res.ok) {
      setDeals(deals.map(d => d.id === dealId ? { ...d, stage } : d));
      if (selectedDeal?.id === dealId) setSelectedDeal({ ...selectedDeal, stage });
    }
  }

  async function deleteDeal(dealId: string) {
    if (!confirm("Delete this deal?")) return;
    await fetch(`/api/deals/${dealId}`, { method: "DELETE" });
    setDeals(deals.filter(d => d.id !== dealId));
    setSelectedDeal(null);
  }

  const fmt = (n: number) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${n.toLocaleString("en-IN")}`;
  const stageDeals = (stage: string) => deals.filter(d => d.stage === stage);
  const stageValue = (stage: string) => deals.filter(d => d.stage === stage).reduce((s, d) => s + (d.value || 0), 0);
  const totalPipeline = deals.filter(d => !["WON","LOST"].includes(d.stage)).reduce((s, d) => s + (d.value || 0), 0);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">BD Pipeline</h1>
          <p className="text-zinc-500 text-sm">{deals.length} deals · {fmt(totalPipeline)} pipeline</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-zinc-700">
          <Plus className="w-4 h-4" /> Add Deal
        </button>
      </div>

      {/* Add Deal Form */}
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
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Probability (%)</label>
              <input type="number" value={form.probability} onChange={e => setForm({...form, probability: e.target.value})} className={ic} placeholder="0-100" min="0" max="100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Expected Close Date</label>
              <input type="date" value={form.closeDate} onChange={e => setForm({...form, closeDate: e.target.value})} className={ic} />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Notes</label>
              <input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className={ic} placeholder="Any notes..." />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={addDeal} disabled={loading} className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">{loading ? "Saving..." : "Add Deal"}</button>
            <button onClick={() => setShowForm(false)} className="border border-zinc-300 text-zinc-700 px-4 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        {/* Kanban Board */}
        <div className="flex-1 flex gap-3 overflow-x-auto pb-4">
          {STAGES.map(stage => (
            <div key={stage} className="flex-shrink-0 w-56">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${BADGE_COLORS[stage]}`}>{STAGE_LABELS[stage]}</span>
                <span className="text-xs text-zinc-400">{stageDeals(stage).length}{stageValue(stage) > 0 ? ` · ${fmt(stageValue(stage))}` : ""}</span>
              </div>
              <div className={`min-h-24 rounded-xl border p-2 space-y-2 ${STAGE_COLORS[stage]}`}>
                {stageDeals(stage).map(deal => (
                  <div key={deal.id} onClick={() => setSelectedDeal(deal)} className="bg-white rounded-lg border border-zinc-200 p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                    <p className="text-xs font-medium text-zinc-900 mb-1 line-clamp-2">{deal.title}</p>
                    <p className="text-xs text-zinc-400 mb-1">{deal.clientName}</p>
                    <div className="flex items-center justify-between">
                      {deal.value ? <span className="text-xs font-medium text-blue-600">{fmt(deal.value)}</span> : <span/>}
                      {deal.probability && <span className="text-xs text-zinc-400">{deal.probability}%</span>}
                    </div>
                    {deal.closeDate && <p className="text-xs text-orange-500 mt-1">📅 {new Date(deal.closeDate).toLocaleDateString("en-IN")}</p>}
                  </div>
                ))}
                {stageDeals(stage).length === 0 && <div className="text-center py-4 text-xs text-zinc-300">Empty</div>}
              </div>
            </div>
          ))}
        </div>

        {/* Deal Detail Panel */}
        {selectedDeal && (
          <div className="w-72 flex-shrink-0 bg-white rounded-xl border border-zinc-200 p-4 h-fit">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-zinc-900 text-sm">Deal Detail</h3>
              <button onClick={() => setSelectedDeal(null)}><X className="w-4 h-4 text-zinc-400" /></button>
            </div>
            <p className="text-sm font-medium text-zinc-900 mb-1">{selectedDeal.title}</p>
            <p className="text-xs text-zinc-500 mb-3">{selectedDeal.clientName}</p>
            <div className="space-y-2 text-xs mb-4">
              {selectedDeal.value && <div className="flex justify-between"><span className="text-zinc-400">Value</span><span className="font-medium">{fmt(selectedDeal.value)}</span></div>}
              {selectedDeal.probability && <div className="flex justify-between"><span className="text-zinc-400">Probability</span><span className="font-medium">{selectedDeal.probability}%</span></div>}
              {selectedDeal.closeDate && <div className="flex justify-between"><span className="text-zinc-400">Close Date</span><span className="font-medium">{new Date(selectedDeal.closeDate).toLocaleDateString("en-IN")}</span></div>}
              {selectedDeal.notes && <div><span className="text-zinc-400">Notes</span><p className="mt-1 text-zinc-600">{selectedDeal.notes}</p></div>}
            </div>
            <p className="text-xs font-medium text-zinc-700 mb-2">Move to stage:</p>
            <div className="space-y-1">
              {STAGES.filter(s => s !== selectedDeal.stage).map(s => (
                <button key={s} onClick={() => moveStage(selectedDeal.id, s)} className="w-full flex items-center justify-between text-xs px-2 py-1.5 rounded-lg hover:bg-zinc-50 text-zinc-600">
                  <span>{STAGE_LABELS[s]}</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              ))}
            </div>
            <button onClick={() => deleteDeal(selectedDeal.id)} className="w-full mt-3 text-xs text-red-500 hover:text-red-700 py-1">Delete deal</button>
          </div>
        )}
      </div>
    </div>
  );
}
