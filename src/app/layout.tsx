import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Providers } from '@/components/Providers'
import './globals.css'

export const viewport: Viewport = {
  themeColor: '#228B22',
}

export const metadata: Metadata = {
  title: 'Mannt Check – Cyfrowy opiekun Twojego kampera',
  description: 'Zarządzaj serwisem kampera, checklistami i kosztami podróży. AI doradca Majster Mannt zawsze do Twojej dyspozycji.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Mannt Check'
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pl">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <Script
          src="https://sdk.nxcode.ai/nxcode.js"
          strategy="beforeInteractive"
          onError={(e) => {
            console.error('Failed to load Nxcode SDK:', e)
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
