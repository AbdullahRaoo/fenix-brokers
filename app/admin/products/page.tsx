"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Pencil } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"

const productsData = [
  {
    id: "PROD-001",
    name: "Industrial LED Light Panel 60W",
    sku: "LED-60W-001",
    category: "Electronics",
    brand: "LumenTech",
    stock: "In Stock",
    image: "/industrial-led-panel.jpg",
    specifications: "60W power, 5000 lumens, IP65 rated",
  },
  {
    id: "PROD-002",
    name: "Heavy Duty Power Drill Set",
    sku: "DRILL-HD-002",
    category: "Industrial Equipment",
    brand: "PowerMax",
    stock: "In Stock",
    image: "/power-drill-set.jpg",
    specifications: "20V lithium battery, variable speed, includes 50 accessories",
  },
  {
    id: "PROD-003",
    name: "Office Chair Ergonomic Pro",
    sku: "CHAIR-ERG-003",
    category: "Office Supplies",
    brand: "ComfortSeating",
    stock: "In Stock",
    image: "/ergonomic-office-chair.jpg",
    specifications: "Adjustable lumbar support, 360° swivel, weight capacity 300lbs",
  },
  {
    id: "PROD-004",
    name: "Steel Beam 20ft I-Section",
    sku: "STEEL-I20-004",
    category: "Construction Materials",
    brand: "SteelCore",
    stock: "In Stock",
    image: "/steel-i-beam.jpg",
    specifications: "20ft length, I-beam profile, grade A36 steel",
  },
  {
    id: "PROD-005",
    name: "Commercial Coffee Maker 12-Cup",
    sku: "COFFEE-12C-005",
    category: "Office Supplies",
    brand: "BrewMaster",
    stock: "In Stock",
    image: "/commercial-coffee-maker.jpg",
    specifications: "12-cup capacity, programmable timer, auto shut-off",
  },
  {
    id: "PROD-006",
    name: "Warehouse Shelving Unit",
    sku: "SHELF-WH-006",
    category: "Industrial Equipment",
    brand: "StoragePro",
    stock: "In Stock",
    image: "/warehouse-shelving-unit.jpg",
    specifications: "6 adjustable shelves, 2000lb capacity, 72H x 48W x 24D inches",
  },
  {
    id: "PROD-007",
    name: "Security Camera System 8-Channel",
    sku: "CAM-8CH-007",
    category: "Electronics",
    brand: "SecureVision",
    stock: "In Stock",
    image: "/security-camera-system.jpg",
    specifications: "8 HD cameras, night vision, 1TB storage, mobile app",
  },
  {
    id: "PROD-008",
    name: "Concrete Mix Pro Grade 50lb",
    sku: "CONC-50-008",
    category: "Construction Materials",
    brand: "BuildStrong",
    stock: "In Stock",
    image: "/concrete-mix-bags.jpg",
    specifications: "50lb bag, high-strength formula, 3000 PSI",
  },
]

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredProducts = productsData.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Product Management</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, SKU, or brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Stock Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="w-12 h-12 rounded-md overflow-hidden bg-muted">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.brand}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                      {product.stock}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/products/${product.id}`}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
