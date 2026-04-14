"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { properCase } from "@/lib/proper-case";
import { MapPin, Phone, Mail, Plus, Globe } from "lucide-react";

interface Contact { id: string; name: string; designation: string | null; phone: string | null; email: string | null; residentCity: string | null; isPrimary: boolean; interests: string | null; }
interface Deal { id: string; title: string; stage: string; value: number | null; createdAt: string; }
interface Client { id: string; name: string; uin: string | null; businessType: string | null; businessScale: string | null; engagementLevel: string | null; established: number | null; accountManager: string | null; industry: string | null; website: string | null; linkedIn: string | null; instagram: string | null; email: string | null; phone: string | null; headquarters: string | null; officesInCities: string | null; gstin: string | null; pan: string | null; notes: string | null; status: string; contacts: Contact[]; deals: Deal[]; }

export default function OrganisationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", designation: "", phone: "", email: "", residentCity: "", interests: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/clients/${id}`).then(r => r.json()).then(setClient).catch(() => {});
  }, [id]);

  async function addContact() {
    if (!newContact.name) return;
    setLoading(true);
    const res = await fetch(`/api/clients/${id}/contacts`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newContact),
    });
    if (res.ok) {
      const updated = await fetch(`/api/clients/${id}`).then(r => r.json());
      setClient(updated);
      setShowAddContact(false);
      setNewContact({ name: "", designation: "", phone: "", email: "", residentCity: "", interests: "" });
    }
    setLoading(false);
  }

  async function deleteClient() {
    if (!confirm("Delete this organisation?")) return;
    await fetch(`/api/clients/${id}`, { method: "DELETE" });
    router.push("/clients/organisations");
  }

  if (!client) return <div className="p-8 text-zinc-400">Loading...</div>;

  const ic = "w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400";
  const statusColor: Record<string, string> = { PROSPECT: "bg-blue-100 text-blue-700", ACTIVE: "bg-green-100 text-green-700", INACTIVE: "bg-zinc-100 text-zinc-600", CHURNED: "bg-red-100 text-red-700" };
  const tabs = ["overview", "people", "deals", "tax & legal", "notes"];

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-zinc-900">{client.name}</h1>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[client.status] || "bg-zinc-100 text-zinc-600"}`}>{properCase(client.status)}</span>
          </div>
          <p className="text-zinc-500 text-sm">{[client.industry, client.headquarters].filter(Boolean).join(" · ")}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.push(`/clients/organisations/${id}/edit`)} className="border border-zinc-300 text-zinc-700 px-3 py-1.5 rounded-lg text-xs hover:bg-zinc-50">Edit</button>
          <button onClick={deleteClient} className="border border-red-200 text-red-600 px-3 py-1.5 rounded-lg text-xs hover:bg-red-50">Delete</button>
        </div>
      </div>

      <div className="flex gap-1 mb-6 border-b border-zinc-200">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === tab ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-500 hover:text-zinc-700"}`}>{tab}</button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <h2 className="font-semibold text-zinc-900 mb-4">Organisation Details</h2>
            <div className="space-y-3 text-sm">
              {[["Business Type",client.businessType],["Business Scale",client.businessScale],["Engagement Level",client.engagementLevel],["Established",client.established],["Account Manager",client.accountManager],["Industry",client.industry],["UIN",client.uin]].filter(([,v])=>v).map(([label,value])=>(
                <div key={label as string} className="flex justify-between">
                  <span className="text-zinc-400">{label}</span>
                  <span className="font-medium text-zinc-800">{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <h2 className="font-semibold text-zinc-900 mb-4">Contact & Social</h2>
            <div className="space-y-3 text-sm">
              {client.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-zinc-400" /><a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">{client.email}</a></div>}
              {client.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-zinc-400" /><span>{client.phone}</span></div>}
              {client.website && <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-zinc-400" /><a href={client.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{client.website}</a></div>}
              {client.linkedIn && <div className="flex items-center gap-2"><span className="text-xs font-bold text-zinc-400">in</span><a href={client.linkedIn} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">LinkedIn</a></div>}
              {client.instagram && <div className="flex items-center gap-2"><span className="text-xs font-bold text-zinc-400">IG</span><span>@{client.instagram}</span></div>}
              {client.headquarters && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-zinc-400" /><span>{client.headquarters}</span></div>}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-zinc-200 p-6 md:col-span-2">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div><p className="text-2xl font-bold text-zinc-900">{client.contacts.length}</p><p className="text-xs text-zinc-500 mt-1">Contacts</p></div>
              <div><p className="text-2xl font-bold text-zinc-900">{client.deals.length}</p><p className="text-xs text-zinc-500 mt-1">Deals</p></div>
              <div><p className="text-2xl font-bold text-zinc-900">{client.deals.filter(d=>d.stage==="WON").length}</p><p className="text-xs text-zinc-500 mt-1">Won</p></div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "people" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-zinc-900">{client.contacts.length} People</h2>
            <button onClick={() => setShowAddContact(!showAddContact)} className="flex items-center gap-1 text-sm bg-zinc-900 text-white px-3 py-1.5 rounded-lg hover:bg-zinc-700"><Plus className="w-4 h-4" /> Add Person</button>
          </div>
          {showAddContact && (
            <div className="bg-zinc-50 rounded-xl border border-zinc-200 p-4 mb-4">
              <div className="grid grid-cols-2 gap-3">
                <input value={newContact.name} onChange={e=>setNewContact({...newContact,name:e.target.value})} className={ic} placeholder="Full Name *" />
                <input value={newContact.designation} onChange={e=>setNewContact({...newContact,designation:e.target.value})} className={ic} placeholder="Designation" />
                <input value={newContact.phone} onChange={e=>setNewContact({...newContact,phone:e.target.value})} className={ic} placeholder="Mobile" />
                <input value={newContact.email} onChange={e=>setNewContact({...newContact,email:e.target.value})} className={ic} placeholder="Email" />
                <input value={newContact.residentCity} onChange={e=>setNewContact({...newContact,residentCity:e.target.value})} className={ic} placeholder="City" />
                <input value={newContact.interests} onChange={e=>setNewContact({...newContact,interests:e.target.value})} className={ic} placeholder="Interests" />
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={addContact} disabled={loading} className="bg-zinc-900 text-white px-4 py-1.5 rounded-lg text-sm disabled:opacity-50">{loading?"Saving...":"Add"}</button>
                <button onClick={()=>setShowAddContact(false)} className="border border-zinc-300 text-zinc-700 px-4 py-1.5 rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          )}
          {client.contacts.length === 0 ? (
            <div className="text-center py-12 text-zinc-400"><p>No people added yet</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {client.contacts.map(c=>(
                <div key={c.id} className="bg-white rounded-xl border border-zinc-200 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div><p className="font-semibold text-zinc-900">{c.name}</p>{c.designation&&<p className="text-xs text-zinc-500">{c.designation}</p>}</div>
                    {c.isPrimary&&<span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Primary</span>}
                  </div>
                  <div className="space-y-1 text-xs text-zinc-500">
                    {c.phone&&<p>📱 {c.phone}</p>}
                    {c.email&&<p>✉️ {c.email}</p>}
                    {c.residentCity&&<p>📍 {c.residentCity}</p>}
                    {c.interests&&<p>⭐ {c.interests}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "deals" && (
        <div>
          <h2 className="font-semibold text-zinc-900 mb-4">{client.deals.length} Deals</h2>
          {client.deals.length===0?(
            <div className="text-center py-12 text-zinc-400"><p>No deals yet</p></div>
          ):(
            <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>{["Title","Stage","Value","Date"].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-500">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {client.deals.map(deal=>(
                    <tr key={deal.id} className="hover:bg-zinc-50">
                      <td className="px-4 py-3 font-medium text-zinc-900">{deal.title}</td>
                      <td className="px-4 py-3"><span className="px-2 py-1 bg-zinc-100 text-zinc-700 rounded-full text-xs">{properCase(deal.stage)}</span></td>
                      <td className="px-4 py-3 text-zinc-500">{deal.value?`₹${deal.value.toLocaleString("en-IN")}`:"—"}</td>
                      <td className="px-4 py-3 text-zinc-500">{new Date(deal.createdAt).toLocaleDateString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "tax & legal" && (
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="font-semibold text-zinc-900 mb-4">Tax & Legal</h2>
          <div className="space-y-4 text-sm">
            {[["GST Number",client.gstin],["PAN Number",client.pan]].map(([label,value])=>(
              <div key={label as string}><p className="text-xs text-zinc-400 mb-1">{label}</p><p className="font-medium text-zinc-800">{value||"—"}</p></div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "notes" && (
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="font-semibold text-zinc-900 mb-4">Notes</h2>
          {client.notes?<p className="text-sm text-zinc-600 whitespace-pre-wrap">{client.notes}</p>:<p className="text-sm text-zinc-400">No notes added yet.</p>}
        </div>
      )}
    </div>
  );
}
