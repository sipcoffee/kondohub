"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ImagePlus,
  Star,
  Trash2,
  Loader2,
  CheckCircle2,
  Upload,
} from "lucide-react";

type Photo = {
  id: string;
  url: string;
  isPrimary: boolean;
  order: number;
};

type Props = {
  unitId: string;
  initialPhotos: Photo[];
};

export function PhotoUploader({ unitId, initialPhotos }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  async function handleFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (!list.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      list.forEach((f) => fd.append("files", f));
      const res = await fetch(`/api/units/${unitId}/photos`, {
        method: "POST",
        body: fd,
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error(result.error || "Upload failed");
        return;
      }
      setPhotos((prev) => [...prev, ...result.data]);
      toast.success(`${list.length} photo${list.length > 1 ? "s" : ""} uploaded`);
      router.refresh();
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function setPrimary(id: string) {
    setPendingId(id);
    try {
      const res = await fetch(`/api/units/${unitId}/photos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrimary: true }),
      });
      if (!res.ok) {
        toast.error("Could not set primary");
        return;
      }
      setPhotos((prev) =>
        prev.map((p) => ({ ...p, isPrimary: p.id === id }))
      );
      toast.success("Cover photo updated");
      router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  async function deletePhoto(id: string) {
    if (!confirm("Delete this photo? This cannot be undone.")) return;
    setPendingId(id);
    try {
      const res = await fetch(`/api/units/${unitId}/photos/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        toast.error("Delete failed");
        return;
      }
      setPhotos((prev) => prev.filter((p) => p.id !== id));
      toast.success("Photo deleted");
      router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
        }}
        className={`rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
          dragOver
            ? "border-[#E0484F] bg-[#FDE8E4]/40"
            : "border-[#E5E7EB] bg-[#FAFAFA]"
        }`}
      >
        <div className="mx-auto h-12 w-12 rounded-2xl bg-white border border-[#EBEBEB] flex items-center justify-center mb-4">
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-[#E0484F]" />
          ) : (
            <Upload className="h-5 w-5 text-[#E0484F]" />
          )}
        </div>
        <p className="text-sm font-semibold text-[#222222]">
          Drop photos here, or click to browse
        </p>
        <p className="text-xs text-[#717171] mt-1">
          JPG, PNG or WebP. Up to 10 MB each.
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="mt-4 inline-flex items-center gap-2 bg-[#222222] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#3A3A3A] disabled:opacity-50 transition-colors"
        >
          <ImagePlus className="h-4 w-4" />
          Add photos
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {photos.length === 0 ? (
        <div className="text-center py-12 text-[#717171]">
          <ImagePlus className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No photos yet — add at least one to publish.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative rounded-xl overflow-hidden border border-[#EBEBEB] bg-white"
            >
              <div className="relative aspect-[4/3] bg-[#F7F7F7]">
                <Image
                  src={photo.url}
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
              {photo.isPrimary && (
                <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-white text-[#222222] text-[11px] font-semibold px-2 py-1 rounded-full shadow-sm">
                  <CheckCircle2 className="h-3 w-3 text-[#1F6E3A]" />
                  Cover
                </span>
              )}
              <div className="p-3 flex items-center justify-between gap-2">
                {!photo.isPrimary ? (
                  <button
                    onClick={() => setPrimary(photo.id)}
                    disabled={pendingId === photo.id}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#222222] hover:text-[#E0484F] transition-colors disabled:opacity-50"
                  >
                    {pendingId === photo.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Star className="h-3 w-3" />
                    )}
                    Set as cover
                  </button>
                ) : (
                  <span className="text-xs text-[#9CA3AF]">Cover photo</span>
                )}
                <button
                  onClick={() => deletePhoto(photo.id)}
                  disabled={pendingId === photo.id}
                  className="text-[#717171] hover:text-[#C13947] transition-colors disabled:opacity-50"
                  aria-label="Delete photo"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
