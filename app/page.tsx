"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Truck, Globe, HeadphonesIcon, CheckCircle2, Star } from "lucide-react"
import SubscriberModal from "@/components/subscriber-modal"
import { PublicHeader } from "@/components/public-header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { getProducts } from "@/app/actions/products"
import type { Product } from "@/types/database"

export default function HomePage() {
  const [showSubscriberModal, setShowSubscriberModal] = useState(false)
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])

  useEffect(() => {
    // Check if user has already subscribed
    const hasSubscribed = localStorage.getItem("has_subscribed")
    const subscribedAt = localStorage.getItem("subscribed_at")

    // Only show modal if not subscribed or subscription is older than 30 days
    if (!hasSubscribed || (subscribedAt && Date.now() - new Date(subscribedAt).getTime() > 30 * 24 * 60 * 60 * 1000)) {
      const timer = setTimeout(() => {
        setShowSubscriberModal(true)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    async function loadProducts() {
      const result = await getProducts({ sortBy: 'newest' })
      if (result.data) {
        setFeaturedProducts(result.data.slice(0, 5))
      }
    }
    loadProducts()
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
      name: "Perfumes",
      image: "/perfume-collection.jpg",
      count: 45,
    },
    {
      name: "Skincare",
      image: "/skincare-products.jpg",
      count: 78,
    },
    {
      name: "Makeup",
      image: "/makeup-collection.jpg",
      count: 124,
    },
    {
      name: "Hair Care",
      image: "/haircare-products.jpg",
      count: 56,
    },
    {
      name: "Body Care",
      image: "/bodycare-products.jpg",
      count: 89,
    },
    {
      name: "Gift Sets",
      image: "/gift-sets.jpg",
      count: 34,
    },
  ]

  const clientLogos = ["Sephora", "Ulta Beauty", "Douglas", "Boots", "Marionnaud", "Nocibé"]

  return (
    <div className="min-h-screen">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-purple-500/10 to-transparent animate-gradient" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(236,72,153,0.1),transparent_50%)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="fade-in-up">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance mb-6 leading-tight">
                Premium <span className="text-primary">Cosmetics & Fragrances</span> Wholesale
              </h1>
              <p className="text-lg text-muted-foreground mb-8 text-pretty leading-relaxed">
                Source authentic beauty products at wholesale prices. From luxury perfumes to professional skincare,
                we supply retailers, salons, and beauty businesses worldwide.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="text-base">
                  <Link href="/catalog">
                    Browse Collection <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-base bg-transparent">
                  <Link href="/contact">Request Wholesale Pricing</Link>
                </Button>
              </div>
            </div>

            <div className="fade-in-up lg:block hidden">
              <div className="relative">
                <img src="/cosmetics-hero.jpg" alt="Luxury Cosmetics" className="rounded-2xl shadow-2xl" />
                <div className="absolute -bottom-6 -left-6 bg-card border border-border rounded-lg p-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-8 w-8 text-pink-500" />
                    <div>
                      <p className="font-bold text-lg">500+</p>
                      <p className="text-sm text-muted-foreground">Premium Brands</p>
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
            Trusted By Leading Beauty Retailers
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
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">Why Partner With Fenix Brokers</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
              Your trusted source for authentic wholesale beauty products
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="fade-in-up group">
              <div className="bg-card border border-border rounded-xl p-8 hover:shadow-lg hover:-translate-y-2 transition-all duration-300">
                <div className="w-12 h-12 bg-pink-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-pink-500/20 transition-colors">
                  <Star className="h-6 w-6 text-pink-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">100% Authentic</h3>
                <p className="text-muted-foreground leading-relaxed">
                  All products sourced directly from authorized distributors. Full traceability and authenticity guaranteed.
                </p>
              </div>
            </div>

            <div className="fade-in-up group" style={{ animationDelay: "0.1s" }}>
              <div className="bg-card border border-border rounded-xl p-8 hover:shadow-lg hover:-translate-y-2 transition-all duration-300">
                <div className="w-12 h-12 bg-pink-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-pink-500/20 transition-colors">
                  <Truck className="h-6 w-6 text-pink-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Fast Shipping</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Temperature-controlled logistics to preserve product quality. Express delivery available worldwide.
                </p>
              </div>
            </div>

            <div className="fade-in-up group" style={{ animationDelay: "0.2s" }}>
              <div className="bg-card border border-border rounded-xl p-8 hover:shadow-lg hover:-translate-y-2 transition-all duration-300">
                <div className="w-12 h-12 bg-pink-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-pink-500/20 transition-colors">
                  <HeadphonesIcon className="h-6 w-6 text-pink-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Expert Support</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Dedicated beauty industry specialists to help you build the perfect product mix for your store.
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
              Explore our curated selection of premium beauty products
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <Link
                key={category.name}
                href={`/catalog?category=${category.name.toLowerCase().replace(" ", "-")}`}
                className="fade-in-up group relative overflow-hidden rounded-xl border border-border bg-card hover:border-pink-500/50 transition-all duration-300 hover:shadow-xl"
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
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">New Arrivals</h2>
              <p className="text-muted-foreground text-lg">Latest additions to our collection</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/catalog">View All</Link>
            </Button>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin">
            {featuredProducts.map((product, index) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="fade-in-up flex-shrink-0 w-64 group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    <img
                      src={product.images?.[0] || "/placeholder.svg"}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
                    <h3 className="font-semibold mb-2 line-clamp-2">{product.title}</h3>
                    <p className="text-lg font-bold text-pink-500">
                      {product.price ? `$${product.price}` : "Request Quote"}
                    </p>
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
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-balance">Your Beauty Business Partner</h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                With over a decade of experience in the cosmetics industry, Fenix Brokers connects retailers and
                professionals with premium beauty brands. We handle sourcing, quality control, and logistics so
                you can focus on growing your business.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-pink-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Verified Suppliers</h4>
                    <p className="text-muted-foreground text-sm">
                      All products from authorized distributors with batch tracking
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-pink-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Flexible Payment Terms</h4>
                    <p className="text-muted-foreground text-sm">Net 30/60 terms available for qualified buyers</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-pink-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Low MOQ Options</h4>
                    <p className="text-muted-foreground text-sm">Start small and scale as your business grows</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="fade-in-up grid grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                <p className="text-4xl font-bold text-pink-500 mb-2">500+</p>
                <p className="text-muted-foreground">Premium Brands</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                <p className="text-4xl font-bold text-pink-500 mb-2">2,000+</p>
                <p className="text-muted-foreground">Products</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                <p className="text-4xl font-bold text-pink-500 mb-2">50+</p>
                <p className="text-muted-foreground">Countries</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                <p className="text-4xl font-bold text-pink-500 mb-2">98%</p>
                <p className="text-muted-foreground">Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="fade-in-up bg-gradient-to-br from-pink-500 via-purple-500 to-pink-600 rounded-2xl p-12 lg:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.1),transparent_50%)]" />
            <div className="relative z-10">
              <Sparkles className="h-12 w-12 text-white mx-auto mb-6" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white text-balance">
                Ready to Stock Premium Beauty?
              </h2>
              <p className="text-white/90 text-lg max-w-2xl mx-auto mb-8 text-pretty">
                Join hundreds of successful beauty retailers. Get exclusive wholesale pricing and dedicated support today.
              </p>
              <Button size="lg" variant="secondary" asChild className="text-base">
                <Link href="/contact">
                  Request Wholesale Access <ArrowRight className="ml-2 h-5 w-5" />
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
