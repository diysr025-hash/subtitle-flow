import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DropZone } from "@/components/DropZone";
import { FolderOpen, Sparkles } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — SubtitleAI" }] }),
});

function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-5xl w-full px-6 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 backdrop-blur px-3 py-1 text-xs text-muted-foreground mb-6">
            <Sparkles className="h-3 w-3 text-primary" />
            <span>Powered by AI · Hinglish ready</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Generate <span className="text-gradient">AI subtitles</span> in seconds
          </h1>
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
            Upload a video and we'll transcribe, translate, and style your captions automatically.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-12"
        >
          <div className="absolute -inset-8 bg-gradient-radial opacity-60 pointer-events-none blur-2xl" />
          <div className="relative">
            <DropZone />
          </div>
        </motion.div>

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-semibold text-muted-foreground/90">Your projects</h2>
          </div>
          <div className="rounded-2xl border border-dashed border-border/70 bg-card/30 px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-border/60 bg-card/60 mb-5">
              <FolderOpen className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-display text-lg font-medium">No projects yet</h3>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-sm mx-auto">
              Upload your first video above to start generating subtitles. Your projects will show up here.
            </p>
          </div>
        </motion.section>
      </main>
      <Footer />
    </div>
  );
}
