export interface NavItem {
  label: string;
  href: string;
  highlight?: boolean;
}

export const mainNav: NavItem[] = [
  { label: "AI", href: "/ai" },
  { label: "Finance", href: "/finance" },
  { label: "Technology", href: "/technology" },
  { label: "Startups", href: "/startups" },
  { label: "Geopolitics", href: "/geopolitics" },
  { label: "Wealth", href: "/wealth" },
  { label: "Crypto", href: "/crypto" },
  { label: "AI Tools", href: "/ai-tools", highlight: true },
];

export const footerNav = {
  categories: [
    { label: "AI", href: "/ai" },
    { label: "Finance", href: "/finance" },
    { label: "Technology", href: "/technology" },
    { label: "Startups", href: "/startups" },
    { label: "Crypto & Web3", href: "/crypto" },
    { label: "Cloud & AWS", href: "/cloud-aws" },
  ],
  tools: [
    { label: "AI Tools Directory", href: "/ai-tools" },
    { label: "AI Comparisons", href: "/compare" },
    { label: "Finance Glossary", href: "/glossary" },
  ],
  company: [
    { label: "About Us",        href: "/about" },
    { label: "Contact Us",      href: "/contact" },
    { label: "Newsletter",      href: "/newsletter" },
    { label: "Privacy Policy",  href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Disclaimer",      href: "/disclaimer" },
  ],
};
