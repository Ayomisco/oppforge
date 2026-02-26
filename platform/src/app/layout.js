import { JetBrains_Mono, Space_Grotesk } from 'next/font/google'
import './globals.css'

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'], 
  variable: '--font-mono',
  display: 'swap',
  preload: false,
})

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'], 
  variable: '--font-sans',
  display: 'swap',
  preload: false,
})

export const metadata = {
  title: {
    default: 'OppForge | Mission Control',
    template: '%s | OppForge',
  },
  description: 'Your Web3 mission control center. Track grants, hackathons, airdrops, and bounties with AI-powered insights and scoring.',
  keywords: ['Web3', 'grants', 'hackathons', 'airdrops', 'bounties', 'crypto', 'blockchain', 'AI', 'opportunities', 'dashboard'],
  authors: [{ name: 'OppForge' }],
  creator: 'OppForge',
  publisher: 'OppForge',
  metadataBase: new URL('https://app.oppforge.xyz'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/logo.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: '/logo.png',
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://app.oppforge.xyz',
    siteName: 'OppForge',
    title: 'OppForge | Mission Control',
    description: 'Your Web3 mission control center. Track grants, hackathons, airdrops, and bounties with AI-powered insights.',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'OppForge Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OppForge | Mission Control',
    description: 'Your Web3 mission control center. Track grants, hackathons, airdrops, and bounties with AI-powered insights.',
    images: ['/logo.png'],
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

import { Providers } from '../components/providers/Providers';

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
