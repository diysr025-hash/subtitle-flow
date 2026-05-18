import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Download, FileDown, Pause, Play, Plus, Sparkles, Trash2, Type, Video as VideoIcon, Wand2 } from "lucide-react";
import { sampleSubtitles, toSrt, type Subtitle } from "@/lib/sample-subtitles";
import { toast } from "sonner";

export const Route = createFileRoute("/editor")({
  component: Editor,
  head: () => ({ meta: [{ title: "Subtitle Editor — SubtitleAI" }] }),
});

const GENERATION_STAGES = [
  "Uploading audio stream…",
  "Detecting speech segments…",
  "Transcribing in Hinglish…",
  "Aligning timestamps…",
  "Polishing captions…",
];

function Editor() {
  const [subs, setSubs] = useState<Subtitle[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [generating, setGenerating] = useState(true);
  const [stageIdx, setStageIdx] = useState(0);
  const rafRef = useRef<number | undefined>(undefined);
  const lastTickRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = sessionStorage.getItem("uploadedVideoUrl");
    if (url) setVideoUrl(url);
  }, []);



  // Load real subtitles from upload (sessionStorage) — falls back to sample demo
  useEffect(() => {
    let cancelled = false;

    const stored = typeof window !== "undefined"
      ? sessionStorage.getItem("subtitleai:result")
      : null;

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { subs: Subtitle[] };
        if (parsed.subs?.length) {
          const stageTimer = setInterval(() => {
            setStageIdx((i) => Math.min(i + 1, GENERATION_STAGES.length - 1));
          }, 350);
          const doneTimer = setTimeout(() => {
            if (cancelled) return;
            setSubs(parsed.subs);
            setActiveId(parsed.subs[0].id);
            setGenerating(false);
          }, 1400);
          return () => { clearInterval(stageTimer); clearTimeout(doneTimer); cancelled = true; };
        }
      } catch (e) {
        console.error("Failed to parse stored subtitles", e);
      }
    }

    const stageTimer = setInterval(() => {
      setStageIdx((i) => Math.min(i + 1, GENERATION_STAGES.length - 1));
    }, 900);
    const doneTimer = setTimeout(() => {
      if (cancelled) return;
      setSubs(sampleSubtitles);
      setActiveId(sampleSubtitles[0].id);
      setGenerating(false);
    }, 4800);
    return () => { clearInterval(stageTimer); clearTimeout(doneTimer); cancelled = true; };
  }, []);

  const duration = videoDuration || (subs.length ? Math.max(...subs.map((s) => s.end), 14) : 14);

  useEffect(() => {
    if (videoUrl) return;
    if (!playing) return;
    lastTickRef.current = performance.now();
    const tick = (now: number) => {
      const dt = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;
      setTime((t) => {
        const next = t + dt;
        if (next >= duration) { setPlaying(false); return 0; }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [playing, duration, videoUrl]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !videoUrl) return;
    if (playing) v.play().catch(() => setPlaying(false));
    else v.pause();
  }, [playing, videoUrl]);

  const current = subs.find((s) => time >= s.start && time <= s.end);
  const active = subs.find((s) => s.id === activeId);

  const updateActive = (patch: Partial<Subtitle>) => {
    if (!activeId) return;
    setSubs((arr) => arr.map((s) => (s.id === activeId ? { ...s, ...patch } : s)));
  };

  const addCue = () => {
    const last = subs[subs.length - 1];
    const start = last ? last.end + 0.1 : 0;
    const newSub: Subtitle = { id: crypto.randomUUID(), start, end: start + 2.5, text: "New caption" };
    setSubs([...subs, newSub]);
    setActiveId(newSub.id);
  };

  const removeActive = () => {
    if (!activeId || subs.length <= 1) return;
    const idx = subs.findIndex((s) => s.id === activeId);
    const next = subs.filter((s) => s.id !== activeId);
    setSubs(next);
    setActiveId(next[Math.max(0, idx - 1)].id);
  };

  const downloadBlob = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportSrt = () => {
    downloadBlob("captions.srt", toSrt(subs), "text/plain");
    toast.success("SRT exported", { description: "captions.srt downloaded" });
  };

  const exportMp4 = () => {
    toast.success("Render started", { description: "We'll email your burned-in MP4 in ~2 minutes." });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-7xl w-full px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Subtitle Editor</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {generating ? "Preparing your captions…" : `${subs.length} cues · ready to export`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportSrt} disabled={generating || !subs.length}>
              <FileDown className="mr-2 h-4 w-4" />Export SRT
            </Button>
            <Button onClick={exportMp4} disabled={generating || !subs.length} className="bg-gradient-brand text-white border-0 hover:opacity-90 transition-opacity">
              <Download className="mr-2 h-4 w-4" />Export MP4
            </Button>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Preview + timeline */}
          <div className="space-y-4">
            <Card className="bg-card/60 border-border/60 overflow-hidden backdrop-blur">
              <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                {videoUrl ? (
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    controls
                    playsInline
                    className="absolute inset-0 h-full w-full object-contain bg-black"
                    onLoadedMetadata={(e) => setVideoDuration(e.currentTarget.duration || 0)}
                    onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
                    onPlay={() => setPlaying(true)}
                    onPause={() => setPlaying(false)}
                    onEnded={() => setPlaying(false)}
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.72_0.22_305_/_0.25),transparent_60%)]" />
                    <motion.div
                      className="absolute inset-0 opacity-40"
                      animate={{ background: [
                        "radial-gradient(circle at 20% 30%, oklch(0.72 0.22 305 / 0.35), transparent 50%)",
                        "radial-gradient(circle at 80% 70%, oklch(0.78 0.18 200 / 0.35), transparent 50%)",
                        "radial-gradient(circle at 20% 30%, oklch(0.72 0.22 305 / 0.35), transparent 50%)",
                      ] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <VideoIcon className="h-16 w-16 text-white/10 relative" />
                  </>
                )}

                {/* Generating overlay */}
                <AnimatePresence>
                  {generating && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-black/40 backdrop-blur-sm"
                    >
                      <div className="relative">
                        <motion.div
                          className="absolute inset-0 rounded-full bg-gradient-brand blur-xl"
                          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.9, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.div
                          className="relative h-16 w-16 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-[var(--shadow-glow)]"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                        >
                          <Wand2 className="h-7 w-7 text-white" />
                        </motion.div>
                      </div>
                      <div className="text-center">
                        <div className="font-display text-lg md:text-xl font-semibold text-white">
                          Generating subtitles…
                        </div>
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={stageIdx}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.3 }}
                            className="mt-1.5 text-xs text-white/70 font-mono"
                          >
                            {GENERATION_STAGES[stageIdx]}
                          </motion.div>
                        </AnimatePresence>
                      </div>
                      {/* Progress bar */}
                      <div className="w-56 h-1 rounded-full bg-white/10 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-brand"
                          initial={{ width: "0%" }}
                          animate={{ width: `${((stageIdx + 1) / GENERATION_STAGES.length) * 100}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Subtitle overlay */}
                <AnimatePresence mode="wait">
                  {!generating && current && (
                    <motion.div
                      key={current.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute bottom-10 left-0 right-0 px-6 text-center"
                    >
                      <span
                        className="inline-block max-w-[85%] px-4 py-2 rounded-lg bg-black/30 backdrop-blur-md text-white font-display font-semibold text-lg md:text-2xl"
                        style={{ textShadow: "0 2px 18px rgba(0,0,0,0.85), 0 0 1px rgba(0,0,0,0.5)" }}
                      >
                        {current.text}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Playback overlay — only when no real video */}
                {!generating && !videoUrl && (
                  <button
                    onClick={() => setPlaying((p) => !p)}
                    className="absolute inset-0 flex items-center justify-center group"
                  >
                    <div className="h-16 w-16 rounded-full bg-gradient-brand shadow-[var(--shadow-glow)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                      {playing ? <Pause className="h-7 w-7 text-white" /> : <Play className="h-7 w-7 text-white ml-1" />}
                    </div>
                  </button>
                )}
              </div>
              {/* Timeline */}
              <div className="p-4 border-t border-border/60">
                <div className="flex items-center gap-3 mb-3">
                  <Button size="icon" variant="outline" onClick={() => setPlaying((p) => !p)} disabled={generating || !subs.length}>
                    {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <span className="text-xs text-muted-foreground font-mono">
                    {time.toFixed(1)}s / {duration.toFixed(1)}s
                  </span>
                </div>
                <div className="relative h-12 rounded-lg bg-secondary/40 overflow-hidden">
                  {generating && (
                    <motion.div
                      className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-primary/30 to-transparent"
                      animate={{ x: ["-100%", "300%"] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                  {subs.map((s) => {
                    const left = (s.start / duration) * 100;
                    const width = ((s.end - s.start) / duration) * 100;
                    return (
                      <motion.button
                        key={s.id}
                        initial={{ opacity: 0, scaleY: 0.6 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        whileHover={{ scaleY: 1.08 }}
                        onClick={() => {
                          setActiveId(s.id);
                          setTime(s.start);
                          if (videoRef.current) videoRef.current.currentTime = s.start;
                        }}
                        className={`absolute top-1 bottom-1 rounded transition-colors ${
                          s.id === activeId ? "bg-gradient-brand shadow-[var(--shadow-glow)]" : "bg-primary/30 hover:bg-primary/60"
                        }`}
                        style={{ left: `${left}%`, width: `${width}%` }}
                        title={s.text}
                      />
                    );
                  })}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white pointer-events-none"
                    style={{ left: `${(time / duration) * 100}%` }}
                  />
                </div>
              </div>
            </Card>

            {/* Cue list */}
            <Card className="bg-card/60 border-border/60 backdrop-blur">
              <div className="flex items-center justify-between p-4 border-b border-border/60">
                <h2 className="font-display font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Captions
                </h2>
                <Button size="sm" variant="outline" onClick={addCue} disabled={generating}>
                  <Plus className="h-4 w-4 mr-1" />Add cue
                </Button>
              </div>
              <div className="divide-y divide-border/60 max-h-[420px] overflow-y-auto">
                {generating ? (
                  <div className="p-6 space-y-3">
                    {[0, 1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        className="flex gap-4 items-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.3, 0.7, 0.3] }}
                        transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.15 }}
                      >
                        <div className="h-3 w-10 rounded bg-muted" />
                        <div className="h-3 w-20 rounded bg-muted" />
                        <div className="h-3 flex-1 rounded bg-muted" />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  subs.map((s, i) => (
                    <motion.button
                      key={s.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => { setActiveId(s.id); setTime(s.start); }}
                      className={`w-full text-left p-4 flex gap-4 hover:bg-secondary/40 transition-colors ${
                        s.id === activeId ? "bg-secondary/60 border-l-2 border-primary" : ""
                      }`}
                    >
                      <div className="text-xs text-muted-foreground font-mono shrink-0 w-12">#{i + 1}</div>
                      <div className="text-xs text-muted-foreground font-mono shrink-0 w-24">
                        {s.start.toFixed(1)}-{s.end.toFixed(1)}s
                      </div>
                      <div className="text-sm flex-1">{s.text}</div>
                    </motion.button>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Inspector */}
          <div className="space-y-4">
            <Card className="bg-card/60 border-border/60 p-5 backdrop-blur">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold flex items-center gap-2"><Type className="h-4 w-4 text-primary" />Edit cue</h3>
                <Button size="icon" variant="ghost" onClick={removeActive} disabled={!active}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              {active ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground">Text</label>
                    <Textarea
                      value={active.text}
                      onChange={(e) => updateActive({ text: e.target.value })}
                      rows={3}
                      className="mt-1 bg-input border-border"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Start (s)</label>
                      <Input type="number" step="0.1" value={active.start} onChange={(e) => updateActive({ start: parseFloat(e.target.value) || 0 })} className="mt-1 bg-input border-border" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">End (s)</label>
                      <Input type="number" step="0.1" value={active.end} onChange={(e) => updateActive({ end: parseFloat(e.target.value) || 0 })} className="mt-1 bg-input border-border" />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {generating ? "Captions will appear here once generation completes." : "Select a cue to edit."}
                </p>
              )}
            </Card>

            <Card className="bg-card/60 border-border/60 p-5 backdrop-blur">
              <h3 className="font-display font-semibold mb-3">Style preset</h3>
              <div className="grid grid-cols-2 gap-2">
                {["Reels Bold", "Karaoke", "Minimal", "Pop"].map((s, i) => (
                  <button key={s} className={`rounded-lg border px-3 py-3 text-sm transition-all hover:border-primary/50 hover:bg-primary/5 ${i === 0 ? "border-primary bg-primary/10" : "border-border/70"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </Card>

            <Card className="bg-card/60 border-border/60 p-5 backdrop-blur">
              <h3 className="font-display font-semibold mb-3">Language</h3>
              <div className="flex flex-wrap gap-2">
                {["Hinglish", "Hindi", "English", "Tamil"].map((l, i) => (
                  <span key={l} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${i === 0 ? "bg-gradient-brand text-white border-transparent" : "border-border/70 text-muted-foreground hover:border-primary/40"}`}>
                    {l}
                  </span>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
