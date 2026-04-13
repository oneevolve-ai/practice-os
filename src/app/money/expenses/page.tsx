"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Receipt } from "lucide-react";
import { properCase } from "@/lib/proper-case";

interface Expense { id: string; date: string; category: string; description: string; amount: number; gstAmount: number; projectName: string | null; status: string; }

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    fetch("/api/expenses").then(r => r.json()).then(setExpenses).catch(() => {});
  }, []);

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  const statusColor: Record<string, string> = { PENDING: "bg-orange-100 text-orange-700", APPROVED: "bg-green-100 text-green-700", REJECTED: "bg-red-100 text-red-700" };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Expenses</h1>
          <p className="text-zinc-500 text-sm">Total: {fmt(total)}</p>
        </div>
        <Link href="/money/expenses/new" className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-zinc-700">
          <Plus className="w-4 h-4" /> Add Expense
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        {expenses.length === 0 ? (
          <div className="text-center py-16 text-zinc-400">
            <Receipt className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No expenses yet</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                {["Date","Category","Description","Project","Amount","GST","Status"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {expenses.map(exp => (
                <tr key={exp.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3 text-zinc-500">{new Date(exp.date).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3 text-zinc-700">{exp.category}</td>
                  <td className="px-4 py-3 text-zinc-800">{exp.description}</td>
                  <td className="px-4 py-3 text-zinc-500">{exp.projectName || "—"}</td>
                  <td className="px-4 py-3 font-medium text-zinc-900">{fmt(exp.amount)}</td>
                  <td className="px-4 py-3 text-zinc-500">{exp.gstAmount > 0 ? fmt(exp.gstAmount) : "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[exp.status]}`}>{properCase(exp.status)}</span>
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
