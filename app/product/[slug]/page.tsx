"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PublicHeader } from "@/components/public-header"
import { RequestQuoteModal } from "@/components/request-quote-modal"
import { Footer } from "@/components/footer"
import { ChevronLeft, Package2, CheckCircle2, Loader2 } from "lucide-react"
import Link from "next/link"
import { getProductBySlug } from "@/app/actions/products"
import type { Product } from "@/types/database"

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showQuoteModal, setShowQuoteModal] = useState(false)

  useEffect(() => {
    async function loadProduct() {
      setIsLoading(true)
      const result = await getProductBySlug(resolvedParams.slug)

      if (result.error || !result.data) {
        setNotFound(true)
      } else {
        setProduct(result.data)
      }

      setIsLoading(false)
    }

    loadProduct()
  }, [resolvedParams.slug])

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <PublicHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Cargando producto...</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen">
        <PublicHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <Package2 className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h1 className="text-2xl font-bold mb-2">Producto No Encontrado</h1>
          <p className="text-muted-foreground mb-6">El producto que buscas no existe.</p>
          <Button asChild>
            <Link href="/catalog">Ver Catálogo</Link>
          </Button>
        </div>
        <Footer />
      </div>
    )
  }

  const images = product.images?.length > 0 ? product.images : ["/placeholder.svg"]

  return (
    <div className="min-h-screen">
      <PublicHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">
            Inicio
          </Link>
          <span>/</span>
          <Link href="/catalog" className="hover:text-foreground transition-colors">
            Catálogo
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.title}</span>
        </div>

        {/* Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Left Side - Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
              <img
                src={images[selectedImage] || "/placeholder.svg"}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index ? "border-primary" : "border-border hover:border-primary/50"
                      }`}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{product.category}</Badge>
                <Badge variant="outline" className="border-primary/50 text-primary">
                  {product.stock_status}
                </Badge>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-3 text-balance">{product.title}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span>Código: {product.id.slice(0, 8)}</span>
                <span>•</span>
                <span>Marca: {product.brand}</span>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">{product.short_description}</p>
            </div>

            {/* CTA Section */}
            <div className="bg-muted/50 border border-border rounded-lg p-6 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {product.show_price && product.price ? "Precio" : "Cotización"}
                </p>
                <p className="text-2xl font-bold text-primary">
                  {product.show_price && product.price ? `$${product.price}` : "Solicitar Cotización"}
                </p>
              </div>
              <Button size="lg" className="w-full text-base" onClick={() => setShowQuoteModal(true)}>
                <Package2 className="mr-2 h-5 w-5" />
                Solicitar Cotización
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Obtén una cotización personalizada en 24 horas para pedidos al mayoreo
              </p>
            </div>

            {/* Key Features */}
            {product.specs && product.specs.length > 0 && (
              <div className="border border-border rounded-lg p-6">
                <h3 className="font-semibold mb-4">Características Principales</h3>
                <ul className="space-y-3">
                  {product.specs.slice(0, 5).map((spec, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">
                        <span className="font-medium">{spec.key}:</span> {spec.value}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Below the Fold - Tabbed Section */}
        <Tabs defaultValue="description" className="mb-16">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="description">Descripción Completa</TabsTrigger>
            <TabsTrigger value="specifications">Especificaciones Técnicas</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-8">
            <div className="bg-card border border-border rounded-lg p-6 lg:p-8">
              <h2 className="text-2xl font-bold mb-4">Descripción del Producto</h2>
              <p className="text-muted-foreground leading-relaxed">{product.full_description}</p>
            </div>
          </TabsContent>

          <TabsContent value="specifications" className="mt-8">
            <div className="bg-card border border-border rounded-lg p-6 lg:p-8">
              <h2 className="text-2xl font-bold mb-6">Especificaciones Técnicas</h2>
              {product.specs && product.specs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.specs.map((spec, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-4 bg-muted/50 rounded-lg border border-border"
                    >
                      <span className="font-medium">{spec.key}</span>
                      <span className="text-muted-foreground">{spec.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No hay especificaciones disponibles.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Back to Catalog */}
        <div className="text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/catalog">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Volver al Catálogo
            </Link>
          </Button>
        </div>
      </div>

      {/* Footer component */}
      <Footer />

      {/* Request Quote Modal */}
      <RequestQuoteModal
        open={showQuoteModal}
        onOpenChange={setShowQuoteModal}
        product={{
          id: product.id,
          name: product.title,
          brand: product.brand || "",
          category: product.category || "",
          image: images[0],
          specifications: product.specs,
        }}
      />
    </div>
  )
}
