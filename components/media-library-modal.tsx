"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Search, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface MediaLibraryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (url: string) => void
  allowMultiple?: boolean
}

// Mock media library images
const LIBRARY_IMAGES = [
  "/industrial-led-panel.jpg",
  "/power-drill-set.jpg",
  "/ergonomic-office-chair.jpg",
  "/steel-i-beam.jpg",
  "/commercial-coffee-maker.jpg",
  "/warehouse-shelving-unit.jpg",
  "/security-camera-system.jpg",
  "/electronics-wholesale.jpg",
  "/industrial-machinery.jpg",
  "/office-supplies-bulk.jpg",
  "/construction-materials-variety.png",
  "/industrial-safety-gear.jpg",
  "/packaging-supplies-boxes.jpg",
]

export function MediaLibraryModal({ open, onOpenChange, onSelect, allowMultiple = false }: MediaLibraryModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedImages, setSelectedImages] = useState<string[]>([])

  const filteredImages = LIBRARY_IMAGES.filter((img) => img.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleSelectImage = (url: string) => {
    if (allowMultiple) {
      setSelectedImages((prev) => (prev.includes(url) ? prev.filter((img) => img !== url) : [...prev, url]))
    } else {
      onSelect(url)
      onOpenChange(false)
    }
  }

  const handleInsertSelected = () => {
    if (selectedImages.length > 0) {
      // For multiple selection, you might want to pass an array
      // For now, we'll just insert the first one
      onSelect(selectedImages[0])
      setSelectedImages([])
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Media Library</DialogTitle>
          <DialogDescription>Select an image from your media library or upload a new one</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="library" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library">Media Library</TabsTrigger>
            <TabsTrigger value="upload">Upload New</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-4 gap-3 max-h-[400px] overflow-y-auto p-1">
              {filteredImages.map((img, idx) => {
                const isSelected = selectedImages.includes(img)
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectImage(img)}
                    className={cn(
                      "relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105",
                      isSelected ? "border-primary ring-2 ring-primary" : "border-border",
                    )}
                  >
                    <img
                      src={img || "/placeholder.svg"}
                      alt={`Media ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-5 w-5 text-primary-foreground" />
                        </div>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {allowMultiple && selectedImages.length > 0 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-muted-foreground">{selectedImages.length} image(s) selected</p>
                <Button onClick={handleInsertSelected}>Insert Selected</Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">Drag and drop images here, or click to browse</p>
              <p className="text-xs text-muted-foreground mb-4">Supports: JPG, PNG, WEBP (Max 5MB each)</p>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Browse Files
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
