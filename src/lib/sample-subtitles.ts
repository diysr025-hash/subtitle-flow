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
