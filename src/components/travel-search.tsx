"use client";

import { useState } from "react";
import { Search, X, Plane } from "lucide-react";

interface FlightOffer {
  id: number;
  airline: string;
  flightNumber: string;
  departureAirport: string;
  departureTime: string;
  arrivalAirport: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  price: number;
  currency: string;
  rawOffer: unknown;
}

interface Props {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  travelMode: string;
  onSelect: (price: number, offer: unknown) => void;
}

function formatDuration(iso: string) {
  return iso.replace("PT", "").replace("H", "h ").replace("M", "m").trim();
}

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso || "--";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch { return iso || "--"; }
}

export function TravelSearch({
  origin,
  destination,
  departureDate,
  returnDate,
  travelMode,
  onSelect,
}: Props) {
  const [offers, setOffers] = useState<FlightOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);

  async function handleSearch() {
    if (!origin || !destination || !departureDate) {
      setError("Please fill in origin, destination, and departure date first");
      return;
    }

    setOpen(true);
    setLoading(true);
    setError("");
    setMessage("");
    setOffers([]);

    const res = await fetch("/api/amadeus/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origin,
        destination,
        departureDate,
        returnDate,
        travelMode,
        adults: 1,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.error) {
      setError(data.error);
    } else if (data.message) {
      setMessage(data.message);
    } else {
      setOffers(data.offers || []);
      if ((data.offers || []).length === 0) {
        setMessage("No results found for this search");
      }
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleSearch}
        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        <Search className="w-4 h-4" />
        Search Travel Options
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
              <h3 className="text-lg font-semibold text-zinc-900">
                {travelMode === "FLIGHT" ? "Flight" : travelMode} Options
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loading && (
                <div className="text-center py-8 text-zinc-400">
                  Searching for options...
                </div>
              )}

              {error && (
                <div className="text-center py-8 text-red-500 text-sm">{error}</div>
              )}

              {message && (
                <div className="text-center py-8 text-zinc-500 text-sm">{message}</div>
              )}

              {offers.length > 0 && (
                <div className="space-y-3">
                  {offers.map((offer) => (
                    <div
                      key={offer.id}
                      className="border border-zinc-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Plane className="w-5 h-5 text-zinc-400" />
                          <div>
                            <p className="text-sm font-medium text-zinc-900">
                              {offer.airline} {offer.flightNumber}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {offer.departureAirport} {formatTime(offer.departureTime)}
                              {" → "}
                              {offer.arrivalAirport} {formatTime(offer.arrivalTime)}
                            </p>
                            <p className="text-xs text-zinc-400 mt-0.5">
                              {formatDuration(offer.duration)}
                              {offer.stops > 0
                                ? ` · ${offer.stops} stop${offer.stops > 1 ? "s" : ""}`
                                : " · Non-stop"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-zinc-900">
                            ₹{offer.price.toLocaleString()}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              onSelect(offer.price, offer.rawOffer);
                              setOpen(false);
                            }}
                            className="mt-1 text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                          >
                            Select
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
