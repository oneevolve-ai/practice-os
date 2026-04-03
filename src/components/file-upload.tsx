"use client";

import { useState, useRef } from "react";
import { Upload } from "lucide-react";

interface Props {
  requestId: string;
  onUpload: () => void;
}

export function FileUpload({ requestId, onUpload }: Props) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);

      await fetch(`/api/travel/${requestId}/attachments`, {
        method: "POST",
        body: formData,
      });
    }

    setUploading(false);
    onUpload();
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      className="border-2 border-dashed border-zinc-300 rounded-lg p-4 text-center cursor-pointer hover:border-zinc-400 transition-colors"
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <Upload className="w-5 h-5 text-zinc-400 mx-auto mb-1" />
      <p className="text-sm text-zinc-500">
        {uploading ? "Uploading..." : "Click to upload files"}
      </p>
      <p className="text-xs text-zinc-400 mt-0.5">Receipts, tickets, itineraries</p>
    </div>
  );
}
