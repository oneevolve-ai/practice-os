"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const MAX_TITLE = 200;
const MAX_CATEGORY = 100;
const MAX_DESCRIPTION = 2000;

export default function NewDocPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validationError =
    !title.trim() ? "Title is required"
      : title.length > MAX_TITLE ? `Title exceeds ${MAX_TITLE} chars`
      : !category.trim() ? "Category is required"
      : category.length > MAX_CATEGORY ? `Category exceeds ${MAX_CATEGORY} chars`
      : description.length > MAX_DESCRIPTION ? `Description exceeds ${MAX_DESCRIPTION} chars`
      : !file ? "File is required"
      : file.size === 0 ? "File is empty"
      : file.size > MAX_FILE_SIZE ? `File exceeds ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)} MB`
      : null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (validationError || !file) {
      setError(validationError);
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.set("title", title.trim());
      form.set("category", category.trim());
      if (description.trim()) form.set("description", description.trim());
      form.set("file", file);
      const res = await fetch("/api/documents", {
        method: "POST",
        body: form,
        headers: { "x-tenant-id": "default" },
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: { message?: string; code?: string } } | null;
        throw new Error(body?.error?.message ?? `HTTP ${res.status}`);
      }
      router.push("/docs");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Upload Document</h1>
        <p className="text-zinc-500 text-sm">Add a new document with version 1.</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-xl border border-zinc-200 p-6 space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-zinc-700 mb-1">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={MAX_TITLE}
            required
            className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-zinc-700 mb-1">Category</label>
          <input
            id="category"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            maxLength={MAX_CATEGORY}
            required
            placeholder="e.g. Proposals, Contracts, Reports, SOPs"
            className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-zinc-700 mb-1">Description (optional)</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={MAX_DESCRIPTION}
            rows={3}
            className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>

        <div>
          <label htmlFor="file" className="block text-sm font-medium text-zinc-700 mb-1">File</label>
          <input
            id="file"
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            required
            className="block w-full text-sm text-zinc-700 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border file:border-zinc-300 file:bg-zinc-50 file:text-sm file:font-medium hover:file:bg-zinc-100"
          />
          <p className="mt-1 text-xs text-zinc-500">
            Max 50 MB.
            {file && ` Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`}
          </p>
        </div>

        {error && (
          <div role="alert" className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={uploading || validationError !== null}
            className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "Uploading…" : "Upload"}
          </button>
          <Link href="/docs" className="text-sm text-zinc-500 hover:text-zinc-700">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
