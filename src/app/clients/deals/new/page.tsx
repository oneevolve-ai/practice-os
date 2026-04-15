"use client";
import { BackButton } from "@/components/back-button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

interface Person { name: string; designation: string; phone: string; email: string; linkedIn: string; instagram: string; }

export default function NewProspectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const ic = "w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400";

  function addPerson() { setPeople([...people, { name: "", designation: "", phone: "", email: "", linkedIn: "", instagram: "" }]); }
  function removePerson(i: number) { setPeople(people.filter((_, idx) => idx !== i)); }
  function updatePerson(i: number, field: keyof Person, value: string) {
    const updated = [...people];
    updated[i] = { ...updated[i], [field]: value };
    setPeople(updated);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const f = new FormData(e.currentTarget);
    const body = {
      name: f.get("name"), industry: f.get("industry"), businessType: f.get("businessType"),
      businessScale: f.get("businessScale"), engagementLevel: f.get("engagementLevel"),
      established: f.get("established"), website: f.get("website"),
      linkedIn: f.get("linkedIn"), instagram: f.get("instagram"),
      headquarters: f.get("headquarters"), officesInCities: f.get("officesInCities"),
      notes: f.get("notes"), contacts: people.filter(p => p.name),
    };
    const res = await fetch("/api/deals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) router.push("/clients/deals");
    else { alert("Failed"); setLoading(false); }
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-zinc-900 mb-1">New Prospect</h1>
      <p className="text-zinc-500 text-sm mb-6">Add a new prospect to the BD pipeline</p>
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Organisation Details */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="font-semibold text-zinc-900 mb-4">Organisation Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="block text-sm font-medium text-zinc-700 mb-1">Organisation Name *</label><input name="name" required className={ic} /></div>
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
          </div>
        </div>

        {/* Contact & Social */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="font-semibold text-zinc-900 mb-4">Contact & Social</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">Website</label><input name="website" className={ic} placeholder="https://" /></div>
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">LinkedIn</label><input name="linkedIn" className={ic} placeholder="linkedin.com/company/..." /></div>
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">Instagram</label><input name="instagram" className={ic} placeholder="@handle" /></div>
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">Headquarters</label><input name="headquarters" className={ic} placeholder="Mumbai" /></div>
            <div className="col-span-2"><label className="block text-sm font-medium text-zinc-700 mb-1">Offices in Cities</label><input name="officesInCities" className={ic} placeholder="Mumbai, Delhi, Bengaluru" /></div>
          </div>
        </div>

        {/* People */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-zinc-900">People</h2>
            <button type="button" onClick={addPerson} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"><Plus className="w-4 h-4" /> Add Person</button>
          </div>
          {people.length === 0 && <p className="text-sm text-zinc-400 text-center py-4">No people added yet</p>}
          <div className="space-y-4">
            {people.map((p, i) => (
              <div key={i} className="border border-zinc-200 rounded-lg p-4">
                <div className="flex justify-between mb-3">
                  <p className="text-sm font-medium text-zinc-700">Person {i + 1}</p>
                  <button type="button" onClick={() => removePerson(i)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input value={p.name} onChange={e => updatePerson(i, "name", e.target.value)} className={ic} placeholder="Full Name" />
                  <input value={p.designation} onChange={e => updatePerson(i, "designation", e.target.value)} className={ic} placeholder="Designation" />
                  <input value={p.phone} onChange={e => updatePerson(i, "phone", e.target.value)} className={ic} placeholder="Mobile No" />
                  <input value={p.email} onChange={e => updatePerson(i, "email", e.target.value)} className={ic} placeholder="Email" />
                  <input value={p.linkedIn} onChange={e => updatePerson(i, "linkedIn", e.target.value)} className={ic} placeholder="LinkedIn" />
                  <input value={p.instagram} onChange={e => updatePerson(i, "instagram", e.target.value)} className={ic} placeholder="Instagram" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="font-semibold text-zinc-900 mb-4">Notes</h2>
          <textarea name="notes" className={ic} rows={3} placeholder="Any additional notes..." />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="bg-zinc-900 text-white px-6 py-2 rounded-lg text-sm hover:bg-zinc-700 disabled:opacity-50">{loading ? "Creating..." : "Create Prospect"}</button>
          <button type="button" onClick={() => router.back()} className="border border-zinc-300 text-zinc-700 px-6 py-2 rounded-lg text-sm">Cancel</button>
        </div>
      </form>
    </div>
  );
}
