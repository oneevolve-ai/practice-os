"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Building2, CalendarOff, Clock, Calendar, FileText, RefreshCw, DollarSign } from "lucide-react";

const sections = [
  { name: "Employees", href: "/people/employees", icon: Users },
  { name: "Departments", href: "/people/departments", icon: Building2 },
  { name: "Leave", href: "/people/leave", icon: CalendarOff },
  { name: "Leave Calendar", href: "/people/leave/calendar", icon: Calendar },
  { name: "Carry Forward", href: "/people/leave/carry-forward", icon: RefreshCw },
  { name: "Encashment", href: "/people/leave/encashment", icon: DollarSign },
  { name: "Attendance", href: "/people/attendance", icon: Clock },
  { name: "Holidays", href: "/people/holidays", icon: Calendar },
  { name: "Payslips", href: "/people/payslips", icon: FileText },
];

export function PeopleSubNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 mb-6">
      {sections.map((s) => {
        const Icon = s.icon;
        const active = pathname.startsWith(s.href);
        return (
          <Link
            key={s.name}
            href={s.href}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              active
                ? "bg-zinc-900 text-white"
                : "text-zinc-500 hover:bg-zinc-100"
            }`}
          >
            <Icon className="w-4 h-4" />
            {s.name}
          </Link>
        );
      })}
    </div>
  );
}
