"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

interface Item { description: string; hsnCode: string; quantity: number; unit: string; rate: number; amount: number; }

export default function NewInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isInterState, setIsInterState] = useState(false);
  const [gstRate, setGstRate] = useState(18);
  const [items, setItems] = useState<Item[]>([{ description: "", hsnCode: "", quantity: 1, unit: "nos", rate: 0, amount: 0 }]);

  const ic = "w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400";

  function updateItem(index: number, field: keyof Item, value: string | number) {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    if (field === "quantity" || field === "rate") {
      updated[index].amount = updated[index].quantity * updated[index].rate;
    }
    setItems(updated);
  }

  function addItem() { setItems([...items, { description: "", hsnCode: "", quantity: 1, unit: "nos", rate: 0, amount: 0 }]); }
  function removeItem(i: number) { setItems(items.filter((_, idx) => idx !== i)); }

  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const gstAmount = (subtotal * gstRate) / 100;
  const total = subtotal + gstAmount;
  const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const f = new FormData(e.currentTarget);
    const body = {
      clientName: f.get("clientName"), clientGstin: f.get("clientGstin"),
      clientEmail: f.get("clientEmail"), clientAddress: f.get("clientAddress"),
      placeOfSupply: f.get("placeOfSupply"), dueDate: f.get("dueDate"),
      notes: f.get("notes"), gstRate, isInterState, items,
    };
    const res = await fetch("/api/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) {
      const inv = await res.json();
      router.push(`/money/invoices/${inv.id}`);
    } else {
      alert("Failed to create invoice");
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-zinc-900 mb-1">New Invoice</h1>
      <p className="text-zinc-500 text-sm mb-6">GST-compliant invoice</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Details */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="font-semibold text-zinc-900 mb-4">Client Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">Client Name *</label><input name="clientName" required className={ic} placeholder="ABC Private Limited" /></div>
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">GSTIN</label><input name="clientGstin" className={ic} placeholder="27AABCU9603R1ZX" /></div>
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">Email</label><input name="clientEmail" type="email" className={ic} placeholder="accounts@client.com" /></div>
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">Place of Supply</label><input name="placeOfSupply" className={ic} placeholder="Maharashtra" /></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium text-zinc-700 mb-1">Billing Address</label><textarea name="clientAddress" className={ic} rows={2} placeholder="Full billing address" /></div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="font-semibold text-zinc-900 mb-4">Invoice Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">GST Rate</label>
              <select value={gstRate} onChange={e => setGstRate(Number(e.target.value))} className={ic}>
                <option value={0}>0%</option>
                <option value={5}>5%</option>
                <option value={12}>12%</option>
                <option value={18}>18%</option>
                <option value={28}>28%</option>
              </select>
            </div>
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">Due Date</label><input name="dueDate" type="date" className={ic} /></div>
            <div className="flex items-center gap-2 mt-6">
              <input type="checkbox" id="interState" checked={isInterState} onChange={e => setIsInterState(e.target.checked)} className="w-4 h-4" />
              <label htmlFor="interState" className="text-sm text-zinc-700">Inter-state (IGST)</label>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-zinc-900">Line Items</h2>
            <button type="button" onClick={addItem} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-4"><input value={item.description} onChange={e => updateItem(idx, "description", e.target.value)} className={ic} placeholder="Description" /></div>
                <div className="col-span-2"><input value={item.hsnCode} onChange={e => updateItem(idx, "hsnCode", e.target.value)} className={ic} placeholder="HSN/SAC" /></div>
                <div className="col-span-1"><input type="number" value={item.quantity} onChange={e => updateItem(idx, "quantity", Number(e.target.value))} className={ic} /></div>
                <div className="col-span-2"><input type="number" value={item.rate} onChange={e => updateItem(idx, "rate", Number(e.target.value))} className={ic} placeholder="Rate ₹" /></div>
                <div className="col-span-2 text-sm font-medium text-zinc-700 text-right">{fmt(item.amount)}</div>
                <div className="col-span-1 text-right">
                  {items.length > 1 && <button type="button" onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>}
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-6 border-t border-zinc-100 pt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-zinc-500">Subtotal</span><span className="font-medium">{fmt(subtotal)}</span></div>
            {isInterState ? (
              <div className="flex justify-between"><span className="text-zinc-500">IGST ({gstRate}%)</span><span>{fmt(gstAmount)}</span></div>
            ) : (
              <>
                <div className="flex justify-between"><span className="text-zinc-500">CGST ({gstRate/2}%)</span><span>{fmt(gstAmount/2)}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">SGST ({gstRate/2}%)</span><span>{fmt(gstAmount/2)}</span></div>
              </>
            )}
            <div className="flex justify-between text-lg font-bold border-t border-zinc-200 pt-2">
              <span>Total</span><span>₹{total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="font-semibold text-zinc-900 mb-4">Notes</h2>
          <textarea name="notes" className={ic} rows={3} placeholder="Payment terms, bank details, or any other notes..." />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="bg-zinc-900 text-white px-6 py-2 rounded-lg text-sm hover:bg-zinc-700 disabled:opacity-50">
            {loading ? "Creating..." : "Create Invoice"}
          </button>
          <button type="button" onClick={() => router.back()} className="border border-zinc-300 text-zinc-700 px-6 py-2 rounded-lg text-sm hover:bg-zinc-50">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
