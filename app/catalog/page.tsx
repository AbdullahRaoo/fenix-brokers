"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, Search, Filter } from "lucide-react"
import { PublicHeader } from "@/components/public-header"
import { Footer } from "@/components/footer"
import Link from "next/link"

// Dummy product data
const products = [
  {
    id: "PROD-001",
    slug: "industrial-led-light-panel-60w",
    name: "Industrial LED Light Panel 60W",
    brand: "LumenTech",
    category: "Electronics",
    image: "/industrial-led-panel.jpg",
    price: "Request Quote",
    stock: "In Stock",
  },
  {
    id: "PROD-002",
    slug: "heavy-duty-power-drill-set",
    name: "Heavy Duty Power Drill Set",
    brand: "PowerMax",
    category: "Industrial Equipment",
    image: "/power-drill-set.jpg",
    price: "Request Quote",
    stock: "In Stock",
  },
  {
    id: "PROD-003",
    slug: "office-chair-ergonomic-pro",
    name: "Office Chair Ergonomic Pro",
    brand: "ComfortSeating",
    category: "Office Supplies",
    image: "/ergonomic-office-chair.jpg",
    price: "Request Quote",
    stock: "In Stock",
  },
  {
    id: "PROD-004",
    slug: "steel-beam-20ft-i-section",
    name: "Steel Beam 20ft I-Section",
    brand: "SteelCore",
    category: "Construction Materials",
    image: "/steel-i-beam.jpg",
    price: "Request Quote",
    stock: "In Stock",
  },
  {
    id: "PROD-005",
    slug: "commercial-coffee-maker-12-cup",
    name: "Commercial Coffee Maker 12-Cup",
    brand: "BrewMaster",
    category: "Office Supplies",
    image: "/commercial-coffee-maker.jpg",
    price: "Request Quote",
    stock: "In Stock",
  },
  {
    id: "PROD-006",
    slug: "warehouse-shelving-unit",
    name: "Warehouse Shelving Unit",
    brand: "StoragePro",
    category: "Industrial Equipment",
    image: "/warehouse-shelving-unit.jpg",
    price: "Request Quote",
    stock: "In Stock",
  },
  {
    id: "PROD-007",
    slug: "security-camera-system-8-channel",
    name: "Security Camera System 8-Channel",
    brand: "SecureVision",
    category: "Electronics",
    image: "/security-camera-system.jpg",
    price: "Request Quote",
    stock: "In Stock",
  },
  {
    id: "PROD-008",
    slug: "concrete-mix-pro-grade-50lb",
    name: "Concrete Mix Pro Grade 50lb",
    brand: "BuildStrong",
    category: "Construction Materials",
    image: "/concrete-mix-bags.jpg",
    price: "Request Quote",
    stock: "In Stock",
  },
]

export default function CatalogPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen">
      <PublicHeader />

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Product Catalog</h1>
          <p className="text-muted-foreground">Browse our selection of wholesale products</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Electronics">Electronics</SelectItem>
              <SelectItem value="Industrial Equipment">Industrial Equipment</SelectItem>
              <SelectItem value="Office Supplies">Office Supplies</SelectItem>
              <SelectItem value="Construction Materials">Construction Materials</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-300 group block"
              >
                <div className="aspect-square relative overflow-hidden bg-muted">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 bg-primary/90 text-primary-foreground text-xs rounded-md">
                      {product.stock}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
                  <h3 className="font-semibold mb-2 text-balance line-clamp-2">{product.name}</h3>
                  <p className="text-sm text-primary font-medium mb-4">{product.price}</p>
                  <Button className="w-full" size="sm">
                    View Details
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
