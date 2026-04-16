"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2, Send } from "lucide-react";
import { format } from "date-fns";
import { StatusTimeline } from "@/components/status-timeline";
import { ApprovalActions } from "@/components/approval-actions";
import { FileUpload } from "@/components/file-upload";
import { AttachmentsList } from "@/components/attachments-list";
import { PerDiemCalculator } from "@/components/per-diem-calculator";
import { PolicyWarnings } from "@/components/policy-warnings";
import { TripLegs } from "@/components/trip-legs";

interface TravelRequest {
  id: string;
  title: string;
  travelerName: string;
  originCity: string | null;
  destination: string;
  departureDate: string;
  departureTime: string | null;
  returnDate: string;
  returnTime: string | null;
  travelMode: string;
  purpose: string;
  status: string;
  estimatedCost: number;
  selectedOffer: unknown;
  bookedFlight: any;
  notes: string | null;
  createdAt: string;
  statusHistory: StatusEntry[];
  attachments: Attachment[];
}

interface StatusEntry {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  comment: string | null;
  changedBy: string;
  changedAt: string;
}

interface Attachment {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  uploadedAt: string;
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

export default function TravelDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const [req, setReq] = useState<TravelRequest | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRequest = useCallback(() => {
    fetch(`/api/travel/${id}`)
      .then((r) => r.json())
      .then(setReq)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchRequest();
  }, [fetchRequest]);

  async function handleSubmitForApproval() {
    const res = await fetch(`/api/travel/${id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "PENDING",
        comment: "Submitted for approval",
        changedBy: req?.travelerName || "User",
      }),
    });
    if (res.ok) fetchRequest();
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this travel request?")) return;
    const res = await fetch(`/api/travel/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/travel");
  }

  if (loading) return <div className="p-8 text-zinc-400">Loading...</div>;
  if (!req) return <div className="p-8 text-red-500">Travel request not found</div>;

  return (
    <div className="p-8 max-w-3xl">
      <Link
        href="/travel"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Travel
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{req.title}</h1>
          <p className="text-zinc-500 mt-1">
            Created {format(new Date(req.createdAt), "MMM d, yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {req.status === "DRAFT" && (
            <button
              onClick={handleSubmitForApproval}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700"
            >
              <Send className="w-3.5 h-3.5" />
              Submit for Approval
            </button>
          )}
          <Link
            href={`/travel/${id}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-300 text-sm text-zinc-600 hover:bg-zinc-50"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Main details */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <span
            className={`inline-block px-2.5 py-1 rounded text-xs font-medium ${statusColors[req.status]}`}
          >
            {req.status}
          </span>
          <span className="text-xs text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded">
            {modeLabels[req.travelMode] || req.travelMode}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
          <div>
            <p className="text-zinc-400 text-xs uppercase tracking-wide mb-1">Traveler</p>
            <p className="text-zinc-900 font-medium">{req.travelerName}</p>
          </div>
          {req.originCity && (
            <div>
              <p className="text-zinc-400 text-xs uppercase tracking-wide mb-1">Origin</p>
              <p className="text-zinc-900 font-medium">{req.originCity}</p>
            </div>
          )}
          <div>
            <p className="text-zinc-400 text-xs uppercase tracking-wide mb-1">Destination</p>
            <p className="text-zinc-900 font-medium">{req.destination}</p>
          </div>
          <div>
            <p className="text-zinc-400 text-xs uppercase tracking-wide mb-1">Departure</p>
            <p className="text-zinc-900">
              {format(new Date(req.departureDate), "MMMM d, yyyy")}
              {req.departureTime && ` at ${req.departureTime}`}
            </p>
          </div>
          <div>
            <p className="text-zinc-400 text-xs uppercase tracking-wide mb-1">Return</p>
            <p className="text-zinc-900">
              {format(new Date(req.returnDate), "MMMM d, yyyy")}
              {req.returnTime && ` at ${req.returnTime}`}
            </p>
          </div>
          <div>
            <p className="text-zinc-400 text-xs uppercase tracking-wide mb-1">Estimated Cost</p>
            <p className="text-zinc-900 font-medium">
              ₹{req.estimatedCost.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="pt-2">
          <p className="text-zinc-400 text-xs uppercase tracking-wide mb-1">Purpose</p>
          <p className="text-zinc-700 text-sm">{req.purpose}</p>
        </div>

        {req.bookedFlight && (
          <div className="pt-2">
            <p className="text-zinc-400 text-xs uppercase tracking-wide mb-2">Booked Flight</p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <div>
                  <p className="font-semibold text-sm text-zinc-900">{req.bookedFlight.airline} {req.bookedFlight.flightNumber}</p>
                  <p className="text-xs text-zinc-500">{req.bookedFlight.departureAirport} → {req.bookedFlight.arrivalAirport} · {(req.bookedFlight.stops||0) === 0 ? 'Non-stop' : req.bookedFlight.stops + ' stop'}</p>
                </div>
              </div>
              <p className="font-bold text-green-600">₹{(req.bookedFlight.price||0).toLocaleString()}</p>
            </div>
          </div>
        )}
        {req.notes && (
          <div className="pt-2">
            <p className="text-zinc-400 text-xs uppercase tracking-wide mb-1">Notes</p>
            <p className="text-zinc-700 text-sm">{req.notes}</p>
          </div>
        )}
        {req.selectedOffer && Array.isArray(req.selectedOffer) && (req.selectedOffer as any[]).length > 0 && (
          <div className="pt-2">
            <p className="text-zinc-400 text-xs uppercase tracking-wide mb-3">Selected Flight Options ({(req.selectedOffer as any[]).length})</p>
            <div className="space-y-2">
              {(req.selectedOffer as any[]).map((o: any, i: number) => (
                <div key={i} className="border border-zinc-200 rounded-lg p-3 bg-zinc-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">{i+1}</div>
                    <div>
                      <p className="font-medium text-sm text-zinc-900">{o.airline || 'Unknown'} {o.flightNumber || ''}</p>
                      <p className="text-xs text-zinc-500">{o.departureAirport || ''} → {o.arrivalAirport || ''} · {(o.stops||0) === 0 ? 'Non-stop' : (o.stops||0) + ' stop'}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className="font-bold text-blue-600">₹{(o.price||0).toLocaleString()}</p>
                      <p className="text-xs text-zinc-400">{(o.duration||'').replace('PT','').replace('H','h ').replace('M','m')}</p>
                    </div>
                    <button
                      onClick={async () => {
                        await fetch(`/api/travel/${id}`, {
                          method: 'PATCH',
                          headers: {'Content-Type':'application/json'},
                          body: JSON.stringify({ bookedFlight: o })
                        });
                        fetchRequest();
                      }}
                      className="text-xs bg-zinc-900 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Select
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Multi-City Trip Legs */}
      <TripLegs requestId={req.id} />

      {/* Per Diem Calculator */}
      <PerDiemCalculator
        destination={req.destination}
        departureDate={req.departureDate}
        returnDate={req.returnDate}
      />

      {/* Policy Warnings */}
      <PolicyWarnings
        estimatedCost={req.estimatedCost}
        travelMode={req.travelMode}
        departureDate={req.departureDate}
        returnDate={req.returnDate}
      />

      {/* Approval Actions (only when PENDING) */}
      {req.status === "PENDING" && (
        <ApprovalActions requestId={req.id} onStatusChange={fetchRequest} />
      )}

      {/* Status Timeline */}
      <StatusTimeline history={req.statusHistory} />

      {/* Attachments */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 mt-4">
        <h3 className="text-sm font-semibold text-zinc-900 mb-3">Attachments</h3>
        <AttachmentsList
          attachments={req.attachments}
          requestId={req.id}
          onDelete={fetchRequest}
        />
        <div className="mt-3">
          <FileUpload requestId={req.id} onUpload={fetchRequest} />
        </div>
      </div>
    </div>
  );
}
