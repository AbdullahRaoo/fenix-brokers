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
    default: "Fenix Brokers - Broker Global de Cosméticos | Productos de Belleza B2B",
    template: "%s | Fenix Brokers"
  },
  description: "Fenix Brokers es tu broker global de cosméticos de confianza. Obtén productos de belleza premium, perfumes y cuidado de la piel de marcas auténticas a precios B2B competitivos. Con sede en España, sirviendo a minoristas en todo el mundo.",
  keywords: ["broker de cosméticos", "productos de belleza B2B", "perfumes al por mayor", "cuidado de piel mayorista", "distribuidor de belleza", "proveedor de cosméticos España", "Fenix Brokers"],
  authors: [{ name: "Fenix Brokers" }],
  creator: "Fenix Brokers",
  publisher: "Fenix Brokers",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://fenixbrokers.com",
    siteName: "Fenix Brokers",
    title: "Fenix Brokers - Broker Global de Cosméticos",
    description: "Tu broker global de cosméticos de confianza. Productos de belleza B2B premium de marcas auténticas.",
    images: [
      {
        url: "/logos/PNG/logo-fenix-brokers-1.png",
        width: 800,
        height: 600,
        alt: "Logo de Fenix Brokers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fenix Brokers - Broker Global de Cosméticos",
    description: "Tu broker global de cosméticos de confianza. Productos de belleza B2B premium de marcas auténticas.",
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
    <html lang="es" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {/* Accessibility: Skip to main content link */}
          <a href="#main-content" className="skip-to-main">
            Ir al contenido principal
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

