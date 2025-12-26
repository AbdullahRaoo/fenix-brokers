"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, Type, ImageIcon, Package, Trash2, Search, Save, Minus, LinkIcon } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { BlockType, EmailBlock } from "@/types" // Import BlockType and EmailBlock
import {
  addBlock,
  handleDragStart,
  handleDragEnter,
  handleDragEnd,
  deleteBlock,
  renderBlock,
  updateBlock,
  filteredProducts,
  selectProduct,
} from "@/utils" // Import necessary functions and variables

const blockTemplates = [
  {
    type: "heading" as BlockType,
    name: "Heading",
    icon: Type,
    description: "Add a heading text",
  },
  {
    type: "richtext" as BlockType,
    name: "Rich Text",
    icon: Type,
    description: "Add formatted text content",
  },
  {
    type: "image" as BlockType,
    name: "Image",
    icon: ImageIcon,
    description: "Add an image",
  },
  {
    type: "divider" as BlockType,
    name: "Divider",
    icon: Minus,
    description: "Add a horizontal line",
  },
  {
    type: "social" as BlockType,
    name: "Social Links",
    icon: LinkIcon,
    description: "Add social media icons",
  },
  {
    type: "product" as BlockType,
    name: "Dynamic Product",
    icon: Package,
    description: "Add a product card",
  },
]

export default function TemplateEditorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const layout = searchParams.get("layout") || "blank"

  const [templateName, setTemplateName] = useState("Untitled Template")
  const [blocks, setBlocks] = useState<EmailBlock[]>([
    {
      id: "1",
      type: "heading",
      content: "Welcome to our newsletter!",
    },
  ])
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null)
  const [showProductModal, setShowProductModal] = useState(false)
  const [productSearchQuery, setProductSearchQuery] = useState("")

  const handleSave = () => {
    // Store template data
    const templateData = {
      name: templateName,
      blocks,
      layout,
    }
    localStorage.setItem("emailTemplate", JSON.stringify(templateData))
    router.push("/admin/marketing/templates")
  }

  const selectedBlockData = blocks.find((b) => b.id === selectedBlock)

  return (
    <div className="min-h-screen bg-background">
      {/* Full-page header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/marketing/templates/new">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Exit
              </Link>
            </Button>
            <div className="h-6 w-px bg-border" />
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="max-w-xs font-semibold"
            />
          </div>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Sidebar - Blocks Toolbox */}
        <aside className="w-64 border-r border-border bg-card overflow-y-auto">
          <div className="p-4">
            <h2 className="font-semibold mb-1">Content Blocks</h2>
            <p className="text-xs text-muted-foreground mb-4">Drag blocks onto the canvas</p>
            <div className="space-y-2">
              {blockTemplates.map((template) => (
                <div
                  key={template.type}
                  className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => addBlock(template.type)}
                >
                  <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <template.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{template.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{template.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Center - Email Canvas */}
        <main className="flex-1 overflow-y-auto bg-muted/30 p-8">
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-xl">
              <CardContent className="p-0">
                <div className="bg-white">
                  {/* Email Header */}
                  <div className="bg-slate-900 p-8 text-center">
                    <h1 className="text-2xl font-bold text-white">ProSupply Wholesale</h1>
                    <p className="text-slate-300 text-sm mt-2">Your trusted B2B partner</p>
                  </div>

                  {/* Email Body - Draggable Blocks */}
                  <div className="min-h-[400px]">
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
                            "relative group border-2 border-transparent hover:border-primary/50 transition-colors cursor-pointer",
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
        </main>

        {/* Right Sidebar - Block Properties */}
        <aside className="w-80 border-l border-border bg-card overflow-y-auto">
          <div className="p-4">
            <h2 className="font-semibold mb-1">Styling Properties</h2>
            <p className="text-xs text-muted-foreground mb-4">Edit the selected block</p>
            {selectedBlockData ? (
              <div className="space-y-4">
                {/* Content editing based on block type */}
                {(selectedBlockData.type === "heading" || selectedBlockData.type === "richtext") && (
                  <div className="space-y-2">
                    <Label>Text Content</Label>
                    <textarea
                      className="w-full min-h-[100px] px-3 py-2 border border-border rounded-md bg-background resize-none"
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
                      placeholder="Enter image URL"
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

                {/* Styling properties */}
                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-semibold mb-3">Style Options</h3>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Text Color</Label>
                      <Input type="color" defaultValue="#000000" className="h-10" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Padding (px)</Label>
                      <Input type="number" defaultValue="16" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Font Size (px)</Label>
                      <Input type="number" defaultValue="16" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Text Alignment</Label>
                      <Tabs defaultValue="left" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="left">Left</TabsTrigger>
                          <TabsTrigger value="center">Center</TabsTrigger>
                          <TabsTrigger value="right">Right</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">Select a block to edit its properties</p>
              </div>
            )}
          </div>
        </aside>
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
    </div>
  )
}
