"use client";
import { BackButton } from "@/components/back-button";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";

interface RegRequest {
  id: string; date: string; requestedCheckIn: string | null; requestedCheckOut: string | null;
  reason: string; status: string; reviewedBy: string | null; createdAt: string;
  employee: { name: string; department: { name: string } | null };
}

const statusColors: Record<string, string> = { PENDING: "bg-amber-100 text-amber-700", APPROVED: "bg-green-100 text-green-700", REJECTED: "bg-red-100 text-red-700" };
const ic = "border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400";

export default function RegularizationPage() {
  const [requests, setRequests] = useState<RegRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchRequests = useCallback(() => {
    setLoading(true);
    const params = statusFilter ? `?status=${statusFilter}` : "";
    fetch(`/api/regularization${params}`).then((r) => r.json()).then(setRequests).finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  async function handleAction(id: string, status: string) {
    await fetch(`/api/regularization/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reviewedBy: "Manager" }),
    });
    fetchRequests();
  }

  return (
    <div className="p-8">
      <BackButton href="/people/attendance" />
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-zinc-900">Regularization Requests</h1><p className="text-zinc-500 mt-1">Review attendance correction requests</p></div>
      </div>

      <div className="flex gap-3 mb-4">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={ic}>
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option>
        </select>
      </div>

      {loading ? <div className="text-center py-12 text-zinc-400">Loading...</div>
      : requests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-zinc-200">
          <Clock className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-zinc-600">No regularization requests</h3>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-zinc-100 bg-zinc-50">
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Employee</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Date</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Requested Times</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Reason</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Status</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Actions</th>
            </tr></thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-900">{r.employee.name}</p>
                    <p className="text-xs text-zinc-400">{r.employee.department?.name}</p>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{format(new Date(r.date), "MMM d, yyyy")}</td>
                  <td className="px-4 py-3 text-zinc-600">
                    {r.requestedCheckIn && <span>In: {r.requestedCheckIn}</span>}
                    {r.requestedCheckIn && r.requestedCheckOut && <span> · </span>}
                    {r.requestedCheckOut && <span>Out: {r.requestedCheckOut}</span>}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs max-w-[200px] truncate">{r.reason}</td>
                  <td className="px-4 py-3"><span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusColors[r.status]}`}>{r.status}</span></td>
                  <td className="px-4 py-3">
                    {r.status === "PENDING" && (
                      <div className="flex gap-1">
                        <button onClick={() => handleAction(r.id, "APPROVED")} className="p-1 text-green-600 hover:bg-green-50 rounded"><CheckCircle className="w-4 h-4" /></button>
                        <button onClick={() => handleAction(r.id, "REJECTED")} className="p-1 text-red-600 hover:bg-red-50 rounded"><XCircle className="w-4 h-4" /></button>
                      </div>
                    )}
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
