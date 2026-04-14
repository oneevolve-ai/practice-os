"use client";

import { useEffect, useState } from "react";
import { Building2, Plus, Pencil, Trash2, X, Upload, Download } from "lucide-react";
import { PeopleSubNav } from "@/components/people/people-sub-nav";

interface Department {
  id: string;
  name: string;
  code: string;
  description: string | null;
  _count: { employees: number };
}

const inputClass =
  "w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkResult, setBulkResult] = useState<{ created: number; errors: string[] } | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  function fetchDepartments() {
    fetch("/api/departments")
      .then((r) => r.json())
      .then(setDepartments)
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchDepartments(); }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const body = {
      name: form.get("name"),
      code: form.get("code"),
      description: form.get("description") || "",
    };

    const url = editId ? `/api/departments/${editId}` : "/api/departments";
    const method = editId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setShowForm(false);
      setEditId(null);
      fetchDepartments();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to save department");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this department?")) return;
    const res = await fetch(`/api/departments/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchDepartments();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to delete");
    }
  }

  function startEdit(dept: Department) {
    setEditId(dept.id);
    setShowForm(true);
  }

  const editDept = editId ? departments.find((d) => d.id === editId) : null;

  return (
    <div className="p-8">
      <PeopleSubNav />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Departments</h1>
          <p className="text-zinc-500 mt-1">Manage company departments</p>
        </div>
        {!showForm && (
          <>
          <button onClick={() => setShowBulk(!showBulk)} className="inline-flex items-center gap-2 border border-zinc-300 text-zinc-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-50 mr-2"><Upload className="w-4 h-4" />Bulk Upload</button>
          <button
            onClick={() => { setShowForm(true); setEditId(null); }}
            className="inline-flex items-center gap-2 bg-zinc-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-800"
          >
            <Plus className="w-4 h-4" />
            Add Department
          </button>
          </>
        )}

      {showBulk && (
        <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-zinc-900">Bulk Upload Departments</h2>
            <button onClick={() => { setShowBulk(false); setBulkResult(null); }} className="text-zinc-400 hover:text-zinc-600"><X className="w-4 h-4" /></button>
          </div>
          <a href="/api/departments/template" download className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mb-4 block"><Download className="w-4 h-4" />Download CSV Template</a>
          <p className="text-xs text-zinc-500 mb-4">Required: <strong>name</strong>. Optional: <strong>code</strong> (auto-generated if blank), description</p>
          <label className="flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed border-zinc-300 rounded-lg px-6 py-8 text-sm text-zinc-500 hover:border-zinc-400">
            <Upload className="w-4 h-4" />
            {bulkUploading ? "Uploading..." : "Click to upload CSV file"}
            <input type="file" accept=".csv" className="hidden" disabled={bulkUploading} onChange={e => {
              const f = e.target.files?.[0];
              if (f) {
                setBulkUploading(true);
                const fd = new FormData();
                fd.append("file", f);
                fetch("/api/departments/bulk", { method: "POST", body: fd })
                  .then(r => r.json())
                  .then(data => { setBulkResult(data); setBulkUploading(false); if (data.created > 0) fetchDepartments(); })
                  .catch(() => setBulkUploading(false));
              }
            }} />
          </label>
          {bulkResult && (
            <div className={`mt-4 rounded-lg p-4 text-sm ${bulkResult.errors.length > 0 ? "bg-amber-50 border border-amber-200" : "bg-green-50 border border-green-200"}`}>
              <p className="font-medium">✅ {bulkResult.created} department(s) created</p>
              {bulkResult.errors.length > 0 && <ul className="text-xs text-amber-700 mt-2">{bulkResult.errors.map((e, i) => <li key={i}>• {e}</li>)}</ul>}
            </div>
          )}
        </div>
      )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-zinc-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-900">
              {editId ? "Edit Department" : "New Department"}
            </h3>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="text-zinc-400 hover:text-zinc-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Name</label>
              <input name="name" required defaultValue={editDept?.name || ""} placeholder="e.g. Engineering" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Code</label>
              <input name="code" required defaultValue={editDept?.code || ""} placeholder="e.g. ENG" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Description</label>
              <input name="description" defaultValue={editDept?.description || ""} placeholder="Optional" className={inputClass} />
            </div>
          </div>
          <button type="submit" className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800">
            {editId ? "Save Changes" : "Create Department"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-zinc-400">Loading...</div>
      ) : departments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-zinc-200">
          <Building2 className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-zinc-600">No departments yet</h3>
          <p className="text-sm text-zinc-400 mt-1">Create your first department to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <div key={dept.id} className="bg-white rounded-xl border border-zinc-200 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-zinc-900">{dept.name}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">{dept.code}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(dept)} className="p-1 text-zinc-400 hover:text-zinc-600">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(dept.id)} className="p-1 text-zinc-400 hover:text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {dept.description && <p className="text-sm text-zinc-500 mt-2">{dept.description}</p>}
              <p className="text-xs text-zinc-400 mt-3">
                {dept._count.employees} employee{dept._count.employees !== 1 ? "s" : ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
