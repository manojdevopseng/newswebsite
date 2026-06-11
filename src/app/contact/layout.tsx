import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | TechPulseGlobe",
  description:
    "Get in touch with the TechPulseGlobe team — editorial tips, advertising enquiries, legal requests, and general questions.",
  alternates: { canonical: "https://techpulseglobe.com/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

