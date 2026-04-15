"use client";
import { BackButton } from "@/components/back-button";
import { useEffect, useState } from "react";
import { Plus, Phone, Mail, Users, MapPin, FileText } from "lucide-react";

interface Activity { id: string; type: string; notes: string; date: string; client: { name: string }; }

const ACTIVITY_TYPES = ["Call","Email","Meeting","Site Visit","WhatsApp","Proposal Sent","Follow Up","Other"];
const TYPE_ICONS: Record<string, any> = { Call: Phone, Email: Mail, Meeting: Users, "Site Visit": MapPin, WhatsApp: Phone, "Proposal Sent": FileText, "Follow Up": Phone, Other: FileText };
const TYPE_COLORS: Record<string, string> = { Call: "bg-blue-100 text-blue-700", Email: "bg-purple-100 text-purple-700", Meeting: "bg-green-100 text-green-700", "Site Visit": "bg-orange-100 text-orange-700", WhatsApp: "bg-teal-100 text-teal-700", "Proposal Sent": "bg-yellow-100 text-yellow-700", "Follow Up": "bg-pink-100 text-pink-700", Other: "bg-zinc-100 text-zinc-600" };

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ clientId: "", type: "Call", notes: "", date: new Date().toISOString().slice(0,10) });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/clients").then(r => r.json()).then(setClients).catch(() => {});
    fetchActivities();
  }, []);

  async function fetchActivities() {
    const clients = await fetch("/api/clients").then(r => r.json()).catch(() => []);
    const all: Activity[] = [];
    for (const c of clients) {
      const acts = await fetch(`/api/clients/${c.id}/activities`).then(r => r.json()).catch(() => []);
      acts.forEach((a: any) => all.push({ ...a, client: { name: c.name } }));
    }
    all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setActivities(all);
  }

  async function addActivity() {
    if (!form.clientId || !form.notes) return;
    setLoading(true);
    const res = await fetch(`/api/clients/${form.clientId}/activities`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) { setShowForm(false); setForm({ clientId: "", type: "Call", notes: "", date: new Date().toISOString().slice(0,10) }); fetchActivities(); }
    setLoading(false);
  }

  const ic = "w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400";

  return (
    <div className="p-8">
      <BackButton href="/clients" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">CRM Activity</h1>
          <p className="text-zinc-500 text-sm">{activities.length} interactions logged</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-zinc-700">
          <Plus className="w-4 h-4" /> Log Activity
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-6">
          <h2 className="font-semibold text-zinc-900 mb-4">Log New Activity</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Organisation *</label>
              <select value={form.clientId} onChange={e => setForm({...form, clientId: e.target.value})} className={ic}>
                <option value="">Select organisation</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Activity Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className={ic}>
                {ACTIVITY_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Date</label>
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className={ic} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-zinc-700 mb-1">Notes *</label>
              <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className={ic} rows={3} placeholder="What happened? What was discussed? Next steps?" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={addActivity} disabled={loading} className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">{loading ? "Saving..." : "Save Activity"}</button>
            <button onClick={() => setShowForm(false)} className="border border-zinc-300 text-zinc-700 px-4 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Activity Timeline */}
      {activities.length === 0 ? (
        <div className="text-center py-16 text-zinc-400">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No activities logged yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map(a => {
            const Icon = TYPE_ICONS[a.type] || FileText;
            return (
              <div key={a.id} className="bg-white rounded-xl border border-zinc-200 p-4 flex gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${TYPE_COLORS[a.type] || "bg-zinc-100 text-zinc-600"}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[a.type] || "bg-zinc-100 text-zinc-600"}`}>{a.type}</span>
                    <span className="text-sm font-medium text-zinc-900">{a.client.name}</span>
                    <span className="text-xs text-zinc-400 ml-auto">{new Date(a.date).toLocaleDateString("en-IN")}</span>
                  </div>
                  <p className="text-sm text-zinc-600">{a.notes}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
