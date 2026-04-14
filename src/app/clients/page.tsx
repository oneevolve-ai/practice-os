"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, Users, FileText, Activity } from "lucide-react";

interface Client { id: string; name: string; status: string; engagementLevel: string | null; deals: { id: string; stage: string; value: number | null }[]; proposals: { id: string; status: string; value: number | null }[]; }

const STAGES = ["LEAD","SHORTLISTED","PRESENTATION","PROJECT_DEAL","PROPOSAL_SENT","WON","LOST","ON_HOLD"];
const STAGE_LABELS: Record<string,string> = { LEAD:"Lead", SHORTLISTED:"Shortlisted", PRESENTATION:"Presentation", PROJECT_DEAL:"Project Deal", PROPOSAL_SENT:"Proposal Sent", WON:"Won", LOST:"Lost", ON_HOLD:"On Hold" };
const STAGE_COLORS: Record<string,string> = { LEAD:"bg-zinc-200", SHORTLISTED:"bg-blue-300", PRESENTATION:"bg-purple-300", PROJECT_DEAL:"bg-indigo-300", PROPOSAL_SENT:"bg-yellow-300", WON:"bg-green-400", LOST:"bg-red-300", ON_HOLD:"bg-orange-300" };

export default function CRMDashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  

  useEffect(() => {
    fetch("/api/clients").then(r => r.json()).then(data => { setClients(data); }).catch(() => {});
  }, []);

  

  const totalClients = clients.length;
  const allDeals = clients.flatMap(c => c.deals || []);
  const allProposals = clients.flatMap(c => c.proposals || []);
  const wonDeals = allDeals.filter(d => d.stage === "WON");
  const wonValue = wonDeals.reduce((s, d) => s + (d.value || 0), 0);
  const pipelineValue = allDeals.filter(d => !["WON","LOST"].includes(d.stage)).reduce((s, d) => s + (d.value || 0), 0);
  const conversionRate = allDeals.length > 0 ? Math.round((wonDeals.length / allDeals.length) * 100) : 0;
  const fmt = (n: number) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : n > 0 ? `₹${n.toLocaleString("en-IN")}` : "₹0";

  const stageCounts = STAGES.map(stage => ({
    stage, label: STAGE_LABELS[stage],
    count: allDeals.filter(d => d.stage === stage).length,
    value: allDeals.filter(d => d.stage === stage).reduce((s, d) => s + (d.value || 0), 0),
  }));

  const topClients = [...clients]
    .map(c => ({ ...c, totalValue: c.deals.reduce((s, d) => s + (d.value || 0), 0) }))
    .filter(c => c.totalValue > 0)
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 5);

  const engagementMap: Record<string, number> = {};
  clients.forEach(c => { const e = c.engagementLevel || "Unknown"; engagementMap[e] = (engagementMap[e] || 0) + 1; });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">CRM Dashboard</h1>
          <p className="text-zinc-500 text-sm">Pipeline overview and activity</p>
        </div>
        <div className="flex gap-2">
          <Link href="/clients/organisations" className="border border-zinc-300 text-zinc-700 px-3 py-1.5 rounded-lg text-sm hover:bg-zinc-50">Organisations</Link>
          <Link href="/clients/pipeline" className="border border-zinc-300 text-zinc-700 px-3 py-1.5 rounded-lg text-sm hover:bg-zinc-50">Pipeline</Link>
          <Link href="/clients/activity" className="border border-zinc-300 text-zinc-700 px-3 py-1.5 rounded-lg text-sm hover:bg-zinc-50">Activity</Link>
          <Link href="/clients/proposals" className="bg-zinc-900 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-zinc-700">Proposals</Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Organisations", value: totalClients, icon: Users, color: "text-zinc-700" },
          { label: "Won Value", value: fmt(wonValue), icon: TrendingUp, color: "text-green-600" },
          { label: "Pipeline Value", value: fmt(pipelineValue), icon: FileText, color: "text-blue-600" },
          { label: "Conversion Rate", value: `${conversionRate}%`, icon: Activity, color: "text-purple-600" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-zinc-200 p-5">
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-zinc-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Pipeline Funnel */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="font-semibold text-zinc-900 mb-4">Pipeline Funnel</h2>
          {stageCounts.every(s => s.count === 0) ? (
            <p className="text-sm text-zinc-400 text-center py-8">No deals yet — add deals via BD Pipeline</p>
          ) : (
            <div className="space-y-3">
              {stageCounts.filter(s => s.count > 0).map(s => {
                const maxCount = Math.max(...stageCounts.map(x => x.count), 1);
                const width = Math.round((s.count / maxCount) * 100);
                return (
                  <div key={s.stage}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-zinc-600">{s.label}</span>
                      <span className="text-zinc-400">{s.count}{s.value > 0 ? ` · ${fmt(s.value)}` : ""}</span>
                    </div>
                    <div className="w-full h-5 bg-zinc-100 rounded-lg overflow-hidden">
                      <div className={`h-full rounded-lg ${STAGE_COLORS[s.stage]}`} style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Engagement Breakdown */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="font-semibold text-zinc-900 mb-4">Engagement Breakdown</h2>
          <div className="space-y-3">
            {Object.entries(engagementMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([level, count]) => {
              const pct = Math.round((count / totalClients) * 100);
              return (
                <div key={level}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-zinc-600 truncate">{level}</span>
                    <span className="text-zinc-400 ml-2">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-4 bg-zinc-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Clients */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="font-semibold text-zinc-900 mb-4">Top Clients by Deal Value</h2>
          {topClients.length === 0 ? (
            <p className="text-sm text-zinc-400 text-center py-8">No deal values recorded yet</p>
          ) : (
            <div className="space-y-3">
              {topClients.map((c, i) => (
                <div key={c.id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-zinc-300 w-4">{i + 1}</span>
                  <div className="flex-1">
                    <Link href={`/clients/organisations/${c.id}`} className="text-sm font-medium text-blue-600 hover:underline">{c.name}</Link>
                    <p className="text-xs text-zinc-400">{c.deals.length} deals</p>
                  </div>
                  <span className="text-sm font-bold text-zinc-900">{fmt(c.totalValue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Proposal Summary */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="font-semibold text-zinc-900 mb-4">Proposal Summary</h2>
          <div className="grid grid-cols-3 gap-3">
            {["DRAFT","SENT","VIEWED","WON","LOST"].map(status => {
              const count = allProposals.filter(p => p.status === status).length;
              const value = allProposals.filter(p => p.status === status).reduce((s, p) => s + (p.value || 0), 0);
              return (
                <div key={status} className="bg-zinc-50 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-zinc-900">{count}</p>
                  <p className="text-xs text-zinc-500">{status}</p>
                  {value > 0 && <p className="text-xs text-blue-600 mt-1">{fmt(value)}</p>}
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-100 flex justify-between text-sm">
            <span className="text-zinc-500">Total proposals</span>
            <span className="font-medium text-zinc-900">{allProposals.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
