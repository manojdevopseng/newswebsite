export interface GlossaryEntry {
  title:        string;
  definition:   string;
  example:      string;
  relatedTerms: string[];
  category:     "AI" | "Finance" | "Investing" | "Technology" | "Crypto";
}

export const GLOSSARY: Record<string, GlossaryEntry> = {

  // ── AI ────────────────────────────────────────────────────────────────────
  "large-language-model": {
    category: "AI",
    title: "Large Language Model (LLM)",
    definition: "A Large Language Model (LLM) is a type of AI model trained on massive amounts of text data to understand and generate human-like text. LLMs like GPT-4, Claude, and Gemini use transformer architecture and billions of parameters to process and generate language. They power chatbots, coding assistants, and content generation tools.",
    example: "ChatGPT, powered by GPT-4o, is an LLM used by over 100 million people to answer questions, write code, and generate content.",
    relatedTerms: ["generative-ai", "transformer", "neural-network", "prompt-engineering"],
  },
  "generative-ai": {
    category: "AI",
    title: "Generative AI",
    definition: "Generative AI refers to artificial intelligence systems that can create new content — text, images, audio, video, or code — based on patterns learned from training data. These models use techniques like transformers, GANs (Generative Adversarial Networks), and diffusion models to generate original outputs.",
    example: "Midjourney generates photorealistic images from text prompts, while ChatGPT generates human-like text responses.",
    relatedTerms: ["large-language-model", "diffusion-model", "neural-network"],
  },
  "transformer": {
    category: "AI",
    title: "Transformer (AI Architecture)",
    definition: "The Transformer is a deep learning architecture introduced by Google in 2017 that revolutionized natural language processing. It uses a self-attention mechanism to process input sequences in parallel rather than sequentially, making it far more efficient and powerful than previous RNN-based models. GPT, BERT, and most modern LLMs are transformer-based.",
    example: "GPT-4 is built on the transformer architecture, allowing it to process entire documents and generate coherent, contextually aware responses.",
    relatedTerms: ["large-language-model", "neural-network", "generative-ai"],
  },
  "neural-network": {
    category: "AI",
    title: "Neural Network",
    definition: "A neural network is a machine learning model inspired by the human brain, consisting of layers of interconnected nodes (neurons) that process information. Deep neural networks with many hidden layers form the foundation of modern AI, including image recognition, speech processing, and language generation.",
    example: "Google's image search uses convolutional neural networks (CNNs) to identify objects in billions of photos.",
    relatedTerms: ["large-language-model", "transformer", "generative-ai"],
  },
  "prompt-engineering": {
    category: "AI",
    title: "Prompt Engineering",
    definition: "Prompt engineering is the practice of designing and optimizing text inputs (prompts) given to AI language models to elicit better, more accurate, or more useful outputs. It involves techniques like chain-of-thought prompting, few-shot examples, role assignment, and structured instructions to guide model behavior.",
    example: "Adding 'Think step by step' to a math problem prompt significantly improves GPT-4's accuracy on complex calculations.",
    relatedTerms: ["large-language-model", "generative-ai", "rag"],
  },
  "rag": {
    category: "AI",
    title: "Retrieval-Augmented Generation (RAG)",
    definition: "Retrieval-Augmented Generation (RAG) is a technique that enhances AI language model responses by first retrieving relevant information from external sources (databases, documents, or the web), then passing that context to the model to generate a more accurate and up-to-date answer. RAG solves the problem of LLM knowledge cutoffs.",
    example: "Perplexity AI uses RAG to search the internet in real-time before answering questions, ensuring responses include current information.",
    relatedTerms: ["large-language-model", "prompt-engineering", "vector-database"],
  },
  "vector-database": {
    category: "AI",
    title: "Vector Database",
    definition: "A vector database stores data as high-dimensional numerical vectors (embeddings) and enables ultra-fast similarity searches. They are essential infrastructure for AI applications like RAG, semantic search, and recommendation systems, allowing models to quickly find contextually similar information from large datasets.",
    example: "Pinecone and Weaviate are vector databases used to store millions of document embeddings for AI-powered semantic search applications.",
    relatedTerms: ["rag", "large-language-model", "generative-ai"],
  },
  "diffusion-model": {
    category: "AI",
    title: "Diffusion Model",
    definition: "A diffusion model is a class of generative AI model that learns to create data (typically images) by reversing a gradual noising process. Starting from pure noise, the model progressively removes noise to reveal a coherent output. Stable Diffusion, DALL-E 3, and Midjourney use diffusion techniques.",
    example: "Adobe Firefly uses diffusion models to generate marketing images and artwork directly within Adobe Photoshop.",
    relatedTerms: ["generative-ai", "neural-network"],
  },
  "agi": {
    category: "AI",
    title: "Artificial General Intelligence (AGI)",
    definition: "Artificial General Intelligence (AGI) refers to a hypothetical AI system that can perform any intellectual task that a human can — reasoning, learning, creativity, and social understanding — at human level or beyond. Current AI systems are 'narrow AI' (task-specific). AGI remains a research goal, not yet achieved.",
    example: "OpenAI's stated mission is to build AGI that benefits all of humanity, though timelines are debated with estimates ranging from 5 to 50+ years.",
    relatedTerms: ["large-language-model", "neural-network", "generative-ai"],
  },
  "fine-tuning": {
    category: "AI",
    title: "Fine-Tuning",
    definition: "Fine-tuning is the process of taking a pre-trained AI model and training it further on a smaller, domain-specific dataset to adapt its behavior for a particular task. Instead of training from scratch, fine-tuning is faster and requires less data while producing highly specialized outputs.",
    example: "A hospital fine-tunes GPT-4 on medical literature to create a clinical assistant that accurately answers healthcare questions.",
    relatedTerms: ["large-language-model", "neural-network", "prompt-engineering"],
  },
  "hallucination": {
    category: "AI",
    title: "AI Hallucination",
    definition: "AI hallucination refers to when a large language model generates information that sounds confident and plausible but is factually incorrect or entirely fabricated. This happens because LLMs predict statistically likely text rather than verifying facts. It is one of the biggest challenges in deploying AI reliably.",
    example: "A lawyer used ChatGPT to research cases and submitted a brief citing six court cases — all of which were hallucinated and did not exist.",
    relatedTerms: ["large-language-model", "rag", "prompt-engineering"],
  },
  "context-window": {
    category: "AI",
    title: "Context Window",
    definition: "A context window is the maximum amount of text (measured in tokens) that an AI language model can process at one time — both the input prompt and the generated output combined. Larger context windows allow models to handle longer documents, conversations, and codebases without losing earlier information.",
    example: "Claude 3.5 has a 200,000-token context window, allowing it to read and analyze an entire book or large codebase in a single prompt.",
    relatedTerms: ["large-language-model", "transformer", "prompt-engineering"],
  },
  "embeddings": {
    category: "AI",
    title: "Embeddings",
    definition: "Embeddings are numerical representations of text, images, or other data as vectors in a high-dimensional space. Similar concepts are placed close together in this space. AI models use embeddings to understand meaning and relationships between words, sentences, and documents — powering search, recommendations, and RAG systems.",
    example: "OpenAI's text-embedding-ada-002 model converts sentences into 1,536-dimensional vectors, enabling semantic search across millions of documents.",
    relatedTerms: ["vector-database", "rag", "neural-network"],
  },
  "rlhf": {
    category: "AI",
    title: "Reinforcement Learning from Human Feedback (RLHF)",
    definition: "RLHF is a training technique used to align AI language models with human preferences. Human evaluators rank multiple model outputs, and this feedback is used to train a reward model. The LLM is then fine-tuned using reinforcement learning to maximize this reward — making outputs more helpful, harmless, and honest.",
    example: "OpenAI used RLHF to train ChatGPT to follow instructions and refuse harmful requests, dramatically improving its real-world usefulness.",
    relatedTerms: ["large-language-model", "fine-tuning", "agi"],
  },
  "multimodal-ai": {
    category: "AI",
    title: "Multimodal AI",
    definition: "Multimodal AI refers to AI systems that can process and generate multiple types of data — such as text, images, audio, and video — simultaneously. Unlike text-only models, multimodal AI understands context across different formats, enabling richer, more human-like interactions.",
    example: "GPT-4o is multimodal — it can analyze a photo of a math problem and solve it, or describe what it 'sees' in an uploaded image.",
    relatedTerms: ["large-language-model", "generative-ai", "diffusion-model"],
  },

  // ── Finance ───────────────────────────────────────────────────────────────
  "sip": {
    category: "Finance",
    title: "Systematic Investment Plan (SIP)",
    definition: "A Systematic Investment Plan (SIP) is a disciplined investment approach in mutual funds where you invest a fixed amount regularly — weekly, monthly, or quarterly. SIP harnesses rupee-cost averaging, automatically buying more units when prices are low and fewer when high, reducing the impact of market volatility over time.",
    example: "Investing ₹10,000/month in a Nifty 50 index fund via SIP for 20 years, assuming 12% annual returns, grows to approximately ₹99 lakhs.",
    relatedTerms: ["mutual-fund", "rupee-cost-averaging", "nifty-50", "lump-sum"],
  },
  "mutual-fund": {
    category: "Finance",
    title: "Mutual Fund",
    definition: "A mutual fund is a professionally managed investment vehicle that pools money from multiple investors to purchase a diversified portfolio of stocks, bonds, or other securities. In India, mutual funds are regulated by SEBI and managed by AMCs (Asset Management Companies). They offer retail investors access to diversified portfolios with small investment amounts.",
    example: "HDFC Mid-Cap Opportunities Fund pools money from thousands of investors to buy shares in 50-70 mid-sized Indian companies.",
    relatedTerms: ["sip", "index-fund", "nav", "sebi"],
  },
  "rupee-cost-averaging": {
    category: "Finance",
    title: "Rupee Cost Averaging (RCA)",
    definition: "Rupee Cost Averaging is an investment strategy where you invest a fixed amount regularly regardless of market conditions. When prices fall, you automatically buy more units; when prices rise, you buy fewer. Over time, this lowers your average cost per unit compared to buying everything at one price, reducing timing risk.",
    example: "With ₹5,000/month in a fund: at ₹100 NAV you get 50 units; at ₹80 NAV you get 62.5 units. Your average cost is lower than the average price.",
    relatedTerms: ["sip", "mutual-fund", "lump-sum", "dollar-cost-averaging"],
  },
  "nav": {
    category: "Finance",
    title: "Net Asset Value (NAV)",
    definition: "Net Asset Value (NAV) is the per-unit price of a mutual fund. It is calculated by dividing the total value of all assets in the fund minus liabilities by the number of outstanding units. NAV is published daily after market close for all Indian mutual funds. When you buy or redeem mutual fund units, the transaction is processed at the applicable NAV.",
    example: "If a mutual fund has ₹100 crore in assets, ₹1 crore in liabilities, and 1 crore outstanding units, the NAV = ₹99.",
    relatedTerms: ["mutual-fund", "sip", "index-fund"],
  },
  "index-fund": {
    category: "Finance",
    title: "Index Fund",
    definition: "An index fund is a type of mutual fund or ETF that passively tracks a market index like the Nifty 50, Sensex, or Nifty Next 50. Instead of active stock picking, it holds the same stocks in the same proportion as the index. Index funds have significantly lower expense ratios than actively managed funds.",
    example: "UTI Nifty 50 Index Fund tracks all 50 stocks in the Nifty 50 index proportionally, with an expense ratio of just 0.20%.",
    relatedTerms: ["nifty-50", "mutual-fund", "etf", "sip"],
  },
  "nifty-50": {
    category: "Finance",
    title: "Nifty 50",
    definition: "The Nifty 50 is India's premier stock market index, maintained by NSE Indices Limited. It tracks the performance of 50 of the largest and most liquid Indian companies listed on the National Stock Exchange (NSE), representing about 13 sectors. It is widely used as a benchmark for Indian equity performance.",
    example: "Companies like Reliance Industries, TCS, HDFC Bank, and Infosys are among the top constituents of the Nifty 50 index.",
    relatedTerms: ["index-fund", "etf", "sebi", "sensex"],
  },
  "sensex": {
    category: "Finance",
    title: "Sensex (BSE Sensex)",
    definition: "The Sensex, or S&P BSE Sensex, is India's oldest stock market index maintained by the Bombay Stock Exchange (BSE). It tracks 30 of the largest and most actively traded companies on the BSE. Like the Nifty 50, it serves as a barometer of the Indian economy and stock market health.",
    example: "When the Sensex crossed 80,000 points in 2024, it reflected India's strong economic growth and investor confidence in the market.",
    relatedTerms: ["nifty-50", "index-fund", "etf", "sebi"],
  },
  "lump-sum": {
    category: "Investing",
    title: "Lump Sum Investment",
    definition: "A lump sum investment means deploying a large amount of money into an investment all at once, rather than spreading it over time. It maximizes market exposure from day one, which is advantageous in rising markets. However, it carries higher timing risk — if markets fall right after investing, losses are immediate and full.",
    example: "Investing a ₹5 lakh year-end bonus entirely into a Nifty 50 index fund on January 1 is a lump sum investment.",
    relatedTerms: ["sip", "rupee-cost-averaging", "mutual-fund", "dollar-cost-averaging"],
  },
  "sebi": {
    category: "Finance",
    title: "SEBI (Securities and Exchange Board of India)",
    definition: "SEBI (Securities and Exchange Board of India) is the regulatory authority for the Indian securities market, established in 1992. It regulates stock exchanges, brokers, mutual funds, and listed companies to protect investor interests, develop the securities market, and regulate its functioning.",
    example: "SEBI mandates that all mutual funds in India disclose their portfolio holdings monthly and publish daily NAVs for investor transparency.",
    relatedTerms: ["mutual-fund", "nifty-50", "etf"],
  },
  "etf": {
    category: "Finance",
    title: "Exchange Traded Fund (ETF)",
    definition: "An Exchange Traded Fund (ETF) is a type of fund that tracks an index, commodity, or basket of assets and trades on a stock exchange like an individual stock throughout the trading day. Unlike mutual funds priced once daily at NAV, ETFs can be bought and sold at real-time market prices during trading hours.",
    example: "The Nippon India ETF Nifty 50 BeES is India's oldest ETF, tradeable on NSE just like buying a share of Infosys or TCS.",
    relatedTerms: ["index-fund", "nifty-50", "mutual-fund"],
  },

  // ── Investing (Global) ────────────────────────────────────────────────────
  "dollar-cost-averaging": {
    category: "Investing",
    title: "Dollar Cost Averaging (DCA)",
    definition: "Dollar Cost Averaging (DCA) is an investment strategy where you invest a fixed amount of money at regular intervals — weekly, monthly, or quarterly — regardless of market conditions. When prices are low, you buy more shares; when prices are high, you buy fewer. Over time, DCA reduces the impact of volatility and eliminates the risk of investing everything at the wrong time.",
    example: "Investing $500 every month into an S&P 500 index fund for 10 years — regardless of whether markets are up or down — is a classic DCA strategy used by millions of investors globally.",
    relatedTerms: ["sip", "rupee-cost-averaging", "index-fund", "lump-sum"],
  },
  "compound-interest": {
    category: "Investing",
    title: "Compound Interest",
    definition: "Compound interest is interest calculated on both the initial principal and the accumulated interest from previous periods. Unlike simple interest (calculated only on principal), compound interest grows exponentially over time — making it the most powerful force in long-term wealth creation. Einstein reportedly called it the 'eighth wonder of the world'.",
    example: "Investing $1,000 at 10% annual return: after 30 years with simple interest you earn $3,000. With compound interest, you earn $17,449 — nearly 6x more.",
    relatedTerms: ["dollar-cost-averaging", "index-fund", "etf"],
  },
  "bull-market": {
    category: "Investing",
    title: "Bull Market",
    definition: "A bull market is a period of sustained rising asset prices — typically defined as a 20% or more rise from recent lows. Bull markets are driven by strong economic growth, investor optimism, and increasing corporate profits. They can last months or years. The term comes from a bull's upward horn strike gesture.",
    example: "The US stock market experienced one of its longest bull markets from 2009 to 2020, with the S&P 500 rising over 400% before COVID-19 ended it.",
    relatedTerms: ["bear-market", "index-fund", "dollar-cost-averaging"],
  },
  "bear-market": {
    category: "Investing",
    title: "Bear Market",
    definition: "A bear market is a sustained period of declining asset prices — generally defined as a drop of 20% or more from recent highs. Bear markets are often triggered by economic recessions, geopolitical crises, or loss of investor confidence. They can be painful in the short term but historically represent buying opportunities for long-term investors.",
    example: "During the 2022 bear market, the NASDAQ fell over 30% as rising interest rates crushed technology stock valuations.",
    relatedTerms: ["bull-market", "dollar-cost-averaging", "index-fund"],
  },
  "portfolio-diversification": {
    category: "Investing",
    title: "Portfolio Diversification",
    definition: "Diversification is the investment strategy of spreading money across different asset classes, sectors, and geographies to reduce risk. When one investment falls, others may rise or hold steady, protecting the overall portfolio. The core principle: don't put all your eggs in one basket.",
    example: "A diversified portfolio might include 60% stocks (across US, India, and emerging markets), 30% bonds, and 10% gold — so a stock market crash doesn't wipe out the entire portfolio.",
    relatedTerms: ["index-fund", "etf", "bull-market", "bear-market"],
  },
  "expense-ratio": {
    category: "Investing",
    title: "Expense Ratio",
    definition: "The expense ratio is the annual fee that mutual funds and ETFs charge investors to cover operating costs, expressed as a percentage of assets under management. It is automatically deducted from returns. Lower expense ratios mean more of your returns stay in your pocket — a key advantage of index funds over actively managed funds.",
    example: "An actively managed mutual fund with a 1.5% expense ratio vs an index fund with 0.1% — on a $100,000 investment over 20 years, this difference costs you over $60,000 in compounded returns.",
    relatedTerms: ["index-fund", "etf", "mutual-fund"],
  },

  // ── Technology ────────────────────────────────────────────────────────────
  "api": {
    category: "Technology",
    title: "API (Application Programming Interface)",
    definition: "An API is a set of rules and protocols that allows different software applications to communicate with each other. APIs define how requests are made and how data is exchanged between systems. REST APIs, GraphQL APIs, and WebSocket APIs are common types used in modern web and mobile applications.",
    example: "OpenAI's API allows developers to integrate GPT-4 into their own apps by sending text prompts and receiving AI-generated responses.",
    relatedTerms: ["large-language-model", "rag", "cloud-computing"],
  },
  "cloud-computing": {
    category: "Technology",
    title: "Cloud Computing",
    definition: "Cloud computing delivers computing services — servers, storage, databases, networking, software, and analytics — over the internet ('the cloud') on a pay-as-you-go basis. Major providers include Amazon Web Services (AWS), Microsoft Azure, and Google Cloud Platform (GCP). Cloud computing eliminates the need for owning physical infrastructure.",
    example: "Zepto runs its entire grocery delivery infrastructure on AWS, using cloud servers, databases, and CDN to serve millions of daily orders.",
    relatedTerms: ["api", "devops", "microservices"],
  },
  "devops": {
    category: "Technology",
    title: "DevOps",
    definition: "DevOps is a set of practices that combines software development (Dev) and IT operations (Ops) to shorten the development lifecycle and deliver software continuously. It emphasizes automation, collaboration, CI/CD pipelines, and monitoring to enable teams to ship code faster and more reliably.",
    example: "Netflix uses DevOps practices to deploy code thousands of times per day, enabling rapid feature releases and near-zero downtime for 200+ million subscribers.",
    relatedTerms: ["cicd", "microservices", "cloud-computing"],
  },
  "cicd": {
    category: "Technology",
    title: "CI/CD (Continuous Integration / Continuous Deployment)",
    definition: "CI/CD is a DevOps practice where code changes are automatically built, tested, and deployed to production. Continuous Integration (CI) means every code commit triggers automated tests. Continuous Deployment (CD) means passing builds are automatically deployed. CI/CD eliminates manual release processes and reduces bugs in production.",
    example: "When a developer pushes code to GitHub, a CI/CD pipeline (via GitHub Actions) automatically runs tests, builds the app, and deploys it to Vercel — all within minutes, without human intervention.",
    relatedTerms: ["devops", "microservices", "cloud-computing"],
  },
  "microservices": {
    category: "Technology",
    title: "Microservices Architecture",
    definition: "Microservices is an architectural approach where a large application is broken down into small, independent services that each handle a specific business function and communicate via APIs. Each service can be developed, deployed, and scaled independently — contrasting with a monolithic application where everything is tightly coupled.",
    example: "Amazon's e-commerce platform uses hundreds of microservices — one handles product search, another manages payments, another tracks inventory — allowing each team to deploy independently.",
    relatedTerms: ["api", "devops", "cicd", "cloud-computing"],
  },
  "open-source": {
    category: "Technology",
    title: "Open Source Software",
    definition: "Open source software is software whose source code is publicly available for anyone to view, use, modify, and distribute. Open source projects are typically maintained by communities of contributors. They form the backbone of the modern internet — Linux, Python, React, and PostgreSQL are all open source.",
    example: "Meta released the LLaMA large language model as open source, allowing researchers and developers worldwide to run, fine-tune, and build on it for free.",
    relatedTerms: ["api", "devops", "large-language-model"],
  },
  "rest-api": {
    category: "Technology",
    title: "REST API",
    definition: "REST (Representational State Transfer) is an architectural style for designing APIs that use standard HTTP methods (GET, POST, PUT, DELETE) to interact with resources. REST APIs are stateless, scalable, and the most widely used API standard on the web today. They return data typically in JSON format.",
    example: "Twitter's REST API allows developers to fetch tweets, post on behalf of users, and search trending topics by making HTTP requests to endpoints like GET /tweets/{id}.",
    relatedTerms: ["api", "microservices", "cloud-computing"],
  },
  "graphql": {
    category: "Technology",
    title: "GraphQL",
    definition: "GraphQL is a query language for APIs, developed by Meta (Facebook), that lets clients request exactly the data they need — no more, no less. Unlike REST APIs which have fixed endpoints returning fixed data, GraphQL has a single endpoint where clients specify their exact data requirements in the query itself.",
    example: "GitHub uses GraphQL for its API, allowing developers to fetch a repository's name, stars, and last 5 commits in a single request instead of multiple REST calls.",
    relatedTerms: ["rest-api", "api", "microservices"],
  },

  // ── Crypto ────────────────────────────────────────────────────────────────
  "blockchain": {
    category: "Crypto",
    title: "Blockchain",
    definition: "A blockchain is a distributed, decentralized digital ledger that records transactions across a network of computers. Each block of data is cryptographically linked to the previous block, making records tamper-resistant. Bitcoin and Ethereum are the most well-known blockchains.",
    example: "Every Bitcoin transaction ever made is permanently recorded on its public blockchain, viewable by anyone at blockchain.com.",
    relatedTerms: ["defi", "nft", "smart-contract"],
  },
  "defi": {
    category: "Crypto",
    title: "Decentralized Finance (DeFi)",
    definition: "Decentralized Finance (DeFi) refers to financial applications built on blockchain networks (primarily Ethereum) that operate without traditional intermediaries like banks or brokers. DeFi protocols enable lending, borrowing, trading, and earning interest directly between users via smart contracts.",
    example: "Using Aave (a DeFi protocol), you can lend USDC and earn 5-8% interest annually without involving any bank.",
    relatedTerms: ["blockchain", "nft", "smart-contract"],
  },
  "nft": {
    category: "Crypto",
    title: "NFT (Non-Fungible Token)",
    definition: "A Non-Fungible Token (NFT) is a unique digital asset stored on a blockchain that represents ownership of a specific item — artwork, music, collectibles, or in-game items. Unlike cryptocurrencies (fungible/interchangeable), each NFT is one-of-a-kind and cannot be directly exchanged for another.",
    example: "Beeple's digital artwork 'Everydays: The First 5000 Days' sold as an NFT for $69 million at Christie's in 2021.",
    relatedTerms: ["blockchain", "defi", "smart-contract"],
  },
  "smart-contract": {
    category: "Crypto",
    title: "Smart Contract",
    definition: "A smart contract is a self-executing program stored on a blockchain that automatically enforces and executes the terms of an agreement when predefined conditions are met — without any intermediary. Written in code, smart contracts are transparent, tamper-proof, and run exactly as programmed.",
    example: "A smart contract on Ethereum can automatically release payment to a freelancer when a client confirms project delivery — no escrow service or lawyer needed.",
    relatedTerms: ["blockchain", "defi", "nft"],
  },
  "web3": {
    category: "Crypto",
    title: "Web3",
    definition: "Web3 is the vision of a decentralized internet built on blockchain technology, where users own their data, digital assets, and identities — rather than corporations like Google or Meta. Web3 applications (dApps) run on decentralized networks, enabling trustless transactions and user-owned economies.",
    example: "OpenSea is a Web3 marketplace where users buy and sell NFTs directly from their crypto wallets, without a central company controlling or profiting from their assets.",
    relatedTerms: ["blockchain", "defi", "nft", "smart-contract"],
  },
};

export const GLOSSARY_CATEGORIES = ["AI", "Finance", "Investing", "Technology", "Crypto"] as const;

export function getTermsByCategory(category: string) {
  return Object.entries(GLOSSARY).filter(([, entry]) => entry.category === category);
}

export function getAllTerms() {
  return Object.entries(GLOSSARY).sort(([a], [b]) => a.localeCompare(b));
}
