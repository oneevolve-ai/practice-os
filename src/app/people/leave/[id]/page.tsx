"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { PeopleSubNav } from "@/components/people/people-sub-nav";

interface Leave {
  id: string; leaveType: string; startDate: string; endDate: string;
  days: number; reason: string | null; status: string;
  reviewedBy: string | null; reviewNote: string | null; createdAt: string;
  employee: { name: string; email: string; department: { name: string } | null };
}

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700", APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700", CANCELLED: "bg-zinc-200 text-zinc-500",
};

const typeLabels: Record<string, string> = {
  CASUAL: "Casual", SICK: "Sick", EARNED: "Earned", UNPAID: "Unpaid", COMP_OFF: "Comp Off", PRIVILEGE: "Privilege",
};

export default function LeaveDetailPage() {
  const { id } = useParams();
  const [leave, setLeave] = useState<Leave | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [loading, setLoading] = useState(true);

  function fetchLeave() {
    fetch(`/api/leave/${id}`).then((r) => r.json()).then(setLeave).finally(() => setLoading(false));
  }

  useEffect(() => { fetchLeave(); }, [id]);

  async function handleAction(status: string) {
    await fetch(`/api/leave/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reviewedBy: "Manager", reviewNote: reviewNote || null }),
    });
    fetchLeave();
  }

  if (loading) return <div className="p-8 text-zinc-400">Loading...</div>;
  if (!leave) return <div className="p-8 text-red-500">Leave request not found</div>;

  return (
    <div className="p-8 max-w-3xl">
      <PeopleSubNav />
      <Link href="/people/leave" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Leave
      </Link>

      <h1 className="text-2xl font-bold text-zinc-900 mb-1">{typeLabels[leave.leaveType]} Leave</h1>
      <p className="text-zinc-500 mb-6">Applied {format(new Date(leave.createdAt), "MMM d, yyyy")}</p>

      <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4">
        <span className={`inline-block px-2.5 py-1 rounded text-xs font-medium ${statusColors[leave.status]}`}>{leave.status}</span>
        <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
          <div><p className="text-zinc-400 text-xs uppercase tracking-wide mb-1">Employee</p><p className="text-zinc-900 font-medium">{leave.employee.name}</p></div>
          <div><p className="text-zinc-400 text-xs uppercase tracking-wide mb-1">Department</p><p className="text-zinc-900">{leave.employee.department?.name || "—"}</p></div>
          <div><p className="text-zinc-400 text-xs uppercase tracking-wide mb-1">Start Date</p><p className="text-zinc-900">{format(new Date(leave.startDate), "MMMM d, yyyy")}</p></div>
          <div><p className="text-zinc-400 text-xs uppercase tracking-wide mb-1">End Date</p><p className="text-zinc-900">{format(new Date(leave.endDate), "MMMM d, yyyy")}</p></div>
          <div><p className="text-zinc-400 text-xs uppercase tracking-wide mb-1">Days</p><p className="text-zinc-900 font-medium">{leave.days}</p></div>
          <div><p className="text-zinc-400 text-xs uppercase tracking-wide mb-1">Leave Type</p><p className="text-zinc-900">{typeLabels[leave.leaveType]}</p></div>
        </div>
        {leave.reason && <div><p className="text-zinc-400 text-xs uppercase tracking-wide mb-1">Reason</p><p className="text-zinc-700 text-sm">{leave.reason}</p></div>}
        {leave.reviewedBy && <div className="pt-2 border-t border-zinc-100">
          <p className="text-zinc-400 text-xs uppercase tracking-wide mb-1">Reviewed By</p><p className="text-zinc-700 text-sm">{leave.reviewedBy}</p>
          {leave.reviewNote && <p className="text-zinc-500 text-sm mt-1">{leave.reviewNote}</p>}
        </div>}
      </div>

      {leave.status === "PENDING" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mt-4">
          <h3 className="text-sm font-semibold text-amber-900 mb-3">Review Leave Request</h3>
          <textarea value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} placeholder="Add a note (optional)..." rows={2} className="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-amber-400" />
          <div className="flex gap-2">
            <button onClick={() => handleAction("APPROVED")} className="inline-flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
              <CheckCircle className="w-4 h-4" /> Approve
            </button>
            <button onClick={() => handleAction("CANCELLED")} className="inline-flex items-center gap-1.5 border border-zinc-300 text-zinc-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-50">
              Cancel Leave
            </button>
            <button onClick={() => handleAction("REJECTED")} className="inline-flex items-center gap-1.5 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700">
              <XCircle className="w-4 h-4" /> Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
