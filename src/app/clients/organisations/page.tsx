"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Building2, Search } from "lucide-react";
import { properCase } from "@/lib/proper-case";

interface Client { id: string; name: string; industry: string | null; headquarters: string | null; status: string; contacts: { id: string }[]; deals: { id: string }[]; }

export default function OrganisationsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/clients").then(r => r.json()).then(setClients).catch(() => {});
  }, []);

  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  const statusColor: Record<string, string> = { PROSPECT: "bg-blue-100 text-blue-700", ACTIVE: "bg-green-100 text-green-700", INACTIVE: "bg-zinc-100 text-zinc-600", CHURNED: "bg-red-100 text-red-700" };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Organisations</h1>
          <p className="text-zinc-500 text-sm">{clients.length} total</p>
        </div>
        <Link href="/clients/organisations/new" className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-zinc-700">
          <Plus className="w-4 h-4" /> Add Organisation
        </Link>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search organisations..." className="w-full pl-9 pr-4 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400" />
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-zinc-400">
            <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No organisations found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                {["Name","Industry","Headquarters","Contacts","Deals","Status"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3 font-medium text-blue-600"><Link href={`/clients/organisations/${c.id}`}>{c.name}</Link></td>
                  <td className="px-4 py-3 text-zinc-500">{c.industry || "—"}</td>
                  <td className="px-4 py-3 text-zinc-500">{c.headquarters || "—"}</td>
                  <td className="px-4 py-3 text-zinc-500">{c.contacts.length}</td>
                  <td className="px-4 py-3 text-zinc-500">{c.deals.length}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[c.status]}`}>{properCase(c.status)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
