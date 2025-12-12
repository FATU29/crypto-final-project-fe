import type { NewsArticle } from "@/types";

export const MOCK_NEWS: NewsArticle[] = [
  {
    id: "1",
    title: "Bitcoin Surges Past $43,000 as Institutional Interest Grows",
    summary:
      "Bitcoin price rallies as major institutions announce increased crypto allocations.",
    content:
      "Bitcoin has surged past the $43,000 mark following announcements from several major financial institutions about increased cryptocurrency allocations in their portfolios...",
    source: "CoinDesk",
    url: "https://example.com/news/1",
    publishedAt: new Date("2025-12-12T08:30:00"),
    imageUrl:
      "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800",
    sentiment: "positive",
    sentimentScore: 0.78,
    tags: ["Bitcoin", "Institutional", "Bullish"],
  },
  {
    id: "2",
    title: "Ethereum Network Upgrade Scheduled for Q1 2026",
    summary:
      "Major improvements to scalability and transaction costs expected.",
    content:
      "The Ethereum Foundation has announced a major network upgrade scheduled for Q1 2026, promising significant improvements to scalability and reduced transaction costs...",
    source: "CryptoNews",
    url: "https://example.com/news/2",
    publishedAt: new Date("2025-12-12T07:15:00"),
    imageUrl:
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800",
    sentiment: "positive",
    sentimentScore: 0.65,
    tags: ["Ethereum", "Upgrade", "Technology"],
  },
  {
    id: "3",
    title: "SEC Delays Decision on Bitcoin ETF Applications",
    summary: "Regulatory uncertainty continues as SEC postpones rulings.",
    content:
      "The U.S. Securities and Exchange Commission has delayed its decision on multiple Bitcoin ETF applications, citing the need for additional review...",
    source: "Bloomberg Crypto",
    url: "https://example.com/news/3",
    publishedAt: new Date("2025-12-12T06:00:00"),
    imageUrl:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800",
    sentiment: "negative",
    sentimentScore: -0.42,
    tags: ["Regulation", "SEC", "ETF"],
  },
  {
    id: "4",
    title: "DeFi Protocol Reports Record Trading Volume",
    summary: "Decentralized finance continues to grow with $10B daily volume.",
    content:
      "A leading DeFi protocol has reported record trading volume, surpassing $10 billion in daily transactions as user adoption continues to accelerate...",
    source: "DeFi Pulse",
    url: "https://example.com/news/4",
    publishedAt: new Date("2025-12-11T18:45:00"),
    imageUrl:
      "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800",
    sentiment: "positive",
    sentimentScore: 0.55,
    tags: ["DeFi", "Trading", "Volume"],
  },
  {
    id: "5",
    title: "Market Analysis: Key Support Levels to Watch",
    summary:
      "Technical analysts identify crucial price levels for major cryptocurrencies.",
    content:
      "Leading technical analysts have identified key support and resistance levels for Bitcoin and Ethereum as markets consolidate...",
    source: "Trading View",
    url: "https://example.com/news/5",
    publishedAt: new Date("2025-12-11T15:30:00"),
    imageUrl:
      "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800",
    sentiment: "neutral",
    sentimentScore: 0.05,
    tags: ["Analysis", "Technical", "Trading"],
  },
];
