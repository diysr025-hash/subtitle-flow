import { useCallback, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { UploadCloud, FileVideo } from "lucide-react";
import { cn } from "@/lib/utils";

export function DropZone({ compact = false }: { compact?: boolean }) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    setFile(f);
    setTimeout(() => navigate({ to: "/editor" }), 600);
  }, [navigate]);

  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
      className={cn(
        "relative block w-full cursor-pointer rounded-2xl border-2 border-dashed transition-all overflow-hidden group",
        compact ? "p-8" : "p-12 md:p-16",
        dragging
          ? "border-primary bg-primary/10 scale-[1.01]"
          : "border-border bg-card/50 hover:border-primary/50 hover:bg-card",
      )}
    >
      <input
        type="file"
        accept="video/*"
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="absolute inset-0 bg-gradient-radial opacity-50 pointer-events-none" />
      <div className="relative flex flex-col items-center text-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-brand shadow-[var(--shadow-glow)] group-hover:scale-110 transition-transform">
          {file ? <FileVideo className="h-7 w-7 text-white" /> : <UploadCloud className="h-7 w-7 text-white" />}
        </div>
        <div>
          <h3 className="font-display text-xl font-semibold">
            {file ? file.name : "Drop your video here"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {file ? "Processing… opening editor" : "MP4, MOV, WEBM up to 2GB · Hinglish ready"}
          </p>
        </div>
        {!file && (
          <button type="button" className="mt-2 inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-5 py-2.5 text-sm font-medium text-white shadow-[var(--shadow-glow)] hover:opacity-90 transition-opacity">
            Browse files
          </button>
        )}
      </div>
    </label>
  );
}
