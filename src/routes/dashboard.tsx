import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DropZone } from "@/components/DropZone";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, FileVideo, MoreHorizontal, Sparkles, Video, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — SubtitleAI" }] }),
});

const projects = [
  { name: "Reel_Mumbai_streetfood.mp4", duration: "0:42", status: "ready", lang: "Hinglish", date: "2h ago" },
  { name: "Podcast_ep_14_full.mp4", duration: "48:12", status: "processing", lang: "Hinglish", date: "Just now" },
  { name: "Vlog_Goa_trip.mov", duration: "8:20", status: "ready", lang: "English", date: "Yesterday" },
  { name: "Tutorial_react_hooks.mp4", duration: "12:55", status: "ready", lang: "Hindi", date: "3 days ago" },
];

function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-7xl w-full px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold">Welcome back, Aarav 👋</h1>
            <p className="mt-1 text-muted-foreground">3 of 5 free credits remaining this month.</p>
          </div>
          <Button asChild className="bg-gradient-brand text-white border-0">
            <Link to="/pricing">Upgrade plan</Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { label: "Videos captioned", value: "23", icon: Video },
            { label: "Hours saved", value: "14.2", icon: Clock },
            { label: "Words generated", value: "48,219", icon: Sparkles },
          ].map((s) => (
            <Card key={s.label} className="p-6 bg-card border-border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">{s.label}</div>
                  <div className="mt-1 font-display text-3xl font-bold">{s.value}</div>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-brand/20 border border-primary/30">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-8">
          <DropZone compact />
        </div>

        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold">Recent projects</h2>
          </div>
          <Card className="divide-y divide-border bg-card border-border overflow-hidden">
            {projects.map((p) => (
              <Link
                key={p.name}
                to="/editor"
                className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-brand/20 border border-primary/30 shrink-0">
                  <FileVideo className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-3">
                    <span>{p.duration}</span>
                    <span>·</span>
                    <span>{p.lang}</span>
                    <span>·</span>
                    <span>{p.date}</span>
                  </div>
                </div>
                {p.status === "ready" ? (
                  <Badge variant="outline" className="border-primary/40 text-primary gap-1"><CheckCircle2 className="h-3 w-3" />Ready</Badge>
                ) : (
                  <Badge variant="outline" className="border-accent/40 text-accent">
                    <span className="relative flex h-2 w-2 mr-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                    </span>
                    Processing
                  </Badge>
                )}
                <button className="p-2 rounded-lg hover:bg-secondary"><MoreHorizontal className="h-4 w-4 text-muted-foreground" /></button>
              </Link>
            ))}
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
