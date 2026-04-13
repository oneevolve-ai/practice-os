"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const ic = "w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const f = new FormData(e.currentTarget);
    const body = {
      name: f.get("name"), code: f.get("code"), clientName: f.get("clientName"),
      type: f.get("type"), status: f.get("status"), billingType: f.get("billingType"),
      startDate: f.get("startDate"), endDate: f.get("endDate"),
      budget: f.get("budget"), description: f.get("description"),
    };
    const res = await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { const p = await res.json(); router.push(`/projects/${p.id}`); }
    else { alert("Failed to create project"); setLoading(false); }
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-zinc-900 mb-1">New Project</h1>
      <p className="text-zinc-500 text-sm mb-6">Create a new project</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="font-semibold text-zinc-900 mb-4">Project Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="block text-sm font-medium text-zinc-700 mb-1">Project Name *</label><input name="name" required className={ic} placeholder="e.g. Cloudnine Whitefield Digital Twin" /></div>
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">Project Code</label><input name="code" className={ic} placeholder="e.g. OE-2026-001" /></div>
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">Client Name</label><input name="clientName" className={ic} placeholder="e.g. Cloudnine Care" /></div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Type</label>
              <select name="type" className={ic}>
                {["Digital Twin","Spatial OS Onboarding","Off Court Setup","Platform Development","Consulting"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Status</label>
              <select name="status" className={ic}>
                {["PLANNING","ACTIVE","ON_HOLD","COMPLETED","ARCHIVED"].map(s => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Billing Type</label>
              <select name="billingType" className={ic}>
                {["Fixed Fee","Time & Materials","Retainer","Subscription"].map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">Budget (₹)</label><input name="budget" type="number" className={ic} placeholder="0" /></div>
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">Start Date</label><input name="startDate" type="date" className={ic} /></div>
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">End Date</label><input name="endDate" type="date" className={ic} /></div>
            <div className="col-span-2"><label className="block text-sm font-medium text-zinc-700 mb-1">Description</label><textarea name="description" className={ic} rows={3} placeholder="Project description and scope..." /></div>
          </div>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="bg-zinc-900 text-white px-6 py-2 rounded-lg text-sm hover:bg-zinc-700 disabled:opacity-50">{loading ? "Creating..." : "Create Project"}</button>
          <button type="button" onClick={() => router.back()} className="border border-zinc-300 text-zinc-700 px-6 py-2 rounded-lg text-sm">Cancel</button>
        </div>
      </form>
    </div>
  );
}
