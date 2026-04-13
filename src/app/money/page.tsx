"use client";
import Link from "next/link";
import { FileText, Receipt, BarChart3, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function MoneyPage() {
  const [stats, setStats] = useState({ totalInvoiced: 0, outstanding: 0, totalExpenses: 0, gstLiability: 0 });

  useEffect(() => {
    Promise.all([
      fetch("/api/invoices").then(r => r.json()),
      fetch("/api/expenses").then(r => r.json()),
    ]).then(([invoices, expenses]) => {
      const totalInvoiced = invoices.filter((i: {status: string}) => i.status === "PAID").reduce((s: number, i: {total: number}) => s + i.total, 0);
      const outstanding = invoices.filter((i: {status: string}) => ["SENT","VIEWED","OVERDUE"].includes(i.status)).reduce((s: number, i: {total: number}) => s + i.total, 0);
      const totalExpenses = expenses.reduce((s: number, e: {amount: number}) => s + e.amount, 0);
      const gstLiability = invoices.reduce((s: number, i: {cgst: number; sgst: number; igst: number}) => s + i.cgst + i.sgst + i.igst, 0);
      setStats({ totalInvoiced, outstanding, totalExpenses, gstLiability });
    }).catch(() => {});
  }, []);

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-zinc-900 mb-1">Money</h1>
      <p className="text-zinc-500 mb-8">Finance, invoicing and expenses</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Revenue Collected", value: fmt(stats.totalInvoiced), color: "text-green-600" },
          { label: "Outstanding", value: fmt(stats.outstanding), color: "text-orange-600" },
          { label: "Total Expenses", value: fmt(stats.totalExpenses), color: "text-red-600" },
          { label: "GST Liability", value: fmt(stats.gstLiability), color: "text-blue-600" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-zinc-200 p-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-zinc-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { href: "/money/invoices", icon: FileText, label: "Invoices", desc: "Create and manage GST invoices", color: "bg-blue-50 text-blue-600" },
          { href: "/money/expenses", icon: Receipt, label: "Expenses", desc: "Track expenses and receipts", color: "bg-orange-50 text-orange-600" },
          { href: "/money/reports", icon: BarChart3, label: "Reports", desc: "P&L, GST returns, cash flow", color: "bg-green-50 text-green-600" },
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
