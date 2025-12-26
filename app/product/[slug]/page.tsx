"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PublicHeader } from "@/components/public-header"
import { RequestQuoteModal } from "@/components/request-quote-modal"
import { Footer } from "@/components/footer"
import { ChevronLeft, Package2, CheckCircle2 } from "lucide-react"
import Link from "next/link"

// Mock product data - in real app this would be fetched from API
const getProduct = (slug: string) => {
  const products = [
    {
      id: "PROD-001",
      slug: "industrial-led-light-panel-60w",
      name: "Industrial LED Light Panel 60W",
      brand: "LumenTech",
      category: "Electronics",
      images: [
        "/industrial-led-panel.jpg",
        "/placeholder.svg?height=600&width=600",
        "/placeholder.svg?height=600&width=600",
      ],
      price: "Request Quote",
      stock: "In Stock",
      sku: "PROD-001",
      shortDescription:
        "High-efficiency LED panel perfect for industrial and commercial spaces. Features advanced heat dissipation and energy-saving technology.",
      fullDescription:
        "Our Industrial LED Light Panel 60W is designed for demanding commercial and industrial environments. With a luminous efficacy of 120 lm/W and a wide beam angle of 120°, this panel provides uniform illumination across large areas. The aluminum housing ensures excellent heat dissipation, extending the lifespan to over 50,000 hours. IP65 rating makes it suitable for both indoor and outdoor applications.",
      specifications: [
        { key: "Power", value: "60W" },
        { key: "Voltage", value: "AC 100-240V" },
        { key: "Lumens", value: "7,200 lm" },
        { key: "Color Temperature", value: "4000K-6000K" },
        { key: "Beam Angle", value: "120°" },
        { key: "IP Rating", value: "IP65" },
        { key: "Lifespan", value: "50,000 hours" },
        { key: "Dimensions", value: "600 x 600 x 50mm" },
        { key: "Weight", value: "4.5kg" },
        { key: "Warranty", value: "5 years" },
      ],
      relatedProducts: ["PROD-007", "PROD-002"],
    },
    {
      id: "PROD-002",
      slug: "heavy-duty-power-drill-set",
      name: "Heavy Duty Power Drill Set",
      brand: "PowerMax",
      category: "Industrial Equipment",
      images: ["/power-drill-set.jpg", "/placeholder.svg?height=600&width=600"],
      price: "Request Quote",
      stock: "In Stock",
      sku: "PROD-002",
      shortDescription: "Professional-grade cordless drill set with multiple attachments for heavy-duty applications.",
      fullDescription:
        "The PowerMax Heavy Duty Power Drill Set includes a high-torque brushless motor drill with variable speed control, two 20V lithium-ion batteries, and a comprehensive set of drill bits and driver bits. Built for professionals who demand reliability and performance in challenging work environments.",
      specifications: [
        { key: "Motor Type", value: "Brushless" },
        { key: "Voltage", value: "20V" },
        { key: "Max Torque", value: "80 Nm" },
        { key: "Chuck Size", value: "13mm" },
        { key: "Battery Capacity", value: "4.0 Ah" },
        { key: "Charge Time", value: "60 minutes" },
        { key: "Weight", value: "2.2kg" },
        { key: "Warranty", value: "3 years" },
      ],
      relatedProducts: ["PROD-006", "PROD-004"],
    },
  ]

  return products.find((p) => p.slug === slug) || products[0]
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = getProduct(params.slug)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showQuoteModal, setShowQuoteModal] = useState(false)

  return (
    <div className="min-h-screen">
      <PublicHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/catalog" className="hover:text-foreground transition-colors">
            Catalog
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        {/* Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Left Side - Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
              <img
                src={product.images[selectedImage] || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index ? "border-primary" : "border-border hover:border-primary/50"
                  }`}
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Side - Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{product.category}</Badge>
                <Badge variant="outline" className="border-primary/50 text-primary">
                  {product.stock}
                </Badge>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-3 text-balance">{product.name}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span>SKU: {product.sku}</span>
                <span>•</span>
                <span>Brand: {product.brand}</span>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">{product.shortDescription}</p>
            </div>

            {/* CTA Section */}
            <div className="bg-muted/50 border border-border rounded-lg p-6 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Price</p>
                <p className="text-2xl font-bold text-primary">Request Quote</p>
              </div>
              <Button size="lg" className="w-full text-base" onClick={() => setShowQuoteModal(true)}>
                <Package2 className="mr-2 h-5 w-5" />
                Request a Quote
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Get a custom quote within 24 hours for bulk orders
              </p>
            </div>

            {/* Key Features */}
            <div className="border border-border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Key Features</h3>
              <ul className="space-y-3">
                {product.specifications.slice(0, 5).map((spec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">
                      <span className="font-medium">{spec.key}:</span> {spec.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Below the Fold - Tabbed Section */}
        <Tabs defaultValue="description" className="mb-16">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl">
            <TabsTrigger value="description">Full Description</TabsTrigger>
            <TabsTrigger value="specifications">Technical Specifications</TabsTrigger>
            <TabsTrigger value="related">Related Products</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-8">
            <div className="bg-card border border-border rounded-lg p-6 lg:p-8">
              <h2 className="text-2xl font-bold mb-4">Product Description</h2>
              <p className="text-muted-foreground leading-relaxed">{product.fullDescription}</p>
            </div>
          </TabsContent>

          <TabsContent value="specifications" className="mt-8">
            <div className="bg-card border border-border rounded-lg p-6 lg:p-8">
              <h2 className="text-2xl font-bold mb-6">Technical Specifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.specifications.map((spec, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-4 bg-muted/50 rounded-lg border border-border"
                  >
                    <span className="font-medium">{spec.key}</span>
                    <span className="text-muted-foreground">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="related" className="mt-8">
            <div className="bg-card border border-border rounded-lg p-6 lg:p-8">
              <h2 className="text-2xl font-bold mb-6">Related Products</h2>
              <p className="text-muted-foreground mb-4">Customers also viewed these products</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Placeholder for related products */}
                <div className="text-center py-8 text-muted-foreground">Related products coming soon</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Back to Catalog */}
        <div className="text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/catalog">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Catalog
            </Link>
          </Button>
        </div>
      </div>

      {/* Footer component */}
      <Footer />

      {/* Request Quote Modal */}
      <RequestQuoteModal open={showQuoteModal} onOpenChange={setShowQuoteModal} product={product} />
    </div>
  )
}
