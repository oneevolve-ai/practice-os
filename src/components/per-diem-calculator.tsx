"use client";

import { DollarSign } from "lucide-react";
import { calculatePerDiem } from "@/lib/per-diem-rates";

interface Props {
  destination: string;
  departureDate: string;
  returnDate: string;
}

export function PerDiemCalculator({ destination, departureDate, returnDate }: Props) {
  const { dailyRate, days, total, isDefault } = calculatePerDiem(
    destination,
    departureDate,
    returnDate
  );

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
      <div className="flex items-center gap-2 mb-2">
        <DollarSign className="w-4 h-4 text-blue-600" />
        <h3 className="text-sm font-semibold text-blue-900">Per Diem Allowance</h3>
      </div>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-blue-400 text-xs uppercase tracking-wide">Daily Rate</p>
          <p className="text-blue-900 font-medium">₹{dailyRate}/day</p>
        </div>
        <div>
          <p className="text-blue-400 text-xs uppercase tracking-wide">Duration</p>
          <p className="text-blue-900 font-medium">{days} day{days !== 1 ? "s" : ""}</p>
        </div>
        <div>
          <p className="text-blue-400 text-xs uppercase tracking-wide">Total Allowance</p>
          <p className="text-blue-900 font-bold">₹{total.toLocaleString()}</p>
        </div>
      </div>
      {isDefault && (
        <p className="text-xs text-blue-500 mt-2">
          * Using default rate. Destination-specific rate not found.
        </p>
      )}
    </div>
  );
}
