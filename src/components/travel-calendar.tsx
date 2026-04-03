"use client";

import { useState } from "react";
import Link from "next/link";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  format,
  isSameMonth,
  isSameDay,
  isWithinInterval,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TravelRequest {
  id: string;
  title: string;
  travelerName: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  status: string;
}

const statusBg: Record<string, string> = {
  DRAFT: "bg-zinc-200",
  PENDING: "bg-amber-200",
  APPROVED: "bg-green-200",
  REJECTED: "bg-red-200",
  COMPLETED: "bg-blue-200",
  CANCELLED: "bg-zinc-300",
};

export function TravelCalendar({ requests }: { requests: TravelRequest[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = calStart;
  while (day <= calEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  function getTripsForDay(d: Date) {
    return requests.filter((r) => {
      const dep = new Date(r.departureDate);
      const ret = new Date(r.returnDate);
      dep.setHours(0, 0, 0, 0);
      ret.setHours(23, 59, 59, 999);
      return isWithinInterval(d, { start: dep, end: ret });
    });
  }

  const today = new Date();

  return (
    <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1 hover:bg-zinc-100 rounded"
        >
          <ChevronLeft className="w-5 h-5 text-zinc-600" />
        </button>
        <h3 className="text-sm font-semibold text-zinc-900">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1 hover:bg-zinc-100 rounded"
        >
          <ChevronRight className="w-5 h-5 text-zinc-600" />
        </button>
      </div>

      <div className="grid grid-cols-7">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="px-2 py-2 text-center text-xs font-medium text-zinc-400 border-b border-zinc-100"
          >
            {d}
          </div>
        ))}

        {days.map((d, i) => {
          const trips = getTripsForDay(d);
          const inMonth = isSameMonth(d, monthStart);
          const isToday = isSameDay(d, today);

          return (
            <div
              key={i}
              className={`min-h-[80px] border-b border-r border-zinc-100 p-1 ${
                inMonth ? "bg-white" : "bg-zinc-50"
              }`}
            >
              <p
                className={`text-xs text-right mb-0.5 ${
                  isToday
                    ? "bg-zinc-900 text-white w-5 h-5 rounded-full flex items-center justify-center ml-auto"
                    : inMonth
                      ? "text-zinc-700"
                      : "text-zinc-300"
                }`}
              >
                {format(d, "d")}
              </p>
              <div className="space-y-0.5">
                {trips.slice(0, 2).map((trip) => (
                  <Link
                    key={trip.id}
                    href={`/travel/${trip.id}`}
                    className={`block text-[10px] leading-tight px-1 py-0.5 rounded truncate ${statusBg[trip.status]} hover:opacity-80`}
                  >
                    {trip.destination}
                  </Link>
                ))}
                {trips.length > 2 && (
                  <p className="text-[10px] text-zinc-400 px-1">
                    +{trips.length - 2} more
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
