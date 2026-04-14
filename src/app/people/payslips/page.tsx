"use client";
import { useEffect, useState } from "react";
import { Plus, Download, FileText, X } from "lucide-react";

interface Employee { id: string; name: string; designation: string | null; department: { name: string } | null; }
interface Payslip { id: string; employeeId: string; month: number; year: number; basicSalary: number; hra: number; allowances: number; grossSalary: number; pfDeduction: number; esiDeduction: number; otherDeductions: number; netSalary: number; workingDays: number; presentDays: number; status: string; employee: { name: string; designation: string | null; department: { name: string } | null }; }

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const STATUS_COLORS: Record<string, string> = { DRAFT: "bg-zinc-100 text-zinc-600", PUBLISHED: "bg-green-100 text-green-700", PAID: "bg-blue-100 text-blue-700" };

export default function PayslipsPage() {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    employeeId: "", month: new Date().getMonth() + 1, year: new Date().getFullYear(),
    basicSalary: "", hra: "", allowances: "", pfDeduction: "", esiDeduction: "",
    otherDeductions: "", workingDays: "26", presentDays: "26", status: "DRAFT",
  });

  const ic = "w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400";
  const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

  useEffect(() => {
    fetch("/api/payslips").then(r => r.json()).then(setPayslips).catch(() => {});
    fetch("/api/employees").then(r => r.json()).then(setEmployees).catch(() => {});
  }, []);

  // Auto-calculate
  const basic = parseFloat(form.basicSalary) || 0;
  const hra = parseFloat(form.hra) || basic * 0.4;
  const allowances = parseFloat(form.allowances) || 0;
  const gross = basic + hra + allowances;
  const pf = parseFloat(form.pfDeduction) || Math.round(basic * 0.12);
  const esi = parseFloat(form.esiDeduction) || (gross <= 21000 ? Math.round(gross * 0.0075) : 0);
  const other = parseFloat(form.otherDeductions) || 0;
  const net = gross - pf - esi - other;

  async function handleSubmit() {
    if (!form.employeeId || !form.basicSalary) return;
    setLoading(true);
    const res = await fetch("/api/payslips", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, hra, pfDeduction: pf, esiDeduction: esi }),
    });
    if (res.ok) {
      const data = await res.json();
      setPayslips([data, ...payslips]);
      setShowForm(false);
      setForm({ employeeId: "", month: new Date().getMonth() + 1, year: new Date().getFullYear(), basicSalary: "", hra: "", allowances: "", pfDeduction: "", esiDeduction: "", otherDeductions: "", workingDays: "26", presentDays: "26", status: "DRAFT" });
    }
    setLoading(false);
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Payslips</h1>
          <p className="text-zinc-500 text-sm">{payslips.length} payslips generated</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-zinc-700">
          <Plus className="w-4 h-4" /> Generate Payslip
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-zinc-900">Generate Payslip</h2>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-zinc-400" /></button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-3">
              <label className="block text-sm font-medium text-zinc-700 mb-1">Employee *</label>
              <select value={form.employeeId} onChange={e => setForm({...form, employeeId: e.target.value})} className={ic}>
                <option value="">Select employee</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name} — {e.designation || "—"}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Month</label>
              <select value={form.month} onChange={e => setForm({...form, month: Number(e.target.value)})} className={ic}>
                {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Year</label>
              <input type="number" value={form.year} onChange={e => setForm({...form, year: Number(e.target.value)})} className={ic} />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className={ic}>
                {["DRAFT","PUBLISHED","PAID"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Basic Salary (₹) *</label>
              <input type="number" value={form.basicSalary} onChange={e => setForm({...form, basicSalary: e.target.value})} className={ic} placeholder="e.g. 30000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">HRA (₹) <span className="text-zinc-400 font-normal">auto: 40% of basic</span></label>
              <input type="number" value={form.hra} onChange={e => setForm({...form, hra: e.target.value})} className={ic} placeholder={`Auto: ${Math.round(basic * 0.4)}`} />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Other Allowances (₹)</label>
              <input type="number" value={form.allowances} onChange={e => setForm({...form, allowances: e.target.value})} className={ic} placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">PF Deduction (₹) <span className="text-zinc-400 font-normal">auto: 12%</span></label>
              <input type="number" value={form.pfDeduction} onChange={e => setForm({...form, pfDeduction: e.target.value})} className={ic} placeholder={`Auto: ${Math.round(basic * 0.12)}`} />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">ESI (₹) <span className="text-zinc-400 font-normal">auto: 0.75%</span></label>
              <input type="number" value={form.esiDeduction} onChange={e => setForm({...form, esiDeduction: e.target.value})} className={ic} placeholder="Auto" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Other Deductions (₹)</label>
              <input type="number" value={form.otherDeductions} onChange={e => setForm({...form, otherDeductions: e.target.value})} className={ic} placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Working Days</label>
              <input type="number" value={form.workingDays} onChange={e => setForm({...form, workingDays: e.target.value})} className={ic} />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Present Days</label>
              <input type="number" value={form.presentDays} onChange={e => setForm({...form, presentDays: e.target.value})} className={ic} />
            </div>
          </div>

          {/* Summary */}
          {basic > 0 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {[
                { label: "Gross", value: fmt(gross), color: "text-zinc-900" },
                { label: "Deductions", value: fmt(pf + esi + other), color: "text-red-600" },
                { label: "Net Salary", value: fmt(net), color: "text-green-600" },
              ].map(s => (
                <div key={s.label} className="bg-zinc-50 rounded-lg p-3 text-center">
                  <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-zinc-500">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button onClick={handleSubmit} disabled={loading} className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">{loading ? "Generating..." : "Generate Payslip"}</button>
            <button onClick={() => setShowForm(false)} className="border border-zinc-300 text-zinc-700 px-4 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        {payslips.length === 0 ? (
          <div className="text-center py-16 text-zinc-400">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No payslips generated yet</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                {["Employee","Department","Period","Gross","Deductions","Net Salary","Status","PDF"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {payslips.map(p => (
                <tr key={p.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3 font-medium text-zinc-900">{p.employee.name}</td>
                  <td className="px-4 py-3 text-zinc-500">{p.employee.department?.name || "—"}</td>
                  <td className="px-4 py-3 text-zinc-500">{MONTHS[p.month-1]} {p.year}</td>
                  <td className="px-4 py-3 text-zinc-700">{fmt(p.grossSalary)}</td>
                  <td className="px-4 py-3 text-red-600">{fmt(p.pfDeduction + p.esiDeduction + p.otherDeductions)}</td>
                  <td className="px-4 py-3 font-bold text-green-600">{fmt(p.netSalary)}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[p.status] || "bg-zinc-100 text-zinc-600"}`}>{p.status}</span></td>
                  <td className="px-4 py-3">
                    <a href={`/api/payslips/${p.id}/pdf`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                      <Download className="w-3 h-3" /> PDF
                    </a>
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
