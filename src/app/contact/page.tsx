"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, MessageSquare, Briefcase, AlertCircle, Send, CheckCircle2 } from "lucide-react";

const reasons = [
  { icon: MessageSquare, title: "Editorial & Tips",    desc: "Story tips, press releases, corrections", email: "editorial@techpulseglobe.com" },
  { icon: Briefcase,     title: "Advertising",         desc: "Brand partnerships, sponsored content",    email: "advertise@techpulseglobe.com" },
  { icon: AlertCircle,   title: "Legal & Privacy",     desc: "DMCA, content removal, privacy requests", email: "legal@techpulseglobe.com" },
  { icon: Mail,          title: "General Enquiries",   desc: "Everything else",                         email: "hello@techpulseglobe.com" },
];

export default function ContactPage() {
  const [form, setForm]       = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus]   = useState<"idle" | "sending" | "sent" | "error">("idle");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/contact", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong. Please try again.");
        setStatus("error");
      } else {
        setStatus("sent");
        setForm({ name: "", email: "", subject: "", message: "" });
      }
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-fg mb-10">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <span className="text-foreground">Contact Us</span>
      </nav>

      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Contact <span className="gradient-text">TechPulseGlobe</span></h1>
        <p className="text-lg text-muted-fg leading-relaxed max-w-2xl">
          Have a story tip, advertising enquiry, or just want to say hello? We read every
          message and respond within 2 business days.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-10">

        {/* Contact Form */}
        <div>
          <div className="p-8 rounded-2xl bg-card border border-border">
            <h2 className="text-xl font-bold mb-6">Send us a Message</h2>

            {status === "sent" ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-14 h-14 rounded-full bg-accent-green/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-7 h-7 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Message Sent!</h3>
                <p className="text-muted-fg text-sm">
                  Thank you for reaching out. We'll get back to you within 2 business days.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-muted-fg mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name"
                      className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-fg focus:outline-none focus:border-accent/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-fg mb-1.5">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-fg focus:outline-none focus:border-accent/50 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-fg mb-1.5">Subject *</label>
                  <select
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground focus:outline-none focus:border-accent/50 transition-colors"
                  >
                    <option value="">Select a topic...</option>
                    <option value="editorial">Editorial / Story Tip</option>
                    <option value="advertising">Advertising / Partnership</option>
                    <option value="legal">Legal / Privacy / DMCA</option>
                    <option value="correction">Correction Request</option>
                    <option value="newsletter">Newsletter</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-fg mb-1.5">Message *</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us what's on your mind..."
                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-fg focus:outline-none focus:border-accent/50 transition-colors resize-none"
                  />
                </div>

                {status === "error" && errorMsg && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-hover disabled:opacity-60 transition-all"
                >
                  {status === "sending" ? (
                    <>Sending...</>
                  ) : (
                    <><Send size={14} /> Send Message</>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Sidebar — contact reasons */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-muted-fg uppercase tracking-widest text-xs mb-5">
            Contact by Topic
          </h2>

          {reasons.map((r) => (
            <div key={r.title} className="p-5 rounded-xl bg-card border border-border">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <r.icon size={14} className="text-accent" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm">{r.title}</p>
                  <p className="text-xs text-muted-fg mt-0.5 mb-2">{r.desc}</p>
                  <a
                    href={`mailto:${r.email}`}
                    className="text-xs text-accent hover:underline break-all"
                  >
                    {r.email}
                  </a>
                </div>
              </div>
            </div>
          ))}

          {/* Response time note */}
          <div className="p-5 rounded-xl border border-border bg-muted/30 text-sm text-muted-fg leading-relaxed">
            <p className="font-medium text-foreground mb-1">Response Time</p>
            <p>We aim to respond to all enquiries within <strong>2 business days</strong> (Monday&ndash;Friday, IST).</p>
          </div>
        </div>
      </div>
    </div>
  );
}
