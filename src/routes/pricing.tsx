import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Sparkles } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  component: Pricing,
  head: () => ({
    meta: [
      { title: "Pricing — SubtitleAI" },
      { name: "description", content: "Simple, creator-friendly pricing. Start free, upgrade as you grow." },
    ],
  }),
});

const tiers = [
  {
    name: "Starter",
    price: "Free",
    blurb: "For trying things out.",
    features: ["5 videos / month", "Up to 10 min per video", "Hinglish, Hindi & English", "SRT export"],
    cta: "Start free",
  },
  {
    name: "Creator",
    price: "₹799",
    period: "/mo",
    blurb: "For active content creators.",
    features: ["100 videos / month", "Up to 60 min per video", "All 40+ languages", "SRT + burned-in MP4 export", "Animated style presets", "Priority processing"],
    cta: "Go Creator",
    highlight: true,
  },
  {
    name: "Studio",
    price: "₹2,499",
    period: "/mo",
    blurb: "For agencies & teams.",
    features: ["Unlimited videos", "Up to 4 hours per video", "Team workspaces (5 seats)", "API access", "Custom brand styles", "Dedicated support"],
    cta: "Go Studio",
  },
];

function Pricing() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-7xl w-full px-6 py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-border glass px-4 py-1.5 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Cancel anytime · No hidden fees
          </div>
          <h1 className="mt-6 font-display text-4xl md:text-6xl font-bold">
            Pricing made for <span className="text-gradient">creators</span>
          </h1>
          <p className="mt-4 text-muted-foreground">Start free. Scale when your channel does.</p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {tiers.map((t) => (
            <Card
              key={t.name}
              className={`relative p-8 flex flex-col ${
                t.highlight
                  ? "bg-card border-primary/50 shadow-[var(--shadow-glow)]"
                  : "bg-card border-border"
              }`}
            >
              {t.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-brand text-white text-xs font-semibold">
                  Most popular
                </div>
              )}
              <div>
                <h3 className="font-display text-xl font-semibold">{t.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t.blurb}</p>
              </div>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-5xl font-bold">{t.price}</span>
                {t.period && <span className="text-muted-foreground">{t.period}</span>}
              </div>
              <ul className="mt-6 space-y-3 flex-1">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className={`mt-8 ${t.highlight ? "bg-gradient-brand text-white border-0" : ""}`}
                variant={t.highlight ? "default" : "outline"}
              >
                <Link to="/dashboard">{t.cta}</Link>
              </Button>
            </Card>
          ))}
        </div>

        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-center mb-8">Frequently asked</h2>
          <div className="space-y-3">
            {faqs.map((q) => (
              <details key={q.q} className="group rounded-xl border border-border bg-card p-5 open:shadow-[var(--shadow-card)]">
                <summary className="cursor-pointer font-medium flex justify-between items-center">
                  {q.q}
                  <span className="text-primary group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{q.a}</p>
              </details>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

const faqs = [
  { q: "What is Hinglish subtitle generation?", a: "Hinglish blends Hindi and English the way creators actually speak. Our AI transcribes mixed-language audio and outputs Roman-script captions that read naturally." },
  { q: "Can I edit subtitles after they're generated?", a: "Yes — every cue is editable in our inline editor. Adjust text, retime, restyle, and re-export in seconds." },
  { q: "What formats can I export?", a: "SRT for use with any editor, and burned-in MP4 with your chosen style preset." },
  { q: "Do you offer student or refunds?", a: "Reach out via the contact link in the footer — we're a small team and try to help where we can." },
];
