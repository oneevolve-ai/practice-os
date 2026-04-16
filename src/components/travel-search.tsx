"use client";

import { useState } from "react";
import { Search, X, Plane } from "lucide-react";

interface Segment {
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  durationInMinutes: number;
  flightNumber: string;
  airline: string;
}
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
  segments: Segment[];
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
  const [selectedOffers, setSelectedOffers] = useState<FlightOffer[]>([]);

  function toggleSelect(offer: FlightOffer) {
    setSelectedOffers(prev =>
      prev.find(o => o.id === offer.id)
        ? prev.filter(o => o.id !== offer.id)
        : [...prev, offer]
    );
  }

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
                              {offer.stops === 0 ? " · Non-stop" : ` · ${offer.stops} stop${offer.stops > 1 ? "s" : ""}`}
                            </p>
                            {offer.stops > 0 && offer.segments && offer.segments.length > 1 && (
                              <div className="mt-1 space-y-0.5">
                                {offer.segments.slice(0, -1).map((seg, i) => (
                                  <p key={i} className="text-xs text-orange-500">
                                    Layover: {seg.destination} · {Math.floor((offer.segments[i+1] ? new Date(offer.segments[i+1].departure).getTime() - new Date(seg.arrival).getTime() : 0) / 60000)}m wait
                                  </p>
                                ))}
                              </div>
                            )}
                            <p className="hidden">
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-zinc-900">
                            ₹{offer.price.toLocaleString()}
                          </p>
                          <label className="flex items-center gap-2 mt-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!selectedOffers.find(o=>o.id===offer.id)}
                              onChange={() => {
                                if (selectedOffers.find(o=>o.id===offer.id)) {
                                  toggleSelect(offer);
                                } else if (selectedOffers.length < 5) {
                                  toggleSelect(offer);
                                }
                              }}
                              className="w-4 h-4 accent-blue-600"
                            />
                            <span className="text-xs text-zinc-600">
                              {selectedOffers.find(o=>o.id===offer.id) ? "✓ Selected" : selectedOffers.length >= 5 ? "Max 5 reached" : "Select"}
                            </span>
                          </label>
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

      {/* Comparison Table */}
      {selectedOffers.length > 0 && (
        <div className="mt-6 border border-zinc-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between bg-zinc-50 px-4 py-3 border-b border-zinc-200">
            <h3 className="font-semibold text-zinc-900 text-sm">Selected Flights ({selectedOffers.length}/5)</h3>
            <button onClick={() => setSelectedOffers([])} className="text-xs text-zinc-400 hover:text-zinc-600">Clear all</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-xs text-zinc-400">
                  <th className="text-left px-4 py-2">Airline</th>
                  <th className="text-left px-4 py-2">Departure</th>
                  <th className="text-left px-4 py-2">Arrival</th>
                  <th className="text-left px-4 py-2">Duration</th>
                  <th className="text-left px-4 py-2">Stops</th>
                  <th className="text-right px-4 py-2">Price</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {selectedOffers.map((offer, i) => (
                  <tr key={offer.id} className={`border-b border-zinc-50 ${i === 0 ? "bg-green-50" : ""}`}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-zinc-900">{offer.airline}</p>
                      <p className="text-xs text-zinc-400">{offer.flightNumber}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{formatTime(offer.departureTime)}</p>
                      <p className="text-xs text-zinc-400">{offer.departureAirport}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{formatTime(offer.arrivalTime)}</p>
                      <p className="text-xs text-zinc-400">{offer.arrivalAirport}</p>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{formatDuration(offer.duration)}</td>
                    <td className="px-4 py-3">
                      {offer.stops === 0
                        ? <span className="text-green-600 text-xs font-medium">Non-stop</span>
                        : <span className="text-orange-500 text-xs">{offer.stops} stop{offer.stops > 1 ? "s" : ""}</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="font-bold text-blue-600">₹{offer.price.toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedOffers(prev => prev.filter(o => o.id !== offer.id))}
                          className="text-xs text-zinc-400 hover:text-red-500 px-2"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
            {selectedOffers.length > 1 && (
              <p className="text-xs text-blue-600">
                💡 Best: <strong>₹{Math.min(...selectedOffers.map(o => o.price)).toLocaleString()}</strong> — {selectedOffers.find(o => o.price === Math.min(...selectedOffers.map(x => x.price)))?.airline}
              </p>
            )}
            <button
              type="button"
              onClick={() => {
                selectedOffers.forEach(o => onSelect(o.price, o));
              }}
              className="ml-auto text-sm bg-zinc-900 text-white px-4 py-2 rounded-lg hover:bg-zinc-700"
            >
              Confirm {selectedOffers.length} Flight{selectedOffers.length > 1 ? "s" : ""}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
