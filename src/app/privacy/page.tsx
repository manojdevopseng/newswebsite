import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy | TechPulseGlobe",
  description: "TechPulseGlobe Privacy Policy — how we collect, use, and protect your personal data.",
  alternates: { canonical: `${siteConfig.url}/privacy` },
  openGraph: {
    title:    "Privacy Policy | TechPulseGlobe",
    description: "How TechPulseGlobe collects, uses, and protects your personal data.",
    url:      `${siteConfig.url}/privacy`,
    siteName: siteConfig.name,
    type:     "website",
    images:   [{ url: `${siteConfig.url}${siteConfig.ogImage}`, width: 1200, height: 630, alt: "TechPulseGlobe Privacy Policy" }],
  },
};

const LAST_UPDATED = "June 3, 2026";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-fg mb-10">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <span className="text-foreground">Privacy Policy</span>
      </nav>

      <h1 className="text-4xl font-bold tracking-tight mb-3">Privacy Policy</h1>
      <p className="text-sm text-muted-fg mb-10">Last updated: {LAST_UPDATED}</p>

      <div className="prose dark:prose-invert prose-base max-w-none
        prose-headings:font-bold prose-headings:tracking-tight
        prose-a:text-accent prose-a:no-underline hover:prose-a:underline
        prose-li:text-muted-fg prose-p:text-muted-fg
        prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4
        prose-h3:text-base prose-h3:mt-6 prose-h3:mb-3">

        <p>
          Welcome to <strong>TechPulseGlobe</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). We operate the website
          located at <a href="https://techpulseglobe.com">techpulseglobe.com</a> (the &ldquo;Site&rdquo;). This
          Privacy Policy explains how we collect, use, disclose, and protect your information
          when you visit our Site. Please read it carefully.
        </p>

        <h2>1. Information We Collect</h2>

        <h3>1.1 Information You Provide Voluntarily</h3>
        <p>We may collect personal information that you voluntarily provide when you:</p>
        <ul>
          <li>Subscribe to our newsletter (email address, name)</li>
          <li>Submit a contact form (name, email, message)</li>
          <li>Leave comments or engage with interactive features</li>
        </ul>

        <h3>1.2 Information Collected Automatically</h3>
        <p>
          When you visit our Site, we automatically collect certain information about your
          device and usage, including:
        </p>
        <ul>
          <li>IP address and approximate location (country/city level)</li>
          <li>Browser type, version, and operating system</li>
          <li>Pages visited, time spent, and referring URLs</li>
          <li>Device type (desktop, mobile, tablet)</li>
          <li>Cookies and similar tracking technologies</li>
        </ul>

        <h2>2. Cookies and Tracking Technologies</h2>
        <p>
          We use cookies and similar technologies to enhance your experience, analyze traffic,
          and serve relevant advertisements. The types of cookies we use include:
        </p>
        <ul>
          <li><strong>Essential Cookies:</strong> Required for the Site to function properly (session management, theme preference).</li>
          <li><strong>Analytics Cookies:</strong> Used by Google Analytics to understand how visitors interact with the Site (pages viewed, session duration, traffic source). This data is aggregated and anonymized.</li>
          <li><strong>Advertising Cookies:</strong> Used by Google AdSense to serve personalized or contextual advertisements based on your browsing activity.</li>
        </ul>
        <p>
          You may control or disable cookies through your browser settings. Note that disabling
          cookies may affect the functionality of certain parts of our Site.
        </p>

        <h2>3. Google AdSense and Advertising</h2>
        <p>
          We use <strong>Google AdSense</strong> to display advertisements on our Site. Google
          AdSense uses cookies to serve ads based on a user&apos;s prior visits to our Site and
          other sites on the Internet. Google&apos;s use of advertising cookies enables it and its
          partners to serve ads based on your visit to our Site and/or other sites.
        </p>
        <p>
          You may opt out of personalized advertising by visiting{" "}
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
            Google Ads Settings
          </a>{" "}
          or by visiting{" "}
          <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer">
            aboutads.info
          </a>.
        </p>
        <p>
          For more information on how Google uses data from sites that use its advertising
          services, visit:{" "}
          <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">
            How Google uses information from sites or apps that use our services
          </a>.
        </p>

        <h2>4. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Deliver and improve the content and features of the Site</li>
          <li>Send newsletter emails (only if you have subscribed)</li>
          <li>Respond to enquiries submitted via the contact form</li>
          <li>Analyze traffic and usage patterns to improve user experience</li>
          <li>Display relevant advertisements via Google AdSense</li>
          <li>Comply with legal obligations</li>
          <li>Protect the security and integrity of our Site</li>
        </ul>

        <h2>5. How We Share Your Information</h2>
        <p>
          We do <strong>not</strong> sell, rent, or trade your personal information to third
          parties. We may share your information in the following limited circumstances:
        </p>
        <ul>
          <li><strong>Service Providers:</strong> Third-party vendors who assist us in operating the Site (e.g., email service providers, analytics). They are bound by confidentiality obligations.</li>
          <li><strong>Advertising Partners:</strong> Google AdSense, as described in Section 3 above.</li>
          <li><strong>Legal Requirements:</strong> If required by law, court order, or governmental authority.</li>
          <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets.</li>
        </ul>

        <h2>6. Third-Party Links</h2>
        <p>
          Our Site may contain links to third-party websites. We are not responsible for the
          privacy practices or content of those websites. We encourage you to review the privacy
          policies of any third-party sites you visit.
        </p>

        <h2>7. Data Retention</h2>
        <p>
          We retain personal data only for as long as necessary to fulfill the purposes
          described in this Policy, or as required by law. Newsletter subscriber data is
          retained until you unsubscribe. Contact form data is retained for up to 12 months.
        </p>

        <h2>8. Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to protect your
          information against unauthorized access, alteration, disclosure, or destruction.
          However, no method of transmission over the Internet is 100% secure.
        </p>

        <h2>9. Children&apos;s Privacy</h2>
        <p>
          Our Site is not directed to individuals under the age of 13. We do not knowingly
          collect personal information from children under 13. If we become aware that we have
          collected such information, we will delete it promptly.
        </p>

        <h2>10. Your Rights</h2>
        <p>Depending on your location, you may have the right to:</p>
        <ul>
          <li>Access the personal data we hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your personal data</li>
          <li>Opt out of marketing communications at any time</li>
          <li>Lodge a complaint with a supervisory authority</li>
        </ul>
        <p>
          To exercise any of these rights, please contact us at{" "}
          <a href="mailto:legal@techpulseglobe.com">legal@techpulseglobe.com</a>.
        </p>

        <h2>11. Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of material
          changes by updating the &ldquo;Last updated&rdquo; date at the top of this page. Continued use
          of the Site after changes constitutes acceptance of the revised Policy.
        </p>

        <h2>12. Contact Us</h2>
        <p>
          If you have any questions or concerns about this Privacy Policy, please contact us:
        </p>
        <ul>
          <li><strong>Email:</strong> <a href="mailto:legal@techpulseglobe.com">legal@techpulseglobe.com</a></li>
          <li><strong>Website:</strong> <a href="https://techpulseglobe.com/contact">techpulseglobe.com/contact</a></li>
          <li><strong>Publisher:</strong> TechPulseGlobe Media, India</li>
        </ul>
      </div>
    </div>
  );
}
