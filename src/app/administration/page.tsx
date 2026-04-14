"use client";
import Link from "next/link";
import { Plane, UserCheck } from "lucide-react";

export default function AdministrationPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Administration</h1>
        <p className="text-zinc-500 mt-1">Manage travel and visitor operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/travel" className="bg-white rounded-xl border border-zinc-200 p-8 hover:shadow-md transition-shadow group">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
            <Plane className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-900 mb-2">Travel</h2>
          <p className="text-sm text-zinc-500">Manage travel requests, approvals, bookings and per diem</p>
          <p className="text-sm text-blue-600 mt-4 font-medium group-hover:underline">Open Travel →</p>
        </Link>

        <Link href="/visitors" className="bg-white rounded-xl border border-zinc-200 p-8 hover:shadow-md transition-shadow group">
          <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-4">
            <UserCheck className="w-6 h-6 text-teal-600" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-900 mb-2">Visitors</h2>
          <p className="text-sm text-zinc-500">Register visitors, manage check-ins and host notifications</p>
          <p className="text-sm text-teal-600 mt-4 font-medium group-hover:underline">Open Visitors →</p>
        </Link>
      </div>
    </div>
  );
}
