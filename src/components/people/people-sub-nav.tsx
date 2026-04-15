"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Users, Building2, CalendarOff, Clock, Calendar, FileText, RefreshCw, DollarSign, ClipboardList, TrendingUp } from "lucide-react";

const navGroups = [
  {
    label: "People",
    items: [
      { name: "Employees", href: "/people/employees", icon: Users },
      { name: "Departments", href: "/people/departments", icon: Building2 },
      { name: "Onboarding", href: "/people/employees/onboarding", icon: ClipboardList },
      { name: "Performance", href: "/people/performance", icon: TrendingUp },
      { name: "Letters", href: "/people/letters", icon: FileText },
    ],
  },
  {
    label: "Leave",
    items: [
      { name: "Leave", href: "/people/leave", icon: CalendarOff },
      { name: "Calendar", href: "/people/leave/calendar", icon: Calendar },
      { name: "Carry Forward", href: "/people/leave/carry-forward", icon: RefreshCw },
      { name: "Encashment", href: "/people/leave/encashment", icon: DollarSign },
    ],
  },
  {
    label: "Attendance",
    items: [
      { name: "Attendance", href: "/people/attendance", icon: Clock },
      { name: "Holidays", href: "/people/holidays", icon: Calendar },
    ],
  },
  {
    label: "Payroll",
    items: [
      { name: "Payslips", href: "/people/payslips", icon: FileText },
    ],
  },
];

export function PeopleSubNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/people/leave") return pathname === "/people/leave" || pathname.startsWith("/people/leave/");
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <div className="border-b border-zinc-200 bg-white px-8">
      <div className="flex items-center gap-6 overflow-x-auto">
        {navGroups.map((group, gi) => (
          <div key={gi} className="flex items-center gap-1 py-2">
            <span className="text-xs text-zinc-400 font-medium mr-1 whitespace-nowrap">{group.label}</span>
            {group.items.map(item => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                    active ? "bg-zinc-900 text-white" : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                  )}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  {item.name}
                </Link>
              );
            })}
            {gi < navGroups.length - 1 && <div className="w-px h-5 bg-zinc-200 ml-2" />}
          </div>
        ))}
      </div>
    </div>
  );
}
