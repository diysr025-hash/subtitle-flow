import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand shadow-[var(--shadow-glow)]">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span>SubtitleAI</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors" activeOptions={{ exact: true }}>Home</Link>
          <Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
          <Link to="/editor" className="hover:text-foreground transition-colors">Editor</Link>
          <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Sign in</Button>
          <Button asChild size="sm" className="bg-gradient-brand text-white border-0 hover:opacity-90">
            <Link to="/dashboard">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
