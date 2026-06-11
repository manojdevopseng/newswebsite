import Link from "next/link";
import { Twitter, Linkedin, Rss, Github } from "lucide-react";
import { footerNav } from "@/config/nav";
import { siteConfig } from "@/config/site";
import { categories } from "@/config/categories";

export function Footer() {
  return (
    <footer className="relative border-t border-border mt-20 overflow-hidden">
      {/* Subtle top gradient */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      {/* Ambient glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-accent/4 blur-[80px] pointer-events-none" />

      <div className="relative bg-card/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          {/* Top section */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">

            {/* Brand column — spans 2 on md */}
            <div className="col-span-2">
              {/* Logo */}
              <Link href="/" className="inline-flex items-center gap-2.5 group mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-accent/20 to-accent-purple/20 border border-accent/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/favicon-32x32.png" alt="TechPulseGlobe logo" width={18} height={18} />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-bold text-base tracking-tight gradient-text">
                    {siteConfig.name}
                  </span>
                  <span className="text-[9px] text-muted-fg tracking-widest uppercase font-medium opacity-70">
                    Intelligence
                  </span>
                </div>
              </Link>

              <p className="text-sm text-muted-fg leading-relaxed max-w-xs mb-5">
                Premium AI, Finance &amp; Tech intelligence for India&apos;s most ambitious
                professionals. Free newsletter, deep analysis, real-time insights.
              </p>

              {/* Social links */}
              <div className="flex gap-2">
                {[
                  { icon: Twitter,  href: "https://x.com/TechPulseG1310", label: "Twitter / X" },
                  { icon: Linkedin, href: "#",                                                          label: "LinkedIn" },
                  { icon: Github,   href: "#",                                                          label: "GitHub" },
                  { icon: Rss,      href: "/api/feed",                                                  label: "RSS Feed" },
                ].map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                    aria-label={label}
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted text-muted-fg
                      hover:text-foreground hover:bg-border transition-all hover:-translate-y-0.5"
                  >
                    <Icon size={14} />
                  </a>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-fg mb-4">
                Categories
              </h3>
              <ul className="space-y-2.5">
                {footerNav.categories.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-fg hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tools */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-fg mb-4">
                Tools
              </h3>
              <ul className="space-y-2.5">
                {footerNav.tools.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-fg hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-fg mb-4">
                Company
              </h3>
              <ul className="space-y-2.5">
                {footerNav.company.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-fg hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Category color chips row */}
          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                  border transition-all hover:-translate-y-0.5"
                style={{
                  color: cat.color,
                  borderColor: `${cat.color}30`,
                  backgroundColor: `${cat.color}0a`,
                }}
              >
                <span
                  className="h-1 w-1 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="section-divider mb-6" />
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-muted-fg">
            <p>
              © {new Date().getFullYear()}{" "}
              <span className="gradient-text font-semibold">{siteConfig.name}</span>.
              {" "}All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/about"      className="hover:text-foreground transition-colors">About</Link>
              <Link href="/contact"    className="hover:text-foreground transition-colors">Contact</Link>
              <Link href="/privacy"    className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/terms"      className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="/disclaimer" className="hover:text-foreground transition-colors">Disclaimer</Link>
              <span className="text-border hidden sm:inline">·</span>
              <span className="hidden sm:inline">Made with ❤️ for India&apos;s tech community</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
