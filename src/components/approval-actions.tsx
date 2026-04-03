"use client";

import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";

interface Props {
  requestId: string;
  onStatusChange: () => void;
}

export function ApprovalActions({ requestId, onStatusChange }: Props) {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAction(newStatus: "APPROVED" | "REJECTED") {
    if (newStatus === "REJECTED" && !comment.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    setLoading(true);
    const res = await fetch(`/api/travel/${requestId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: newStatus,
        comment: comment.trim() || null,
        changedBy: "Manager",
      }),
    });

    if (res.ok) {
      onStatusChange();
    } else {
      alert("Failed to update status");
    }
    setLoading(false);
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mt-4">
      <h3 className="text-sm font-semibold text-amber-900 mb-3">Approval Required</h3>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add a comment (required for rejection)..."
        rows={2}
        className="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 mb-3"
      />
      <div className="flex gap-2">
        <button
          onClick={() => handleAction("APPROVED")}
          disabled={loading}
          className="inline-flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
        >
          <CheckCircle className="w-4 h-4" />
          Approve
        </button>
        <button
          onClick={() => handleAction("REJECTED")}
          disabled={loading}
          className="inline-flex items-center gap-1.5 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
        >
          <XCircle className="w-4 h-4" />
          Reject
        </button>
      </div>
    </div>
  );
}
