"use client"

import type React from "react"

import Link from "next/link"
import { Sparkles, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useTransition } from "react"
import { subscribeEmail } from "@/app/actions/subscribers"
import { useToast } from "@/hooks/use-toast"

export function Footer() {
  const [email, setEmail] = useState("")
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      startTransition(async () => {
        const result = await subscribeEmail({ email })

        if (result.error) {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          })
          return
        }

        toast({
          title: result.alreadySubscribed ? "Already subscribed!" : "Thank you!",
          description: result.alreadySubscribed
            ? "This email is already on our list."
            : "You've been subscribed to our newsletter.",
        })

        localStorage.setItem("has_subscribed", "true")
        localStorage.setItem("subscribed_at", new Date().toISOString())
        setEmail("")
      })
    }
  }

  return (
    <footer className="border-t border-border/40 bg-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/logos/PNG/logo-fenix-brokers-1.png"
                alt="Fenix Brokers"
                className="h-12 w-auto object-contain rounded-lg"
              />
            </div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Your trusted wholesale partner for premium cosmetics and fragrances. Authentic products, competitive prices.
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Email:</strong> info@fenixbrokers.com
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-base">Quick Links</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="hover:text-foreground transition-colors">
                  Product Catalog
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-foreground transition-colors">
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4 text-base">Categories</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/catalog?category=Perfumes" className="hover:text-foreground transition-colors">
                  Perfumes
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=Skincare" className="hover:text-foreground transition-colors">
                  Skincare
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=Makeup" className="hover:text-foreground transition-colors">
                  Makeup
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=Hair Care" className="hover:text-foreground transition-colors">
                  Hair Care
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="hover:text-foreground transition-colors">
                  View All
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h3 className="font-semibold mb-4 text-base">Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Get the latest updates on new arrivals and exclusive offers.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background"
              />
              <Button type="submit" className="w-full" disabled={isPending}>
                <Mail className="mr-2 h-4 w-4" />
                {isPending ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/40 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            &copy; 2025 Fenix Brokers. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
