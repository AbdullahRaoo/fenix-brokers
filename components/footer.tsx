"use client"

import type React from "react"

import Link from "next/link"
import { Package, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export function Footer() {
  const [email, setEmail] = useState("")

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      const subscribers = JSON.parse(localStorage.getItem("subscribers") || "[]")
      subscribers.push({
        email,
        company: "Footer Newsletter",
        createdAt: new Date().toISOString(),
      })
      localStorage.setItem("subscribers", JSON.stringify(subscribers))
      setEmail("")
      alert("Thank you for subscribing!")
    }
  }

  return (
    <footer className="border-t border-border/40 bg-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">ProSupply</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Your trusted B2B wholesale partner for over 10 years. Quality products, competitive prices, exceptional
              service.
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Phone:</strong> +1 (555) 123-4567
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Email:</strong> sales@prosupply.com
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
                <Link href="/catalog?category=electronics" className="hover:text-foreground transition-colors">
                  Electronics
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=industrial" className="hover:text-foreground transition-colors">
                  Industrial Equipment
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=office" className="hover:text-foreground transition-colors">
                  Office Supplies
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=construction" className="hover:text-foreground transition-colors">
                  Construction Materials
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
              Get the latest updates on new products and exclusive offers.
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
              <Button type="submit" className="w-full">
                <Mail className="mr-2 h-4 w-4" />
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/40 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            &copy; 2025 ProSupply Wholesale. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
