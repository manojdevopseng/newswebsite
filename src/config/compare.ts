export interface CompareEntry {
  tool1: { name: string; slug: string; description: string; website: string };
  tool2: { name: string; slug: string; description: string; website: string };
  summary: string;
  tags: string[];
}

/** Slug format: "tool1-vs-tool2" — must match the URL */
export const COMPARE_PAIRS: Record<string, CompareEntry> = {
  "chatgpt-vs-claude": {
    tool1: {
      name:        "ChatGPT",
      slug:        "chatgpt",
      description: "OpenAI's flagship conversational AI, powered by GPT-4o. Best known for general-purpose tasks, coding, and creative writing.",
      website:     "https://chat.openai.com",
    },
    tool2: {
      name:        "Claude",
      slug:        "claude",
      description: "Anthropic's AI assistant, known for long context windows, nuanced reasoning, and safety-focused design.",
      website:     "https://claude.ai",
    },
    summary:
      "ChatGPT vs Claude is the most searched AI comparison in 2025. ChatGPT excels at plugin integrations and image generation via DALL-E, while Claude leads in handling very long documents and following nuanced instructions.",
    tags: ["AI chatbot", "LLM", "GPT-4o", "Claude 3.5", "AI assistant"],
  },

  "chatgpt-vs-gemini": {
    tool1: {
      name:        "ChatGPT",
      slug:        "chatgpt",
      description: "OpenAI's flagship conversational AI, powered by GPT-4o.",
      website:     "https://chat.openai.com",
    },
    tool2: {
      name:        "Gemini",
      slug:        "gemini",
      description: "Google's multimodal AI model, deeply integrated with Google Search, Docs, and the entire Google Workspace.",
      website:     "https://gemini.google.com",
    },
    summary:
      "ChatGPT vs Gemini: OpenAI's GPT-4o versus Google's Gemini 1.5 Pro. Gemini has an edge in real-time Google Search integration and multimodal tasks, while ChatGPT leads in third-party plugin ecosystem and coding.",
    tags: ["AI chatbot", "LLM", "GPT-4o", "Gemini 1.5", "Google AI"],
  },

  "claude-vs-gemini": {
    tool1: {
      name:        "Claude",
      slug:        "claude",
      description: "Anthropic's AI assistant with a 200K token context window and strong reasoning.",
      website:     "https://claude.ai",
    },
    tool2: {
      name:        "Gemini",
      slug:        "gemini",
      description: "Google's multimodal AI deeply integrated with Google Search and Workspace.",
      website:     "https://gemini.google.com",
    },
    summary:
      "Claude vs Gemini: Anthropic's safety-focused model versus Google's multimodal powerhouse. Claude is preferred for long document analysis and careful reasoning; Gemini for real-time web access and Google product integration.",
    tags: ["AI chatbot", "LLM", "Claude 3.5", "Gemini 1.5", "AI comparison"],
  },

  "midjourney-vs-dalle": {
    tool1: {
      name:        "Midjourney",
      slug:        "midjourney",
      description: "The leading AI image generator known for artistic, photorealistic, and cinematic outputs.",
      website:     "https://midjourney.com",
    },
    tool2: {
      name:        "DALL-E 3",
      slug:        "dalle-3",
      description: "OpenAI's image generation model integrated directly into ChatGPT Plus for prompt-to-image creation.",
      website:     "https://openai.com/dall-e-3",
    },
    summary:
      "Midjourney vs DALL-E 3: Midjourney produces stunning, highly stylized artwork via Discord, while DALL-E 3 integrates seamlessly into ChatGPT and excels at following precise textual prompts.",
    tags: ["AI image generator", "generative AI", "Midjourney", "DALL-E", "text-to-image"],
  },

  "chatgpt-vs-perplexity": {
    tool1: {
      name:        "ChatGPT",
      slug:        "chatgpt",
      description: "OpenAI's flagship conversational AI, powered by GPT-4o.",
      website:     "https://chat.openai.com",
    },
    tool2: {
      name:        "Perplexity AI",
      slug:        "perplexity",
      description: "An AI search engine that answers questions with cited, real-time web sources using RAG architecture.",
      website:     "https://perplexity.ai",
    },
    summary:
      "ChatGPT vs Perplexity AI: ChatGPT is the king of general-purpose AI conversations, while Perplexity AI is designed specifically for research — pulling live web results and citing sources for every answer.",
    tags: ["AI chatbot", "AI search", "RAG", "Perplexity", "ChatGPT"],
  },

  "stable-diffusion-vs-midjourney": {
    tool1: {
      name:        "Stable Diffusion",
      slug:        "stable-diffusion",
      description: "An open-source AI image model you can run locally or via APIs, offering maximum customization.",
      website:     "https://stability.ai",
    },
    tool2: {
      name:        "Midjourney",
      slug:        "midjourney",
      description: "The leading commercial AI image generator known for photorealistic and artistic outputs.",
      website:     "https://midjourney.com",
    },
    summary:
      "Stable Diffusion vs Midjourney: Stable Diffusion is free and open-source with unlimited customization (run locally or on cloud), while Midjourney delivers superior out-of-the-box image quality with a simple Discord interface.",
    tags: ["AI image generator", "Stable Diffusion", "Midjourney", "open source AI", "text-to-image"],
  },

  "github-copilot-vs-cursor": {
    tool1: {
      name:        "GitHub Copilot",
      slug:        "github-copilot",
      description: "Microsoft's AI coding assistant embedded in VS Code and JetBrains, powered by OpenAI Codex.",
      website:     "https://github.com/features/copilot",
    },
    tool2: {
      name:        "Cursor",
      slug:        "cursor",
      description: "An AI-first code editor built on VS Code with Claude and GPT-4 for codebase-wide context.",
      website:     "https://cursor.sh",
    },
    summary:
      "GitHub Copilot vs Cursor: Copilot is the industry standard AI pair programmer, while Cursor goes further with full codebase understanding, multi-file edits, and inline chat — making it the preferred tool for complex projects.",
    tags: ["AI coding", "GitHub Copilot", "Cursor", "code editor", "developer tools"],
  },

  "notion-ai-vs-chatgpt": {
    tool1: {
      name:        "Notion AI",
      slug:        "notion-ai",
      description: "AI built into Notion for writing, summarizing, and managing knowledge inside your workspace.",
      website:     "https://notion.so/product/ai",
    },
    tool2: {
      name:        "ChatGPT",
      slug:        "chatgpt",
      description: "OpenAI's general-purpose AI assistant for writing, coding, research, and more.",
      website:     "https://chat.openai.com",
    },
    summary:
      "Notion AI vs ChatGPT: Notion AI is purpose-built for productivity within your Notion workspace, while ChatGPT is a powerful standalone AI for any writing or research task outside of a specific app.",
    tags: ["AI writing", "productivity", "Notion AI", "ChatGPT", "knowledge management"],
  },

  // ── Global Tech Comparisons (Hybrid Approach) ────────────────────────────

  "notion-vs-obsidian": {
    tool1: {
      name:        "Notion",
      slug:        "notion",
      description: "An all-in-one workspace for notes, wikis, databases, and project management with a collaborative cloud-first approach.",
      website:     "https://notion.so",
    },
    tool2: {
      name:        "Obsidian",
      slug:        "obsidian",
      description: "A powerful local-first markdown knowledge base with a rich plugin ecosystem and a graph view for connecting ideas.",
      website:     "https://obsidian.md",
    },
    summary:
      "Notion vs Obsidian: Notion is the go-to choice for teams who need collaboration, databases, and project management in one place. Obsidian is preferred by power users who want offline-first, privacy-focused note-taking with deep linking.",
    tags: ["productivity", "note-taking", "knowledge management", "PKM"],
  },

  "vercel-vs-netlify": {
    tool1: {
      name:        "Vercel",
      slug:        "vercel",
      description: "The platform for frontend frameworks — optimized for Next.js with edge functions, analytics, and zero-config deployments.",
      website:     "https://vercel.com",
    },
    tool2: {
      name:        "Netlify",
      slug:        "netlify",
      description: "A powerful web hosting and automation platform with serverless functions, forms, and a mature CI/CD pipeline.",
      website:     "https://netlify.com",
    },
    summary:
      "Vercel vs Netlify: Both are top-tier Jamstack hosting platforms. Vercel dominates for Next.js and React projects with superior edge performance, while Netlify offers more flexibility for static sites, serverless functions, and form handling.",
    tags: ["cloud hosting", "developer tools", "Vercel", "Netlify", "deployment"],
  },

  "react-vs-vue": {
    tool1: {
      name:        "React",
      slug:        "react",
      description: "Meta's JavaScript library for building component-based UIs, powering millions of web apps and the Next.js ecosystem.",
      website:     "https://react.dev",
    },
    tool2: {
      name:        "Vue.js",
      slug:        "vue",
      description: "A progressive JavaScript framework for building UIs with a gentle learning curve and excellent documentation.",
      website:     "https://vuejs.org",
    },
    summary:
      "React vs Vue: React leads in job demand, ecosystem size, and enterprise adoption, while Vue.js wins on developer experience, documentation quality, and ease of learning for beginners — making both excellent choices in 2025.",
    tags: ["JavaScript", "frontend", "web development", "React", "Vue"],
  },

  "grammarly-vs-chatgpt": {
    tool1: {
      name:        "Grammarly",
      slug:        "grammarly",
      description: "An AI-powered writing assistant that checks grammar, spelling, style, and tone in real time across apps and browsers.",
      website:     "https://grammarly.com",
    },
    tool2: {
      name:        "ChatGPT",
      slug:        "chatgpt",
      description: "OpenAI's general-purpose AI that can write, edit, rewrite, and improve any text with simple natural language prompts.",
      website:     "https://chat.openai.com",
    },
    summary:
      "Grammarly vs ChatGPT for writing: Grammarly excels as a real-time, inline grammar and style checker that works everywhere you type. ChatGPT is a better choice for generating full drafts, rewriting paragraphs, or brainstorming ideas from scratch.",
    tags: ["AI writing", "grammar checker", "Grammarly", "ChatGPT", "productivity"],
  },

  "zoom-vs-google-meet": {
    tool1: {
      name:        "Zoom",
      slug:        "zoom",
      description: "The world's leading video conferencing platform with webinar features, AI meeting summaries, and 1000+ integrations.",
      website:     "https://zoom.us",
    },
    tool2: {
      name:        "Google Meet",
      slug:        "google-meet",
      description: "Google's video conferencing tool integrated directly with Google Calendar, Gmail, and the entire Workspace suite.",
      website:     "https://meet.google.com",
    },
    summary:
      "Zoom vs Google Meet: Zoom is the enterprise standard with advanced webinar features, breakout rooms, and broad integrations. Google Meet wins for teams already on Google Workspace — it's free, seamless, and requires no downloads.",
    tags: ["video conferencing", "productivity", "remote work", "Zoom", "Google Meet"],
  },

  "canva-vs-adobe-firefly": {
    tool1: {
      name:        "Canva",
      slug:        "canva",
      description: "A beginner-friendly graphic design platform with AI-powered tools for creating social media, presentations, and marketing assets.",
      website:     "https://canva.com",
    },
    tool2: {
      name:        "Adobe Firefly",
      slug:        "adobe-firefly",
      description: "Adobe's generative AI image creation suite, built for commercial use with copyright-safe training data and Creative Cloud integration.",
      website:     "https://firefly.adobe.com",
    },
    summary:
      "Canva vs Adobe Firefly: Canva is the top choice for non-designers who need fast, polished results with templates and drag-and-drop tools. Adobe Firefly is built for professionals who need commercially safe AI-generated images inside the Creative Cloud ecosystem.",
    tags: ["AI image generator", "graphic design", "Canva", "Adobe Firefly", "creative tools"],
  },

  "shopify-vs-woocommerce": {
    tool1: {
      name:        "Shopify",
      slug:        "shopify",
      description: "A fully hosted e-commerce platform with built-in payments, AI product descriptions, and a massive app marketplace.",
      website:     "https://shopify.com",
    },
    tool2: {
      name:        "WooCommerce",
      slug:        "woocommerce",
      description: "An open-source e-commerce plugin for WordPress, offering unlimited customization with full control over hosting and data.",
      website:     "https://woocommerce.com",
    },
    summary:
      "Shopify vs WooCommerce: Shopify is the easiest way to launch an online store with zero technical setup and built-in everything. WooCommerce is ideal for developers and WordPress users who need full customization, lower transaction fees, and complete data ownership.",
    tags: ["e-commerce", "online store", "Shopify", "WooCommerce", "WordPress"],
  },

  "aws-vs-google-cloud": {
    tool1: {
      name:        "Amazon Web Services",
      slug:        "aws",
      description: "The world's largest cloud platform with 200+ services covering compute, storage, AI/ML, databases, and everything in between.",
      website:     "https://aws.amazon.com",
    },
    tool2: {
      name:        "Google Cloud Platform",
      slug:        "google-cloud",
      description: "Google's cloud computing suite with standout AI/ML services, BigQuery for analytics, and Kubernetes leadership.",
      website:     "https://cloud.google.com",
    },
    summary:
      "AWS vs Google Cloud: AWS leads in market share, service breadth, and enterprise trust. Google Cloud excels in AI/ML capabilities (Vertex AI, TPUs), data analytics (BigQuery), and Kubernetes tooling — making it the top pick for AI-first startups.",
    tags: ["cloud computing", "AWS", "Google Cloud", "cloud hosting", "infrastructure"],
  },
};

export function getComparePair(slug: string): CompareEntry | null {
  return COMPARE_PAIRS[slug] ?? null;
}

export function getAllCompareSlugs(): string[] {
  return Object.keys(COMPARE_PAIRS);
}
