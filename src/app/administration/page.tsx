import Link from "next/link";
import { Plane, UserCheck, Package, Users, ShoppingCart, Receipt, Box, Calendar, Briefcase, Ticket } from "lucide-react";

const modules = [
  { href: "/travel", icon: Plane, label: "Travel", desc: "Travel requests, approvals and bookings", color: "bg-blue-50 text-blue-600", tag: "Live" },
  { href: "/visitors", icon: UserCheck, label: "Visitors", desc: "Register visitors and manage check-ins", color: "bg-teal-50 text-teal-600", tag: "Live" },
  { href: "/administration/supply", icon: Package, label: "Supply Management", desc: "Track office supplies and inventory", color: "bg-orange-50 text-orange-600", tag: "Soon" },
  { href: "/administration/users", icon: Users, label: "User Management", desc: "Manage system users and roles", color: "bg-purple-50 text-purple-600", tag: "Soon" },
  { href: "/administration/procurement", icon: ShoppingCart, label: "Procurement", desc: "Purchase requests and vendor management", color: "bg-indigo-50 text-indigo-600", tag: "Soon" },
  { href: "/administration/reimbursement", icon: Receipt, label: "Reimbursement", desc: "Employee expense reimbursements", color: "bg-green-50 text-green-600", tag: "Soon" },
  { href: "/administration/assets", icon: Box, label: "Assets", desc: "Track company assets and allocations", color: "bg-yellow-50 text-yellow-600", tag: "Soon" },
  { href: "/administration/events", icon: Calendar, label: "Events", desc: "Company events and scheduling", color: "bg-pink-50 text-pink-600", tag: "Soon" },
  { href: "/administration/recruitment", icon: Briefcase, label: "Recruitment", desc: "Job postings, candidates and hiring pipeline", color: "bg-cyan-50 text-cyan-600", tag: "Soon" },
  { href: "/administration/tickets", icon: Ticket, label: "Tickets", desc: "Internal helpdesk and support tickets", color: "bg-red-50 text-red-600", tag: "Soon" },
];

export default function AdministrationPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Administration</h1>
        <p className="text-zinc-500 mt-1">Manage operations, people and company resources</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {modules.map(m => {
          const Icon = m.icon;
          return (
            <Link key={m.href} href={m.href}
              className="bg-white rounded-xl border border-zinc-200 p-5 hover:shadow-md transition-shadow group relative">
              {m.tag === "Soon" && (
                <span className="absolute top-3 right-3 text-[10px] font-medium bg-zinc-100 text-zinc-400 px-2 py-0.5 rounded-full">Soon</span>
              )}
              {m.tag === "Live" && (
                <span className="absolute top-3 right-3 text-[10px] font-medium bg-green-100 text-green-600 px-2 py-0.5 rounded-full">Live</span>
              )}
              <div className={`w-10 h-10 ${m.color.split(' ')[0]} rounded-lg flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${m.color.split(' ')[1]}`} />
              </div>
              <p className="font-semibold text-zinc-900 text-sm mb-1">{m.label}</p>
              <p className="text-xs text-zinc-500">{m.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
