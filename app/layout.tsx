import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

const siteUrl = 'https://realestate.pratham.click'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Realest — Discover the Perfect Place to Call Home',
    template: '%s | Realest',
  },
  description:
    'Realest is your trusted real estate agency for buying, selling, and renting luxury homes and commercial properties across prime locations.',
  keywords: [
    'real estate',
    'property for sale',
    'homes for sale',
    'luxury real estate',
    'buy property',
    'rent property',
    'real estate agency',
    'commercial property',
  ],
  authors: [{ name: 'Realest Real Estate' }],
  creator: 'Realest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Realest',
    title: 'Realest — Discover the Perfect Place to Call Home',
    description:
      'Your trusted real estate agency for luxury homes and commercial properties. Browse listings, connect with agents, and find your perfect property.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Realest — Real Estate Agency' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Realest — Discover the Perfect Place to Call Home',
    description:
      'Your trusted real estate agency for luxury homes and commercial properties.',
    images: ['/og-image.png'],
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
