"use client";
import { BackButton } from "@/components/back-button";

import { useEffect, useState } from "react";
import { MapPin, Plus, Pencil, Trash2, X } from "lucide-react";

interface Office { id: string; name: string; address: string | null; latitude: number; longitude: number; radius: number; isActive: boolean; }

const ic = "w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400";

export default function OfficeLocationsPage() {
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  function fetchOffices() {
    fetch("/api/office-locations").then((r) => r.json()).then(setOffices).finally(() => setLoading(false));
  }
  useEffect(() => { fetchOffices(); }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = {
      name: f.get("name"), address: f.get("address") || "",
      latitude: f.get("latitude"), longitude: f.get("longitude"),
      radius: f.get("radius") || "200",
    };
    const url = editId ? `/api/office-locations/${editId}` : "/api/office-locations";
    const method = editId ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { setShowForm(false); setEditId(null); fetchOffices(); }
    else alert("Failed to save");
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this office location?")) return;
    await fetch(`/api/office-locations/${id}`, { method: "DELETE" });
    fetchOffices();
  }

  async function toggleActive(office: Office) {
    await fetch(`/api/office-locations/${office.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !office.isActive }),
    });
    fetchOffices();
  }

  const editOffice = editId ? offices.find((o) => o.id === editId) : null;

  return (
    <div className="p-8">
      <BackButton href="/people/attendance" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Office Locations</h1>
          <p className="text-zinc-500 mt-1">Configure geofencing for attendance check-in</p>
        </div>
        {!showForm && (
          <button onClick={() => { setShowForm(true); setEditId(null); }} className="inline-flex items-center gap-2 bg-zinc-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-800">
            <Plus className="w-4 h-4" /> Add Office
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-zinc-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-900">{editId ? "Edit Office" : "New Office Location"}</h3>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="text-zinc-400 hover:text-zinc-600"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">Office Name *</label>
              <input name="name" required defaultValue={editOffice?.name || ""} placeholder="e.g. Mumbai HQ" className={ic} />
            </div>
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">Address</label>
              <input name="address" defaultValue={editOffice?.address || ""} placeholder="Full address" className={ic} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">Latitude *</label>
              <input name="latitude" type="number" step="any" required defaultValue={editOffice?.latitude || ""} placeholder="e.g. 19.0760" className={ic} />
            </div>
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">Longitude *</label>
              <input name="longitude" type="number" step="any" required defaultValue={editOffice?.longitude || ""} placeholder="e.g. 72.8777" className={ic} />
            </div>
            <div><label className="block text-sm font-medium text-zinc-700 mb-1">Radius (meters)</label>
              <input name="radius" type="number" min="50" max="5000" defaultValue={editOffice?.radius || 200} className={ic} />
            </div>
          </div>
          <p className="text-xs text-zinc-400 mb-4">Tip: Get coordinates from Google Maps — right-click on your office → copy coordinates.</p>
          <button type="submit" className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800">
            {editId ? "Save Changes" : "Add Office"}
          </button>
        </form>
      )}

      {loading ? <div className="text-center py-12 text-zinc-400">Loading...</div>
      : offices.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-zinc-200">
          <MapPin className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-zinc-600">No office locations configured</h3>
          <p className="text-sm text-zinc-400 mt-1">Add an office to enable geofenced check-in. Without offices, employees can check in from anywhere.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {offices.map((office) => (
            <div key={office.id} className={`bg-white rounded-xl border p-5 ${office.isActive ? "border-green-200" : "border-zinc-200 opacity-60"}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className={`w-5 h-5 ${office.isActive ? "text-green-600" : "text-zinc-400"}`} />
                  <div>
                    <h3 className="font-semibold text-zinc-900">{office.name}</h3>
                    {office.address && <p className="text-xs text-zinc-400">{office.address}</p>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditId(office.id); setShowForm(true); }} className="p-1 text-zinc-400 hover:text-zinc-600"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(office.id)} className="p-1 text-zinc-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="mt-3 text-xs text-zinc-500 space-y-1">
                <p>Lat: {office.latitude}, Lng: {office.longitude}</p>
                <p>Radius: {office.radius}m</p>
              </div>
              <button onClick={() => toggleActive(office)} className={`mt-3 text-xs px-2 py-1 rounded ${office.isActive ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"}`}>
                {office.isActive ? "Active" : "Inactive"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
