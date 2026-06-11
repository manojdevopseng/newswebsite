"use client";

import { useState } from "react";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";
import { isValidEmail } from "@/lib/utils";

export function NewsletterCTA() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) { setErrorMsg("Please enter a valid email address."); return; }

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
      } else if (res.status === 409) {
        setErrorMsg("You&apos;re already subscribed! Check your inbox.");
        setStatus("error");
      } else {
        setStatus("error");
        setErrorMsg("Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
    }
  };

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="relative overflow-hidden rounded-3xl border border-accent/20 p-8 sm:p-14"
          style={{
            background:
              "radial-gradient(ellipse 80% 80% at 50% -10%, rgba(96,165,250,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 90% 80%, rgba(167,139,250,0.10) 0%, transparent 50%), var(--card)",
          }}
        >
          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, #60a5fa 0px, transparent 1px, transparent 60px, #60a5fa 61px), repeating-linear-gradient(90deg, #60a5fa 0px, transparent 1px, transparent 60px, #60a5fa 61px)",
            }}
          />
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent-purple/8 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/8 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 mb-5">
              <Mail size={22} className="text-accent" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold">
              Stay Ahead of the Curve
            </h2>
            <p className="mt-3 text-muted-fg leading-relaxed">
              Get the best AI, Finance &amp; Tech stories delivered to your inbox every morning. Free forever. No spam.
            </p>

            {status === "success" ? (
              <div className="mt-8 flex items-center justify-center gap-2 text-accent-green font-semibold">
                <CheckCircle size={20} />
                You&apos;re in! Welcome to TechPulseGlobe.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrorMsg(""); }}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-xl bg-background border border-border text-sm outline-none focus:border-accent transition-colors placeholder:text-muted-fg"
                  required
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors shadow-lg shadow-accent/20 disabled:opacity-60 whitespace-nowrap"
                >
                  {status === "loading" ? "Subscribing..." : "Subscribe Free"} <ArrowRight size={14} />
                </button>
              </form>
            )}

            {errorMsg && <p className="mt-3 text-sm text-accent-orange">{errorMsg}</p>}

            <p className="mt-4 text-xs text-muted-fg">
              Free daily newsletter &middot; Unsubscribe anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
