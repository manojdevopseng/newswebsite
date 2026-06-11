import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TechPulseGlobe — AI · Finance · Tech Intelligence',
    short_name: 'TechPulseGlobe',
    description: 'Premium AI-powered intelligence platform covering AI, Finance, Technology, Startups, and Investing for India\'s most ambitious professionals.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0f',
    theme_color: '#60a5fa',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'en-IN',
    categories: ['news', 'finance', 'technology'],
    icons: [
      {
        src: '/images/logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/favicon.ico',
        sizes: '48x48',
        type: 'image/x-icon',
      },
    ],
    shortcuts: [
      {
        name: 'AI News',
        url: '/ai',
        description: 'Latest Artificial Intelligence news',
      },
      {
        name: 'Finance',
        url: '/finance',
        description: 'Markets, investing and financial news',
      },
      {
        name: 'Technology',
        url: '/technology',
        description: 'Tech news and deep dives',
      },
    ],
  }
}
