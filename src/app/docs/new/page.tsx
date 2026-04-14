"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = ["Proposals","Contracts","Reports","SOPs","Templates","Marketing","Legal","Presentations","Other"];

export default function NewDocPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const ic = "w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const f = new FormData(e.currentTarget);
    const body = {
      title: f.get("title"),
      category: f.get("category"),
      description: f.get("description"),
      fileUrl: f.get("fileUrl"),
      fileType: f.get("fileType"),
      tags: f.get("tags"),
      projectName: f.get("projectName"),
      clientName: f.get("clientName"),
      createdBy: f.get("createdBy"),
    };
    const res = await fetch("/api/documents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) router.push("/docs");
    else { alert("Failed"); setLoading(false); }
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-zinc-900 mb-1">Add Document</h1>
      <p className="text-zinc-500 text-sm mb-6">Add a document to the knowledge base</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="font-semibold text-zinc-900 mb-4">Document Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-zinc-700 mb-1">Title *</label>
              <input name="title" required className={ic} placeholder="e.g. Cloudnine Whitefield Proposal v2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Category *</label>
              <select name="category" required className={ic}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">File Type</label>
              <select name="fileType" className={ic}>
                <option value="">Select type</option>
                {["PDF","Word","Excel","PowerPoint","Image","Other"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-zinc-700 mb-1">Description</label>
              <textarea name="description" className={ic} rows={2} placeholder="Brief description of the document..." />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-zinc-700 mb-1">File URL</label>
              <input name="fileUrl" className={ic} placeholder="https://drive.google.com/..." />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="font-semibold text-zinc-900 mb-4">Links & Tags</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Client Name</label>
              <input name="clientName" className={ic} placeholder="e.g. Cloudnine Care" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Project Name</label>
              <input name="projectName" className={ic} placeholder="e.g. Whitefield Digital Twin" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Created By</label>
              <input name="createdBy" className={ic} placeholder="Your name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Tags</label>
              <input name="tags" className={ic} placeholder="proposal, healthcare, 2026 (comma separated)" />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="bg-zinc-900 text-white px-6 py-2 rounded-lg text-sm hover:bg-zinc-700 disabled:opacity-50">
            {loading ? "Saving..." : "Add Document"}
          </button>
          <button type="button" onClick={() => router.back()} className="border border-zinc-300 text-zinc-700 px-6 py-2 rounded-lg text-sm">Cancel</button>
        </div>
      </form>
    </div>
  );
}
