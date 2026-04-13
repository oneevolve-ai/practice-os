"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { properCase } from "@/lib/proper-case";

interface InvoiceItem { id: string; description: string; hsnCode: string | null; quantity: number; unit: string; rate: number; amount: number; }
interface Invoice { id: string; number: string; clientName: string; clientGstin: string | null; clientEmail: string | null; clientAddress: string | null; placeOfSupply: string | null; invoiceDate: string; dueDate: string | null; subtotal: number; gstRate: number; cgst: number; sgst: number; igst: number; total: number; status: string; notes: string | null; items: InvoiceItem[]; }

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/invoices/${id}`).then(r => r.json()).then(setInvoice).catch(() => {});
  }, [id]);

  async function updateStatus(status: string) {
    setLoading(true);
    const res = await fetch(`/api/invoices/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (res.ok) setInvoice(await res.json());
    setLoading(false);
  }

  async function deleteInvoice() {
    if (!confirm("Delete this invoice?")) return;
    await fetch(`/api/invoices/${id}`, { method: "DELETE" });
    router.push("/money/invoices");
  }

  if (!invoice) return <div className="p-8 text-zinc-400">Loading...</div>;

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
  const statusColor: Record<string, string> = { DRAFT: "bg-zinc-100 text-zinc-600", SENT: "bg-blue-100 text-blue-700", VIEWED: "bg-purple-100 text-purple-700", PAID: "bg-green-100 text-green-700", OVERDUE: "bg-red-100 text-red-700" };
  const nextStatuses = { DRAFT: ["SENT"], SENT: ["VIEWED", "PAID", "OVERDUE"], VIEWED: ["PAID", "OVERDUE"], OVERDUE: ["PAID"], PAID: [], CANCELLED: [] }[invoice.status] || [];

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{invoice.number}</h1>
          <span className={`px-2 py-1 rounded-full text-xs font-medium mt-1 inline-block ${statusColor[invoice.status]}`}>{properCase(invoice.status)}</span>
        </div>
        <div className="flex gap-2">
          {nextStatuses.map(s => (
            <button key={s} onClick={() => updateStatus(s)} disabled={loading} className="bg-zinc-900 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-zinc-700 disabled:opacity-50">
              Mark as {properCase(s)}
            </button>
          ))}
          <button onClick={deleteInvoice} className="border border-red-200 text-red-600 px-3 py-1.5 rounded-lg text-xs hover:bg-red-50">Delete</button>
        </div>
      </div>

      {/* Invoice */}
      <div className="bg-white rounded-xl border border-zinc-200 p-8">
        {/* Top */}
        <div className="flex justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">OneEvolve.AI</h2>
            <p className="text-sm text-zinc-500 mt-1">practice-os.ai</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-zinc-900">{invoice.number}</p>
            <p className="text-sm text-zinc-500">Date: {new Date(invoice.invoiceDate).toLocaleDateString("en-IN")}</p>
            {invoice.dueDate && <p className="text-sm text-zinc-500">Due: {new Date(invoice.dueDate).toLocaleDateString("en-IN")}</p>}
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-8">
          <p className="text-xs font-medium text-zinc-400 uppercase mb-1">Bill To</p>
          <p className="font-semibold text-zinc-900">{invoice.clientName}</p>
          {invoice.clientGstin && <p className="text-sm text-zinc-500">GSTIN: {invoice.clientGstin}</p>}
          {invoice.clientAddress && <p className="text-sm text-zinc-500">{invoice.clientAddress}</p>}
          {invoice.placeOfSupply && <p className="text-sm text-zinc-500">Place of Supply: {invoice.placeOfSupply}</p>}
        </div>

        {/* Items Table */}
        <table className="w-full text-sm mb-6">
          <thead className="bg-zinc-50">
            <tr>
              {["Description","HSN/SAC","Qty","Rate","Amount"].map(h => (
                <th key={h} className="text-left px-3 py-2 text-xs font-medium text-zinc-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {invoice.items.map(item => (
              <tr key={item.id}>
                <td className="px-3 py-2 text-zinc-800">{item.description}</td>
                <td className="px-3 py-2 text-zinc-500">{item.hsnCode || "—"}</td>
                <td className="px-3 py-2 text-zinc-500">{item.quantity} {item.unit}</td>
                <td className="px-3 py-2 text-zinc-500">{fmt(item.rate)}</td>
                <td className="px-3 py-2 font-medium text-zinc-900">{fmt(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-zinc-500">Subtotal</span><span>{fmt(invoice.subtotal)}</span></div>
            {invoice.igst > 0 ? (
              <div className="flex justify-between"><span className="text-zinc-500">IGST ({invoice.gstRate}%)</span><span>{fmt(invoice.igst)}</span></div>
            ) : (
              <>
                <div className="flex justify-between"><span className="text-zinc-500">CGST ({invoice.gstRate/2}%)</span><span>{fmt(invoice.cgst)}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">SGST ({invoice.gstRate/2}%)</span><span>{fmt(invoice.sgst)}</span></div>
              </>
            )}
            <div className="flex justify-between font-bold text-lg border-t border-zinc-200 pt-2">
              <span>Total</span><span>{fmt(invoice.total)}</span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-6 pt-6 border-t border-zinc-100">
            <p className="text-xs font-medium text-zinc-400 mb-1">Notes</p>
            <p className="text-sm text-zinc-600">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
