"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
  estimatedCost: number;
  notes: string | null;
}

const TRAVEL_MODES = [
  { value: "FLIGHT", label: "Flight" },
  { value: "TRAIN", label: "Train" },
  { value: "BUS", label: "Bus" },
  { value: "CAR", label: "Car" },
  { value: "OTHER", label: "Other" },
];

const inputClass =
  "w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400";

export default function EditTravelRequestPage() {
  const { id } = useParams();
  const router = useRouter();
  const [req, setReq] = useState<TravelRequest | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/travel/${id}`)
      .then((r) => r.json())
      .then(setReq);
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const form = new FormData(e.currentTarget);
    const body = {
      title: form.get("title"),
      travelerName: form.get("travelerName"),
      originCity: form.get("originCity") || "",
      destination: form.get("destination"),
      departureDate: form.get("departureDate"),
      departureTime: form.get("departureTime") || "",
      returnDate: form.get("returnDate"),
      returnTime: form.get("returnTime") || "",
      travelMode: form.get("travelMode") || "FLIGHT",
      purpose: form.get("purpose"),
      estimatedCost: parseFloat(form.get("estimatedCost") as string) || 0,
      notes: form.get("notes") || "",
    };

    const res = await fetch(`/api/travel/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      router.push(`/travel/${id}`);
    } else {
      setSaving(false);
      alert("Failed to update travel request");
    }
  }

  if (!req) return <div className="p-8 text-zinc-400">Loading...</div>;

  const depDate = req.departureDate ? req.departureDate.slice(0, 10) : "";
  const retDate = req.returnDate ? req.returnDate.slice(0, 10) : "";

  return (
    <div className="p-8 max-w-2xl">
      <Link
        href={`/travel/${id}`}
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Details
      </Link>

      <h1 className="text-2xl font-bold text-zinc-900 mb-6">
        Edit Travel Request
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Title
            </label>
            <input
              name="title"
              required
              defaultValue={req.title}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Traveler Name
              </label>
              <input
                name="travelerName"
                required
                defaultValue={req.travelerName}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Travel Mode
              </label>
              <select
                name="travelMode"
                defaultValue={req.travelMode}
                className={inputClass}
              >
                {TRAVEL_MODES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Origin City
              </label>
              <input
                name="originCity"
                defaultValue={req.originCity || ""}
                placeholder="e.g. DEL or New Delhi"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Destination
              </label>
              <input
                name="destination"
                required
                defaultValue={req.destination}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Departure Date
              </label>
              <input
                name="departureDate"
                type="date"
                required
                defaultValue={depDate}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Departure Time
              </label>
              <input
                name="departureTime"
                type="time"
                defaultValue={req.departureTime || ""}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Return Date
              </label>
              <input
                name="returnDate"
                type="date"
                required
                defaultValue={retDate}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Return Time
              </label>
              <input
                name="returnTime"
                type="time"
                defaultValue={req.returnTime || ""}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Purpose
            </label>
            <textarea
              name="purpose"
              required
              rows={3}
              defaultValue={req.purpose}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Estimated Cost (₹)
              </label>
              <input
                name="estimatedCost"
                type="number"
                step="0.01"
                min="0"
                defaultValue={req.estimatedCost}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              name="notes"
              rows={2}
              defaultValue={req.notes || ""}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-zinc-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-800 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <Link
            href={`/travel/${id}`}
            className="px-5 py-2.5 rounded-lg text-sm font-medium border border-zinc-300 text-zinc-600 hover:bg-zinc-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
