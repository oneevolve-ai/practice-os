"use client";
import Link from "next/link";
import { Users, Building2, CalendarOff, Clock, FileText, ClipboardList, TrendingUp, Mail, LogOut, DollarSign, RefreshCw, Calendar } from "lucide-react";

const modules = [
  { name: "Employees", href: "/people/employees", icon: Users, desc: "Team directory & profiles" },
  { name: "Departments", href: "/people/departments", icon: Building2, desc: "Manage departments" },
  { name: "Leave", href: "/people/leave", icon: CalendarOff, desc: "Leave requests & balances" },
  { name: "Leave Calendar", href: "/people/leave/calendar", icon: Calendar, desc: "Team leave overview" },
  { name: "Carry Forward", href: "/people/leave/carry-forward", icon: RefreshCw, desc: "Carry unused leave" },
  { name: "Encashment", href: "/people/leave/encashment", icon: DollarSign, desc: "Convert leave to cash" },
  { name: "Attendance", href: "/people/attendance", icon: Clock, desc: "Check-in & work hours" },
  { name: "Payslips", href: "/people/payslips", icon: FileText, desc: "Generate & download payslips" },
  { name: "Onboarding", href: "/people/employees/onboarding", icon: ClipboardList, desc: "New joiner checklist" },
  { name: "Performance", href: "/people/performance", icon: TrendingUp, desc: "KRA-based reviews" },
  { name: "Letters", href: "/people/letters", icon: Mail, desc: "Offer & appointment letters" },
  { name: "Exit", href: "/people/exit", icon: LogOut, desc: "Offboarding & FnF" },
];

export default function PeoplePage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">HRMS</h1>
        <p className="text-zinc-500 text-sm mt-1">Employee directory, HR & attendance management</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {modules.map(m => {
          const Icon = m.icon;
          return (
            <Link key={m.href} href={m.href}
              className="bg-white rounded-xl border border-zinc-200 p-5 hover:shadow-md hover:border-zinc-300 transition-all group">
              <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-zinc-900 transition-colors">
                <Icon className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" />
              </div>
              <p className="font-semibold text-zinc-900 text-sm mb-1">{m.name}</p>
              <p className="text-xs text-zinc-500">{m.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
