import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans, JetBrains_Mono } from 'next/font/google'
import 'leaflet/dist/leaflet.css'
import './globals.css'

const cormorant = Cormorant_Garamond({
  variable: '--font-display',
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
})

const dmSans = DM_Sans({
  variable: '--font-body',
  subsets: ['latin'],
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'CivicPulse — Report it. Watch it act.',
  description: 'CivicPulse turns a photo and a location into a routed civic report. Powered by Google AI Studio. Built for India\'s communities.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${dmSans.variable} ${jetbrainsMono.variable} bg-[#FAF7F2]`}
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
