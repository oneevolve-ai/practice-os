import { Users, Building2, CalendarOff, Clock } from "lucide-react";

const cards = [
  { name: "Employees", desc: "Team directory & profiles", icon: Users, href: "/people/employees" },
  { name: "Departments", desc: "Manage departments", icon: Building2, href: "/people/departments" },
  { name: "Leave", desc: "Leave requests & balances", icon: CalendarOff, href: "/people/leave" },
  { name: "Attendance", desc: "Check-in & work hours", icon: Clock, href: "/people/attendance" },
];

export default function PeopleHubPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">HRMS</h1>
        <p className="text-zinc-500 mt-1">Employee directory, HR & attendance management</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <a
              key={card.name}
              href={card.href}
              className="group block rounded-xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all"
            >
              <Icon className="w-8 h-8 text-zinc-700 mb-3 group-hover:text-zinc-900" />
              <h2 className="font-semibold text-zinc-900">{card.name}</h2>
              <p className="text-sm text-zinc-500 mt-1">{card.desc}</p>
            </a>
          );
        })}
      </div>
    </div>
  );
}
