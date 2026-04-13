"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewExpensePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const ic = "w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const f = new FormData(e.currentTarget);
    const body = { category: f.get("category"), description: f.get("description"), amount: Number(f.get("amount")), gstAmount: Number(f.get("gstAmount") || 0), projectName: f.get("projectName"), date: f.get("date") };
    const res = await fetch("/api/expenses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) router.push("/money/expenses");
    else { alert("Failed"); setLoading(false); }
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-zinc-900 mb-1">Add Expense</h1>
      <p className="text-zinc-500 text-sm mb-6">Record a business expense</p>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-zinc-700 mb-1">Date</label><input name="date" type="date" required className={ic} defaultValue={new Date().toISOString().slice(0,10)} /></div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Category</label>
            <select name="category" required className={ic}>
              <option value="">Select category</option>
              {["Travel","Software","Hardware","Office","Meals","Marketing","Professional Fees","Hosting","Other"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="col-span-2"><label className="block text-sm font-medium text-zinc-700 mb-1">Description</label><input name="description" required className={ic} placeholder="What was this expense for?" /></div>
          <div><label className="block text-sm font-medium text-zinc-700 mb-1">Amount (₹)</label><input name="amount" type="number" required className={ic} placeholder="0" /></div>
          <div><label className="block text-sm font-medium text-zinc-700 mb-1">GST Amount (₹)</label><input name="gstAmount" type="number" className={ic} placeholder="0" /></div>
          <div className="col-span-2"><label className="block text-sm font-medium text-zinc-700 mb-1">Project (optional)</label><input name="projectName" className={ic} placeholder="Project name" /></div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="bg-zinc-900 text-white px-6 py-2 rounded-lg text-sm hover:bg-zinc-700 disabled:opacity-50">{loading ? "Saving..." : "Save Expense"}</button>
          <button type="button" onClick={() => router.back()} className="border border-zinc-300 text-zinc-700 px-6 py-2 rounded-lg text-sm">Cancel</button>
        </div>
      </form>
    </div>
  );
}
