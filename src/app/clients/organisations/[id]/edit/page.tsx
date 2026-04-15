"use client";
import { BackButton } from "@/components/back-button";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditOrganisationPage() {
  const { id } = useParams();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const ic = "w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400";

  useEffect(() => {
    fetch(`/api/clients/${id}`).then(r => r.json()).then(data => {
      setForm({
        name: data.name || "", uin: data.uin || "",
        industry: data.industry || "", businessType: data.businessType || "",
        businessScale: data.businessScale || "", engagementLevel: data.engagementLevel || "",
        established: data.established?.toString() || "", accountManager: data.accountManager || "",
        website: data.website || "", linkedIn: data.linkedIn || "",
        instagram: data.instagram || "", email: data.email || "",
        phone: data.phone || "", headquarters: data.headquarters || "",
        officesInCities: data.officesInCities || "", gstin: data.gstin || "",
        pan: data.pan || "", notes: data.notes || "", status: data.status || "PROSPECT",
      });
    }).catch(() => {});
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/clients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, established: form.established ? parseInt(form.established) : null }),
    });
    if (res.ok) router.push(`/clients/organisations/${id}`);
    else { alert("Failed to save"); setSaving(false); }
  }

  const field = (label: string, key: string, type = "text") => (
    <div>
      <label className="block text-sm font-medium text-zinc-700 mb-1">{label}</label>
      <input type={type} value={form[key] || ""} onChange={e => setForm({...form, [key]: e.target.value})} className={ic} />
    </div>
  );

  const select = (label: string, key: string, options: string[]) => (
    <div>
      <label className="block text-sm font-medium text-zinc-700 mb-1">{label}</label>
      <select value={form[key] || ""} onChange={e => setForm({...form, [key]: e.target.value})} className={ic}>
        <option value="">Select</option>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Edit Organisation</h1>
          <p className="text-zinc-500 text-sm">{form.name}</p>
        </div>
        <button onClick={() => router.back()} className="text-sm text-zinc-500 hover:text-zinc-700">← Back</button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="font-semibold text-zinc-900 mb-4">Organisation Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">{field("Organisation Name *", "name")}</div>
            {field("UIN", "uin")}
            {field("Industry", "industry")}
            {field("Business Type", "businessType")}
            {select("Business Scale", "businessScale", ["Startup","SME","Mid-Market","Enterprise","MNC"])}
            {select("Engagement Level", "engagementLevel", ["Cold","Warm","Hot","Active","In Loop","Meeting Done","Proposal Sent"])}
            {field("Established Year", "established", "number")}
            {field("Account Manager", "accountManager")}
            {select("Status", "status", ["PROSPECT","ACTIVE","INACTIVE","CHURNED"])}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="font-semibold text-zinc-900 mb-4">Contact & Social</h2>
          <div className="grid grid-cols-2 gap-4">
            {field("Email", "email", "email")}
            {field("Phone", "phone")}
            {field("Website", "website")}
            {field("LinkedIn", "linkedIn")}
            {field("Instagram", "instagram")}
            {field("Headquarters", "headquarters")}
            <div className="col-span-2">{field("Offices in Cities", "officesInCities")}</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="font-semibold text-zinc-900 mb-4">Tax & Legal</h2>
          <div className="grid grid-cols-2 gap-4">
            {field("GST Number", "gstin")}
            {field("PAN Number", "pan")}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="font-semibold text-zinc-900 mb-4">Notes</h2>
          <textarea value={form.notes || ""} onChange={e => setForm({...form, notes: e.target.value})} className={ic} rows={4} />
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="bg-zinc-900 text-white px-6 py-2 rounded-lg text-sm hover:bg-zinc-700 disabled:opacity-50">{saving ? "Saving..." : "Save Changes"}</button>
          <button type="button" onClick={() => router.back()} className="border border-zinc-300 text-zinc-700 px-6 py-2 rounded-lg text-sm">Cancel</button>
        </div>
      </form>
    </div>
  );
}
