"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { mainNav } from "@/config/nav";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { useSearchStore } from "@/store/searchStore";
import { MobileNav } from "./MobileNav";
import { useState, useEffect } from "react";

export function Header() {
  const pathname = usePathname();
  const { open: openSearch } = useSearchStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        openSearch();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [openSearch]);

  return (
    <>
      {/* Top gradient accent line — premium brand indicator */}
      <div className="fixed top-0 inset-x-0 h-[2px] z-[60] bg-gradient-to-r from-transparent via-accent to-accent-purple opacity-70 pointer-events-none" />

      <header
        className={cn(
          "fixed top-[2px] inset-x-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-background/90 backdrop-blur-md border-b border-border shadow-[0_1px_20px_rgba(0,0,0,0.15)]"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0 group">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-accent/20 to-accent-purple/20 border border-accent/20 group-hover:border-accent/40 transition-colors">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/favicon-32x32.png" alt="TechPulseGlobe logo" width={18} height={18} />
              </div>
              <div className="hidden sm:flex flex-col leading-none">
                <span className="font-bold text-[17px] tracking-tight gradient-text">
                  TechPulseGlobe
                </span>
                <span className="text-[9px] text-muted-fg tracking-widest uppercase font-medium opacity-70">
                  Intelligence
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {mainNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150",
                    pathname === item.href || pathname.startsWith(item.href + "/")
                      ? "text-accent bg-accent/10"
                      : "text-muted-fg hover:text-foreground hover:bg-muted",
                    item.highlight && pathname !== item.href &&
                      "text-accent-purple hover:text-accent-purple hover:bg-accent-purple/10"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Search button */}
              <button
                onClick={openSearch}
                className={cn(
                  "hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                  "bg-muted text-muted-fg hover:text-foreground hover:bg-border",
                  "transition-colors duration-150 group"
                )}
              >
                <Search size={14} />
                <span className="text-xs">Search</span>
                <kbd className="ml-1 px-1.5 py-0.5 text-xs rounded bg-border text-muted-fg group-hover:bg-muted">
                  Ctrl K
                </kbd>
              </button>

              {/* Mobile search icon */}
              <button
                onClick={openSearch}
                className="sm:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-muted text-muted-fg hover:text-foreground transition-colors"
                aria-label="Search"
              >
                <Search size={16} />
              </button>

              <LanguageToggle />

              <ThemeToggle />

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-muted text-muted-fg hover:text-foreground transition-colors"
                aria-label="Open menu"
              >
                <Menu size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileNav isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}

