"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, Type, ImageIcon, Square, Package, GripVertical, Trash2, Search } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

// Email block types
type BlockType = "text" | "image" | "button" | "spacer" | "product"

interface EmailBlock {
  id: string
  type: BlockType
  content?: string
  imageUrl?: string
  buttonText?: string
  buttonUrl?: string
  spacerHeight?: number
  product?: {
    id: string
    name: string
    image: string
    brand: string
  }
}

const blockTemplates = [
  {
    type: "text" as BlockType,
    name: "Text Block",
    icon: Type,
    description: "Add a paragraph or heading",
  },
  {
    type: "image" as BlockType,
    name: "Image Block",
    icon: ImageIcon,
    description: "Add an image",
  },
  {
    type: "button" as BlockType,
    name: "Button Block",
    icon: Square,
    description: "Add a call-to-action button",
  },
  {
    type: "spacer" as BlockType,
    name: "Spacer",
    icon: GripVertical,
    description: "Add vertical spacing",
  },
  {
    type: "product" as BlockType,
    name: "Product Block",
    icon: Package,
    description: "Add a product card",
  },
]

// Mock product data
const productsData = [
  {
    id: "PROD-001",
    name: "Industrial LED Light Panel 60W",
    brand: "LumenTech",
    category: "Electronics",
    image: "/industrial-led-panel.jpg",
  },
  {
    id: "PROD-002",
    name: "Heavy Duty Power Drill Set",
    brand: "PowerMax",
    category: "Industrial Equipment",
    image: "/power-drill-set.jpg",
  },
  {
    id: "PROD-003",
    name: "Office Chair Ergonomic Pro",
    brand: "ComfortSeating",
    category: "Office Supplies",
    image: "/ergonomic-office-chair.jpg",
  },
  {
    id: "PROD-004",
    name: "Steel Beam 20ft I-Section",
    brand: "SteelCore",
    category: "Construction Materials",
    image: "/steel-i-beam.jpg",
  },
]

export default function EditorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const template = searchParams.get("template") || "blank"

  const [blocks, setBlocks] = useState<EmailBlock[]>([
    {
      id: "1",
      type: "text",
      content: "Welcome to our latest newsletter!",
    },
  ])
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null)
  const [showProductModal, setShowProductModal] = useState(false)
  const [productSearchQuery, setProductSearchQuery] = useState("")
  const dragItem = useRef<number | null>(null)
  const dragOverItem = useRef<number | null>(null)

  const addBlock = (type: BlockType) => {
    const newBlock: EmailBlock = {
      id: Date.now().toString(),
      type,
      content: type === "text" ? "New text block" : undefined,
      imageUrl: type === "image" ? "/email-icon.png" : undefined,
      buttonText: type === "button" ? "Click Here" : undefined,
      buttonUrl: type === "button" ? "#" : undefined,
      spacerHeight: type === "spacer" ? 40 : undefined,
    }

    if (type === "product") {
      setShowProductModal(true)
      // Store the pending block temporarily
      ;(window as any).pendingProductBlock = newBlock
    } else {
      setBlocks([...blocks, newBlock])
      setSelectedBlock(newBlock.id)
    }
  }

  const selectProduct = (product: any) => {
    const pendingBlock = (window as any).pendingProductBlock
    if (pendingBlock) {
      pendingBlock.product = {
        id: product.id,
        name: product.name,
        image: product.image,
        brand: product.brand,
      }
      setBlocks([...blocks, pendingBlock])
      setSelectedBlock(pendingBlock.id)
      ;(window as any).pendingProductBlock = null
    }
    setShowProductModal(false)
    setProductSearchQuery("")
  }

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id))
    if (selectedBlock === id) setSelectedBlock(null)
  }

  const updateBlock = (id: string, updates: Partial<EmailBlock>) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)))
  }

  const handleDragStart = (index: number) => {
    dragItem.current = index
  }

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index
  }

  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null) {
      const newBlocks = [...blocks]
      const draggedItem = newBlocks[dragItem.current]
      newBlocks.splice(dragItem.current, 1)
      newBlocks.splice(dragOverItem.current, 0, draggedItem)
      setBlocks(newBlocks)
    }
    dragItem.current = null
    dragOverItem.current = null
  }

  const handleContinue = () => {
    // Store the email content in sessionStorage for the review page
    sessionStorage.setItem("emailBlocks", JSON.stringify(blocks))
    router.push("/admin/marketing/create/review")
  }

  const filteredProducts = productsData.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearchQuery.toLowerCase()),
  )

  const renderBlock = (block: EmailBlock) => {
    switch (block.type) {
      case "text":
        return (
          <div className="p-4 text-center">
            <p className="text-sm">{block.content}</p>
          </div>
        )
      case "image":
        return (
          <div className="p-4">
            <img src={block.imageUrl || "/placeholder.svg"} alt="Email content" className="w-full h-auto rounded" />
          </div>
        )
      case "button":
        return (
          <div className="p-4 text-center">
            <div className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg text-sm font-semibold">
              {block.buttonText}
            </div>
          </div>
        )
      case "spacer":
        return <div style={{ height: `${block.spacerHeight}px` }} className="bg-transparent" />
      case "product":
        return (
          <div className="p-4">
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              <img
                src={block.product?.image || "/placeholder.svg"}
                alt={block.product?.name}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <p className="text-xs text-gray-500 mb-1">{block.product?.brand}</p>
                <h3 className="font-semibold text-sm mb-3">{block.product?.name}</h3>
                <div className="inline-block bg-indigo-600 text-white px-4 py-2 rounded text-xs font-semibold">
                  View Product
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  const selectedBlockData = blocks.find((b) => b.id === selectedBlock)

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/admin/marketing/create">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mb-2">Design Your Email</h1>
        <p className="text-muted-foreground">Step 2 of 3: Drag and drop blocks to build your email</p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold mb-2">
              ✓
            </div>
            <span className="text-sm font-medium">Template</span>
          </div>
          <div className="h-px w-20 bg-border" />
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold mb-2">
              2
            </div>
            <span className="text-sm font-medium">Design</span>
          </div>
          <div className="h-px w-20 bg-border" />
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-semibold mb-2">
              3
            </div>
            <span className="text-sm text-muted-foreground">Review</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 mb-8">
        {/* Right Sidebar - Toolbox */}
        <div className="col-span-3">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Content Blocks</CardTitle>
              <CardDescription>Drag blocks onto the canvas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {blockTemplates.map((template) => (
                <div
                  key={template.type}
                  className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => addBlock(template.type)}
                >
                  <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                    <template.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{template.name}</p>
                    <p className="text-xs text-muted-foreground">{template.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Center - Email Canvas */}
        <div className="col-span-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Canvas</CardTitle>
              <CardDescription>Live preview of your email</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border rounded-lg bg-muted/30 min-h-[600px]">
                {/* Email Header */}
                <div className="bg-slate-900 p-8 text-center">
                  <h1 className="text-2xl font-bold text-white">ProSupply Wholesale</h1>
                  <p className="text-slate-300 text-sm mt-2">Your trusted B2B partner</p>
                </div>

                {/* Email Body - Draggable Blocks */}
                <div className="bg-white">
                  {blocks.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Drag content blocks here to start building</p>
                    </div>
                  ) : (
                    blocks.map((block, index) => (
                      <div
                        key={block.id}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragEnter={() => handleDragEnter(index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => e.preventDefault()}
                        className={cn(
                          "relative group border-2 border-transparent hover:border-primary/50 transition-colors",
                          selectedBlock === block.id && "border-primary",
                        )}
                        onClick={() => setSelectedBlock(block.id)}
                      >
                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <Button
                            size="icon"
                            variant="destructive"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteBlock(block.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {renderBlock(block)}
                      </div>
                    ))
                  )}
                </div>

                {/* Email Footer */}
                <div className="bg-slate-900 p-6 text-center">
                  <p className="text-slate-300 text-xs">© 2025 ProSupply Wholesale. All rights reserved.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Left Sidebar - Block Properties */}
        <div className="col-span-3">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Block Settings</CardTitle>
              <CardDescription>Edit the selected block</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedBlockData ? (
                <div className="space-y-4">
                  {selectedBlockData.type === "text" && (
                    <div className="space-y-2">
                      <Label>Text Content</Label>
                      <textarea
                        className="w-full min-h-[100px] px-3 py-2 border border-border rounded-md bg-background"
                        value={selectedBlockData.content}
                        onChange={(e) => updateBlock(selectedBlockData.id, { content: e.target.value })}
                      />
                    </div>
                  )}
                  {selectedBlockData.type === "image" && (
                    <div className="space-y-2">
                      <Label>Image URL</Label>
                      <Input
                        value={selectedBlockData.imageUrl}
                        onChange={(e) => updateBlock(selectedBlockData.id, { imageUrl: e.target.value })}
                      />
                    </div>
                  )}
                  {selectedBlockData.type === "button" && (
                    <>
                      <div className="space-y-2">
                        <Label>Button Text</Label>
                        <Input
                          value={selectedBlockData.buttonText}
                          onChange={(e) => updateBlock(selectedBlockData.id, { buttonText: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Button URL</Label>
                        <Input
                          value={selectedBlockData.buttonUrl}
                          onChange={(e) => updateBlock(selectedBlockData.id, { buttonUrl: e.target.value })}
                        />
                      </div>
                    </>
                  )}
                  {selectedBlockData.type === "spacer" && (
                    <div className="space-y-2">
                      <Label>Height (px)</Label>
                      <Input
                        type="number"
                        value={selectedBlockData.spacerHeight}
                        onChange={(e) =>
                          updateBlock(selectedBlockData.id, { spacerHeight: Number.parseInt(e.target.value) })
                        }
                      />
                    </div>
                  )}
                  {selectedBlockData.type === "product" && selectedBlockData.product && (
                    <div className="space-y-2">
                      <Label>Selected Product</Label>
                      <div className="border border-border rounded-lg p-3">
                        <div className="flex gap-3">
                          <img
                            src={selectedBlockData.product.image || "/placeholder.svg"}
                            alt={selectedBlockData.product.name}
                            className="w-16 h-16 rounded object-cover"
                          />
                          <div>
                            <p className="text-sm font-medium">{selectedBlockData.product.name}</p>
                            <p className="text-xs text-muted-foreground">{selectedBlockData.product.brand}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-3 bg-transparent"
                          onClick={() => setShowProductModal(true)}
                        >
                          Change Product
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">Select a block to edit its properties</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Product Selection Modal */}
      <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select a Product</DialogTitle>
            <DialogDescription>Choose a product to add to your email</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 p-3 border border-border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => selectProduct(product)}
                >
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-16 h-16 rounded object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.brand}</p>
                    <p className="text-xs text-muted-foreground mt-1">{product.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link href="/admin/marketing/create">Back</Link>
        </Button>
        <Button onClick={handleContinue} size="lg">
          Continue to Review
        </Button>
      </div>
    </div>
  )
}
