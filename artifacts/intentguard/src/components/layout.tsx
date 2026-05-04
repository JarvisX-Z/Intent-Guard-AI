import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { ShieldCheck, History, Menu, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 sticky top-0 z-40">
        <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg hover:text-primary transition-colors group">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <span className="tracking-tight">IntentGuard <span className="text-primary font-mono text-sm uppercase ml-1">AI</span></span>
          </Link>
          
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link 
              href="/" 
              className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 ${location === "/" ? "text-primary" : "text-muted-foreground"}`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Verify</span>
            </Link>
            <Link 
              href="/history" 
              className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 ${location === "/history" ? "text-primary" : "text-muted-foreground"}`}
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t border-border py-6 mt-12 bg-card/30">
        <div className="container mx-auto px-4 md:px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} IntentGuard AI. Verifying Solana transactions.
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>Powered by Replit</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
