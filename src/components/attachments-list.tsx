"use client";

import { Paperclip, Trash2, Download } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Attachment {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  uploadedAt: string;
}

interface Props {
  attachments: Attachment[];
  requestId: string;
  onDelete: () => void;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentsList({ attachments, requestId, onDelete }: Props) {
  if (!attachments || attachments.length === 0) return null;

  async function handleDelete(attachmentId: string) {
    if (!confirm("Delete this attachment?")) return;
    const res = await fetch(
      `/api/travel/${requestId}/attachments/${attachmentId}`,
      { method: "DELETE" }
    );
    if (res.ok) onDelete();
  }

  return (
    <div className="space-y-2">
      {attachments.map((att) => (
        <div
          key={att.id}
          className="flex items-center gap-3 bg-zinc-50 rounded-lg px-3 py-2"
        >
          <Paperclip className="w-4 h-4 text-zinc-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-zinc-800 truncate">{att.fileName}</p>
            <p className="text-xs text-zinc-400">
              {formatSize(att.fileSize)} &middot;{" "}
              {formatDistanceToNow(new Date(att.uploadedAt), {
                addSuffix: true,
              })}
            </p>
          </div>
          <a
            href={att.filePath}
            download={att.fileName}
            className="p-1.5 text-zinc-400 hover:text-zinc-600"
          >
            <Download className="w-4 h-4" />
          </a>
          <button
            onClick={() => handleDelete(att.id)}
            className="p-1.5 text-zinc-400 hover:text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
