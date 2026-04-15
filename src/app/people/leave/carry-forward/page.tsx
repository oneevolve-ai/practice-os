"use client";
import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

interface CarryForward {
  id: string; leaveType: string; fromYear: number; toYear: number; daysCarried: number;
  employee: { name: string; department: { name: string } | null };
}

const TYPE_COLORS: Record<string, string> = {
  CASUAL: "bg-blue-100 text-blue-700", PRIVILEGE: "bg-purple-100 text-purple-700",
  EARNED: "bg-green-100 text-green-700", COMP_OFF: "bg-orange-100 text-orange-700",
};

export default function LeaveCarryForwardPage() {
  const [records, setRecords] = useState<CarryForward[]>([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ carried: number; skipped: number; results: string[] } | null>(null);
  const [fromYear, setFromYear] = useState(new Date().getFullYear() - 1);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const ic = "border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400";

  async function fetchRecords() {
    setLoading(true);
    fetch(`/api/leave/carry-forward?year=${viewYear}`).then(r => r.json()).then(setRecords).finally(() => setLoading(false));
  }

  useEffect(() => { fetchRecords(); }, [viewYear]);

  async function runCarryForward() {
    setRunning(true);
    const res = await fetch("/api/leave/carry-forward", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromYear }),
    });
    const data = await res.json();
    setResult(data);
    setRunning(false);
    fetchRecords();
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Leave Carry Forward</h1>
          <p className="text-zinc-500 text-sm">Carry unused leave balances to next year</p>
        </div>
      </div>

      {/* Run Carry Forward */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-6">
        <h2 className="font-semibold text-zinc-900 mb-1">Run Carry Forward</h2>
        <p className="text-sm text-zinc-500 mb-4">
          Carries unused leave from one year to the next. Max carry: Casual 5 days, Privilege 15 days, Earned 15 days, Comp Off 2 days. Sick leave is not carried forward.
        </p>
        <div className="flex items-center gap-3">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">From Year</label>
            <input type="number" value={fromYear} onChange={e => setFromYear(Number(e.target.value))} className={ic} style={{ width: 100 }} />
          </div>
          <div className="pt-5 text-zinc-400">→</div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">To Year</label>
            <input type="number" value={fromYear + 1} disabled className={`${ic} bg-zinc-50`} style={{ width: 100 }} />
          </div>
          <button onClick={runCarryForward} disabled={running} className="mt-5 flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-zinc-700 disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${running ? "animate-spin" : ""}`} />
            {running ? "Running..." : "Run Carry Forward"}
          </button>
        </div>

        {result && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm font-medium text-green-800">✅ {result.carried} carry forward records created · {result.skipped} skipped</p>
            {result.results.length > 0 && (
              <div className="mt-2 max-h-32 overflow-y-auto">
                {result.results.map((r, i) => <p key={i} className="text-xs text-green-700">• {r}</p>)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* View Records */}
      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm font-medium text-zinc-700">View Year:</label>
        <input type="number" value={viewYear} onChange={e => setViewYear(Number(e.target.value))} className={ic} style={{ width: 100 }} />
        <button onClick={fetchRecords} className="border border-zinc-300 text-zinc-700 px-3 py-2 rounded-lg text-sm hover:bg-zinc-50">Refresh</button>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        {records.length === 0 ? (
          <div className="text-center py-16 text-zinc-400">
            <p>{loading ? "Loading..." : "No carry forward records found for this year"}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                {["Employee","Department","Leave Type","From Year","To Year","Days Carried"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {records.map(r => (
                <tr key={r.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3 font-medium text-zinc-900">{r.employee.name}</td>
                  <td className="px-4 py-3 text-zinc-500">{r.employee.department?.name || "—"}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[r.leaveType] || "bg-zinc-100 text-zinc-600"}`}>{r.leaveType}</span></td>
                  <td className="px-4 py-3 text-zinc-500">{r.fromYear}</td>
                  <td className="px-4 py-3 text-zinc-500">{r.toYear}</td>
                  <td className="px-4 py-3 font-bold text-green-600">{r.daysCarried} days</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
