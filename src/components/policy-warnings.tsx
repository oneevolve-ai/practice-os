"use client";

import { AlertTriangle, XOctagon } from "lucide-react";
import { checkPolicyViolations } from "@/lib/travel-policy";

interface Props {
  estimatedCost: number;
  travelMode: string;
  departureDate: string;
  returnDate: string;
}

export function PolicyWarnings(props: Props) {
  const violations = checkPolicyViolations(props);

  if (violations.length === 0) return null;

  return (
    <div className="space-y-2 mt-4">
      {violations.map((v, i) => (
        <div
          key={i}
          className={`flex items-start gap-2 rounded-lg px-4 py-3 text-sm ${
            v.type === "error"
              ? "bg-red-50 border border-red-200 text-red-700"
              : "bg-amber-50 border border-amber-200 text-amber-700"
          }`}
        >
          {v.type === "error" ? (
            <XOctagon className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <p>{v.message}</p>
        </div>
      ))}
    </div>
  );
}
