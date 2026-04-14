"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, FileText, Search, Trash2, ExternalLink } from "lucide-react";

interface Doc { id: string; title: string; category: string; description: string | null; fileUrl: string | null; fileType: string | null; tags: string | null; projectName: string | null; clientName: string | null; createdBy: string | null; createdAt: string; }

const CATEGORIES = ["All","Proposals","Contracts","Reports","SOPs","Templates","Marketing","Legal","Presentations","Other"];
const CATEGORY_COLORS: Record<string, string> = {
  Proposals: "bg-blue-100 text-blue-700",
  Contracts: "bg-purple-100 text-purple-700",
  Reports: "bg-green-100 text-green-700",
  SOPs: "bg-orange-100 text-orange-700",
  Templates: "bg-yellow-100 text-yellow-700",
  Marketing: "bg-pink-100 text-pink-700",
  Legal: "bg-red-100 text-red-700",
  Presentations: "bg-indigo-100 text-indigo-700",
  Other: "bg-zinc-100 text-zinc-600",
};

export default function DocsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => { fetchDocs(); }, []);

  async function fetchDocs() {
    const res = await fetch("/api/documents");
    const data = await res.json();
    setDocs(data);
  }

  async function deleteDoc(id: string) {
    if (!confirm("Delete this document?")) return;
    await fetch(`/api/documents/${id}`, { method: "DELETE" });
    setDocs(docs.filter(d => d.id !== id));
  }

  const filtered = docs.filter(d => {
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.clientName?.toLowerCase().includes(search.toLowerCase()) ||
      d.projectName?.toLowerCase().includes(search.toLowerCase()) ||
      d.tags?.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || d.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Docs</h1>
          <p className="text-zinc-500 text-sm">{docs.length} documents</p>
        </div>
        <Link href="/docs/new" className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-zinc-700">
          <Plus className="w-4 h-4" /> Add Document
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
        {CATEGORIES.filter(c => c !== "All").map(cat => {
          const count = docs.filter(d => d.category === cat).length;
          return (
            <button key={cat} onClick={() => setActiveCategory(cat === activeCategory ? "All" : cat)}
              className={`rounded-xl border p-3 text-left transition-all ${activeCategory === cat ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white hover:border-zinc-300"}`}>
              <p className={`text-lg font-bold ${activeCategory === cat ? "text-white" : "text-zinc-900"}`}>{count}</p>
              <p className={`text-xs mt-0.5 ${activeCategory === cat ? "text-zinc-300" : "text-zinc-500"}`}>{cat}</p>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents, clients, projects, tags..." className="w-full pl-9 pr-4 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400" />
      </div>

      {/* Documents Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-zinc-400">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No documents found</p>
          <Link href="/docs/new" className="text-blue-600 text-sm mt-2 inline-block">Add your first document</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(doc => (
            <div key={doc.id} className="bg-white rounded-xl border border-zinc-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[doc.category] || "bg-zinc-100 text-zinc-600"}`}>{doc.category}</span>
                <div className="flex gap-1">
                  {doc.fileUrl && (
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-zinc-600">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button onClick={() => deleteDoc(doc.id)} className="text-zinc-300 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-medium text-zinc-900 mb-1">{doc.title}</h3>
              {doc.description && <p className="text-xs text-zinc-500 mb-2 line-clamp-2">{doc.description}</p>}
              <div className="flex flex-wrap gap-1 mt-2">
                {doc.clientName && <span className="text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full">{doc.clientName}</span>}
                {doc.projectName && <span className="text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full">{doc.projectName}</span>}
                {doc.tags && doc.tags.split(",").map(t => (
                  <span key={t} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{t.trim()}</span>
                ))}
              </div>
              <p className="text-xs text-zinc-300 mt-3">{new Date(doc.createdAt).toLocaleDateString("en-IN")}{doc.createdBy ? ` · ${doc.createdBy}` : ""}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
