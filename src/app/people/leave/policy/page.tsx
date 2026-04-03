"use client";

import { useEffect, useState } from "react";
import { Save, Settings } from "lucide-react";
import { PeopleSubNav } from "@/components/people/people-sub-nav";

interface Policy {
  id: string; leaveType: string; allocation: number; carryForward: boolean;
  maxCarryDays: number; minAdvanceDays: number; maxConsecutive: number; isUnlimited: boolean;
}

const typeLabels: Record<string, string> = { CASUAL: "Casual", SICK: "Sick", EARNED: "Earned", UNPAID: "Unpaid", COMP_OFF: "Comp Off" };
const ic = "border border-zinc-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 w-full";

export default function LeavePolicyPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/leave/policy").then((r) => r.json()).then(setPolicies).finally(() => setLoading(false));
  }, []);

  function updatePolicy(index: number, field: string, value: unknown) {
    setPolicies((prev) => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  }

  async function handleSave() {
    setSaving(true);
    await fetch("/api/leave/policy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ policies }),
    });
    setSaving(false);
    alert("Leave policies saved!");
  }

  return (
    <div className="p-8">
      <PeopleSubNav />
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-zinc-900">Leave Policy</h1><p className="text-zinc-500 mt-1">Configure leave allocations and rules</p></div>
        <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 bg-zinc-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-800 disabled:opacity-50">
          <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save All"}
        </button>
      </div>

      {loading ? <div className="text-center py-12 text-zinc-400">Loading...</div> : (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-zinc-100 bg-zinc-50">
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Leave Type</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Annual Allocation</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Carry Forward</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Max Carry Days</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Min Advance (days)</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Max Consecutive</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Unlimited</th>
            </tr></thead>
            <tbody>
              {policies.map((p, i) => (
                <tr key={p.id} className="border-b border-zinc-50">
                  <td className="px-4 py-3 font-medium text-zinc-900">{typeLabels[p.leaveType] || p.leaveType}</td>
                  <td className="px-4 py-2"><input type="number" min="0" value={p.allocation} onChange={(e) => updatePolicy(i, "allocation", parseInt(e.target.value) || 0)} className={ic} disabled={p.isUnlimited} /></td>
                  <td className="px-4 py-2 text-center"><input type="checkbox" checked={p.carryForward} onChange={(e) => updatePolicy(i, "carryForward", e.target.checked)} className="rounded border-zinc-300" /></td>
                  <td className="px-4 py-2"><input type="number" min="0" value={p.maxCarryDays} onChange={(e) => updatePolicy(i, "maxCarryDays", parseInt(e.target.value) || 0)} className={ic} disabled={!p.carryForward} /></td>
                  <td className="px-4 py-2"><input type="number" min="0" value={p.minAdvanceDays} onChange={(e) => updatePolicy(i, "minAdvanceDays", parseInt(e.target.value) || 0)} className={ic} /></td>
                  <td className="px-4 py-2"><input type="number" min="0" value={p.maxConsecutive} onChange={(e) => updatePolicy(i, "maxConsecutive", parseInt(e.target.value) || 0)} className={ic} /></td>
                  <td className="px-4 py-2 text-center"><input type="checkbox" checked={p.isUnlimited} onChange={(e) => updatePolicy(i, "isUnlimited", e.target.checked)} className="rounded border-zinc-300" /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 bg-zinc-50 border-t border-zinc-100 text-xs text-zinc-500 flex items-center gap-2">
            <Settings className="w-3.5 h-3.5" /> Set Max Consecutive to 0 for unlimited consecutive days
          </div>
        </div>
      )}
    </div>
  );
}
