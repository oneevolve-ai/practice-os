"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { properCase } from "@/lib/proper-case";
import { Plus, Check } from "lucide-react";

interface Timesheet { id: string; employeeName: string | null; date: string; hours: number; description: string | null; billable: boolean; }
interface Milestone { id: string; title: string; dueDate: string | null; completed: boolean; }
interface Project { id: string; name: string; code: string | null; clientName: string | null; type: string; status: string; startDate: string | null; endDate: string | null; budget: number | null; billingType: string; description: string | null; timesheets: Timesheet[]; milestones: Milestone[]; }

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [newMilestone, setNewMilestone] = useState("");
  const [showTimesheetForm, setShowTimesheetForm] = useState(false);
  const [tsForm, setTsForm] = useState({ employeeName: "", date: new Date().toISOString().slice(0,10), hours: "", description: "", billable: true });

  const ic = "w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400";

  useEffect(() => {
    fetch(`/api/projects/${id}`).then(r => r.json()).then(setProject).catch(() => {});
  }, [id]);

  async function updateStatus(status: string) {
    const res = await fetch(`/api/projects/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (res.ok) setProject(await res.json());
  }

  async function addMilestone() {
    if (!newMilestone) return;
    const res = await fetch(`/api/projects/${id}/milestones`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: newMilestone }) });
    if (res.ok) { setNewMilestone(""); const updated = await fetch(`/api/projects/${id}`).then(r => r.json()); setProject(updated); }
  }

  async function toggleMilestone(milestoneId: string, completed: boolean) {
    const res = await fetch(`/api/projects/${id}/milestones`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ milestoneId, completed }) });
    if (res.ok) { const updated = await fetch(`/api/projects/${id}`).then(r => r.json()); setProject(updated); }
  }

  async function addTimesheet() {
    if (!tsForm.hours) return;
    const res = await fetch("/api/timesheets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...tsForm, projectId: id }) });
    if (res.ok) { setShowTimesheetForm(false); setTsForm({ employeeName: "", date: new Date().toISOString().slice(0,10), hours: "", description: "", billable: true }); const updated = await fetch(`/api/projects/${id}`).then(r => r.json()); setProject(updated); }
  }

  async function deleteProject() {
    if (!confirm("Delete this project?")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    router.push("/projects");
  }

  if (!project) return <div className="p-8 text-zinc-400">Loading...</div>;

  const totalHours = project.timesheets.reduce((s, t) => s + t.hours, 0);
  const billableHours = project.timesheets.filter(t => t.billable).reduce((s, t) => s + t.hours, 0);
  const completedMilestones = project.milestones.filter(m => m.completed).length;
  const progress = project.milestones.length > 0 ? Math.round((completedMilestones / project.milestones.length) * 100) : 0;
  const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  const statusColor: Record<string, string> = { PLANNING: "bg-zinc-100 text-zinc-600", ACTIVE: "bg-green-100 text-green-700", ON_HOLD: "bg-orange-100 text-orange-700", COMPLETED: "bg-blue-100 text-blue-700", ARCHIVED: "bg-zinc-100 text-zinc-400" };
  const STATUSES = ["PLANNING","ACTIVE","ON_HOLD","COMPLETED","ARCHIVED"];

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-zinc-900">{project.name}</h1>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[project.status]}`}>{properCase(project.status)}</span>
          </div>
          <p className="text-zinc-500 text-sm">{[project.clientName, project.type, project.code].filter(Boolean).join(" · ")}</p>
        </div>
        <div className="flex gap-2">
          <select value={project.status} onChange={e => updateStatus(e.target.value)} className="border border-zinc-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none">
            {STATUSES.map(s => <option key={s} value={s}>{properCase(s)}</option>)}
          </select>
          <button onClick={deleteProject} className="border border-red-200 text-red-600 px-3 py-1.5 rounded-lg text-xs hover:bg-red-50">Delete</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-zinc-200">
        {["overview","milestones","timesheets"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === tab ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-500 hover:text-zinc-700"}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <h2 className="font-semibold text-zinc-900 mb-4">Project Details</h2>
            <div className="space-y-3 text-sm">
              {[
                ["Client", project.clientName],
                ["Type", project.type],
                ["Billing", project.billingType],
                ["Budget", project.budget ? fmt(project.budget) : null],
                ["Start Date", project.startDate ? new Date(project.startDate).toLocaleDateString("en-IN") : null],
                ["End Date", project.endDate ? new Date(project.endDate).toLocaleDateString("en-IN") : null],
              ].filter(([,v]) => v).map(([label, value]) => (
                <div key={label as string} className="flex justify-between">
                  <span className="text-zinc-400">{label}</span>
                  <span className="font-medium text-zinc-800">{value}</span>
                </div>
              ))}
            </div>
            {project.description && <p className="text-sm text-zinc-600 mt-4 pt-4 border-t border-zinc-100">{project.description}</p>}
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-zinc-200 p-6">
              <h2 className="font-semibold text-zinc-900 mb-4">Stats</h2>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div><p className="text-2xl font-bold text-zinc-900">{totalHours.toFixed(1)}h</p><p className="text-xs text-zinc-500">Total Hours</p></div>
                <div><p className="text-2xl font-bold text-green-600">{billableHours.toFixed(1)}h</p><p className="text-xs text-zinc-500">Billable Hours</p></div>
              </div>
            </div>
            {project.milestones.length > 0 && (
              <div className="bg-white rounded-xl border border-zinc-200 p-6">
                <h2 className="font-semibold text-zinc-900 mb-3">Progress</h2>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-zinc-200 rounded-full">
                    <div className="h-2 bg-green-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="text-sm font-medium text-zinc-700">{progress}%</span>
                </div>
                <p className="text-xs text-zinc-400 mt-2">{completedMilestones} of {project.milestones.length} milestones done</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Milestones */}
      {activeTab === "milestones" && (
        <div>
          <div className="flex gap-2 mb-4">
            <input value={newMilestone} onChange={e => setNewMilestone(e.target.value)} onKeyDown={e => e.key === "Enter" && addMilestone()} className={ic} placeholder="Add milestone and press Enter..." />
            <button onClick={addMilestone} className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-zinc-700"><Plus className="w-4 h-4" /></button>
          </div>
          {project.milestones.length === 0 ? (
            <div className="text-center py-12 text-zinc-400"><p>No milestones yet — add one above</p></div>
          ) : (
            <div className="space-y-2">
              {project.milestones.map(m => (
                <div key={m.id} className={`flex items-center gap-3 p-4 rounded-xl border ${m.completed ? "bg-green-50 border-green-200" : "bg-white border-zinc-200"}`}>
                  <button onClick={() => toggleMilestone(m.id, !m.completed)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${m.completed ? "bg-green-500 border-green-500 text-white" : "border-zinc-300"}`}>
                    {m.completed && <Check className="w-3 h-3" />}
                  </button>
                  <span className={`text-sm ${m.completed ? "line-through text-zinc-400" : "text-zinc-800"}`}>{m.title}</span>
                  {m.dueDate && <span className="text-xs text-zinc-400 ml-auto">{new Date(m.dueDate).toLocaleDateString("en-IN")}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Timesheets */}
      {activeTab === "timesheets" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-zinc-500">{project.timesheets.length} entries · {totalHours.toFixed(1)}h total</p>
            <button onClick={() => setShowTimesheetForm(!showTimesheetForm)} className="flex items-center gap-1 bg-zinc-900 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-zinc-700">
              <Plus className="w-4 h-4" /> Log Time
            </button>
          </div>

          {showTimesheetForm && (
            <div className="bg-zinc-50 rounded-xl border border-zinc-200 p-4 mb-4">
              <h3 className="font-medium text-zinc-900 mb-3">Log Time</h3>
              <div className="grid grid-cols-2 gap-3">
                <input value={tsForm.employeeName} onChange={e => setTsForm({...tsForm, employeeName: e.target.value})} className={ic} placeholder="Your name" />
                <input type="date" value={tsForm.date} onChange={e => setTsForm({...tsForm, date: e.target.value})} className={ic} />
                <input type="number" value={tsForm.hours} onChange={e => setTsForm({...tsForm, hours: e.target.value})} className={ic} placeholder="Hours (e.g. 2.5)" step="0.5" />
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={tsForm.billable} onChange={e => setTsForm({...tsForm, billable: e.target.checked})} className="w-4 h-4" id="billable" />
                  <label htmlFor="billable" className="text-sm text-zinc-700">Billable</label>
                </div>
                <div className="col-span-2"><input value={tsForm.description} onChange={e => setTsForm({...tsForm, description: e.target.value})} className={ic} placeholder="What did you work on?" /></div>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={addTimesheet} className="bg-zinc-900 text-white px-4 py-1.5 rounded-lg text-sm">Save</button>
                <button onClick={() => setShowTimesheetForm(false)} className="border border-zinc-300 text-zinc-700 px-4 py-1.5 rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          )}

          {project.timesheets.length === 0 ? (
            <div className="text-center py-12 text-zinc-400"><p>No time logged yet</p></div>
          ) : (
            <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    {["Date","Person","Hours","Description","Billable"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {project.timesheets.map(t => (
                    <tr key={t.id} className="hover:bg-zinc-50">
                      <td className="px-4 py-3 text-zinc-500">{new Date(t.date).toLocaleDateString("en-IN")}</td>
                      <td className="px-4 py-3 text-zinc-800">{t.employeeName || "—"}</td>
                      <td className="px-4 py-3 font-medium text-zinc-900">{t.hours}h</td>
                      <td className="px-4 py-3 text-zinc-500">{t.description || "—"}</td>
                      <td className="px-4 py-3">{t.billable ? <span className="text-green-600 text-xs font-medium">Billable</span> : <span className="text-zinc-400 text-xs">Non-billable</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
