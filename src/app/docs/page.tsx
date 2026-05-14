"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Download, Plus, Search, Trash2 } from "lucide-react";

type CurrentVersion = {
  id: string;
  versionNumber: number;
  fileName: string;
  fileSize: number;
  fileType: string | null;
  uploadedAt: string;
};

type DocumentListItem = {
  id: string;
  title: string;
  category: string;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  linkCount: number;
  currentVersion: CurrentVersion | null;
};

type ListResponse = {
  documents: DocumentListItem[];
  total: number;
  limit: number;
  offset: number;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString();
}

export default function DocsPage() {
  const [docs, setDocs] = useState<DocumentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL("/api/documents", window.location.origin);
      if (category.trim()) url.searchParams.set("category", category.trim());
      url.searchParams.set("limit", "100");
      const res = await fetch(url.toString(), {
        headers: { "x-tenant-id": "default" },
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
        throw new Error(body?.error?.message ?? `HTTP ${res.status}`);
      }
      const data: ListResponse = await res.json();
      setDocs(data.documents);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    void fetchDocs();
  }, [fetchDocs]);

  async function handleDelete(id: string) {
    if (!confirm("Soft-delete this document? Files on disk are retained.")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
        headers: { "x-tenant-id": "default" },
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
        throw new Error(body?.error?.message ?? `HTTP ${res.status}`);
      }
      await fetchDocs();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete document");
    } finally {
      setDeleting(null);
    }
  }

  const filtered = docs.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Documents</h1>
          <p className="text-zinc-500 text-sm">{docs.length} document{docs.length === 1 ? "" : "s"}</p>
        </div>
        <Link
          href="/docs/new"
          className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-zinc-700"
        >
          <Plus className="w-4 h-4" /> New
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Filter by category (exact match)"
          className="w-full px-4 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
        />
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title…"
            className="w-full pl-9 pr-4 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>
      </div>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 mb-4 flex items-center justify-between">
          <span className="text-sm">{error}</span>
          <button onClick={fetchDocs} className="text-sm text-red-700 hover:underline">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-zinc-200 p-8 text-center text-sm text-zinc-500">
          Loading documents…
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200 p-8 text-center text-sm text-zinc-500">
          {docs.length === 0
            ? "No documents yet. Click + New to upload one."
            : "No documents match the current filter."}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">File</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Uploaded</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map((d) => (
                <tr key={d.id}>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-zinc-900">{d.title}</p>
                    {d.description && <p className="text-xs text-zinc-500 mt-0.5">{d.description}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded text-xs">{d.category}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-700">
                    {d.currentVersion ? (
                      <>
                        <p className="truncate max-w-xs">{d.currentVersion.fileName}</p>
                        <p className="text-xs text-zinc-400">{formatBytes(d.currentVersion.fileSize)}</p>
                      </>
                    ) : (
                      <span className="text-xs text-zinc-400">no version</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-700">{formatDate(d.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-3">
                      {d.currentVersion && (
                        <a
                          href={`/api/documents/${d.id}/download?downloadedBy=ui-user`}
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                        >
                          <Download className="w-4 h-4" /> Download
                        </a>
                      )}
                      <button
                        onClick={() => handleDelete(d.id)}
                        disabled={deleting === d.id}
                        className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" /> {deleting === d.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
