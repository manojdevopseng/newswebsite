export interface Category {
  slug: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  gradient: string;
}

export const categories: Category[] = [
  {
    slug: "ai",
    name: "Artificial Intelligence",
    description: "Latest AI research, models, tools, and industry developments.",
    color: "#60a5fa",
    icon: "Brain",
    gradient: "from-blue-500/20 to-blue-600/5",
  },
  {
    slug: "finance",
    name: "Finance & Markets",
    description: "Market insights, mutual funds, SIP, and financial analysis.",
    color: "#34d399",
    icon: "TrendingUp",
    gradient: "from-emerald-500/20 to-emerald-600/5",
  },
  {
    slug: "technology",
    name: "Technology",
    description: "Software, hardware, developer tools, and emerging tech.",
    color: "#a78bfa",
    icon: "Cpu",
    gradient: "from-violet-500/20 to-violet-600/5",
  },
  {
    slug: "startups",
    name: "Startups",
    description: "Funding rounds, founders, and startup ecosystem news.",
    color: "#f97316",
    icon: "Rocket",
    gradient: "from-orange-500/20 to-orange-600/5",
  },
  {
    slug: "automation",
    name: "Automation",
    description: "AI automation, workflows, RPA, and productivity tools.",
    color: "#22d3ee",
    icon: "Zap",
    gradient: "from-cyan-500/20 to-cyan-600/5",
  },
  {
    slug: "geopolitics",
    name: "Geopolitics",
    description: "World politics, international relations, conflicts, and global affairs.",
    color: "#ef4444",
    icon: "Globe",
    gradient: "from-red-500/20 to-red-600/5",
  },
  {
    slug: "cloud-aws",
    name: "Cloud & AWS",
    description: "Cloud infrastructure, AWS services, DevOps, and SRE.",
    color: "#fb923c",
    icon: "Cloud",
    gradient: "from-amber-500/20 to-amber-600/5",
  },
  {
    slug: "investing",
    name: "Investing",
    description: "Investment strategies, stock analysis, and wealth building.",
    color: "#4ade80",
    icon: "BarChart3",
    gradient: "from-green-500/20 to-green-600/5",
  },
  {
    slug: "wealth",
    name: "Wealth",
    description: "Wealth building habits, personal finance strategies, and financial independence for Indian professionals.",
    color: "#f59e0b",
    icon: "Coins",
    gradient: "from-amber-500/20 to-yellow-600/5",
  },
  {
    slug: "crypto",
    name: "Crypto & Web3",
    description: "Cryptocurrency, blockchain, DeFi, and Web3 innovations.",
    color: "#f59e0b",
    icon: "Bitcoin",
    gradient: "from-yellow-500/20 to-yellow-600/5",
  },
  {
    slug: "sports",
    name: "Sports",
    description: "Cricket, IPL, football, and major sporting events coverage.",
    color: "#22c55e",
    icon: "Trophy",
    gradient: "from-green-500/20 to-green-600/5",
  },
  {
    slug: "entertainment",
    name: "Entertainment",
    description: "Movies, music, celebrity news, biopics, and pop culture.",
    color: "#ec4899",
    icon: "Clapperboard",
    gradient: "from-pink-500/20 to-pink-600/5",
  },
];

export const categoryMap = new Map(categories.map((c) => [c.slug, c]));

export function getCategoryBySlug(slug: string): Category | undefined {
  return categoryMap.get(slug);
}

export function getCategoryColor(slug: string): string {
  return categoryMap.get(slug)?.color ?? "#60a5fa";
}
