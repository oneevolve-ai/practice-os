"use client";
import { useEffect, useState } from "react";
import { Plus, X, CheckCircle, XCircle, ChevronRight, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface Deal { id: string; title: string; stage: string; value: number | null; clientId: string; clientName: string; notes: string | null; closeDate: string | null; probability: number | null; createdAt: string; }

const CYCLE1 = [
  { key: "LEAD", label: "Lead", prob: 10, color: "bg-zinc-100 text-zinc-700", bar: "bg-zinc-400" },
  { key: "SHORTLISTED", label: "Shortlisted", prob: 25, color: "bg-blue-100 text-blue-700", bar: "bg-blue-500" },
  { key: "PRESENTATION", label: "Organisations", prob: 40, color: "bg-purple-100 text-purple-700", bar: "bg-purple-500" },
];
const CYCLE2 = [
  { key: "PROJECT_DEAL", label: "Presentation", prob: 60, color: "bg-indigo-100 text-indigo-700", bar: "bg-indigo-500" },
  { key: "PROPOSAL_SENT", label: "Proposal Sent", prob: 75, color: "bg-yellow-100 text-yellow-700", bar: "bg-yellow-500" },
  { key: "WON", label: "Won", prob: 100, color: "bg-green-100 text-green-700", bar: "bg-green-500" },
];
const PIPELINE_STAGES = [...CYCLE1, ...CYCLE2];

const NEXT_STAGE: Record<string, string> = {
  LEAD: "SHORTLISTED",
  SHORTLISTED: "PRESENTATION",
  PRESENTATION: "PROJECT_DEAL",
  PROJECT_DEAL: "PROPOSAL_SENT",
  PROPOSAL_SENT: "WON",
};

const ALL_STAGES = ["LEAD","SHORTLISTED","PRESENTATION","PROJECT_DEAL","PROPOSAL_SENT","WON","LOST","ON_HOLD"];
const STAGE_LABELS: Record<string,string> = { LEAD:"Lead", SHORTLISTED:"Shortlisted", PRESENTATION:"Presentation", PROJECT_DEAL:"Project Deal", PROPOSAL_SENT:"Proposal Sent", WON:"Won", LOST:"Lost", ON_HOLD:"On Hold" };

export default function PipelinePage() {
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [clients, setClients] = useState<{id: string; name: string}[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [activeStage, setActiveStage] = useState("LEAD");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ clientId: "", title: "", stage: "LEAD", value: "", notes: "", closeDate: "", probability: "" });
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
  const totalPipeline = deals.filter(d => !["WON","LOST"].includes(d.stage)).reduce((s, d) => s + (d.value || 0), 0);
  const wonDeals = deals.filter(d => d.stage === "WON").reduce((s, d) => s + (d.value || 0), 0);
  const activeDeals = deals.filter(d => d.stage === activeStage);
  const currentStage = PIPELINE_STAGES.find(s => s.key === activeStage);

  return (
    <div className="p-8">
      {/* Header */}
      <button onClick={() => router.push("/clients")} className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">BD Pipeline</h1>
          <p className="text-zinc-500 text-sm">{deals.length} deals · {fmt(totalPipeline)} active pipeline · {fmt(wonDeals)} won</p>
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
                {ALL_STAGES.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
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
              <input type="number" value={form.probability} onChange={e => setForm({...form, probability: e.target.value})} className={ic} placeholder="0-100" />
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
            <button onClick={addDeal} disabled={loading} className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm">{loading ? "Saving..." : "Add Deal"}</button>
            <button onClick={() => setShowForm(false)} className="border border-zinc-300 text-zinc-700 px-4 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Pipeline Progress Bar */}
      <div className="bg-white rounded-xl border border-zinc-200 p-4 mb-6">
        {/* Cycle 1 */}
        <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-2">Cycle 1 — Qualification</p>
        <div className="flex items-center gap-1 mb-4">
          {CYCLE1.map((stage, idx) => (
            <div key={stage.key} className="flex items-center flex-1">
              <button onClick={() => setActiveStage(stage.key)}
                className={`flex-1 text-center py-2 px-1 rounded-lg text-xs font-medium transition-all ${activeStage === stage.key ? `${stage.color} ring-2 ring-offset-1 ring-current` : "text-zinc-400 hover:bg-zinc-50"}`}>
                <div className="font-bold text-base">{deals.filter(d => d.stage === stage.key).length}</div>
                <div>{stage.label}</div>
                <div className="text-[10px] opacity-70">{stage.prob}%</div>
              </button>
              {idx < CYCLE1.length - 1 && <ChevronRight className="w-3 h-3 text-zinc-300 flex-shrink-0" />}
            </div>
          ))}
        </div>
        {/* Cycle 2 */}
        <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-2">Cycle 2 — Conversion</p>
        <div className="flex items-center gap-1 mb-3">
          {CYCLE2.map((stage, idx) => (
            <div key={stage.key} className="flex items-center flex-1">
              <button onClick={() => setActiveStage(stage.key)}
                className={`flex-1 text-center py-2 px-1 rounded-lg text-xs font-medium transition-all ${activeStage === stage.key ? `${stage.color} ring-2 ring-offset-1 ring-current` : "text-zinc-400 hover:bg-zinc-50"}`}>
                <div className="font-bold text-base">{deals.filter(d => d.stage === stage.key).length}</div>
                <div>{stage.label}</div>
                <div className="text-[10px] opacity-70">{stage.prob}%</div>
              </button>
              {idx < CYCLE2.length - 1 && <ChevronRight className="w-3 h-3 text-zinc-300 flex-shrink-0" />}
            </div>
          ))}
        </div>
        {/* Won/Lost/On Hold counts */}
        <div className="flex gap-4 pt-3 border-t border-zinc-100">
          {["WON","LOST","ON_HOLD"].map(s => (
            <button key={s} onClick={() => setActiveStage(s)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all ${activeStage === s ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}>
              <span className={s === "WON" ? "text-green-500" : s === "LOST" ? "text-red-500" : "text-orange-500"}>●</span>
              {STAGE_LABELS[s]} ({deals.filter(d => d.stage === s).length})
            </button>
          ))}
        </div>
      </div>

      {/* Active Stage Deals */}
      <div className="grid grid-cols-2 gap-4">
        {/* Deals List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-zinc-900">{STAGE_LABELS[activeStage]}</h2>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${currentStage?.color || "bg-zinc-100 text-zinc-600"}`}>
              {currentStage?.prob}% probability
            </span>
          </div>

          {activeDeals.length === 0 ? (
            <div className="bg-zinc-50 rounded-xl border border-zinc-200 p-8 text-center text-zinc-400 text-sm">
              No deals in {STAGE_LABELS[activeStage]}
            </div>
          ) : (
            <div className="space-y-3">
              {activeDeals.map(deal => (
                <div key={deal.id}
                  className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${selectedDeal?.id === deal.id ? "border-zinc-400 shadow-md" : "border-zinc-200 hover:shadow-sm"}`}
                  onClick={() => setSelectedDeal(deal)}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-zinc-900 text-sm">{deal.title}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">{deal.clientName}</p>
                    </div>
                    {deal.value && <span className="text-sm font-bold text-blue-600">{fmt(deal.value)}</span>}
                  </div>

                  {deal.probability && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-zinc-400 mb-1">
                        <span>Probability</span>
                        <span>{deal.probability}%</span>
                      </div>
                      <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${currentStage?.bar || "bg-zinc-400"}`} style={{ width: `${deal.probability}%` }} />
                      </div>
                    </div>
                  )}

                  {deal.closeDate && <p className="text-xs text-orange-500 mb-3">📅 {new Date(deal.closeDate).toLocaleDateString("en-IN")}</p>}

                  {/* Approve / Reject Buttons */}
                  {!["WON","LOST","ON_HOLD"].includes(activeStage) && (
                    <div className="flex gap-2 mt-2">
                      <button onClick={e => { e.stopPropagation(); moveStage(deal.id, NEXT_STAGE[activeStage] || "WON"); }}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg py-1.5 text-xs font-medium hover:bg-green-100 transition-colors">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Approve → {STAGE_LABELS[NEXT_STAGE[activeStage] || "WON"]}
                      </button>
                      <button onClick={e => { e.stopPropagation(); moveStage(deal.id, "LOST"); }}
                        className="flex items-center justify-center gap-1 bg-red-50 text-red-600 border border-red-200 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-red-100 transition-colors">
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>
                  )}

                  {activeStage === "PROPOSAL_SENT" && (
                    <div className="flex gap-2 mt-2">
                      <button onClick={e => { e.stopPropagation(); moveStage(deal.id, "WON"); }}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 text-white rounded-lg py-1.5 text-xs font-medium hover:bg-green-700">
                        <CheckCircle className="w-3.5 h-3.5" /> Mark Won
                      </button>
                      <button onClick={e => { e.stopPropagation(); moveStage(deal.id, "LOST"); }}
                        className="flex-1 flex items-center justify-center gap-1 bg-red-50 text-red-600 border border-red-200 rounded-lg py-1.5 text-xs font-medium hover:bg-red-100">
                        <XCircle className="w-3.5 h-3.5" /> Lost
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Deal Detail */}
        {selectedDeal && (
          <div className="bg-white rounded-xl border border-zinc-200 p-5 h-fit sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-zinc-900">Deal Detail</h3>
              <button onClick={() => setSelectedDeal(null)}><X className="w-4 h-4 text-zinc-400" /></button>
            </div>
            <p className="font-medium text-zinc-900 mb-1">{selectedDeal.title}</p>
            <p className="text-sm text-zinc-500 mb-4">{selectedDeal.clientName}</p>

            <div className="space-y-2 text-sm mb-4">
              {selectedDeal.value && <div className="flex justify-between"><span className="text-zinc-400">Value</span><span className="font-medium text-blue-600">{fmt(selectedDeal.value)}</span></div>}
              {selectedDeal.probability && <div className="flex justify-between"><span className="text-zinc-400">Probability</span><span className="font-medium">{selectedDeal.probability}%</span></div>}
              {selectedDeal.closeDate && <div className="flex justify-between"><span className="text-zinc-400">Close Date</span><span className="font-medium">{new Date(selectedDeal.closeDate).toLocaleDateString("en-IN")}</span></div>}
              <div className="flex justify-between"><span className="text-zinc-400">Stage</span><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PIPELINE_STAGES.find(s => s.key === selectedDeal.stage)?.color || "bg-zinc-100 text-zinc-600"}`}>{STAGE_LABELS[selectedDeal.stage]}</span></div>
            </div>

            {selectedDeal.notes && (
              <div className="bg-zinc-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-zinc-500">{selectedDeal.notes}</p>
              </div>
            )}

            <p className="text-xs font-medium text-zinc-700 mb-2">Move to stage:</p>
            <div className="space-y-1 mb-4">
              {ALL_STAGES.filter(s => s !== selectedDeal.stage).map(s => (
                <button key={s} onClick={() => moveStage(selectedDeal.id, s)}
                  className="w-full flex items-center justify-between text-xs px-3 py-2 rounded-lg hover:bg-zinc-50 text-zinc-600 border border-transparent hover:border-zinc-200">
                  <span>{STAGE_LABELS[s]}</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              ))}
            </div>
            <button onClick={() => deleteDeal(selectedDeal.id)} className="w-full text-xs text-red-500 hover:text-red-700 py-1">Delete deal</button>
          </div>
        )}
      </div>
    </div>
  );
}
