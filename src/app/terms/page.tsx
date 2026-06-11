import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of Service | TechPulseGlobe",
  description: "TechPulseGlobe Terms of Service — the rules and guidelines for using our platform.",
  alternates: { canonical: `${siteConfig.url}/terms` },
  openGraph: {
    title:       "Terms of Service | TechPulseGlobe",
    description: "The rules and guidelines for using TechPulseGlobe platform.",
    url:         `${siteConfig.url}/terms`,
    siteName:    siteConfig.name,
    type:        "website",
    images:      [{ url: `${siteConfig.url}${siteConfig.ogImage}`, width: 1200, height: 630, alt: "TechPulseGlobe Terms of Service" }],
  },
};

const LAST_UPDATED = "June 3, 2026";

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-fg mb-10">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <span className="text-foreground">Terms of Service</span>
      </nav>

      <h1 className="text-4xl font-bold tracking-tight mb-3">Terms of Service</h1>
      <p className="text-sm text-muted-fg mb-10">Last updated: {LAST_UPDATED}</p>

      <div className="prose dark:prose-invert prose-base max-w-none
        prose-headings:font-bold prose-headings:tracking-tight
        prose-a:text-accent prose-a:no-underline hover:prose-a:underline
        prose-li:text-muted-fg prose-p:text-muted-fg
        prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4
        prose-h3:text-base prose-h3:mt-6 prose-h3:mb-3">

        <p>
          Please read these Terms of Service (&ldquo;Terms&rdquo;) carefully before using the TechPulseGlobe
          website located at <a href="https://techpulseglobe.com">techpulseglobe.com</a> (the &ldquo;Site&rdquo;),
          operated by <strong>TechPulseGlobe Media</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;). By accessing
          or using the Site, you agree to be bound by these Terms. If you do not agree to these
          Terms, please do not use the Site.
        </p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using TechPulseGlobe, you confirm that you are at least 13 years of
          age, have read and understood these Terms, and agree to comply with them and all
          applicable laws and regulations.
        </p>

        <h2>2. Changes to Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. We will indicate the date of
          the most recent revision at the top of this page. Your continued use of the Site
          after any changes constitutes acceptance of the revised Terms.
        </p>

        <h2>3. Use of the Site</h2>

        <h3>3.1 Permitted Use</h3>
        <p>You may use the Site for lawful, personal, and non-commercial purposes, including:</p>
        <ul>
          <li>Reading and sharing our articles</li>
          <li>Subscribing to our newsletter</li>
          <li>Using our search and navigation features</li>
        </ul>

        <h3>3.2 Prohibited Use</h3>
        <p>You agree not to:</p>
        <ul>
          <li>Copy, reproduce, republish, or redistribute our content without explicit written permission</li>
          <li>Use automated tools (bots, scrapers, crawlers) to extract data from the Site without permission</li>
          <li>Attempt to gain unauthorized access to any part of the Site or its systems</li>
          <li>Use the Site for any unlawful purpose or in violation of any applicable regulation</li>
          <li>Transmit any harmful, offensive, or disruptive content</li>
          <li>Interfere with the proper functioning of the Site</li>
          <li>Impersonate TechPulseGlobe, our team, or any other person or entity</li>
        </ul>

        <h2>4. Intellectual Property</h2>
        <p>
          All content published on TechPulseGlobe &mdash; including articles, images, graphics, logos,
          and design elements &mdash; is the intellectual property of TechPulseGlobe Media or its
          content partners and is protected under applicable copyright, trademark, and
          intellectual property laws.
        </p>
        <p>
          You may share links to our articles and quote brief excerpts (up to 50 words) with
          proper attribution and a link back to the original article. Any other use requires
          prior written consent from us.
        </p>

        <h2>5. User-Submitted Content</h2>
        <p>
          If you submit content to us (via contact forms, newsletter responses, or other
          channels), you grant us a non-exclusive, royalty-free, perpetual license to use,
          reproduce, and publish that content in connection with the Site. You represent that
          you have the right to grant this license.
        </p>

        <h2>6. Disclaimer of Warranties</h2>
        <p>
          The Site and all content are provided on an <strong>&ldquo;as is&rdquo; and &ldquo;as available&rdquo;</strong>{" "}
          basis without warranties of any kind, either express or implied. We do not warrant
          that the Site will be uninterrupted, error-free, or free of viruses or other harmful
          components. We make no warranty regarding the accuracy, reliability, or completeness
          of any content on the Site.
        </p>

        <h2>7. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by applicable law, TechPulseGlobe Media shall not be
          liable for any indirect, incidental, special, consequential, or punitive damages
          arising out of your use of or inability to use the Site or its content &mdash; including
          but not limited to financial losses, loss of data, or loss of business &mdash; even if we
          have been advised of the possibility of such damages.
        </p>

        <h2>8. Financial Content Disclaimer</h2>
        <p>
          TechPulseGlobe publishes content related to finance, investing, and markets for
          <strong> informational and educational purposes only</strong>. Nothing on this Site
          constitutes financial, investment, tax, or legal advice. Please read our full{" "}
          <Link href="/disclaimer">Disclaimer</Link> before acting on any financial information
          published on this Site.
        </p>

        <h2>9. Third-Party Links and Advertising</h2>
        <p>
          The Site may contain links to third-party websites and display advertisements from
          third-party networks including Google AdSense. We are not responsible for the content,
          accuracy, or practices of third-party sites. Links do not imply endorsement.
        </p>

        <h2>10. Privacy</h2>
        <p>
          Your use of the Site is also governed by our{" "}
          <Link href="/privacy">Privacy Policy</Link>, which is incorporated into these Terms
          by reference.
        </p>

        <h2>11. Newsletter</h2>
        <p>
          By subscribing to our newsletter, you consent to receive periodic emails from us.
          You may unsubscribe at any time by clicking the &ldquo;Unsubscribe&rdquo; link in any newsletter
          email. We will not share your email address with third parties for marketing purposes.
        </p>

        <h2>12. DMCA / Copyright Infringement</h2>
        <p>
          If you believe that content on the Site infringes your copyright, please send a
          written notice to <a href="mailto:legal@techpulseglobe.com">legal@techpulseglobe.com</a>{" "}
          including: identification of the copyrighted work, identification of the infringing
          material and its URL, your contact information, a statement of good faith belief, and
          your signature. We will respond promptly and remove infringing content where
          appropriate.
        </p>

        <h2>13. Governing Law</h2>
        <p>
          These Terms are governed by and construed in accordance with the laws of India.
          Any disputes arising under these Terms shall be subject to the exclusive jurisdiction
          of the courts of India.
        </p>

        <h2>14. Contact</h2>
        <p>
          For questions about these Terms, please contact us at:
        </p>
        <ul>
          <li><strong>Email:</strong> <a href="mailto:legal@techpulseglobe.com">legal@techpulseglobe.com</a></li>
          <li><strong>Website:</strong> <a href="https://techpulseglobe.com/contact">techpulseglobe.com/contact</a></li>
        </ul>
      </div>
    </div>
  );
}
