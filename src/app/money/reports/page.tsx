"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MoneyReportsPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/invoices").then(r=>r.json()).then(setInvoices).catch(()=>{});
    fetch("/api/expenses").then(r=>r.json()).then(setExpenses).catch(()=>{});
  }, []);

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const totalInvoiced = invoices.reduce((s,i) => s + (i.total||0), 0);
  const totalPaid = invoices.filter(i=>i.status==="PAID").reduce((s,i) => s + (i.total||0), 0);
  const totalPending = invoices.filter(i=>i.status==="SENT"||i.status==="OVERDUE").reduce((s,i) => s + (i.total||0), 0);
  const totalExpenses = expenses.reduce((s,e) => s + (e.amount||0), 0);
  const netProfit = totalPaid - totalExpenses;

  const gstCollected = invoices.filter(i=>i.status==="PAID").reduce((s,i) => s + (i.cgst||0) + (i.sgst||0) + (i.igst||0), 0);

  const byMonth: Record<string,{invoiced:number,paid:number,expenses:number}> = {};
  invoices.forEach(i => {
    const m = new Date(i.createdAt).toLocaleString("en-IN",{month:"short",year:"numeric"});
    if (!byMonth[m]) byMonth[m] = {invoiced:0,paid:0,expenses:0};
    byMonth[m].invoiced += i.total||0;
    if (i.status==="PAID") byMonth[m].paid += i.total||0;
  });
  expenses.forEach(e => {
    const m = new Date(e.date||e.createdAt).toLocaleString("en-IN",{month:"short",year:"numeric"});
    if (!byMonth[m]) byMonth[m] = {invoiced:0,paid:0,expenses:0};
    byMonth[m].expenses += e.amount||0;
  });

  return (
    <div className="p-8">
      <button onClick={()=>router.push("/money")} className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <h1 className="text-2xl font-bold text-zinc-900 mb-6">Financial Reports</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <div className="flex items-center gap-2 mb-2"><FileText className="w-4 h-4 text-blue-500" /><span className="text-xs text-zinc-500">Total Invoiced</span></div>
          <p className="text-2xl font-bold text-zinc-900">{fmt(totalInvoiced)}</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-green-500" /><span className="text-xs text-zinc-500">Total Collected</span></div>
          <p className="text-2xl font-bold text-green-600">{fmt(totalPaid)}</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <div className="flex items-center gap-2 mb-2"><TrendingDown className="w-4 h-4 text-red-500" /><span className="text-xs text-zinc-500">Total Expenses</span></div>
          <p className="text-2xl font-bold text-red-600">{fmt(totalExpenses)}</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <div className="flex items-center gap-2 mb-2"><DollarSign className="w-4 h-4 text-purple-500" /><span className="text-xs text-zinc-500">Net Profit</span></div>
          <p className={`text-2xl font-bold ${netProfit>=0?"text-green-600":"text-red-600"}`}>{fmt(netProfit)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Monthly Breakdown */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <h2 className="font-semibold text-zinc-900 mb-4">Monthly Breakdown</h2>
          {Object.keys(byMonth).length === 0 ? (
            <p className="text-zinc-400 text-sm text-center py-8">No data yet</p>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-zinc-400 border-b border-zinc-100">
                <th className="text-left pb-2">Month</th>
                <th className="text-right pb-2">Invoiced</th>
                <th className="text-right pb-2">Collected</th>
                <th className="text-right pb-2">Expenses</th>
              </tr></thead>
              <tbody>
                {Object.entries(byMonth).map(([m,v])=>(
                  <tr key={m} className="border-b border-zinc-50">
                    <td className="py-2 text-zinc-700">{m}</td>
                    <td className="py-2 text-right text-zinc-600">{fmt(v.invoiced)}</td>
                    <td className="py-2 text-right text-green-600">{fmt(v.paid)}</td>
                    <td className="py-2 text-right text-red-500">{fmt(v.expenses)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* GST Summary */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <h2 className="font-semibold text-zinc-900 mb-4">GST Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm"><span className="text-zinc-500">GST Collected (from paid invoices)</span><span className="font-medium text-zinc-900">{fmt(gstCollected)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-zinc-500">Pending invoices</span><span className="font-medium text-orange-600">{fmt(totalPending)}</span></div>
            <div className="border-t border-zinc-100 pt-3 flex justify-between text-sm"><span className="text-zinc-500">Invoice count</span><span className="font-medium">{invoices.length}</span></div>
            <div className="flex justify-between text-sm"><span className="text-zinc-500">Paid invoices</span><span className="font-medium text-green-600">{invoices.filter(i=>i.status==="PAID").length}</span></div>
            <div className="flex justify-between text-sm"><span className="text-zinc-500">Pending invoices</span><span className="font-medium text-orange-600">{invoices.filter(i=>i.status==="SENT"||i.status==="OVERDUE").length}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
