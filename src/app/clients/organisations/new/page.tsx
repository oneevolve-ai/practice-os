"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewOrganisationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const ic = "w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const f = new FormData(e.currentTarget);
    const body = {
      name: f.get("name"), uin: f.get("uin"),
      industry: f.get("industry"), businessType: f.get("businessType"),
      businessScale: f.get("businessScale"), engagementLevel: f.get("engagementLevel"),
      established: f.get("established"), accountManager: f.get("accountManager"),
      website: f.get("website"), linkedIn: f.get("linkedIn"),
      instagram: f.get("instagram"), email: f.get("email"),
      phone: f.get("phone"), headquarters: f.get("headquarters"),
      officesInCities: f.get("officesInCities"), gstin: f.get("gstin"),
      pan: f.get("pan"), notes: f.get("notes"), status: "ACTIVE",
    };
    const res = await fetch("/api/clients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { const c = await res.json(); router.push(`/clients/organisations/${c.id}`); }
    else { alert("Failed to create organisation"); setLoading(false); }
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-zinc-900 mb-1">Add Organisation</h1>
      <p className="text-zinc-500 text-sm mb-6">Add a new client or organisation</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="font-semibold text-zinc-900 mb-4">Organisation Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="block text-sm font-medium text-zinc-700 mb-1">Organisation Name *</label><input name="name" required className={ic} /></div>
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">UIN</label><input name="uin" className={ic} placeholder="Unique ID" /></div>
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">Industry</label><input name="industry" className={ic} placeholder="e.g. Healthcare" /></div>
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">Business Type</label><input name="businessType" className={ic} placeholder="e.g. Pvt Ltd" /></div>
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">Business Scale</label>
              <select name="businessScale" className={ic}>
                <option value="">Select</option>
                {["Startup","SME","Mid-Market","Enterprise","MNC"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">Engagement Level</label>
              <select name="engagementLevel" className={ic}>
                <option value="">Select</option>
                {["Cold","Warm","Hot","Active"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">Established Year</label><input name="established" type="number" className={ic} placeholder="2010" /></div>
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">Account Manager</label><input name="accountManager" className={ic} /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="font-semibold text-zinc-900 mb-4">Contact & Social</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">Email</label><input name="email" type="email" className={ic} /></div>
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">Phone</label><input name="phone" className={ic} /></div>
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">Website</label><input name="website" className={ic} placeholder="https://" /></div>
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">LinkedIn</label><input name="linkedIn" className={ic} /></div>
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">Instagram</label><input name="instagram" className={ic} placeholder="@handle" /></div>
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">Headquarters</label><input name="headquarters" className={ic} /></div>
            <div className="col-span-2"><label className="block text-sm font-medium text-zinc-700 mb-1">Offices in Cities</label><input name="officesInCities" className={ic} placeholder="Mumbai, Delhi, Bengaluru" /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="font-semibold text-zinc-900 mb-4">Tax & Legal</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">GST Number</label><input name="gstin" className={ic} /></div>
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">PAN Number</label><input name="pan" className={ic} /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="font-semibold text-zinc-900 mb-4">Notes</h2>
          <textarea name="notes" className={ic} rows={3} placeholder="Any notes..." />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="bg-zinc-900 text-white px-6 py-2 rounded-lg text-sm hover:bg-zinc-700 disabled:opacity-50">{loading ? "Saving..." : "Add Organisation"}</button>
          <button type="button" onClick={() => router.back()} className="border border-zinc-300 text-zinc-700 px-6 py-2 rounded-lg text-sm">Cancel</button>
        </div>
      </form>
    </div>
  );
}
