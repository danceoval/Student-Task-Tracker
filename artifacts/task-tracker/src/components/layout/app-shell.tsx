import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  CheckSquare, 
  BookOpen, 
  BookMarked
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/tasks", label: "Tasks", icon: CheckSquare },
    { href: "/courses", label: "Courses", icon: BookOpen },
  ];

  return (
    <div className="min-h-screen flex w-full bg-background selection:bg-primary/20 selection:text-primary">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card/50 hidden md:flex flex-col flex-shrink-0 relative overflow-hidden backdrop-blur-sm z-10">
        <div className="p-6 pb-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-inner">
            <BookMarked className="text-primary-foreground w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif font-semibold text-lg leading-tight text-foreground">Task Tracker</h1>
            <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold font-sans">Command Center</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer group",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/10" 
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("w-4 h-4", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-6 md:p-10 lg:p-12 max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
