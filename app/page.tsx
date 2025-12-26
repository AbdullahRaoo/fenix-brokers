"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp, Zap, Globe, HeadphonesIcon, CheckCircle2 } from "lucide-react"
import SubscriberModal from "@/components/subscriber-modal"
import { PublicHeader } from "@/components/public-header"
import { Footer } from "@/components/footer"
import Link from "next/link"

export default function HomePage() {
  const [showSubscriberModal, setShowSubscriberModal] = useState(false)
  const [email, setEmail] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSubscriberModal(true)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in")
          }
        })
      },
      { threshold: 0.1 },
    )

    document.querySelectorAll(".fade-in-up").forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  const categories = [
    {
      name: "Electronics",
      image: "/electronics-wholesale.jpg",
      count: 234,
    },
    {
      name: "Industrial Equipment",
      image: "/industrial-machinery.jpg",
      count: 189,
    },
    {
      name: "Office Supplies",
      image: "/office-supplies-bulk.jpg",
      count: 567,
    },
    {
      name: "Construction Materials",
      image: "/construction-materials-variety.png",
      count: 423,
    },
    {
      name: "Safety Gear",
      image: "/industrial-safety-gear.jpg",
      count: 156,
    },
    {
      name: "Packaging",
      image: "/packaging-supplies-boxes.jpg",
      count: 289,
    },
  ]

  const featuredProducts = [
    { id: "1", name: "Industrial LED Panel 600W", price: "$1,249", image: "/industrial-led-panel.jpg" },
    { id: "2", name: "Professional Power Drill Set", price: "$899", image: "/power-drill-set.jpg" },
    { id: "3", name: "Ergonomic Office Chair (Bulk)", price: "$399", image: "/ergonomic-office-chair.jpg" },
    { id: "4", name: "Steel I-Beam (Structural)", price: "$2,499", image: "/steel-i-beam.jpg" },
    { id: "5", name: "Commercial Coffee Maker", price: "$1,599", image: "/commercial-coffee-maker.jpg" },
  ]

  const clientLogos = ["TechCorp", "BuildMax", "OfficeHub", "IndustrialPro", "GlobalSupply", "MegaWholesale"]

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      const subscribers = JSON.parse(localStorage.getItem("subscribers") || "[]")
      subscribers.push({
        email,
        company: "Homepage Newsletter",
        createdAt: new Date().toISOString(),
      })
      localStorage.setItem("subscribers", JSON.stringify(subscribers))
      setEmail("")
      alert("Thank you for subscribing!")
    }
  }

  return (
    <div className="min-h-screen">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent animate-gradient" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(99,102,241,0.1),transparent_50%)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="fade-in-up">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance mb-6 leading-tight">
                Wholesale Solutions for <span className="text-primary">Growing Businesses</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 text-pretty leading-relaxed">
                Access premium B2B products at competitive prices. Request custom quotes, manage bulk orders, and scale
                your business with our comprehensive wholesale platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="text-base">
                  <Link href="/catalog">
                    Browse Catalog <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-base bg-transparent">
                  <Link href="/contact">Request Information</Link>
                </Button>
              </div>
            </div>

            <div className="fade-in-up lg:block hidden">
              <div className="relative">
                <img src="/modern-warehouse-with-products.jpg" alt="Warehouse" className="rounded-2xl shadow-2xl" />
                <div className="absolute -bottom-6 -left-6 bg-card border border-border rounded-lg p-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-bold text-lg">500+</p>
                      <p className="text-sm text-muted-foreground">Happy Clients</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-muted/30 border-y border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground mb-6 font-semibold uppercase tracking-wider">
            Trusted By Industry Leaders
          </p>
          <div className="relative overflow-hidden">
            <div className="flex gap-12 animate-scroll">
              {[...clientLogos, ...clientLogos].map((logo, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 px-8 py-4 text-2xl font-bold text-muted-foreground/40 hover:text-foreground transition-colors grayscale hover:grayscale-0"
                >
                  {logo}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 fade-in-up">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">Why Choose ProSupply</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
              We provide comprehensive B2B solutions designed for your success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="fade-in-up group">
              <div className="bg-card border border-border rounded-xl p-8 hover:shadow-lg hover:-translate-y-2 transition-all duration-300">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Bulk Pricing</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Get competitive wholesale prices with volume discounts. The more you buy, the more you save.
                </p>
              </div>
            </div>

            <div className="fade-in-up group" style={{ animationDelay: "0.1s" }}>
              <div className="bg-card border border-border rounded-xl p-8 hover:shadow-lg hover:-translate-y-2 transition-all duration-300">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Global Shipping</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Fast and reliable shipping to over 50 countries. Track your orders in real-time.
                </p>
              </div>
            </div>

            <div className="fade-in-up group" style={{ animationDelay: "0.2s" }}>
              <div className="bg-card border border-border rounded-xl p-8 hover:shadow-lg hover:-translate-y-2 transition-all duration-300">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <HeadphonesIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">24/7 Support</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Dedicated account managers and round-the-clock customer support for your business.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="categories" className="py-20 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 fade-in-up">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">Shop by Category</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
              Explore our wide range of wholesale products across multiple industries
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <Link
                key={category.name}
                href={`/catalog?category=${category.name.toLowerCase().replace(" ", "-")}`}
                className="fade-in-up group relative overflow-hidden rounded-xl border border-border bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-xl"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`${index === 0 || index === 5 ? "aspect-[4/5]" : "aspect-[4/3]"} relative overflow-hidden`}
                >
                  <img
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-semibold mb-1 text-balance">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.count} products</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12 fade-in-up">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">Best Sellers</h2>
              <p className="text-muted-foreground text-lg">Most popular products this month</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/catalog">View All</Link>
            </Button>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin">
            {featuredProducts.map((product, index) => (
              <Link
                key={product.id}
                href={`/product/${product.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="fade-in-up flex-shrink-0 w-64 group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-lg font-bold text-primary">Starting at {product.price}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="fade-in-up">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-balance">Built for B2B Excellence</h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                With over a decade of experience, we've served thousands of businesses worldwide. Our platform combines
                cutting-edge technology with personalized service to deliver exceptional value.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Verified Suppliers</h4>
                    <p className="text-muted-foreground text-sm">
                      All products from certified and vetted manufacturers
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Flexible Payment Terms</h4>
                    <p className="text-muted-foreground text-sm">Net 30/60 terms available for qualified buyers</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Quality Guarantee</h4>
                    <p className="text-muted-foreground text-sm">30-day return policy and warranty on all products</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="fade-in-up grid grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                <p className="text-4xl font-bold text-primary mb-2">500+</p>
                <p className="text-muted-foreground">Active Clients</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                <p className="text-4xl font-bold text-primary mb-2">1,400+</p>
                <p className="text-muted-foreground">Products</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                <p className="text-4xl font-bold text-primary mb-2">50+</p>
                <p className="text-muted-foreground">Countries</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                <p className="text-4xl font-bold text-primary mb-2">98%</p>
                <p className="text-muted-foreground">Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="fade-in-up bg-gradient-to-br from-primary via-primary to-primary/80 rounded-2xl p-12 lg:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.1),transparent_50%)]" />
            <div className="relative z-10">
              <Zap className="h-12 w-12 text-primary-foreground mx-auto mb-6" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-primary-foreground text-balance">
                Ready to Scale Your Business?
              </h2>
              <p className="text-primary-foreground/90 text-lg max-w-2xl mx-auto mb-8 text-pretty">
                Join hundreds of successful businesses. Get custom quotes, exclusive pricing, and dedicated support
                today.
              </p>
              <Button size="lg" variant="secondary" asChild className="text-base">
                <Link href="/contact">
                  Request a Quote <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Subscriber Modal */}
      <SubscriberModal open={showSubscriberModal} onOpenChange={setShowSubscriberModal} />

      <style jsx global>{`
        @keyframes gradient {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        .animate-gradient {
          animation: gradient 8s ease-in-out infinite;
        }
        
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        
        .fade-in-up {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        
        .fade-in-up.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          height: 6px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: hsl(var(--muted-foreground) / 0.3);
          border-radius: 3px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground) / 0.5);
        }
      `}</style>
    </div>
  )
}
