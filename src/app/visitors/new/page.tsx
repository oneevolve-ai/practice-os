"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewVisitorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const ic = "w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const f = new FormData(e.currentTarget);
    const date = f.get("expectedDate") as string;
    const time = f.get("expectedTime") as string;
    const expectedTime = date && time ? new Date(`${date}T${time}`) : null;
    const body = {
      name: f.get("name"), company: f.get("company"),
      phone: f.get("phone"), email: f.get("email"),
      purpose: f.get("purpose"), hostName: f.get("hostName"),
      hostPhone: f.get("hostPhone"), notes: f.get("notes"),
      expectedTime,
    };
    const res = await fetch("/api/visitors", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) router.push("/visitors");
    else { alert("Failed"); setLoading(false); }
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-zinc-900 mb-1">Register Visitor</h1>
      <p className="text-zinc-500 text-sm mb-6">Pre-register an expected visitor</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="font-semibold text-zinc-900 mb-4">Visitor Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="block text-sm font-medium text-zinc-700 mb-1">Full Name *</label><input name="name" required className={ic} placeholder="Visitor name" /></div>
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">Company</label><input name="company" className={ic} placeholder="Company name" /></div>
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">Phone</label><input name="phone" className={ic} placeholder="Mobile number" /></div>
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">Email</label><input name="email" type="email" className={ic} /></div>
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">Purpose</label><input name="purpose" className={ic} placeholder="Meeting, Interview, Delivery..." /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="font-semibold text-zinc-900 mb-4">Host & Schedule</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">Host Name</label><input name="hostName" className={ic} placeholder="Who are they meeting?" /></div>
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">Host Phone</label><input name="hostPhone" className={ic} placeholder="Host mobile" /></div>
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">Expected Date</label><input name="expectedDate" type="date" className={ic} defaultValue={new Date().toISOString().slice(0,10)} /></div>
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">Expected Time</label><input name="expectedTime" type="time" className={ic} /></div>
            <div className="col-span-2"><label className="block text-sm font-medium text-zinc-700 mb-1">Notes</label><textarea name="notes" className={ic} rows={2} placeholder="Any additional notes..." /></div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="bg-zinc-900 text-white px-6 py-2 rounded-lg text-sm hover:bg-zinc-700 disabled:opacity-50">{loading ? "Registering..." : "Register Visitor"}</button>
          <button type="button" onClick={() => router.back()} className="border border-zinc-300 text-zinc-700 px-6 py-2 rounded-lg text-sm">Cancel</button>
        </div>
      </form>
    </div>
  );
}
