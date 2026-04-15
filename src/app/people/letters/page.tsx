"use client";
import { useEffect, useState } from "react";
import { FileText, Download } from "lucide-react";

interface Employee { id: string; name: string; designation: string | null; department: { name: string } | null; joiningDate: string | null; basicSalary: number | null; }

export default function LettersPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selected, setSelected] = useState("");
  const ic = "w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400";
  const emp = employees.find(e => e.id === selected);

  useEffect(() => {
    fetch("/api/employees").then(r => r.json()).then(setEmployees).catch(() => {});
  }, []);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">HR Letters</h1>
        <p className="text-zinc-500 text-sm">Generate offer letters and appointment letters</p>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-6">
        <label className="block text-sm font-medium text-zinc-700 mb-2">Select Employee</label>
        <select value={selected} onChange={e => setSelected(e.target.value)} className={ic}>
          <option value="">Select employee...</option>
          {employees.map(e => <option key={e.id} value={e.id}>{e.name} — {e.designation || "—"}</option>)}
        </select>
      </div>

      {emp && (
        <>
          {/* Employee Summary */}
          <div className="bg-zinc-50 rounded-xl border border-zinc-200 p-4 mb-6">
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div><p className="text-zinc-500 text-xs">Name</p><p className="font-medium">{emp.name}</p></div>
              <div><p className="text-zinc-500 text-xs">Designation</p><p className="font-medium">{emp.designation || "—"}</p></div>
              <div><p className="text-zinc-500 text-xs">Department</p><p className="font-medium">{emp.department?.name || "—"}</p></div>
              <div><p className="text-zinc-500 text-xs">Joining Date</p><p className="font-medium">{emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString("en-IN") : "—"}</p></div>
            </div>
            {!emp.basicSalary && <p className="text-amber-600 text-xs mt-3">⚠️ No salary set — salary section will show Rs.0. Edit employee to add salary.</p>}
          </div>

          {/* Letter Cards */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-zinc-200 p-6">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-zinc-900 mb-1">Offer Letter</h2>
              <p className="text-sm text-zinc-500 mb-4">Pre-joining letter with CTC details, position and joining date</p>
              <a href={`/api/letters?employeeId=${emp.id}&type=offer`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 w-fit">
                <Download className="w-4 h-4" /> Download Offer Letter
              </a>
            </div>

            <div className="bg-white rounded-xl border border-zinc-200 p-6">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-zinc-900 mb-1">Appointment Letter</h2>
              <p className="text-sm text-zinc-500 mb-4">Post-joining confirmation with terms, conditions and salary</p>
              <a href={`/api/letters?employeeId=${emp.id}&type=appointment`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 w-fit">
                <Download className="w-4 h-4" /> Download Appointment Letter
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
