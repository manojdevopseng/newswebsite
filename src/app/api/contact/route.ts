import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { isRateLimited, getIP } from "@/lib/rate-limit";

interface ContactBody {
  name:    string;
  email:   string;
  subject: string;
  message: string;
}

const SUBJECT_LABELS: Record<string, string> = {
  editorial:   "Editorial / Story Tip",
  advertising: "Advertising / Partnership",
  legal:       "Legal / Privacy / DMCA",
  correction:  "Correction Request",
  newsletter:  "Newsletter",
  other:       "Other",
};

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 3 submissions per hour per IP
    const ip = getIP(req)
    if (await isRateLimited(`contact:${ip}`, 3, 60 * 60 * 1000))
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })

    const body = (await req.json()) as Partial<ContactBody>;

    // Basic validation
    const { name, email, subject, message } = body;
    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }
    if (message.trim().length < 10) {
      return NextResponse.json({ error: "Message is too short." }, { status: 400 });
    }

    const subjectLabel = SUBJECT_LABELS[subject] ?? subject;
    const toEmail      = process.env.CONTACT_TO_EMAIL || "hello@techpulseglobe.com";

    // â"€â"€ Send email if SMTP is configured â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host:   smtpHost,
        port:   Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        auth:   { user: smtpUser, pass: smtpPass },
      });

      await transporter.sendMail({
        from:    `"TechPulseGlobe Contact" <${smtpUser}>`,
        to:      toEmail,
        replyTo: `"${name}" <${email}>`,
        subject: `[Contact] ${subjectLabel} - from ${name}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <h2 style="color:#3b82f6;margin-bottom:4px">New Contact Form Submission</h2>
            <p style="color:#6b7280;margin-top:0;font-size:14px">TechPulseGlobe &mdash; ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</p>
            <hr style="border:1px solid #e5e7eb;margin:20px 0"/>
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <tr><td style="padding:8px 0;color:#6b7280;width:100px">Name</td><td style="padding:8px 0;font-weight:600">${name}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280">Email</td><td style="padding:8px 0"><a href="mailto:${email}" style="color:#3b82f6">${email}</a></td></tr>
              <tr><td style="padding:8px 0;color:#6b7280">Topic</td><td style="padding:8px 0">${subjectLabel}</td></tr>
            </table>
            <hr style="border:1px solid #e5e7eb;margin:20px 0"/>
            <h3 style="margin-bottom:8px;font-size:14px;color:#374151">Message</h3>
            <div style="background:#f9fafb;border-radius:8px;padding:16px;font-size:14px;line-height:1.7;color:#111827;white-space:pre-wrap">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
            <hr style="border:1px solid #e5e7eb;margin:20px 0"/>
            <p style="font-size:12px;color:#9ca3af">Reply directly to this email to respond to ${name}.</p>
          </div>
        `,
      });
    } else {
      // No SMTP configured — log to console (dev fallback)
      console.info("[Contact Form]", { name, email, subject: subjectLabel, message });
    }

    // â"€â"€ Also save to MongoDB (optional backup) â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
    try {
      const { default: dbConnect } = await import("@/lib/db/mongoose");
      await dbConnect();
      // Dynamic model — lightweight, no separate file needed for now
      const { default: mongoose } = await import("mongoose");
      const ContactMsg = mongoose.models.ContactMessage ||
        mongoose.model("ContactMessage", new mongoose.Schema({
          name:      String,
          email:     String,
          subject:   String,
          message:   String,
          createdAt: { type: Date, default: Date.now },
        }));
      await (ContactMsg as any).create({ name, email, subject: subjectLabel, message });
    } catch {
      // DB backup is non-critical — don't fail the request
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("[Contact API]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

