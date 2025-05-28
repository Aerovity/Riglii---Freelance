import type React from "react"
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import { Roboto, Roboto_Mono } from 'next/font/google'
import "./globals.css"
import { LanguageProvider } from "./language-provider"
import ConditionalLayout from "@/components/layout/conditional-layout"

const inter = Inter({ subsets: ["latin"] })

const roboto = Roboto({
  variable: '--font-roboto',
  subsets: ['latin'],
  weight: ['100', '300', '400', '500', '700', '900'],
})

const robotoMono = Roboto_Mono({
  variable: '--font-roboto-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: "Riglii - Freelance Services Marketplace",
  description: "Find the perfect freelance services for your business",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${roboto.variable} ${robotoMono.variable} antialiased`}>
        <LanguageProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </LanguageProvider>
      </body>
    </html>
  )
}