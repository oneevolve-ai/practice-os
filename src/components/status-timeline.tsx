"use client";

import { formatDistanceToNow } from "date-fns";

interface StatusEntry {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  comment: string | null;
  changedBy: string;
  changedAt: string;
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-zinc-400",
  PENDING: "bg-amber-500",
  APPROVED: "bg-green-500",
  REJECTED: "bg-red-500",
  COMPLETED: "bg-blue-500",
  CANCELLED: "bg-zinc-400",
};

export function StatusTimeline({ history }: { history: StatusEntry[] }) {
  if (!history || history.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-6 mt-4">
      <h3 className="text-sm font-semibold text-zinc-900 mb-4">Status History</h3>
      <div className="space-y-0">
        {history.map((entry, i) => (
          <div key={entry.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full mt-1.5 ${statusColors[entry.toStatus] || "bg-zinc-400"}`} />
              {i < history.length - 1 && <div className="w-0.5 flex-1 bg-zinc-200 my-1" />}
            </div>
            <div className="pb-4">
              <p className="text-sm text-zinc-900">
                {entry.fromStatus ? (
                  <>
                    <span className="font-medium">{entry.fromStatus}</span>
                    {" → "}
                    <span className="font-medium">{entry.toStatus}</span>
                  </>
                ) : (
                  <span className="font-medium">{entry.toStatus}</span>
                )}
              </p>
              {entry.comment && (
                <p className="text-sm text-zinc-600 mt-0.5">&ldquo;{entry.comment}&rdquo;</p>
              )}
              <p className="text-xs text-zinc-400 mt-0.5">
                {entry.changedBy} &middot;{" "}
                {formatDistanceToNow(new Date(entry.changedAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
