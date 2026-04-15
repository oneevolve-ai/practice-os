"use client";
import { BackButton } from "@/components/back-button";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { properCase } from "@/lib/proper-case";

interface Deal { id: string; title: string; stage: string; value: number | null; createdAt: string; client: { id: string; name: string; industry: string | null; headquarters: string | null; }; }

const STAGES = ["LEAD","SHORTLISTED","PRESENTATION","PROJECT_DEAL","PROPOSAL_SENT","WON","LOST","ON_HOLD"];
const STAGE_COLORS: Record<string, string> = { LEAD: "bg-zinc-100", SHORTLISTED: "bg-blue-50", PRESENTATION: "bg-purple-50", PROJECT_DEAL: "bg-indigo-50", PROPOSAL_SENT: "bg-yellow-50", WON: "bg-green-50", LOST: "bg-red-50", ON_HOLD: "bg-orange-50" };
const STAGE_BADGE: Record<string, string> = { LEAD: "bg-zinc-200 text-zinc-700", SHORTLISTED: "bg-blue-100 text-blue-700", PRESENTATION: "bg-purple-100 text-purple-700", PROJECT_DEAL: "bg-indigo-100 text-indigo-700", PROPOSAL_SENT: "bg-yellow-100 text-yellow-700", WON: "bg-green-100 text-green-700", LOST: "bg-red-100 text-red-700", ON_HOLD: "bg-orange-100 text-orange-700" };

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    fetch("/api/deals").then(r => r.json()).then(setDeals).catch(() => {});
  }, []);

  async function moveStage(dealId: string, stage: string) {
    const res = await fetch(`/api/deals/${dealId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stage }) });
    if (res.ok) setDeals(deals.map(d => d.id === dealId ? { ...d, stage } : d));
  }

  return (
    <div className="p-8">
      <BackButton href="/clients" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Business Development Pipeline</h1>
          <p className="text-zinc-500 text-sm">{deals.length} prospects</p>
        </div>
        <Link href="/clients/deals/new" className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-zinc-700">
          <Plus className="w-4 h-4" /> Prospect
        </Link>
      </div>

      <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
        {STAGES.map(stage => (
          <div key={stage} className={`rounded-xl p-3 ${STAGE_COLORS[stage]} min-h-48`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STAGE_BADGE[stage]}`}>{properCase(stage)}</span>
              <span className="text-xs text-zinc-400">{deals.filter(d => d.stage === stage).length}</span>
            </div>
            <div className="space-y-2">
              {deals.filter(d => d.stage === stage).map(deal => (
                <div key={deal.id} className="bg-white rounded-lg p-3 shadow-sm border border-zinc-100">
                  <Link href={`/clients/deals/${deal.id}`}>
                    <p className="font-medium text-zinc-900 text-xs hover:text-blue-600">{deal.client.name}</p>
                    {deal.client.industry && <p className="text-xs text-zinc-400 mt-0.5">{deal.client.industry}</p>}
                    {deal.value && <p className="text-xs font-medium text-green-600 mt-1">₹{deal.value.toLocaleString("en-IN")}</p>}
                  </Link>
                  <div className="flex gap-1 mt-2">
                    {STAGES.indexOf(stage) > 0 && (
                      <button onClick={() => moveStage(deal.id, STAGES[STAGES.indexOf(stage)-1])} className="text-xs text-zinc-400 hover:text-zinc-600">←</button>
                    )}
                    {STAGES.indexOf(stage) < STAGES.length-1 && (
                      <button onClick={() => moveStage(deal.id, STAGES[STAGES.indexOf(stage)+1])} className="text-xs text-zinc-400 hover:text-zinc-600 ml-auto">→</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
