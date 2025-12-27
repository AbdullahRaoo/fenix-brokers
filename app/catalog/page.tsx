"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, Search, Filter, Loader2, Grid3X3, LayoutGrid, ArrowUpDown, Sparkles, Eye } from "lucide-react"
import { PublicHeader } from "@/components/public-header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { getProducts, getCategories } from "@/app/actions/products"
import type { Product } from "@/types/database"

export default function CatalogPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") || "all")
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState<"grid" | "compact">("grid")

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)

      const [productsResult, categoriesResult] = await Promise.all([
        getProducts({
          category: categoryFilter === "all" ? undefined : categoryFilter,
          search: searchQuery || undefined,
          sortBy: sortBy as any,
        }),
        getCategories(),
      ])

      if (productsResult.data) {
        setProducts(productsResult.data)
      }
      if (categoriesResult.data) {
        setCategories(categoriesResult.data)
      }

      setIsLoading(false)
    }

    loadData()
  }, [categoryFilter, searchQuery, sortBy])

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
  }, [products])

  return (
    <div className="min-h-screen">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent" />
        <div className="absolute top-10 right-20 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-accent/10 rounded-full blur-2xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">Catalog</span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-2 mb-4 text-balance">
              Premium <span className="text-primary">Beauty Products</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Discover our curated selection of authentic wholesale cosmetics and fragrances
            </p>
          </div>
        </div>
      </section>

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters Bar */}
        <div className="bg-card border border-border rounded-2xl p-4 lg:p-6 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search products, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px] h-12">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[160px] h-12">
                  <ArrowUpDown className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="alphabetical">A to Z</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="hidden lg:flex bg-muted rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-background shadow-sm" : "hover:bg-background/50"
                    }`}
                >
                  <LayoutGrid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode("compact")}
                  className={`p-2.5 rounded-md transition-colors ${viewMode === "compact" ? "bg-background shadow-sm" : "hover:bg-background/50"
                    }`}
                >
                  <Grid3X3 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Results count and active filters */}
          <div className="mt-4 pt-4 border-t border-border/50 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">
              {isLoading ? "Loading..." : `${products.length} products found`}
            </span>
            {categoryFilter !== "all" && (
              <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full">
                {categoryFilter}
                <button
                  onClick={() => setCategoryFilter("all")}
                  className="hover:bg-primary/20 rounded-full p-0.5"
                >
                  ×
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full">
                "{searchQuery}"
                <button
                  onClick={() => setSearchQuery("")}
                  className="hover:bg-primary/20 rounded-full p-0.5"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl mb-6">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
            <p className="text-muted-foreground text-lg">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-muted rounded-2xl mb-6">
              <Package className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your search or filters</p>
            <Button onClick={() => { setSearchQuery(""); setCategoryFilter("all"); }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className={`grid gap-6 ${viewMode === "grid"
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            }`}>
            {products.map((product, index) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="fade-in-up bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group block"
                style={{ animationDelay: `${Math.min(index * 0.05, 0.5)}s` }}
              >
                <div className={`${viewMode === "grid" ? "aspect-square" : "aspect-[4/5]"} relative overflow-hidden bg-muted`}>
                  <img
                    src={product.images?.[0] || "/placeholder.svg"}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Quick view button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="bg-white/90 backdrop-blur-sm text-foreground px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Quick View
                    </span>
                  </div>

                  {/* Stock badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${product.stock_status === 'in_stock'
                      ? 'bg-emerald-500/90 text-white'
                      : product.stock_status === 'low_stock'
                        ? 'bg-amber-500/90 text-white'
                        : 'bg-red-500/90 text-white'
                      }`}>
                      {product.stock_status === 'in_stock' ? 'In Stock' :
                        product.stock_status === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                    </span>
                  </div>

                  {/* New badge for recent products */}
                  {new Date(product.created_at || '').getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 && (
                    <div className="absolute top-3 left-3">
                      <span className="bg-primary text-white px-2.5 py-1 text-xs font-medium rounded-full flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        New
                      </span>
                    </div>
                  )}
                </div>

                <div className={`${viewMode === "grid" ? "p-5" : "p-3"}`}>
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">{product.brand}</p>
                  <h3 className={`font-semibold text-balance line-clamp-2 group-hover:text-primary transition-colors ${viewMode === "grid" ? "text-base mb-3" : "text-sm mb-2"
                    }`}>
                    {product.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className={`font-bold text-primary ${viewMode === "grid" ? "text-lg" : "text-base"}`}>
                      {product.price ? `$${product.price}` : "Quote"}
                    </p>
                    {viewMode === "grid" && (
                      <Button size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        View
                      </Button>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Load more / pagination placeholder */}
        {products.length > 0 && (
          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground mb-4">Showing {products.length} products</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />

      <style jsx global>{`
        .fade-in-up {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.5s ease-out, transform 0.5s ease-out;
        }
        
        .fade-in-up.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  )
}
