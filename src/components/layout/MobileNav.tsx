"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { mainNav, footerNav } from "@/config/nav";
import { LanguageToggle } from "./LanguageToggle";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-72 bg-card border-l border-border lg:hidden overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/favicon-32x32.png" alt="TechPulseGlobe logo" width={18} height={18} />
                <span className="font-bold gradient-text">TechPulseGlobe</span>
              </div>
              <button
                onClick={onClose}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted text-muted-fg hover:text-foreground transition-colors"
                aria-label="Close menu"
              >
                <X size={16} />
              </button>
            </div>

            {/* Nav Items */}
            <nav className="p-4 space-y-1">
              {mainNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    pathname === item.href || pathname.startsWith(item.href + "/")
                      ? "bg-accent/10 text-accent"
                      : "text-muted-fg hover:text-foreground hover:bg-muted",
                    item.highlight && pathname !== item.href && "text-accent-purple"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Language toggle — only visible on article pages */}
            <div className="px-4 py-3 border-t border-border">
              <p className="text-xs text-muted-fg mb-2 px-1 font-medium uppercase tracking-wider">Language</p>
              <LanguageToggle />
            </div>

            {/* Footer links */}
            <div className="px-4 pb-8 border-t border-border mt-4 pt-4">
              <p className="text-xs text-muted-fg mb-3 px-3 font-medium uppercase tracking-wider">
                Resources
              </p>
              {footerNav.tools.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center px-3 py-2 rounded-lg text-sm text-muted-fg hover:text-foreground hover:bg-muted transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

