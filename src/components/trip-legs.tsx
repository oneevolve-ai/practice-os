"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, MapPin } from "lucide-react";

interface TripLeg {
  id: string;
  legOrder: number;
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string | null;
  arrivalDate: string;
  arrivalTime: string | null;
  travelMode: string;
  estimatedCost: number;
}

const MODES = [
  { value: "FLIGHT", label: "Flight" },
  { value: "TRAIN", label: "Train" },
  { value: "BUS", label: "Bus" },
  { value: "CAR", label: "Car" },
  { value: "OTHER", label: "Other" },
];

const inputClass =
  "w-full border border-zinc-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-400";

interface Props {
  requestId: string;
  readOnly?: boolean;
}

export function TripLegs({ requestId, readOnly }: Props) {
  const [legs, setLegs] = useState<TripLeg[]>([]);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetch(`/api/travel/${requestId}/legs`)
      .then((r) => r.json())
      .then(setLegs)
      .catch(() => {});
  }, [requestId]);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const body = {
      legOrder: legs.length + 1,
      origin: form.get("origin"),
      destination: form.get("destination"),
      departureDate: form.get("departureDate"),
      departureTime: form.get("departureTime") || "",
      arrivalDate: form.get("arrivalDate"),
      arrivalTime: form.get("arrivalTime") || "",
      travelMode: form.get("travelMode"),
      estimatedCost: parseFloat(form.get("estimatedCost") as string) || 0,
    };

    const res = await fetch(`/api/travel/${requestId}/legs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const leg = await res.json();
      setLegs([...legs, leg]);
      setAdding(false);
    }
  }

  async function handleDelete(legId: string) {
    if (!confirm("Remove this leg?")) return;
    const res = await fetch(`/api/travel/${requestId}/legs?legId=${legId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setLegs(legs.filter((l) => l.id !== legId));
    }
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-6 mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-zinc-900">Trip Legs</h3>
        {!readOnly && !adding && (
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1 text-xs bg-zinc-100 text-zinc-700 px-2 py-1 rounded hover:bg-zinc-200"
          >
            <Plus className="w-3 h-3" />
            Add Leg
          </button>
        )}
      </div>

      {legs.length === 0 && !adding && (
        <p className="text-sm text-zinc-400">No multi-city legs added. This is a direct trip.</p>
      )}

      {legs.length > 0 && (
        <div className="space-y-2">
          {legs.map((leg, i) => (
            <div key={leg.id} className="flex items-center gap-3 bg-zinc-50 rounded-lg px-3 py-2">
              <div className="flex items-center gap-1 text-zinc-400">
                <MapPin className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">{i + 1}</span>
              </div>
              <div className="flex-1 text-xs">
                <p className="text-zinc-900 font-medium">
                  {leg.origin} → {leg.destination}
                </p>
                <p className="text-zinc-500">
                  {new Date(leg.departureDate).toLocaleDateString()}
                  {leg.departureTime && ` ${leg.departureTime}`}
                  {" — "}
                  {new Date(leg.arrivalDate).toLocaleDateString()}
                  {leg.arrivalTime && ` ${leg.arrivalTime}`}
                  {" · "}
                  {MODES.find((m) => m.value === leg.travelMode)?.label}
                  {leg.estimatedCost > 0 && ` · ₹${leg.estimatedCost}`}
                </p>
              </div>
              {!readOnly && (
                <button
                  onClick={() => handleDelete(leg.id)}
                  className="p-1 text-zinc-400 hover:text-red-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {adding && (
        <form onSubmit={handleAdd} className="mt-3 space-y-2 p-3 bg-zinc-50 rounded-lg">
          <div className="grid grid-cols-2 gap-2">
            <input name="origin" required placeholder="Origin" className={inputClass} />
            <input name="destination" required placeholder="Destination" className={inputClass} />
          </div>
          <div className="grid grid-cols-4 gap-2">
            <input name="departureDate" type="date" required className={inputClass} />
            <input name="departureTime" type="time" className={inputClass} />
            <input name="arrivalDate" type="date" required className={inputClass} />
            <input name="arrivalTime" type="time" className={inputClass} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <select name="travelMode" className={inputClass}>
              {MODES.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <input name="estimatedCost" type="number" step="0.01" placeholder="Cost" className={inputClass} />
            <div className="flex gap-1">
              <button type="submit" className="flex-1 bg-zinc-900 text-white text-xs py-1.5 rounded-lg hover:bg-zinc-800">
                Add
              </button>
              <button type="button" onClick={() => setAdding(false)} className="flex-1 border border-zinc-300 text-zinc-600 text-xs py-1.5 rounded-lg hover:bg-zinc-50">
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
