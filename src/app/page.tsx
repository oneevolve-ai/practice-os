import { Plane, Users, DollarSign, Building2, FolderKanban, FileText } from "lucide-react";

const cards = [
  { name: "Travel", desc: "Manage travel requests & approvals", icon: Plane, href: "/travel", ready: true },
  { name: "HRMS", desc: "Employee directory & HR management", icon: Users, href: "/people", ready: true },
  { name: "Money", desc: "Expenses & invoicing", icon: DollarSign, href: "/money", ready: false },
  { name: "Clients", desc: "Client relationship management", icon: Building2, href: "/clients", ready: false },
  { name: "Projects", desc: "Project tracking & timesheets", icon: FolderKanban, href: "/projects", ready: false },
  { name: "Docs", desc: "Document management", icon: FileText, href: "/docs", ready: false },
];

export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Practice OS</h1>
        <p className="text-zinc-500 mt-1">Welcome to the OneEvolve.AI internal platform</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return card.ready ? (
            <a
              key={card.name}
              href={card.href}
              className="group block rounded-xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all"
            >
              <Icon className="w-8 h-8 text-zinc-700 mb-3 group-hover:text-zinc-900" />
              <h2 className="font-semibold text-zinc-900">{card.name}</h2>
              <p className="text-sm text-zinc-500 mt-1">{card.desc}</p>
            </a>
          ) : (
            <div
              key={card.name}
              className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 opacity-50"
            >
              <Icon className="w-8 h-8 text-zinc-400 mb-3" />
              <h2 className="font-semibold text-zinc-400">{card.name}</h2>
              <p className="text-sm text-zinc-400 mt-1">{card.desc}</p>
              <span className="inline-block mt-2 text-[10px] bg-zinc-200 text-zinc-500 px-2 py-0.5 rounded">
                Coming Soon
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
