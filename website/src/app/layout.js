import { Syne, DM_Sans } from 'next/font/google'
import './globals.css'

const syne = Syne({ 
  subsets: ['latin'], 
  variable: '--font-heading',
  display: 'swap',
})

const dmSans = DM_Sans({ 
  subsets: ['latin'], 
  variable: '--font-sans',
  display: 'swap',
})

export const metadata = {
  title: {
    default: 'OppForge | Web3 Opportunity Agent',
    template: '%s | OppForge',
  },
  description: 'AI-powered agent that discovers, scores, and helps you win Web3 grants, hackathons, airdrops, and bounties. Your unfair advantage in the Web3 ecosystem.',
  keywords: ['Web3', 'grants', 'hackathons', 'airdrops', 'bounties', 'crypto', 'blockchain', 'AI', 'opportunities', 'DeFi', 'NFT'],
  authors: [{ name: 'OppForge' }],
  creator: 'OppForge',
  publisher: 'OppForge',
  metadataBase: new URL('https://oppforge.xyz'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/oppforge_logo.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: '/oppforge_logo.png',
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://oppforge.xyz',
    siteName: 'OppForge',
    title: 'OppForge | Web3 Opportunity Agent',
    description: 'AI-powered agent that discovers, scores, and helps you win Web3 grants, hackathons, airdrops, and bounties.',
    images: [
      {
        url: '/oppforge_logo.png',
        width: 512,
        height: 512,
        alt: 'OppForge Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OppForge | Web3 Opportunity Agent',
    description: 'AI-powered agent that discovers, scores, and helps you win Web3 grants, hackathons, airdrops, and bounties.',
    images: ['/oppforge_logo.png'],
    creator: '@oppforge',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F5F0EB' },
    { media: '(prefers-color-scheme: dark)', color: '#0D0A07' },
  ],
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${syne.variable} ${dmSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
