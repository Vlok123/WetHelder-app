import React from 'react'
import type { Metadata } from 'next'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'WetHelder',
  description: 'Nederlandse juridische assistent voor wet- en regelgeving op basis van officiële bronnen',
  keywords: 'Nederlandse wet, regelgeving, juridisch, WetHelder, wetten.overheid.nl',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <body>
        <Providers session={null}>
          <div className="min-h-screen bg-gray-50">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
} 