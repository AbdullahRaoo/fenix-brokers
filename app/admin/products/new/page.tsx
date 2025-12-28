"use client"

import { useState, useTransition, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, X, Loader2, Image as ImageIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { createProduct } from "@/app/actions/products"
import { getCategoryNames } from "@/app/actions/categories"
import { MediaPicker } from "@/components/media-picker"

export default function NewProductPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const [title, setTitle] = useState("")
  const [shortDescription, setShortDescription] = useState("")
  const [fullDescription, setFullDescription] = useState("")
  const [category, setCategory] = useState("")
  const [brand, setBrand] = useState("")
  const [price, setPrice] = useState("")
  const [showPrice, setShowPrice] = useState(false)
  const [stockStatus, setStockStatus] = useState("In Stock")
  const [metaTitle, setMetaTitle] = useState("")
  const [metaDescription, setMetaDescription] = useState("")
  const [specifications, setSpecifications] = useState<{ key: string; value: string }[]>([{ key: "", value: "" }])
  const [imageUrl, setImageUrl] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])

  // Load categories from database
  useEffect(() => {
    async function loadCategories() {
      const result = await getCategoryNames()
      if (result.data) {
        setCategories(result.data)
      }
    }
    loadCategories()
  }, [])

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
    // Validation
    if (!title || !category || !brand) {
      toast({
        title: "Validation Error",
        description: "Please fill in Title, Category, and Brand.",
        variant: "destructive",
      })
      return
    }

    startTransition(async () => {
      const result = await createProduct({
        title,
        brand,
        category,
        price: price ? parseFloat(price) : undefined,
        short_description: shortDescription || undefined,
        full_description: fullDescription || undefined,
        specs: specifications.filter(s => s.key && s.value),
        seo_metadata: {
          meta_title: metaTitle || undefined,
          meta_description: metaDescription || undefined,
        },
        images: images.length > 0 ? images : undefined,
        stock_status: stockStatus,
        show_price: showPrice,
      })

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Product created",
        description: "The product has been successfully added to your catalog.",
      })

      router.push("/admin/products")
    })
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
        <h1 className="text-3xl font-bold mb-2">Add New Product</h1>
        <p className="text-muted-foreground">Create a new product in your catalog</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - General Info (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information */}
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>Basic product details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Product Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Luxury Oud Collection 100ml"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="short-description">Short Description</Label>
                <Textarea
                  id="short-description"
                  placeholder="Brief product summary shown in listings..."
                  rows={3}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="full-description">Full Description</Label>
                <Textarea
                  id="full-description"
                  placeholder="Detailed product description for the product page..."
                  rows={6}
                  value={fullDescription}
                  onChange={(e) => setFullDescription(e.target.value)}
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Media Gallery */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>Add image URLs for this product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <MediaPicker
                onSelect={handleAddImage}
                trigger={
                  <Button type="button" variant="outline" className="w-full">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Add Image from Library
                  </Button>
                }
              />

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
              <CardTitle>Product Specifications</CardTitle>
              <CardDescription>Key-value pairs for product specs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {specifications.map((spec, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Key (e.g., Volume)"
                    value={spec.key}
                    onChange={(e) => updateSpecification(index, "key", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Value (e.g., 100ml)"
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
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length === 0 ? (
                      <SelectItem value="" disabled>No categories - create one first</SelectItem>
                    ) : (
                      categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">
                  Brand <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="brand"
                  placeholder="e.g., Arabian Essence"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (USD)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
                <div>
                  <Label htmlFor="show-price" className="font-medium">Show Price</Label>
                  <p className="text-xs text-muted-foreground">Display price publicly or show "Request Quote"</p>
                </div>
                <Switch
                  id="show-price"
                  checked={showPrice}
                  onCheckedChange={setShowPrice}
                  aria-label="Toggle price visibility"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock-status">Stock Status</Label>
                <Select value={stockStatus} onValueChange={setStockStatus}>
                  <SelectTrigger id="stock-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="In Stock">In Stock</SelectItem>
                    <SelectItem value="Low Stock">Low Stock</SelectItem>
                    <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                    <SelectItem value="Pre-Order">Pre-Order</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              <Button onClick={handleSave} className="w-full" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Save Product"
                )}
              </Button>
              <Button variant="outline" className="w-full bg-transparent" asChild>
                <Link href="/admin/products">Cancel</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
