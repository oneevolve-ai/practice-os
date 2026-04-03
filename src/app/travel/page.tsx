"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Plane, Search, Clock, CalendarCheck, DollarSign, FileText, Download, List, Calendar } from "lucide-react";
import { TravelCalendar } from "@/components/travel-calendar";
import { format } from "date-fns";

interface Stats {
  total: number;
  pending: number;
  upcoming: number;
  monthlySpend: number;
}

interface TravelRequest {
  id: string;
  title: string;
  travelerName: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  travelMode: string;
  status: string;
  estimatedCost: number;
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-zinc-100 text-zinc-600",
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-zinc-200 text-zinc-500",
};

const modeLabels: Record<string, string> = {
  FLIGHT: "Flight",
  TRAIN: "Train",
  BUS: "Bus",
  CAR: "Car",
  OTHER: "Other",
};

const ALL_STATUSES = ["", "DRAFT", "PENDING", "APPROVED", "REJECTED", "COMPLETED", "CANCELLED"];

const inputClass =
  "border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400";

export default function TravelListPage() {
  const [requests, setRequests] = useState<TravelRequest[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, upcoming: 0, monthlySpend: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [view, setView] = useState<"list" | "calendar">("list");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === requests.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(requests.map((r) => r.id)));
    }
  }

  async function handleBulkAction(status: string) {
    if (selected.size === 0) return;
    const label = status === "APPROVED" ? "approve" : "reject";
    if (!confirm(`${label} ${selected.size} request(s)?`)) return;

    setBulkLoading(true);
    const res = await fetch("/api/travel/bulk-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selected), status }),
    });

    if (res.ok) {
      setSelected(new Set());
      fetchRequests();
      fetch("/api/travel/stats").then((r) => r.json()).then(setStats).catch(() => {});
    }
    setBulkLoading(false);
  }

  const fetchRequests = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);

    fetch(`/api/travel?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setRequests(data))
      .finally(() => setLoading(false));
  }, [search, statusFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetch("/api/travel/stats").then((r) => r.json()).then(setStats).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchRequests, 300);
    return () => clearTimeout(timer);
  }, [fetchRequests]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Travel Requests</h1>
          <p className="text-zinc-500 mt-1">Manage travel for the team</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/api/travel/export?search=${search}&status=${statusFilter}`}
            className="inline-flex items-center gap-2 border border-zinc-300 text-zinc-600 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </a>
          <Link
            href="/travel/new"
            className="inline-flex items-center gap-2 bg-zinc-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Request
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-zinc-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-100 rounded-lg">
              <FileText className="w-5 h-5 text-zinc-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900">{stats.total}</p>
              <p className="text-xs text-zinc-500">Total Requests</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-amber-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-700">{stats.pending}</p>
              <p className="text-xs text-zinc-500">Pending Approval</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-blue-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CalendarCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{stats.upcoming}</p>
              <p className="text-xs text-zinc-500">Upcoming Trips</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-green-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">
                ₹{stats.monthlySpend.toLocaleString()}
              </p>
              <p className="text-xs text-zinc-500">Monthly Spend</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search title, traveler, destination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${inputClass} pl-9 w-full`}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={inputClass}
        >
          <option value="">All Statuses</option>
          {ALL_STATUSES.filter(Boolean).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className={inputClass}
          title="From date"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className={inputClass}
          title="To date"
        />
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-1 mb-4">
        <button
          onClick={() => setView("list")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            view === "list" ? "bg-zinc-900 text-white" : "text-zinc-500 hover:bg-zinc-100"
          }`}
        >
          <List className="w-4 h-4" />
          List
        </button>
        <button
          onClick={() => setView("calendar")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            view === "calendar" ? "bg-zinc-900 text-white" : "text-zinc-500 hover:bg-zinc-100"
          }`}
        >
          <Calendar className="w-4 h-4" />
          Calendar
        </button>
      </div>

      {view === "calendar" ? (
        <TravelCalendar requests={requests} />
      ) : loading ? (
        <div className="text-center py-12 text-zinc-400">Loading...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-zinc-200">
          <Plane className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-zinc-600">
            No travel requests found
          </h3>
          <p className="text-sm text-zinc-400 mt-1 mb-4">
            {search || statusFilter || dateFrom || dateTo
              ? "Try adjusting your filters"
              : "Create your first travel request to get started"}
          </p>
          {!search && !statusFilter && !dateFrom && !dateTo && (
            <Link
              href="/travel/new"
              className="inline-flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800"
            >
              <Plus className="w-4 h-4" />
              New Request
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.size === requests.length && requests.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-zinc-300"
                  />
                </th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500">Title</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500">Traveler</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500">Destination</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500">Mode</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500">Dates</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500">Cost</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                  <td className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(req.id)}
                      onChange={() => toggleSelect(req.id)}
                      className="rounded border-zinc-300"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/travel/${req.id}`}
                      className="font-medium text-zinc-900 hover:underline"
                    >
                      {req.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{req.travelerName}</td>
                  <td className="px-4 py-3 text-zinc-600">{req.destination}</td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">
                    {modeLabels[req.travelMode] || req.travelMode}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {format(new Date(req.departureDate), "MMM d")} —{" "}
                    {format(new Date(req.returnDate), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    ₹{req.estimatedCost.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusColors[req.status]}`}
                    >
                      {req.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Bulk Actions Bar */}
          {selected.size > 0 && (
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 border-t border-zinc-200">
              <p className="text-sm text-zinc-600">
                {selected.size} request{selected.size > 1 ? "s" : ""} selected
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction("APPROVED")}
                  disabled={bulkLoading}
                  className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  Approve Selected
                </button>
                <button
                  onClick={() => handleBulkAction("REJECTED")}
                  disabled={bulkLoading}
                  className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  Reject Selected
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
