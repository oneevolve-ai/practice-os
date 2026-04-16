"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { TravelSearch } from "@/components/travel-search";

const TRAVEL_MODES = [
  { value: "FLIGHT", label: "Flight" },
  { value: "TRAIN", label: "Train" },
  { value: "BUS", label: "Bus" },
  { value: "CAR", label: "Car" },
  { value: "OTHER", label: "Other" },
];

const inputClass =
  "w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400";

export default function NewTravelRequestPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [travelMode, setTravelMode] = useState("FLIGHT");
  const [originCity, setOriginCity] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [selectedOffer, setSelectedOffer] = useState<unknown[]>([]);
  const costRef = useRef<HTMLInputElement>(null);

  function handleOfferSelect(price: number, offer: unknown) {
    setSelectedOffer(prev => Array.isArray(prev) ? [...prev, offer] : [offer]);
    if (costRef.current) {
      costRef.current.value = price.toString();
    }
  }

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
      purpose: form.get("purpose") || "",
      estimatedCost: parseFloat(form.get("estimatedCost") as string) || 0,
      selectedOffer: selectedOffer.length > 0 ? selectedOffer : null,
      notes: form.get("notes") || "",
    };

    const res = await fetch("/api/travel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      router.push("/travel");
    } else {
      setSaving(false);
      alert("Failed to create travel request");
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <Link
        href="/travel"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Travel
      </Link>

      <h1 className="text-2xl font-bold text-zinc-900 mb-6">
        New Travel Request
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
              placeholder="e.g. Client meeting in Austin"
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
                placeholder="Full name"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Travel Mode
              </label>
              <select
                name="travelMode"
                value={travelMode}
                onChange={(e) => setTravelMode(e.target.value)}
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
                value={originCity}
                onChange={(e) => setOriginCity(e.target.value)}
                placeholder={travelMode === "FLIGHT" ? "IATA code e.g. DEL" : "City name"}
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
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder={travelMode === "FLIGHT" ? "IATA code e.g. GOI" : "City name"}
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
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Return Date
              </label>
              <input
                name="returnDate"
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Search Travel Options */}
          <div className="pt-2 border-t border-zinc-100">
            <TravelSearch
              origin={originCity}
              destination={destination}
              departureDate={departureDate}
              returnDate={returnDate}
              travelMode={travelMode}
              onSelect={handleOfferSelect}
            />
            {selectedOffer && (
              <p className="text-xs text-green-600 mt-2">
                Travel option selected — cost auto-filled below
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Purpose
            </label>
            <textarea
              name="purpose"
              required
              rows={3}
              placeholder="Describe the purpose of this trip"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Estimated Cost (₹)
              </label>
              <input
                ref={costRef}
                name="estimatedCost"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
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
              placeholder="Any additional notes"
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-zinc-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Request"}
          </button>
          <Link
            href="/travel"
            className="px-5 py-2.5 rounded-lg text-sm font-medium border border-zinc-300 text-zinc-600 hover:bg-zinc-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
