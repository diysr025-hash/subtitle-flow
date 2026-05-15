import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DropZone } from "@/components/DropZone";
import { Button } from "@/components/ui/button";
import { Sparkles, Wand2, Languages, Download, Zap, Play } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "SubtitleAI — Hinglish AI Subtitle Generator" },
      { name: "description", content: "Generate Hinglish subtitles for your videos with AI. Drag, drop, edit, export SRT or burned-in MP4." },
    ],
  }),
});

function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-30"
            style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
          <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-24 md:pt-32 md:pb-32">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-border glass px-4 py-1.5 text-xs text-muted-foreground animate-fade-in">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Now supporting Hinglish, Hindi & 40+ languages
              </div>
              <h1 className="mt-6 font-display text-5xl md:text-7xl font-bold tracking-tight animate-fade-up">
                Subtitles that <span className="text-gradient">speak Hinglish</span> fluently.
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-up">
                Upload your video. Our AI transcribes, translates, and styles subtitles in your audience's voice — ready to export as SRT or burned into MP4.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3 animate-fade-up">
                <Button asChild size="lg" className="bg-gradient-brand text-white border-0 shadow-[var(--shadow-glow)] hover:opacity-90">
                  <Link to="/dashboard"><Wand2 className="mr-2 h-4 w-4" />Generate subtitles free</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/editor"><Play className="mr-2 h-4 w-4" />Try the editor</Link>
                </Button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">No credit card · 5 free videos / month</p>
            </div>

            <div className="mt-16 max-w-3xl mx-auto animate-fade-up">
              <DropZone />
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-bold">Built for the creator economy</h2>
            <p className="mt-4 text-muted-foreground">Everything you need to ship binge-worthy captions, faster.</p>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="group relative rounded-2xl border border-border bg-card p-6 hover:border-primary/40 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card)]">
                <div className="absolute inset-0 rounded-2xl bg-gradient-radial opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="relative">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-brand shadow-[var(--shadow-glow)]">
                    <f.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* STATS */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="rounded-3xl border border-border glass p-10 md:p-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-radial opacity-60 pointer-events-none" />
            <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                ["12M+", "Minutes captioned"],
                ["98.4%", "Hinglish accuracy"],
                ["40+", "Languages"],
                ["80K+", "Creators trust us"],
              ].map(([n, l]) => (
                <div key={l}>
                  <div className="font-display text-3xl md:text-5xl font-bold text-gradient">{n}</div>
                  <div className="mt-2 text-sm text-muted-foreground">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-4xl px-6 py-24 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            Ready to caption like a <span className="text-gradient">pro?</span>
          </h2>
          <p className="mt-4 text-muted-foreground">Join thousands of creators shipping subtitled content daily.</p>
          <Button asChild size="lg" className="mt-8 bg-gradient-brand text-white border-0 shadow-[var(--shadow-glow)] hover:opacity-90">
            <Link to="/dashboard">Start for free</Link>
          </Button>
        </section>
      </main>
      <Footer />
    </div>
  );
}

const features = [
  { icon: Languages, title: "Hinglish-native AI", desc: "Code-switching is our specialty. Roman Hindi, English slang, regional flair — all handled." },
  { icon: Wand2, title: "Inline subtitle editor", desc: "Edit text, retime cues, restyle fonts. Changes preview live on your video." },
  { icon: Zap, title: "Lightning fast", desc: "A 10-min video is captioned in under 60 seconds. Powered by streaming AI." },
  { icon: Download, title: "Export SRT or MP4", desc: "Hand off SRT files to your editor — or burn captions directly into MP4." },
  { icon: Sparkles, title: "Creator templates", desc: "Animated word-by-word reveals, karaoke styles, viral Reels presets." },
  { icon: Play, title: "Real-time preview", desc: "See exactly how subtitles render before you export. No surprises." },
];
