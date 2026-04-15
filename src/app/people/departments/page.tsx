"use client";
import { useEffect, useState } from "react";
import { Building2, Users, Pencil, X, Check } from "lucide-react";

interface Department {
  id: string; name: string; code: string; description: string | null;
  defaultBasicMin: number | null; defaultBasicMax: number | null;
  _count?: { employees: number };
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Department>>({});
  const ic = "border border-zinc-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 w-full";
  const fmt = (n: number | null) => n ? `Rs.${n.toLocaleString("en-IN")}` : "—";

  useEffect(() => {
    fetch("/api/departments").then(r => r.json()).then(setDepartments).catch(() => {});
  }, []);

  async function saveEdit(id: string) {
    const res = await fetch(`/api/departments/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    });
    if (res.ok) {
      const updated = await res.json();
      setDepartments(departments.map(d => d.id === id ? { ...d, ...updated } : d));
      setEditing(null);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Departments</h1>
        <p className="text-zinc-500 text-sm">{departments.length} departments · Set salary ranges per department</p>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              {["Department","Code","Employees","Min Basic (Rs.)","Max Basic (Rs.)","Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {departments.map(dept => (
              <tr key={dept.id} className="hover:bg-zinc-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-zinc-500" />
                    </div>
                    {editing === dept.id ? (
                      <input value={editData.name || ""} onChange={e => setEditData({...editData, name: e.target.value})} className={ic} />
                    ) : (
                      <span className="font-medium text-zinc-900">{dept.name}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3"><span className="bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded text-xs font-mono">{dept.code}</span></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-zinc-500">
                    <Users className="w-3 h-3" />
                    <span>{dept._count?.employees || 0}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {editing === dept.id ? (
                    <input type="number" value={editData.defaultBasicMin || ""} onChange={e => setEditData({...editData, defaultBasicMin: Number(e.target.value)})} className={ic} placeholder="e.g. 25000" />
                  ) : (
                    <span className="text-zinc-700">{fmt(dept.defaultBasicMin)}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editing === dept.id ? (
                    <input type="number" value={editData.defaultBasicMax || ""} onChange={e => setEditData({...editData, defaultBasicMax: Number(e.target.value)})} className={ic} placeholder="e.g. 50000" />
                  ) : (
                    <span className="text-zinc-700">{fmt(dept.defaultBasicMax)}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editing === dept.id ? (
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(dept.id)} className="text-green-600 hover:text-green-700"><Check className="w-4 h-4" /></button>
                      <button onClick={() => setEditing(null)} className="text-zinc-400 hover:text-zinc-600"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditing(dept.id); setEditData({ name: dept.name, defaultBasicMin: dept.defaultBasicMin, defaultBasicMax: dept.defaultBasicMax }); }} className="text-zinc-400 hover:text-zinc-600">
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
