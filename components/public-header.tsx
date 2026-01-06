"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, Menu, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { getProducts } from "@/app/actions/products"
import type { Product } from "@/types/database"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/catalog", label: "Product Catalog" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
]

export function PublicHeader() {
  const pathname = usePathname()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Handle click outside to close search results
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Debounced search
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (value.trim().length < 2) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    setIsSearching(true)
    searchTimeoutRef.current = setTimeout(async () => {
      const result = await getProducts({ search: value, limit: 5 })
      if (result.data) {
        setSearchResults(result.data)
        setShowResults(true)
      }
      setIsSearching(false)
    }, 300)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setShowResults(false)
      window.location.href = `/catalog?search=${encodeURIComponent(searchQuery)}`
    }
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        isScrolled
          ? "py-2 bg-background/80 backdrop-blur-xl shadow-lg shadow-primary/5 border-b border-border/40"
          : "py-3 bg-background/95 backdrop-blur-sm border-b border-border/20"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
            <img
              src="/logos/PNG/logo-fenix-brokers-1.png"
              alt="Fenix Brokers"
              className={cn(
                "w-auto object-contain rounded-lg transition-all duration-300",
                isScrolled ? "h-12" : "h-16"
              )}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative py-2 text-sm font-medium transition-colors group",
                  isActive(link.href)
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
                {/* Animated underline */}
                <span
                  className={cn(
                    "absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 rounded-full",
                    isActive(link.href)
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  )}
                />
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Search Bar - Desktop */}
            <div ref={searchRef} className="hidden md:block relative">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="search"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                  className={cn(
                    "pr-10 transition-all duration-300 border-border/50 focus:border-primary",
                    isScrolled ? "w-48" : "w-56 lg:w-64"
                  )}
                />
                <Button type="submit" size="icon" variant="ghost" className="absolute right-0 top-0">
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </form>

              {/* Search Results Dropdown */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in-0 slide-in-from-top-2">
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      onClick={() => setShowResults(false)}
                      className="flex items-center gap-3 p-3 hover:bg-muted transition-colors border-b border-border/50 last:border-0"
                    >
                      <div className="w-10 h-10 bg-muted rounded overflow-hidden flex-shrink-0">
                        {product.images?.[0] && (
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.title}</p>
                        <p className="text-xs text-muted-foreground">{product.brand}</p>
                      </div>
                      {product.show_price && product.price && (
                        <span className="text-sm font-semibold text-primary">${product.price}</span>
                      )}
                    </Link>
                  ))}
                  <Link
                    href={`/catalog?search=${encodeURIComponent(searchQuery)}`}
                    onClick={() => setShowResults(false)}
                    className="block p-3 text-center text-sm text-primary hover:bg-muted transition-colors font-medium"
                  >
                    View all results →
                  </Link>
                </div>
              )}
            </div>

            {/* Search Icon - Mobile */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSearchOpen(!isSearchOpen)}>
              <Search className="h-5 w-5" />
            </Button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* CTA Button */}
            <Button asChild className="hidden sm:flex bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
              <Link href="/contact">Get a Quote</Link>
            </Button>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <nav className="flex flex-col gap-2 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "text-lg font-medium py-2 px-3 rounded-lg transition-colors",
                        isActive(link.href)
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Button asChild className="mt-4">
                    <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                      Get a Quote
                    </Link>
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <form onSubmit={handleSearch} className="md:hidden py-3 border-t border-border/40 mt-2">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
                autoFocus
              />
              <Button type="submit" size="icon" variant="ghost" className="absolute right-0 top-0">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>
        )}
      </div>
    </header>
  )
}
