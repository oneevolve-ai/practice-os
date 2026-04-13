"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { properCase } from "@/lib/proper-case";

interface Deal { id: string; title: string; stage: string; value: number | null; notes: string | null; client: { id: string; name: string; industry: string | null; businessType: string | null; businessScale: string | null; engagementLevel: string | null; established: number | null; website: string | null; linkedIn: string | null; instagram: string | null; headquarters: string | null; officesInCities: string | null; contacts: { id: string; name: string; designation: string | null; phone: string | null; email: string | null; }[]; }; }

const STAGES = ["LEAD","SHORTLISTED","PRESENTATION","PROJECT_DEAL","PROPOSAL_SENT","WON","LOST","ON_HOLD"];

export default function DealDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/deals/${id}`).then(r => r.json()).then(setDeal).catch(() => {});
  }, [id]);

  async function moveStage(stage: string) {
    setLoading(true);
    const res = await fetch(`/api/deals/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stage }) });
    if (res.ok) setDeal(await res.json());
    setLoading(false);
  }

  async function deleteDeal() {
    if (!confirm("Delete this prospect?")) return;
    await fetch(`/api/deals/${id}`, { method: "DELETE" });
    router.push("/clients/deals");
  }

  if (!deal) return <div className="p-8 text-zinc-400">Loading...</div>;

  const currentIdx = STAGES.indexOf(deal.stage);
  const prevStage = currentIdx > 0 ? STAGES[currentIdx - 1] : null;
  const nextStage = currentIdx < STAGES.length - 1 ? STAGES[currentIdx + 1] : null;

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{deal.client.name}</h1>
          <span className="text-sm text-zinc-500">{deal.client.industry || "—"}</span>
        </div>
        <button onClick={deleteDeal} className="border border-red-200 text-red-600 px-3 py-1.5 rounded-lg text-xs hover:bg-red-50">Delete</button>
      </div>

      {/* Organisation Details */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-4">
        <h2 className="font-semibold text-zinc-900 mb-4">Organisation Details</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ["Business Type", deal.client.businessType],
            ["Business Scale", deal.client.businessScale],
            ["Engagement Level", deal.client.engagementLevel],
            ["Established", deal.client.established],
            ["Headquarters", deal.client.headquarters],
            ["Offices", deal.client.officesInCities],
          ].map(([label, value]) => value ? (
            <div key={label as string}>
              <p className="text-xs text-zinc-400">{label}</p>
              <p className="font-medium text-zinc-800">{value}</p>
            </div>
          ) : null)}
        </div>
        {(deal.client.website || deal.client.linkedIn || deal.client.instagram) && (
          <div className="flex gap-4 mt-4 pt-4 border-t border-zinc-100">
            {deal.client.website && <a href={deal.client.website} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">Website</a>}
            {deal.client.linkedIn && <a href={deal.client.linkedIn} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">LinkedIn</a>}
            {deal.client.instagram && <a href={`https://instagram.com/${deal.client.instagram}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">Instagram</a>}
          </div>
        )}
      </div>

      {/* People */}
      {deal.client.contacts.length > 0 && (
        <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-4">
          <h2 className="font-semibold text-zinc-900 mb-4">People</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {deal.client.contacts.map(c => (
              <div key={c.id} className="border border-zinc-100 rounded-lg p-3">
                <p className="font-medium text-zinc-900 text-sm">{c.name}</p>
                {c.designation && <p className="text-xs text-zinc-500">{c.designation}</p>}
                {c.phone && <p className="text-xs text-zinc-500 mt-1">{c.phone}</p>}
                {c.email && <p className="text-xs text-zinc-500">{c.email}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {deal.notes && (
        <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-4">
          <h2 className="font-semibold text-zinc-900 mb-2">Notes</h2>
          <p className="text-sm text-zinc-600">{deal.notes}</p>
        </div>
      )}

      {/* Stage Navigation */}
      <div className="bg-white rounded-xl border border-zinc-200 p-4 flex items-center justify-between">
        <button onClick={() => prevStage && moveStage(prevStage)} disabled={!prevStage || loading} className="px-4 py-2 rounded-lg border border-zinc-200 text-sm text-zinc-600 hover:bg-zinc-50 disabled:opacity-30">
          ← {prevStage ? properCase(prevStage) : "—"}
        </button>
        <span className="px-4 py-2 rounded-full bg-zinc-900 text-white text-sm font-medium">{properCase(deal.stage)}</span>
        <button onClick={() => nextStage && moveStage(nextStage)} disabled={!nextStage || loading} className="px-4 py-2 rounded-lg border border-zinc-200 text-sm text-zinc-600 hover:bg-zinc-50 disabled:opacity-30">
          {nextStage ? properCase(nextStage) : "—"} →
        </button>
      </div>
    </div>
  );
}
