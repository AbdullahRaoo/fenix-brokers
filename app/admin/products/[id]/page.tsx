"use client"

import { use, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, X, ImageIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { MediaLibraryModal } from "@/components/media-library-modal"

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { toast } = useToast()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [brand, setBrand] = useState("")
  const [price, setPrice] = useState("")
  const [stock, setStock] = useState("")
  const [sku, setSku] = useState("")
  const [metaTitle, setMetaTitle] = useState("")
  const [metaDescription, setMetaDescription] = useState("")
  const [urlSlug, setUrlSlug] = useState("")
  const [canonicalUrl, setCanonicalUrl] = useState("")
  const [specifications, setSpecifications] = useState<{ key: string; value: string }[]>([{ key: "", value: "" }])
  const [images, setImages] = useState<string[]>([])
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false)

  useEffect(() => {
    // In production, this would fetch from API
    // For now, we'll use mock data based on ID
    const mockProduct = {
      id: resolvedParams.id,
      title: "Industrial LED Light Panel 60W",
      description:
        "High-efficiency LED panel perfect for warehouses and industrial spaces. Provides bright, even illumination.",
      category: "electronics",
      brand: "LumenTech",
      sku: "LED-60W-001",
      price: "89.99",
      stock: "245",
      metaTitle: "Industrial LED Light Panel 60W - High Efficiency Lighting",
      metaDescription:
        "Premium 60W LED panel for industrial and commercial spaces. Energy-efficient, long-lasting, and provides excellent illumination.",
      urlSlug: "industrial-led-light-panel-60w",
      canonicalUrl: "https://prosupply.com/products/industrial-led-light-panel-60w",
      specifications: [
        { key: "Wattage", value: "60W" },
        { key: "Lumens", value: "6000 lm" },
        { key: "Color Temperature", value: "5000K" },
      ],
      images: ["/industrial-led-panel.jpg"],
    }

    setTitle(mockProduct.title)
    setDescription(mockProduct.description)
    setCategory(mockProduct.category)
    setBrand(mockProduct.brand)
    setSku(mockProduct.sku)
    setPrice(mockProduct.price)
    setStock(mockProduct.stock)
    setMetaTitle(mockProduct.metaTitle)
    setMetaDescription(mockProduct.metaDescription)
    setUrlSlug(mockProduct.urlSlug)
    setCanonicalUrl(mockProduct.canonicalUrl)
    setSpecifications(mockProduct.specifications)
    setImages(mockProduct.images)
  }, [resolvedParams.id])

  const addSpecification = () => {
    setSpecifications([...specifications, { key: "", value: "" }])
  }

  const removeSpecification = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index))
  }

  const updateSpecification = (index: number, field: "key" | "value", value: string) => {
    const updated = [...specifications]
    updated[index][field] = value
    setSpecifications(updated)
  }

  const handleAddImage = (url: string) => {
    setImages([...images, url])
  }

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    if (!title || !category || !brand || !price || !stock || !sku) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Product updated",
      description: "The product has been successfully updated.",
    })

    router.push("/admin/products")
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/admin/products">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mb-2">Edit Product</h1>
        <p className="text-muted-foreground">Update product information and details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - General Info (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Media Gallery */}
          <Card>
            <CardHeader>
              <CardTitle>Media Gallery</CardTitle>
              <CardDescription>Product images and videos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full bg-transparent" onClick={() => setMediaLibraryOpen(true)}>
                <ImageIcon className="h-4 w-4 mr-2" />
                Add from Media Library
              </Button>

              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-4">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-lg overflow-hidden border border-border group"
                    >
                      <img
                        src={img || "/placeholder.svg"}
                        alt={`Product ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveImage(idx)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Specifications</CardTitle>
              <CardDescription>Key-value pairs for product specs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {specifications.map((spec, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Key (e.g., Material)"
                    value={spec.key}
                    onChange={(e) => updateSpecification(index, "key", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Value (e.g., Steel)"
                    value={spec.value}
                    onChange={(e) => updateSpecification(index, "value", e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSpecification(index)}
                    disabled={specifications.length === 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addSpecification} className="w-full bg-transparent">
                <Plus className="h-4 w-4 mr-2" />
                Add Specification
              </Button>
            </CardContent>
          </Card>

          {/* SEO Section */}
          <Card>
            <CardHeader>
              <CardTitle>Search Engine Optimization</CardTitle>
              <CardDescription>Improve your product's discoverability</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meta-title">Meta Title</Label>
                <Input
                  id="meta-title"
                  placeholder="SEO-optimized title (50-60 characters)"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground">{metaTitle.length}/60 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta-description">Meta Description</Label>
                <Textarea
                  id="meta-description"
                  placeholder="Brief description for search engines (150-160 characters)"
                  rows={3}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  maxLength={160}
                />
                <p className="text-xs text-muted-foreground">{metaDescription.length}/160 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="url-slug">URL Slug</Label>
                <Input
                  id="url-slug"
                  placeholder="product-name-here"
                  value={urlSlug}
                  onChange={(e) => setUrlSlug(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="canonical-url">Canonical URL</Label>
                <Input
                  id="canonical-url"
                  placeholder="https://yoursite.com/products/product-name"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Organization (1/3 width) */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
              <CardDescription>Product categorization and pricing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="industrial">Industrial Equipment</SelectItem>
                    <SelectItem value="office">Office Supplies</SelectItem>
                    <SelectItem value="construction">Construction Materials</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">
                  Brand <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="brand"
                  placeholder="e.g., LumenTech"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">
                  SKU <span className="text-destructive">*</span>
                </Label>
                <Input id="sku" placeholder="e.g., LED-60W-001" value={sku} onChange={(e) => setSku(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">
                  Price (USD) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">
                  Stock Quantity <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="stock"
                  type="number"
                  placeholder="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              <Button onClick={handleSave} className="w-full">
                Update Product
              </Button>
              <Button variant="outline" className="w-full bg-transparent" asChild>
                <Link href="/admin/products">Cancel</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <MediaLibraryModal open={mediaLibraryOpen} onOpenChange={setMediaLibraryOpen} onSelect={handleAddImage} />
    </div>
  )
}
