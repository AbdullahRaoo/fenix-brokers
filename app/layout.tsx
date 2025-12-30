import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Fenix Brokers - Global Cosmetics Broker | B2B Beauty Products",
    template: "%s | Fenix Brokers"
  },
  description: "Fenix Brokers is your trusted global cosmetics broker. Source premium beauty products, perfumes, and skincare from authentic brands at competitive B2B prices. Based in Spain, serving retailers worldwide.",
  keywords: ["cosmetics broker", "B2B beauty products", "wholesale perfumes", "skincare wholesale", "beauty distributor", "cosmetics supplier Spain", "Fenix Brokers"],
  authors: [{ name: "Fenix Brokers" }],
  creator: "Fenix Brokers",
  publisher: "Fenix Brokers",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://fenixbrokers.com",
    siteName: "Fenix Brokers",
    title: "Fenix Brokers - Global Cosmetics Broker",
    description: "Your trusted global cosmetics broker. Premium B2B beauty products from authentic brands.",
    images: [
      {
        url: "/logos/PNG/logo-fenix-brokers-1.png",
        width: 800,
        height: 600,
        alt: "Fenix Brokers Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fenix Brokers - Global Cosmetics Broker",
    description: "Your trusted global cosmetics broker. Premium B2B beauty products from authentic brands.",
    images: ["/logos/PNG/logo-fenix-brokers-1.png"],
  },
  icons: {
    icon: "/logos/fenix-broker-icon-whitebg.png",
    apple: "/logos/fenix-broker-icon-whitebg.png",
  },
  metadataBase: new URL("https://fenixbrokers.com"),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {/* Accessibility: Skip to main content link */}
          <a href="#main-content" className="skip-to-main">
            Skip to main content
          </a>
          <div id="main-content">
            {children}
          </div>
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}

