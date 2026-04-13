"use client";
import Link from "next/link";
import { Building2, TrendingUp, Activity, FileText } from "lucide-react";
import { useEffect, useState } from "react";

export default function ClientsPage() {
  const [stats, setStats] = useState({ total: 0, active: 0, prospects: 0, deals: 0 });

  useEffect(() => {
    Promise.all([
      fetch("/api/clients").then(r => r.json()),
      fetch("/api/deals").then(r => r.json()),
    ]).then(([clients, deals]) => {
      setStats({
        total: clients.length,
        active: clients.filter((c: {status: string}) => c.status === "ACTIVE").length,
        prospects: clients.filter((c: {status: string}) => c.status === "PROSPECT").length,
        deals: deals.length,
      });
    }).catch(() => {});
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-zinc-900 mb-1">Clients</h1>
      <p className="text-zinc-500 mb-8">CRM, pipeline and proposals</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Organisations", value: stats.total },
          { label: "Active Clients", value: stats.active },
          { label: "Prospects", value: stats.prospects },
          { label: "Deals", value: stats.deals },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-zinc-200 p-4">
            <p className="text-2xl font-bold text-zinc-900">{s.value}</p>
            <p className="text-xs text-zinc-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { href: "/clients/deals", icon: TrendingUp, label: "BD Pipeline", desc: "Track prospects through stages", color: "bg-blue-50 text-blue-600" },
          { href: "/clients/organisations", icon: Building2, label: "Organisations", desc: "All clients and prospects", color: "bg-green-50 text-green-600" },
          { href: "/clients/activity", icon: Activity, label: "CRM Activity", desc: "Calls, meetings, emails", color: "bg-purple-50 text-purple-600" },
          { href: "/clients/proposals", icon: FileText, label: "Proposals", desc: "Track proposals and contracts", color: "bg-orange-50 text-orange-600" },
        ].map(card => (
          <Link key={card.href} href={card.href} className="bg-white rounded-xl border border-zinc-200 p-6 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center mb-4`}>
              <card.icon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-zinc-900">{card.label}</h3>
            <p className="text-sm text-zinc-500 mt-1">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
