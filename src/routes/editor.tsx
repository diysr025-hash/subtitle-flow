import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Download, FileDown, Pause, Play, Plus, Trash2, Type, Video as VideoIcon } from "lucide-react";
import { sampleSubtitles, toSrt, type Subtitle } from "@/lib/sample-subtitles";
import { toast } from "sonner";

export const Route = createFileRoute("/editor")({
  component: Editor,
  head: () => ({ meta: [{ title: "Subtitle Editor — SubtitleAI" }] }),
});

function Editor() {
  const [subs, setSubs] = useState<Subtitle[]>(sampleSubtitles);
  const [activeId, setActiveId] = useState<string>(subs[0].id);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const rafRef = useRef<number | undefined>(undefined);
  const lastTickRef = useRef<number>(0);

  const duration = Math.max(...subs.map((s) => s.end), 14);

  useEffect(() => {
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
  }, [playing, duration]);

  const current = subs.find((s) => time >= s.start && time <= s.end);
  const active = subs.find((s) => s.id === activeId)!;

  const updateActive = (patch: Partial<Subtitle>) => {
    setSubs((arr) => arr.map((s) => (s.id === activeId ? { ...s, ...patch } : s)));
  };

  const addCue = () => {
    const last = subs[subs.length - 1];
    const newSub: Subtitle = { id: crypto.randomUUID(), start: last.end + 0.1, end: last.end + 2.5, text: "New caption" };
    setSubs([...subs, newSub]);
    setActiveId(newSub.id);
  };

  const removeActive = () => {
    if (subs.length <= 1) return;
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
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">Subtitle Editor</h1>
            <p className="text-sm text-muted-foreground mt-1">demo_reel_hinglish.mp4 · {subs.length} cues</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportSrt}><FileDown className="mr-2 h-4 w-4" />Export SRT</Button>
            <Button onClick={exportMp4} className="bg-gradient-brand text-white border-0"><Download className="mr-2 h-4 w-4" />Export MP4</Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Preview + timeline */}
          <div className="space-y-4">
            <Card className="bg-card border-border overflow-hidden">
              <div className="relative aspect-video bg-black flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
                <VideoIcon className="h-16 w-16 text-white/10" />
                {/* Subtitle overlay */}
                {current && (
                  <div className="absolute bottom-8 left-0 right-0 px-6 text-center">
                    <span
                      key={current.id}
                      className="inline-block max-w-[85%] px-4 py-2 rounded-lg bg-black/70 backdrop-blur-sm text-white font-display font-semibold text-lg md:text-2xl animate-fade-up"
                      style={{ textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}
                    >
                      {current.text}
                    </span>
                  </div>
                )}
                {/* Playback overlay */}
                <button
                  onClick={() => setPlaying((p) => !p)}
                  className="absolute inset-0 flex items-center justify-center group"
                >
                  <div className="h-16 w-16 rounded-full bg-gradient-brand shadow-[var(--shadow-glow)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {playing ? <Pause className="h-7 w-7 text-white" /> : <Play className="h-7 w-7 text-white ml-1" />}
                  </div>
                </button>
              </div>
              {/* Timeline */}
              <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3 mb-3">
                  <Button size="icon" variant="outline" onClick={() => setPlaying((p) => !p)}>
                    {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <span className="text-xs text-muted-foreground font-mono">
                    {time.toFixed(1)}s / {duration.toFixed(1)}s
                  </span>
                </div>
                <div className="relative h-12 rounded-lg bg-secondary/50 overflow-hidden">
                  {subs.map((s) => {
                    const left = (s.start / duration) * 100;
                    const width = ((s.end - s.start) / duration) * 100;
                    return (
                      <button
                        key={s.id}
                        onClick={() => { setActiveId(s.id); setTime(s.start); }}
                        className={`absolute top-1 bottom-1 rounded transition-all ${
                          s.id === activeId ? "bg-gradient-brand shadow-[var(--shadow-glow)]" : "bg-primary/30 hover:bg-primary/50"
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
            <Card className="bg-card border-border">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="font-display font-semibold">Captions</h2>
                <Button size="sm" variant="outline" onClick={addCue}><Plus className="h-4 w-4 mr-1" />Add cue</Button>
              </div>
              <div className="divide-y divide-border max-h-[420px] overflow-y-auto">
                {subs.map((s, i) => (
                  <button
                    key={s.id}
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
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Inspector */}
          <div className="space-y-4">
            <Card className="bg-card border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold flex items-center gap-2"><Type className="h-4 w-4 text-primary" />Edit cue</h3>
                <Button size="icon" variant="ghost" onClick={removeActive}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
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
            </Card>

            <Card className="bg-card border-border p-5">
              <h3 className="font-display font-semibold mb-3">Style preset</h3>
              <div className="grid grid-cols-2 gap-2">
                {["Reels Bold", "Karaoke", "Minimal", "Pop"].map((s, i) => (
                  <button key={s} className={`rounded-lg border px-3 py-3 text-sm transition-all hover:border-primary/50 ${i === 0 ? "border-primary bg-primary/10" : "border-border"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </Card>

            <Card className="bg-card border-border p-5">
              <h3 className="font-display font-semibold mb-3">Language</h3>
              <div className="flex flex-wrap gap-2">
                {["Hinglish", "Hindi", "English", "Tamil"].map((l, i) => (
                  <span key={l} className={`text-xs px-3 py-1.5 rounded-full border ${i === 0 ? "bg-gradient-brand text-white border-transparent" : "border-border text-muted-foreground"}`}>
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
