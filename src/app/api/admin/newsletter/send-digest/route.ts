import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { auth } from '@/lib/admin/auth'
import dbConnect from '@/lib/db/mongoose'
import NewsletterModel from '@/lib/db/models/Newsletter'
import ArticleModel from '@/lib/db/models/Article'

export const dynamic = 'force-dynamic'

// ── Helper: strip HTML tags ───────────────────────────────────────────────
function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

// ── Email template ────────────────────────────────────────────────────────
function buildEmail(articles: any[], siteUrl: string): string {
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata',
  })

  const articleRows = articles.map(a => {
    const cat     = (a.category as any)?.name  || 'General'
    const catColor= (a.category as any)?.color || '#60a5fa'
    const url     = `${siteUrl}/${(a.category as any)?.slug || 'general'}/${a.slug}`
    const excerpt = a.excerpt ? a.excerpt.slice(0, 120) + '…' : ''
    const image   = a.featuredImage || ''

    return `
      <tr>
        <td style="padding:0 0 28px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              ${image ? `
              <td width="100" valign="top" style="padding-right:16px;">
                <img src="${image}" width="100" height="66" alt="${a.title}"
                  style="border-radius:8px;object-fit:cover;display:block;width:100px;height:66px;" />
              </td>` : ''}
              <td valign="top">
                <span style="display:inline-block;background:${catColor}20;color:${catColor};
                  font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px;margin-bottom:6px;
                  text-transform:uppercase;letter-spacing:0.05em;">${cat}</span>
                <a href="${url}" style="display:block;font-size:16px;font-weight:700;color:#ffffff;
                  text-decoration:none;line-height:1.4;margin-bottom:6px;">${a.title}</a>
                <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;">${excerpt}</p>
                <a href="${url}" style="display:inline-block;margin-top:8px;font-size:12px;
                  color:#60a5fa;text-decoration:none;font-weight:500;">Read article →</a>
              </td>
            </tr>
          </table>
          <hr style="border:none;border-top:1px solid #1e1e2d;margin:20px 0 0 0;" />
        </td>
      </tr>`
  }).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>TechPulseGlobe Weekly Digest</title></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0a0a0f">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" border="0"
        style="max-width:600px;width:100%;background:#111118;border-radius:16px;overflow:hidden;
          border:1px solid #1e1e2d;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a1a2e 0%,#0f0f1a 100%);
            padding:32px 32px 28px;border-bottom:1px solid #1e1e2d;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <span style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
                    Tech<span style="color:#60a5fa;">Pulse</span>Globe
                  </span>
                  <p style="margin:4px 0 0;font-size:12px;color:#60a5fa;font-weight:500;letter-spacing:0.05em;
                    text-transform:uppercase;">AI · Finance · Tech Intelligence</p>
                </td>
                <td align="right">
                  <span style="font-size:12px;color:#475569;">${dateStr}</span>
                </td>
              </tr>
            </table>
            <h1 style="margin:20px 0 6px;font-size:24px;font-weight:700;color:#ffffff;line-height:1.3;">
              Your Weekly Intelligence Digest 🚀
            </h1>
            <p style="margin:0;font-size:14px;color:#64748b;line-height:1.6;">
              The week's most important stories in AI, Finance, and Technology — curated for India's ambitious professionals.
            </p>
          </td>
        </tr>

        <!-- Articles -->
        <tr>
          <td style="padding:28px 32px 8px;">
            <p style="margin:0 0 20px;font-size:11px;font-weight:700;color:#475569;
              text-transform:uppercase;letter-spacing:0.08em;">Top Stories This Week</p>
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              ${articleRows}
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:8px 32px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center" style="background:#1e1e2d;border-radius:12px;padding:20px;">
                  <p style="margin:0 0 12px;font-size:14px;color:#94a3b8;">
                    Read more on TechPulseGlobe
                  </p>
                  <a href="${siteUrl}" style="display:inline-block;background:#60a5fa;color:#ffffff;
                    font-size:14px;font-weight:600;padding:10px 28px;border-radius:8px;
                    text-decoration:none;">Visit TechPulseGlobe →</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #1e1e2d;text-align:center;">
            <p style="margin:0;font-size:11px;color:#334155;line-height:1.8;">
              You're receiving this because you subscribed at techpulseglobe.com<br />
              <a href="${siteUrl}" style="color:#475569;text-decoration:none;">TechPulseGlobe</a>
              &nbsp;·&nbsp;
              <a href="${siteUrl}/privacy" style="color:#475569;text-decoration:none;">Privacy Policy</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ── POST /api/admin/newsletter/send-digest ────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const smtpHost = process.env.SMTP_HOST
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS

  if (!smtpHost || !smtpUser || !smtpPass) {
    return NextResponse.json({ error: 'SMTP not configured' }, { status: 503 })
  }

  await dbConnect()

  // ── Fetch top 7 articles from last 7 days ────────────────────────────
  const since = new Date()
  since.setDate(since.getDate() - 7)

  const articles = await ArticleModel.find({
    status:      'published',
    publishedAt: { $gte: since },
  })
    .populate('category', 'name slug color')
    .select('title slug excerpt featuredImage category publishedAt views readingTime')
    .sort({ views: -1, publishedAt: -1 })
    .limit(7)
    .lean()

  if (articles.length === 0) {
    return NextResponse.json({ error: 'No articles published in the last 7 days' }, { status: 400 })
  }

  // ── Get all active subscribers ────────────────────────────────────────
  const subscribers = await NewsletterModel.find({ status: 'active' })
    .select('email')
    .lean()

  if (subscribers.length === 0) {
    return NextResponse.json({ error: 'No active subscribers' }, { status: 400 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_URL || 'https://techpulseglobe.com'
  const html    = buildEmail(articles, siteUrl)

  // ── Send emails ───────────────────────────────────────────────────────
  const transporter = nodemailer.createTransport({
    host:   smtpHost,
    port:   Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth:   { user: smtpUser, pass: smtpPass },
  })

  let sent = 0, failed = 0
  const dateLabel = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  for (const sub of subscribers) {
    try {
      await transporter.sendMail({
        from:    `"TechPulseGlobe" <${smtpUser}>`,
        to:      sub.email,
        subject: `📰 Your Weekly Digest — ${dateLabel} | TechPulseGlobe`,
        html,
      })
      sent++
    } catch {
      failed++
    }
  }

  return NextResponse.json({
    success: true,
    sent,
    failed,
    total:    subscribers.length,
    articles: articles.length,
  })
}
