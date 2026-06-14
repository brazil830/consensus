import { Link, useLocation } from "wouter";
import { Activity, ShieldCheck, Box, ActivitySquare, TerminalSquare } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: Activity },
    { href: "/tasks", label: "Mission Tasks", icon: ActivitySquare },
    { href: "/capsules", label: "Capsule Ledger", icon: ShieldCheck },
    { href: "/new-task", label: "Command Input", icon: TerminalSquare },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 text-primary font-display font-bold text-xl uppercase tracking-wider">
            <Box className="w-6 h-6" />
            ConsensusAI
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6 shrink-0">
          <div className="text-sm font-mono text-muted-foreground">
            {new Date().toISOString()} | SYS_STATE: NOMINAL
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6 bg-background">
          <div className="max-w-6xl mx-auto space-y-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
