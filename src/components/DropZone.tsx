import { useCallback, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { UploadCloud, FileVideo, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { normalizeSubtitles } from "@/lib/sample-subtitles";

const BACKEND_URL = "https://subtitle-backend-2uzv.onrender.com";

export function DropZone({ compact = false }: { compact?: boolean }) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const navigate = useNavigate();

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (!f.type.startsWith("video/")) {
      toast.error("Please upload a video file");
      return;
    }
    setFile(f);
    setUploading(true);
    setStatus("Uploading video…");

    // Preserve the uploaded video locally BEFORE the backend round-trip,
    // so the editor can always play it even if the upload fails partway.
    try {
      const prev = sessionStorage.getItem("uploadedVideoUrl");
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
    } catch {}
    const videoUrl = URL.createObjectURL(f);
    sessionStorage.setItem("uploadedVideoUrl", videoUrl);
    sessionStorage.setItem("uploadedVideoName", f.name);

    try {
      // Clear previous subtitle state before new upload
      sessionStorage.removeItem("subtitleai:result");

      const form = new FormData();
      form.append("video", f);

      const res = await fetch(`${BACKEND_URL}/upload`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(`Upload failed (${res.status}): ${errText || res.statusText}`);
      }

      setStatus("Processing subtitles…");
      const data = await res.json();
      console.log("[upload] backend response:", data);

      // Backend now returns timed cues: { success, language, text, cues: [{start,end,text}] }
      // Prefer `cues` (real timings). Only fall back to plain `text` if cues missing.
      const rawCues = Array.isArray(data?.cues) ? data.cues : null;
      const hinglishText: string | undefined =
        typeof data?.text === "string" ? data.text : undefined;

      let subs;
      if (rawCues && rawCues.length) {
        subs = rawCues
          .map((c: any) => ({
            id: crypto.randomUUID(),
            start: Number(c.start),
            end: Number(c.end),
            text: String(c.text ?? "").trim(),
          }))
          .filter((s: any) =>
            s.text &&
            Number.isFinite(s.start) &&
            Number.isFinite(s.end) &&
            !/[\u0900-\u097F]/.test(s.text),
          );
      } else if (hinglishText && hinglishText.trim()) {
        subs = normalizeSubtitles(hinglishText).filter(
          (s) => !/[\u0900-\u097F]/.test(s.text),
        );
      } else {
        throw new Error("Server did not return cues or Hinglish text.");
      }

      if (!subs.length) {
        throw new Error("No Hinglish subtitles returned from the server.");
      }

      sessionStorage.setItem(
        "subtitleai:result",
        JSON.stringify({
          name: f.name,
          subs,
          text: hinglishText ?? "",
          language: "Hinglish",
          raw: data,
        }),
      );
      toast.success("Subtitles ready", { description: `${subs.length} cues generated` });
      navigate({ to: "/editor", search: { name: f.name } as never });
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Upload failed";
      toast.error("Upload failed", { description: message });
      setUploading(false);
      setStatus("");
      setFile(null);
    }
  }, [navigate]);

  return (
    <label
      onDragOver={(e) => { if (!uploading) { e.preventDefault(); setDragging(true); } }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { if (uploading) return; e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
      className={cn(
        "relative block w-full rounded-2xl border-2 border-dashed transition-all overflow-hidden group",
        compact ? "p-8" : "p-12 md:p-16",
        uploading ? "cursor-wait" : "cursor-pointer",
        dragging
          ? "border-primary bg-primary/10 scale-[1.01] shadow-[var(--shadow-glow)]"
          : "border-border/70 bg-card/40 hover:border-primary/50 hover:bg-card/70",
      )}
    >
      <input
        type="file"
        accept="video/*"
        disabled={uploading}
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="absolute inset-0 bg-gradient-radial opacity-40 pointer-events-none" />
      <div className="relative flex flex-col items-center text-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-brand shadow-[var(--shadow-glow)] group-hover:scale-110 transition-transform duration-500">
          {uploading
            ? <Loader2 className="h-7 w-7 text-white animate-spin" />
            : file
              ? <FileVideo className="h-7 w-7 text-white" />
              : <UploadCloud className="h-7 w-7 text-white" />}
        </div>
        <div>
          <h3 className="font-display text-xl font-semibold">
            {file ? file.name : "Drop your video here"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {uploading ? status : file ? "Ready" : "MP4, MOV, WEBM up to 2GB · Hinglish ready"}
          </p>
        </div>
        {!file && (
          <span className="mt-2 inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-5 py-2.5 text-sm font-medium text-white shadow-[var(--shadow-glow)] group-hover:opacity-90 transition-opacity">
            Browse files
          </span>
        )}
      </div>
    </label>
  );
}
