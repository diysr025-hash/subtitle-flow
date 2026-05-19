export type Subtitle = {
  id: string;
  start: number; // seconds
  end: number;
  text: string;
};

export const sampleSubtitles: Subtitle[] = [
  { id: "1", start: 0, end: 2.4, text: "Yaar, aaj main aapko ek amazing trick batane wala hoon" },
  { id: "2", start: 2.5, end: 5.0, text: "Ye AI tool literally game changer hai content creators ke liye" },
  { id: "3", start: 5.1, end: 7.8, text: "Bas video upload karo, aur subtitles ready — Hinglish mein!" },
  { id: "4", start: 7.9, end: 10.5, text: "No more manual typing, no more sync issues" },
  { id: "5", start: 10.6, end: 13.2, text: "Try karo aur comments mein batao kaisa laga" },
];

export function toSrt(subs: Subtitle[]) {
  const fmt = (t: number) => {
    const h = Math.floor(t / 3600).toString().padStart(2, "0");
    const m = Math.floor((t % 3600) / 60).toString().padStart(2, "0");
    const s = Math.floor(t % 60).toString().padStart(2, "0");
    const ms = Math.floor((t % 1) * 1000).toString().padStart(3, "0");
    return `${h}:${m}:${s},${ms}`;
  };
  return subs.map((s, i) => `${i + 1}\n${fmt(s.start)} --> ${fmt(s.end)}\n${s.text}\n`).join("\n");
}

const parseTs = (ts: string) => {
  const m = ts.trim().match(/(\d+):(\d+):(\d+)[,.](\d+)/);
  if (!m) return 0;
  return +m[1] * 3600 + +m[2] * 60 + +m[3] + +m[4] / 1000;
};

export function parseSrt(srt: string): Subtitle[] {
  const blocks = srt.replace(/\r/g, "").split(/\n\n+/);
  const out: Subtitle[] = [];
  for (const block of blocks) {
    const lines = block.split("\n").filter(Boolean);
    if (!lines.length) continue;
    const tsLine = lines.find((l) => l.includes("-->"));
    if (!tsLine) continue;
    const [a, b] = tsLine.split("-->");
    const textLines = lines.slice(lines.indexOf(tsLine) + 1);
    if (!textLines.length) continue;
    out.push({
      id: crypto.randomUUID(),
      start: parseTs(a),
      end: parseTs(b),
      text: textLines.join(" ").trim(),
    });
  }
  return out;
}

// Split plain text into evenly-timed cues (~3s each, ~8 words per cue)
export function splitTextToCues(text: string, opts?: { wordsPerCue?: number; secondsPerCue?: number }): Subtitle[] {
  const wordsPerCue = opts?.wordsPerCue ?? 8;
  const secondsPerCue = opts?.secondsPerCue ?? 3;
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];

  // Prefer sentence-ish chunks first
  const sentences = clean.split(/(?<=[.!?।])\s+/).filter(Boolean);
  const chunks: string[] = [];
  for (const sentence of sentences) {
    const words = sentence.split(" ");
    for (let i = 0; i < words.length; i += wordsPerCue) {
      chunks.push(words.slice(i, i + wordsPerCue).join(" "));
    }
  }

  return chunks.map((chunk, i) => ({
    id: crypto.randomUUID(),
    start: i * secondsPerCue,
    end: (i + 1) * secondsPerCue,
    text: chunk,
  }));
}

export function normalizeSubtitles(payload: unknown): Subtitle[] {
  if (!payload) return [];
  if (typeof payload === "string") {
    const srt = parseSrt(payload);
    if (srt.length) return srt;
    return splitTextToCues(payload);
  }
  if (Array.isArray(payload)) {
    return payload
      .map((item: any, i: number) => ({
        id: item.id?.toString() ?? crypto.randomUUID(),
        start: Number(item.start ?? item.start_time ?? item.from ?? i * 2),
        end: Number(item.end ?? item.end_time ?? item.to ?? i * 2 + 2),
        text: String(item.text ?? item.caption ?? item.content ?? ""),
      }))
      .filter((s) => s.text);
  }
  if (typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    // Prefer Hinglish `text` field from backend
    const candidates = [obj.text, obj.subtitles, obj.srt, obj.captions, obj.data, obj.result, obj.originalHindi];
    for (const c of candidates) {
      const parsed = normalizeSubtitles(c);
      if (parsed.length) return parsed;
    }
  }
  return [];
}
