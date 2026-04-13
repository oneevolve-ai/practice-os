"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, FileText, Download } from "lucide-react";
import { properCase } from "@/lib/proper-case";

interface Invoice { id: string; number: string; clientName: string; total: number; status: string; invoiceDate: string; dueDate: string | null; }

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/invoices").then(r => r.json()).then(setInvoices).catch(() => {});
  }, []);

  const filtered = filter === "ALL" ? invoices : invoices.filter(i => i.status === filter);
  const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  const statusColor: Record<string, string> = { DRAFT: "bg-zinc-100 text-zinc-600", SENT: "bg-blue-100 text-blue-700", VIEWED: "bg-purple-100 text-purple-700", PAID: "bg-green-100 text-green-700", OVERDUE: "bg-red-100 text-red-700", CANCELLED: "bg-zinc-100 text-zinc-400" };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Invoices</h1>
          <p className="text-zinc-500 text-sm">GST-compliant invoicing</p>
        </div>
        <Link href="/money/invoices/new" className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-zinc-700">
          <Plus className="w-4 h-4" /> New Invoice
        </Link>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {["ALL","DRAFT","SENT","VIEWED","PAID","OVERDUE"].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1 rounded-full text-xs font-medium ${filter === s ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}>
            {s === "ALL" ? "All" : properCase(s)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-zinc-400">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No invoices found</p>
            <Link href="/money/invoices/new" className="text-blue-600 text-sm mt-2 inline-block">Create your first invoice</Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                {["Invoice No","Client","Date","Due Date","Amount","Status",""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map(inv => (
                <tr key={inv.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3 font-medium text-blue-600">
                    <Link href={`/money/invoices/${inv.id}`}>{inv.number}</Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-800">{inv.clientName}</td>
                  <td className="px-4 py-3 text-zinc-500">{new Date(inv.invoiceDate).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3 text-zinc-500">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("en-IN") : "—"}</td>
                  <td className="px-4 py-3 font-medium text-zinc-900">{fmt(inv.total)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[inv.status]}`}>{properCase(inv.status)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/money/invoices/${inv.id}`} className="text-xs text-zinc-500 hover:text-zinc-700">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
