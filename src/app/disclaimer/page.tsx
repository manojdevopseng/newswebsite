import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Disclaimer | TechPulseGlobe",
  description: "TechPulseGlobe Disclaimer — important disclosures about financial content, affiliate links, and editorial independence.",
  alternates: { canonical: `${siteConfig.url}/disclaimer` },
  openGraph: {
    title:       "Disclaimer | TechPulseGlobe",
    description: "Important disclosures about financial content, affiliate links, and editorial independence.",
    url:         `${siteConfig.url}/disclaimer`,
    siteName:    siteConfig.name,
    type:        "website",
    images:      [{ url: `${siteConfig.url}${siteConfig.ogImage}`, width: 1200, height: 630, alt: "TechPulseGlobe Disclaimer" }],
  },
};

const LAST_UPDATED = "June 3, 2026";

export default function DisclaimerPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-fg mb-10">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <span className="text-foreground">Disclaimer</span>
      </nav>

      {/* Important notice banner */}
      <div className="flex items-start gap-4 p-5 rounded-xl bg-amber-500/8 border border-amber-500/20 mb-10">
        <AlertTriangle size={20} className="text-amber-400 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-200/80 leading-relaxed">
          <strong className="text-amber-300">Important:</strong> TechPulseGlobe publishes content
          for informational and educational purposes only. Nothing on this website constitutes
          financial, investment, legal, or tax advice. Always consult a qualified professional
          before making investment decisions.
        </p>
      </div>

      <h1 className="text-4xl font-bold tracking-tight mb-3">Disclaimer</h1>
      <p className="text-sm text-muted-fg mb-10">Last updated: {LAST_UPDATED}</p>

      <div className="prose dark:prose-invert prose-base max-w-none
        prose-headings:font-bold prose-headings:tracking-tight
        prose-a:text-accent prose-a:no-underline hover:prose-a:underline
        prose-li:text-muted-fg prose-p:text-muted-fg
        prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4
        prose-h3:text-base prose-h3:mt-6 prose-h3:mb-3">

        <h2>1. Not Financial or Investment Advice</h2>
        <p>
          The content published on TechPulseGlobe — including but not limited to articles,
          analysis, opinion pieces, newsletters, and data summaries — is provided for
          <strong> general informational and educational purposes only</strong>. It does not
          constitute, and should not be construed as, financial advice, investment advice,
          trading advice, tax advice, or legal advice of any kind.
        </p>
        <p>
          TechPulseGlobe is not a SEBI-registered investment advisor, stockbroker, financial
          planner, or portfolio manager. Nothing on this website should be relied upon as the
          basis for any investment or financial decision.
        </p>
        <p>
          <strong>Before making any investment decisions</strong>, you should consult a
          SEBI-registered investment advisor or other qualified financial professional who can
          assess your individual financial situation, risk tolerance, and objectives.
        </p>

        <h2>2. No Guarantee of Accuracy</h2>
        <p>
          While we make every effort to ensure the accuracy and timeliness of information
          published on this Site, TechPulseGlobe makes no representations or warranties —
          express or implied — regarding the completeness, accuracy, reliability, or
          suitability of any information for any purpose.
        </p>
        <p>
          Financial markets and AI/technology landscapes change rapidly. Information that is
          accurate at the time of publication may become outdated. We do not undertake any
          obligation to update or revise published content unless specifically stated.
        </p>

        <h2>3. Past Performance</h2>
        <p>
          Any references to historical performance of markets, stocks, mutual funds, or
          other financial instruments are for illustrative purposes only.{" "}
          <strong>Past performance is not indicative of future results.</strong> All investments
          carry risk, including the potential loss of principal.
        </p>

        <h2>4. No Endorsement of Products or Services</h2>
        <p>
          Mention of specific products, services, companies, financial instruments, or
          investment strategies in our content does not constitute an endorsement or
          recommendation by TechPulseGlobe. Such mentions are for illustrative and
          informational purposes only.
        </p>

        <h2>5. Advertising and Sponsored Content</h2>
        <p>
          TechPulseGlobe generates revenue through display advertising (Google AdSense) and may
          occasionally publish sponsored content or brand partnerships. All sponsored or
          promotional content is clearly labeled as "Sponsored," "Promoted," or "Paid
          Partnership" and is subject to our editorial standards.
        </p>
        <p>
          Our advertising relationships do not influence our editorial decisions. We maintain
          strict separation between our commercial and editorial operations.
        </p>

        <h2>6. Affiliate Links</h2>
        <p>
          Some articles on TechPulseGlobe may contain affiliate links, meaning we may receive a
          commission if you click through and make a purchase. This comes at no additional cost
          to you. Affiliate relationships do not influence our editorial coverage, ratings, or
          recommendations.
        </p>

        <h2>7. AI-Assisted Content</h2>
        <p>
          TechPulseGlobe journalists and editors may use artificial intelligence tools to
          assist with research, fact-checking, and data gathering. All articles are written,
          reviewed, and published by our editorial team. AI is used strictly as a productivity
          and research tool — our human editors are always the primary authors and final
          decision-makers on all published content.
        </p>

        <h2>8. Third-Party Sources and Links</h2>
        <p>
          Our articles frequently reference and link to third-party sources including news
          publications, research reports, government data, and company announcements. We are
          not responsible for the content, accuracy, or availability of external websites.
          Linking to a source does not constitute endorsement of that source or its views.
        </p>

        <h2>9. Risk Warning for Financial Content</h2>
        <p>
          Investing in securities, mutual funds, ETFs, cryptocurrency, or any other financial
          instrument involves substantial risk. You could lose some or all of your investment.
          Please ensure you fully understand the risks involved before investing, and consider
          your financial goals, time horizon, and risk capacity.
        </p>
        <p>
          Cryptocurrency and digital assets are highly volatile and speculative. Their value
          can fluctuate dramatically in short periods. They are not regulated in the same way
          as traditional financial instruments in India.
        </p>

        <h2>10. Limitation of Liability</h2>
        <p>
          TechPulseGlobe Media and its contributors, editors, and affiliates shall not be liable
          for any direct, indirect, incidental, consequential, or punitive losses or damages
          arising from your reliance on information published on this Site. You assume full
          responsibility for any decisions made based on content found here.
        </p>

        <h2>11. Jurisdiction</h2>
        <p>
          This Disclaimer is governed by the laws of India. By using this Site, you agree to
          submit to the jurisdiction of Indian courts for any disputes arising from your use
          of TechPulseGlobe.
        </p>

        <h2>12. Contact</h2>
        <p>
          If you have questions about this Disclaimer or our editorial policies, please contact us:
        </p>
        <ul>
          <li><strong>Email:</strong> <a href="mailto:legal@techpulseglobe.com">legal@techpulseglobe.com</a></li>
          <li><strong>Contact Form:</strong> <Link href="/contact">techpulseglobe.com/contact</Link></li>
        </ul>
      </div>
    </div>
  );
}
