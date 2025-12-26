"use client"

import { useState, useEffect, useTransition, useCallback, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft, GripVertical, Trash2, Type, ImageIcon, Square, Minus,
  Box, Loader2, Save, Undo, Redo, ChevronUp, ChevronDown, Sparkles, Upload, Search, Check
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { getPresetById, type TemplateBlock } from "@/lib/template-presets"
import { createTemplate } from "@/app/actions/templates"
import { getMediaFiles, uploadMedia, type MediaItem } from "@/app/actions/media"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const blockTypes = [
  { type: "heading", label: "Heading", icon: Type },
  { type: "text", label: "Paragraph", icon: Type },
  { type: "image", label: "Image", icon: ImageIcon },
  { type: "button", label: "Button", icon: Square },
  { type: "divider", label: "Divider", icon: Minus },
  { type: "spacer", label: "Spacer", icon: Box },
  { type: "product", label: "Product", icon: Box },
]

export default function TemplateEditorPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const [name, setName] = useState("")
  const [subject, setSubject] = useState("")
  const [blocks, setBlocks] = useState<TemplateBlock[]>([])
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null)
  const [history, setHistory] = useState<TemplateBlock[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null)

  // Media picker state - kept separate to avoid re-renders
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false)
  const [mediaPickerBlockId, setMediaPickerBlockId] = useState<string | null>(null)
  const [mediaFiles, setMediaFiles] = useState<MediaItem[]>([])
  const [mediaLoading, setMediaLoading] = useState(false)
  const [mediaUploading, setMediaUploading] = useState(false)
  const [mediaSearch, setMediaSearch] = useState("")
  const [mediaSelected, setMediaSelected] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const initializedRef = useRef(false)

  // Load preset on mount - only once
  useEffect(() => {
    if (initializedRef.current) return

    const presetId = searchParams.get("preset")
    if (presetId) {
      const preset = getPresetById(presetId)
      if (preset) {
        initializedRef.current = true
        const initialBlocks = preset.blocks.map(b => ({ ...b, id: genId() }))
        setBlocks(initialBlocks)
        setHistory([initialBlocks])
        setHistoryIndex(0)
        setName(preset.name === "Blank Template" ? "" : `${preset.name} Template`)
        setSubject(preset.name === "Blank Template" ? "" : `${preset.name} - Fenix Brokers`)
      }
    }
  }, [searchParams])

  const genId = () => Math.random().toString(36).substring(2, 9)

  // History management
  const saveToHistory = useCallback((newBlocks: TemplateBlock[]) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push(JSON.parse(JSON.stringify(newBlocks)))
      return newHistory.slice(-20)
    })
    setHistoryIndex(prev => Math.min(prev + 1, 19))
  }, [historyIndex])

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setBlocks(JSON.parse(JSON.stringify(history[newIndex])))
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setBlocks(JSON.parse(JSON.stringify(history[newIndex])))
    }
  }

  const addBlock = (type: TemplateBlock["type"]) => {
    const newBlock: TemplateBlock = {
      id: genId(),
      type,
      content: type === "heading" ? "New Heading" : type === "text" ? "Enter your text here..." : undefined,
      level: type === "heading" ? 2 : undefined,
      buttonText: type === "button" ? "Click Here" : undefined,
      buttonUrl: type === "button" ? "#" : undefined,
      src: type === "image" || type === "product" ? "" : undefined,
      alt: type === "image" ? "" : undefined,
    }
    const newBlocks = [...blocks, newBlock]
    setBlocks(newBlocks)
    saveToHistory(newBlocks)
    setSelectedBlock(newBlock.id)
  }

  const updateBlock = (id: string, updates: Partial<TemplateBlock>) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b))
  }

  const updateBlockWithHistory = (id: string, updates: Partial<TemplateBlock>) => {
    const newBlocks = blocks.map(b => b.id === id ? { ...b, ...updates } : b)
    setBlocks(newBlocks)
    saveToHistory(newBlocks)
  }

  const deleteBlock = (id: string) => {
    const newBlocks = blocks.filter(b => b.id !== id)
    setBlocks(newBlocks)
    saveToHistory(newBlocks)
    if (selectedBlock === id) setSelectedBlock(null)
  }

  const moveBlock = (id: string, direction: "up" | "down") => {
    const index = blocks.findIndex(b => b.id === id)
    if ((direction === "up" && index === 0) || (direction === "down" && index === blocks.length - 1)) return

    const newBlocks = [...blocks]
    const swapIndex = direction === "up" ? index - 1 : index + 1
      ;[newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]]
    setBlocks(newBlocks)
    saveToHistory(newBlocks)
  }

  // Drag and drop
  const handleDragStart = (e: React.DragEvent, blockId: string) => {
    setDraggedBlock(blockId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedBlock || draggedBlock === targetId) return

    const dragIndex = blocks.findIndex(b => b.id === draggedBlock)
    const dropIndex = blocks.findIndex(b => b.id === targetId)

    const newBlocks = [...blocks]
    const [removed] = newBlocks.splice(dragIndex, 1)
    newBlocks.splice(dropIndex, 0, removed)

    setBlocks(newBlocks)
    saveToHistory(newBlocks)
    setDraggedBlock(null)
  }

  // Media picker functions
  const openMediaPicker = async (blockId: string) => {
    setMediaPickerBlockId(blockId)
    const block = blocks.find(b => b.id === blockId)
    setMediaSelected(block?.src || null)
    setMediaPickerOpen(true)
    setMediaLoading(true)
    const result = await getMediaFiles()
    if (result.data) {
      setMediaFiles(result.data)
    }
    setMediaLoading(false)
  }

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setMediaUploading(true)
    const formData = new FormData()
    formData.append("file", files[0])

    const result = await uploadMedia(formData)
    if (result.data) {
      setMediaFiles(prev => [result.data!, ...prev])
      setMediaSelected(result.data.url)
      toast({ title: "Image uploaded" })
    } else {
      toast({ title: "Upload failed", description: result.error, variant: "destructive" })
    }

    setMediaUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const confirmMediaSelection = () => {
    if (mediaPickerBlockId && mediaSelected) {
      updateBlockWithHistory(mediaPickerBlockId, { src: mediaSelected })
    }
    setMediaPickerOpen(false)
    setMediaPickerBlockId(null)
    setMediaSelected(null)
    setMediaSearch("")
  }

  const handleSave = () => {
    if (!name || !subject) {
      toast({
        title: "Validation Error",
        description: "Please enter a name and subject.",
        variant: "destructive",
      })
      return
    }

    startTransition(async () => {
      const result = await createTemplate({
        name,
        subject,
        content: blocks,
      })

      if (result.error) {
        toast({ title: "Error", description: result.error, variant: "destructive" })
        return
      }

      toast({ title: "Template saved!" })
      router.push("/admin/marketing")
    })
  }

  const selectedBlockData = blocks.find(b => b.id === selectedBlock)
  const filteredMediaFiles = mediaFiles.filter(f =>
    f.name.toLowerCase().includes(mediaSearch.toLowerCase()) && f.type.startsWith("image/")
  )

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-border bg-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/marketing/templates/new">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-pink-500" />
            <span className="font-bold">Email Editor</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex <= 0}>
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1}>
            <Redo className="h-4 w-4" />
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Template
          </Button>
        </div>
      </header>

      {/* Template Name/Subject Bar */}
      <div className="border-b border-border bg-card px-4 py-2 flex gap-4">
        <div className="flex-1">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Template name..."
            className="h-8"
          />
        </div>
        <div className="flex-1">
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject line..."
            className="h-8"
          />
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex min-h-0">
        {/* Block Palette */}
        <aside className="w-48 border-r border-border bg-card p-3 overflow-y-auto">
          <p className="text-xs font-medium text-muted-foreground mb-3">BLOCKS</p>
          <div className="space-y-1">
            {blockTypes.map((bt) => (
              <Button
                key={bt.type}
                variant="ghost"
                size="sm"
                className="w-full justify-start h-9"
                onClick={() => addBlock(bt.type as TemplateBlock["type"])}
              >
                <bt.icon className="h-4 w-4 mr-2" />
                {bt.label}
              </Button>
            ))}
          </div>
        </aside>

        {/* Canvas */}
        <main className="flex-1 overflow-auto bg-muted/30 p-6">
          <div className="max-w-[600px] mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Email Header */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-6 text-center text-white">
              <span className="text-xl font-bold">✨ Fenix Brokers</span>
            </div>

            {/* Email Content */}
            <div className="p-4 space-y-2">
              {blocks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="mb-2">No blocks yet</p>
                  <p className="text-sm">Add blocks from the left panel</p>
                </div>
              ) : (
                blocks.map((block, index) => (
                  <div
                    key={block.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, block.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, block.id)}
                    onClick={() => setSelectedBlock(block.id)}
                    className={`relative group rounded p-2 cursor-pointer transition-all ${selectedBlock === block.id
                      ? "ring-2 ring-pink-500 bg-pink-50"
                      : "hover:bg-gray-50"
                      } ${draggedBlock === block.id ? "opacity-50" : ""}`}
                  >
                    {/* Block Controls */}
                    <div className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex flex-col gap-0.5">
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); moveBlock(block.id, "up"); }} disabled={index === 0}>
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                      <GripVertical className="h-4 w-4 mx-auto text-muted-foreground cursor-grab" />
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); moveBlock(block.id, "down"); }} disabled={index === blocks.length - 1}>
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Block Content */}
                    {block.type === "heading" && (
                      <div className={`font-bold ${block.level === 1 ? "text-2xl" : block.level === 2 ? "text-xl" : "text-lg"}`}>
                        {block.content || "Heading"}
                      </div>
                    )}
                    {block.type === "text" && (
                      <p className="text-gray-600 whitespace-pre-wrap">{block.content || "Paragraph text..."}</p>
                    )}
                    {block.type === "image" && (
                      <div className="aspect-video bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                        {block.src ? (
                          <img src={block.src} alt={block.alt} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center text-muted-foreground">
                            <ImageIcon className="h-8 w-8 mx-auto mb-1" />
                            <p className="text-xs">Click to add image</p>
                          </div>
                        )}
                      </div>
                    )}
                    {block.type === "button" && (
                      <div className="text-center py-2">
                        <span className="inline-block bg-pink-500 text-white px-6 py-2 rounded font-medium">
                          {block.buttonText || "Button"}
                        </span>
                      </div>
                    )}
                    {block.type === "divider" && <hr className="border-t border-gray-200" />}
                    {block.type === "spacer" && <div className="h-8" />}
                    {block.type === "product" && (
                      <div className="flex gap-4 p-3 bg-gray-50 rounded">
                        <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                          {block.src ? (
                            <img src={block.src} alt={block.content} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Box className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{block.content || "Product Name"}</p>
                          <span className="text-sm text-pink-500">View Product →</span>
                        </div>
                      </div>
                    )}

                    {/* Delete button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 h-6 w-6 text-destructive"
                      onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            {/* Email Footer */}
            <div className="bg-gray-800 p-4 text-center text-gray-400 text-xs">
              © 2025 Fenix Brokers
            </div>
          </div>
        </main>

        {/* Settings Panel */}
        <aside className="w-72 border-l border-border bg-card p-4 overflow-y-auto">
          <p className="text-xs font-medium text-muted-foreground mb-3">SETTINGS</p>
          {selectedBlockData ? (
            <div className="space-y-4">
              <div className="text-sm font-medium capitalize">{selectedBlockData.type} Block</div>

              {selectedBlockData.type === "heading" && (
                <>
                  <div className="space-y-1">
                    <Label className="text-xs">Level</Label>
                    <Select
                      value={selectedBlockData.level?.toString()}
                      onValueChange={(v) => updateBlockWithHistory(selectedBlock!, { level: parseInt(v) })}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">H1 - Large</SelectItem>
                        <SelectItem value="2">H2 - Medium</SelectItem>
                        <SelectItem value="3">H3 - Small</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Text</Label>
                    <Input
                      value={selectedBlockData.content || ""}
                      onChange={(e) => updateBlock(selectedBlock!, { content: e.target.value })}
                      onBlur={() => saveToHistory(blocks)}
                      className="h-8"
                    />
                  </div>
                </>
              )}

              {selectedBlockData.type === "text" && (
                <div className="space-y-1">
                  <Label className="text-xs">Content</Label>
                  <Textarea
                    value={selectedBlockData.content || ""}
                    onChange={(e) => updateBlock(selectedBlock!, { content: e.target.value })}
                    onBlur={() => saveToHistory(blocks)}
                    rows={5}
                  />
                </div>
              )}

              {selectedBlockData.type === "image" && (
                <>
                  {selectedBlockData.src && (
                    <img src={selectedBlockData.src} alt="" className="w-full h-24 object-cover rounded" />
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => openMediaPicker(selectedBlock!)}
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    {selectedBlockData.src ? "Change Image" : "Select Image"}
                  </Button>
                  <div className="space-y-1">
                    <Label className="text-xs">Alt Text</Label>
                    <Input
                      value={selectedBlockData.alt || ""}
                      onChange={(e) => updateBlock(selectedBlock!, { alt: e.target.value })}
                      onBlur={() => saveToHistory(blocks)}
                      className="h-8"
                      placeholder="Image description"
                    />
                  </div>
                </>
              )}

              {selectedBlockData.type === "button" && (
                <>
                  <div className="space-y-1">
                    <Label className="text-xs">Button Text</Label>
                    <Input
                      value={selectedBlockData.buttonText || ""}
                      onChange={(e) => updateBlock(selectedBlock!, { buttonText: e.target.value })}
                      onBlur={() => saveToHistory(blocks)}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Button URL</Label>
                    <Input
                      value={selectedBlockData.buttonUrl || ""}
                      onChange={(e) => updateBlock(selectedBlock!, { buttonUrl: e.target.value })}
                      onBlur={() => saveToHistory(blocks)}
                      className="h-8"
                      placeholder="https://..."
                    />
                  </div>
                </>
              )}

              {selectedBlockData.type === "product" && (
                <>
                  <div className="space-y-1">
                    <Label className="text-xs">Product Name</Label>
                    <Input
                      value={selectedBlockData.content || ""}
                      onChange={(e) => updateBlock(selectedBlock!, { content: e.target.value })}
                      onBlur={() => saveToHistory(blocks)}
                      className="h-8"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => openMediaPicker(selectedBlock!)}
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    {selectedBlockData.src ? "Change Image" : "Select Image"}
                  </Button>
                  <div className="space-y-1">
                    <Label className="text-xs">Product URL</Label>
                    <Input
                      value={selectedBlockData.buttonUrl || ""}
                      onChange={(e) => updateBlock(selectedBlock!, { buttonUrl: e.target.value })}
                      onBlur={() => saveToHistory(blocks)}
                      className="h-8"
                      placeholder="https://..."
                    />
                  </div>
                </>
              )}

              {(selectedBlockData.type === "divider" || selectedBlockData.type === "spacer") && (
                <p className="text-sm text-muted-foreground">
                  No settings for this block.
                </p>
              )}

              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() => deleteBlock(selectedBlock!)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Block
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Click a block to edit
            </p>
          )}
        </aside>
      </div>

      {/* Media Picker Dialog */}
      <Dialog open={mediaPickerOpen} onOpenChange={setMediaPickerOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Select Image</DialogTitle>
            <DialogDescription>Choose from your library or upload new</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="library" className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="library">Library</TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>
            </TabsList>

            <TabsContent value="library" className="flex-1 flex flex-col min-h-0 mt-4">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={mediaSearch}
                  onChange={(e) => setMediaSearch(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <div className="flex-1 overflow-auto">
                {mediaLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : filteredMediaFiles.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>No images</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {filteredMediaFiles.map((file) => (
                      <button
                        key={file.name}
                        type="button"
                        onClick={() => setMediaSelected(file.url)}
                        className={`relative aspect-square rounded overflow-hidden border-2 ${mediaSelected === file.url ? "border-pink-500" : "border-transparent hover:border-gray-300"
                          }`}
                      >
                        <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                        {mediaSelected === file.url && (
                          <div className="absolute inset-0 bg-pink-500/20 flex items-center justify-center">
                            <Check className="h-6 w-6 text-white drop-shadow" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="upload" className="flex-1 flex items-center justify-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleMediaUpload}
              />
              <div className="text-center">
                <div className="w-24 h-24 rounded-lg border-2 border-dashed flex items-center justify-center mx-auto mb-4">
                  {mediaUploading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <Button onClick={() => fileInputRef.current?.click()} disabled={mediaUploading}>
                  {mediaUploading ? "Uploading..." : "Choose File"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between items-center pt-4 border-t mt-4">
            <div className="flex items-center gap-2">
              {mediaSelected && (
                <img src={mediaSelected} alt="" className="h-10 w-10 rounded object-cover" />
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setMediaPickerOpen(false)}>
                Cancel
              </Button>
              <Button onClick={confirmMediaSelection} disabled={!mediaSelected}>
                Select
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
