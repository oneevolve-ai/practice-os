"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Users, Search, UserCheck, Building2, Award, Upload, Download, X } from "lucide-react";
import { PeopleSubNav } from "@/components/people/people-sub-nav";

interface Employee {
  id: string;
  name: string;
  email: string;
  designation: string | null;
  status: string;
  projectRole: string;
  department: { name: string } | null;
}

interface Stats { total: number; active: number; departments: number; licensed: number; }

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  INACTIVE: "bg-zinc-200 text-zinc-500",
};

const roleLabels: Record<string, string> = {
  ARCHITECT: "Architect", ENGINEER: "Engineer", CONSULTANT: "Consultant",
  PROJECT_MANAGER: "Project Manager", DESIGNER: "Designer", OTHER: "Other",
};

const inputClass = "border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, departments: 0, licensed: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showBulk, setShowBulk] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkResult, setBulkResult] = useState<{ created: number; failed: number; errors: string[] } | null>(null);

  function parseCSV(text: string): Record<string, string>[] {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) return [];
    const headers = lines[0].split(",").map((h) => h.trim());
    return lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim());
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => { obj[h] = values[i] || ""; });
      return obj;
    });
  }

  async function handleBulkUpload(file: File) {
    setBulkUploading(true);
    setBulkResult(null);
    const text = await file.text();
    const employees = parseCSV(text);
    if (employees.length === 0) {
      setBulkResult({ created: 0, failed: 0, errors: ["No valid rows found in CSV"] });
      setBulkUploading(false);
      return;
    }

    // Map department names to IDs if needed
    const deptMap = new Map(departments.map((d) => [d.name.toLowerCase(), d.id]));
    const mapped = employees.map((emp) => {
      if (emp.department && !emp.departmentId) {
        emp.departmentId = deptMap.get(emp.department.toLowerCase()) || "";
      }
      return emp;
    });

    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/employees/bulk", {
      method: "POST",
      // no headers needed for FormData
      body: formData,
    });
    const data = await res.json();
    setBulkResult(data);
    setBulkUploading(false);
    if (data.created > 0) {
      fetchEmployees();
      fetch("/api/employees/stats").then((r) => r.json()).then(setStats).catch(() => {});
    }
  }

  const fetchEmployees = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (deptFilter) params.set("department", deptFilter);
    if (statusFilter) params.set("status", statusFilter);

    fetch(`/api/employees?${params}`)
      .then((r) => r.json())
      .then(setEmployees)
      .finally(() => setLoading(false));
  }, [search, deptFilter, statusFilter]);

  useEffect(() => {
    fetch("/api/employees/stats").then((r) => r.json()).then(setStats).catch(() => {});
    fetch("/api/departments").then((r) => r.json()).then(setDepartments).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchEmployees, 300);
    return () => clearTimeout(t);
  }, [fetchEmployees]);

  return (
    <div className="p-8">
      <PeopleSubNav />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Employees</h1>
          <p className="text-zinc-500 mt-1">Team directory</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowBulk(!showBulk)} className="inline-flex items-center gap-2 border border-zinc-300 text-zinc-600 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-50">
            <Upload className="w-4 h-4" /> Bulk Upload
          </button>
          <Link href="/people/employees/new" className="inline-flex items-center gap-2 bg-zinc-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-800">
            <Plus className="w-4 h-4" /> Add Employee
          </Link>
        </div>
      </div>

      {/* Bulk Upload Panel */}
      {showBulk && (
        <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-900">Bulk Upload Employees</h3>
            <button onClick={() => { setShowBulk(false); setBulkResult(null); }} className="text-zinc-400 hover:text-zinc-600"><X className="w-4 h-4" /></button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <a href="/api/employees/template" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                <Download className="w-4 h-4" /> Download CSV Template
              </a>
            </div>
            <p className="text-xs text-zinc-500">
              Fill in the CSV template with employee data. Required columns: <strong>name</strong> and <strong>email</strong>. All other fields are optional.
              Use department names (they&apos;ll be matched automatically) or leave blank.
            </p>
            <label className={`flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed rounded-lg px-6 py-4 text-sm transition-colors ${bulkUploading ? "border-zinc-200 text-zinc-400" : "border-zinc-300 text-zinc-500 hover:border-zinc-400"}`}>
              <Upload className="w-5 h-5" />
              {bulkUploading ? "Uploading..." : "Click to upload CSV file"}
              <input type="file" accept=".csv" className="hidden" disabled={bulkUploading} onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleBulkUpload(file);
                e.target.value = "";
              }} />
            </label>
            {bulkResult && (
              <div className={`rounded-lg p-4 text-sm ${bulkResult.failed > 0 ? "bg-amber-50 border border-amber-200" : "bg-green-50 border border-green-200"}`}>
                <p className="font-medium">{bulkResult.created} employee(s) created, {bulkResult.failed} failed</p>
                {bulkResult.errors && bulkResult.errors.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs text-amber-700">
                    {bulkResult.errors.map((err, i) => <li key={i}>• {err}</li>)}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Employees", value: stats.total, icon: Users, color: "zinc" },
          { label: "Active", value: stats.active, icon: UserCheck, color: "green" },
          { label: "Departments", value: stats.departments, icon: Building2, color: "blue" },
          { label: "Licensed (PE/RA)", value: stats.licensed, icon: Award, color: "amber" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`bg-white rounded-xl border border-${s.color}-200 p-4`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 bg-${s.color}-100 rounded-lg`}>
                  <Icon className={`w-5 h-5 text-${s.color}-600`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-zinc-900">{s.value}</p>
                  <p className="text-xs text-zinc-500">{s.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input type="text" placeholder="Search name, email, designation..." value={search} onChange={(e) => setSearch(e.target.value)} className={`${inputClass} pl-9 w-full`} />
        </div>
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className={inputClass}>
          <option value="">All Departments</option>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputClass}>
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-zinc-400">Loading...</div>
      ) : employees.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-zinc-200">
          <Users className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-zinc-600">No employees found</h3>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="text-left px-4 py-3 font-medium text-zinc-500">Name</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500">Email</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500">Department</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500">Designation</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500">Role</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                  <td className="px-4 py-3">
                    <Link href={`/people/employees/${emp.id}`} className="font-medium text-zinc-900 hover:underline">{emp.name}</Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{emp.email}</td>
                  <td className="px-4 py-3 text-zinc-600">{emp.department?.name || "—"}</td>
                  <td className="px-4 py-3 text-zinc-600">{emp.designation || "—"}</td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{roleLabels[emp.projectRole] || emp.projectRole}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusColors[emp.status]}`}>{emp.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
