import { Link, useLocation } from "wouter";
import { Music, Disc, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Gerar", path: "/", icon: Music },
    { label: "Biblioteca", path: "/library", icon: Disc },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 glass border-b border-white/5">
      <div className="container mx-auto h-full px-4 flex items-center justify-between">
        <Link href="/">
          <a className="flex items-center gap-2 group">
            <div className="relative w-8 h-8 rounded-lg bg-linear-to-br from-primary to-secondary p-0.5 group-hover:shadow-[0_0_15px_rgba(139,92,246,0.5)] transition-shadow">
              <div className="w-full h-full bg-black/50 backdrop-blur-sm rounded-md flex items-center justify-center">
                <Music className="w-4 h-4 text-white" />
              </div>
            </div>
            <span className="font-bold text-lg tracking-tight">
              Vibr<span className="text-primary">Ai</span>
            </span>
          </a>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path}>
                <a
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors hover:text-white",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </a>
              </Link>
            );
          })}
        </div>
        <div className="hidden md:flex items-center gap-4"></div>
        <button
          className="md:hidden p-2 text-muted-foreground hover:text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border p-4 flex flex-col gap-4 md:hidden animate-in slide-in-from-top-5 shadow-2xl">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className="w-5 h-5 text-primary" />
                <span className="text-lg font-medium">{item.label}</span>
              </a>
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
