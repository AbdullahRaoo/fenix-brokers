"use client"

import { useState, useEffect, useTransition, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft, GripVertical, Trash2, Plus, Type, ImageIcon, Square, Minus,
  Box, Loader2, Eye, Save, Undo, Redo, ChevronUp, ChevronDown
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { getPresetById, type TemplateBlock } from "@/lib/template-presets"
import { createTemplate } from "@/app/actions/templates"
import { MediaPicker } from "@/components/media-picker"

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
  const [showPreview, setShowPreview] = useState(false)
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null)

  // Load preset on mount
  useEffect(() => {
    const presetId = searchParams.get("preset")
    if (presetId) {
      const preset = getPresetById(presetId)
      if (preset) {
        setBlocks(preset.blocks.map(b => ({ ...b, id: genId() })))
        setName(preset.name === "Blank Template" ? "" : `${preset.name} Template`)
        setSubject(preset.name === "Blank Template" ? "" : `${preset.name} - Fenix Brokers`)
      }
    }
  }, [searchParams])

  const genId = () => Math.random().toString(36).substring(2, 9)

  // History management
  const saveToHistory = useCallback((newBlocks: TemplateBlock[]) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(JSON.parse(JSON.stringify(newBlocks)))
    setHistory(newHistory.slice(-20)) // Keep last 20 states
    setHistoryIndex(newHistory.length - 1)
  }, [history, historyIndex])

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setBlocks(JSON.parse(JSON.stringify(history[historyIndex - 1])))
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setBlocks(JSON.parse(JSON.stringify(history[historyIndex + 1])))
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
    const newBlocks = blocks.map(b => b.id === id ? { ...b, ...updates } : b)
    setBlocks(newBlocks)
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

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/marketing/templates/new">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold">Email Template Editor</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex <= 0}>
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1}>
            <Redo className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? "Edit" : "Preview"}
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Template
          </Button>
        </div>
      </div>

      {/* Template Info */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-1">
          <Label htmlFor="name">Template Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Monthly Newsletter"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="subject">Email Subject</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g., New Products This Month!"
          />
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        {/* Block Palette */}
        <div className="col-span-2">
          <Card className="h-full">
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Blocks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {blockTypes.map((bt) => (
                <Button
                  key={bt.type}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => addBlock(bt.type as TemplateBlock["type"])}
                >
                  <bt.icon className="h-4 w-4 mr-2" />
                  {bt.label}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Canvas */}
        <div className="col-span-7 overflow-auto">
          <div className="bg-muted/50 rounded-lg p-4 min-h-full">
            {/* Email Preview Container */}
            <div className="max-w-[600px] mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Email Header */}
              <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-6 text-center text-white">
                <span className="text-xl font-bold">✨ Fenix Brokers</span>
              </div>

              {/* Email Content */}
              <div className="p-4 space-y-3">
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
                          ? "ring-2 ring-primary bg-primary/5"
                          : "hover:bg-muted/50"
                        } ${draggedBlock === block.id ? "opacity-50" : ""}`}
                    >
                      {/* Block Controls */}
                      <div className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex flex-col gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); moveBlock(block.id, "up"); }} disabled={index === 0}>
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); moveBlock(block.id, "down"); }} disabled={index === blocks.length - 1}>
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
                        <div className="aspect-video bg-muted rounded flex items-center justify-center">
                          {block.src ? (
                            <img src={block.src} alt={block.alt} className="w-full h-full object-cover rounded" />
                          ) : (
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
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
                          <div className="w-16 h-16 bg-muted rounded flex-shrink-0">
                            {block.src ? (
                              <img src={block.src} alt={block.content} className="w-full h-full object-cover rounded" />
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
                        className="absolute -right-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 h-6 w-6 text-destructive"
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
          </div>
        </div>

        {/* Settings Panel */}
        <div className="col-span-3">
          <Card className="h-full">
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Block Settings</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedBlockData ? (
                <div className="space-y-4">
                  <div className="text-xs text-muted-foreground uppercase font-medium">
                    {selectedBlockData.type} Block
                  </div>

                  {selectedBlockData.type === "heading" && (
                    <>
                      <div className="space-y-1">
                        <Label>Level</Label>
                        <Select
                          value={selectedBlockData.level?.toString()}
                          onValueChange={(v) => updateBlockWithHistory(selectedBlock!, { level: parseInt(v) })}
                        >
                          <SelectTrigger>
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
                        <Label>Text</Label>
                        <Input
                          value={selectedBlockData.content || ""}
                          onChange={(e) => updateBlock(selectedBlock!, { content: e.target.value })}
                          onBlur={() => saveToHistory(blocks)}
                        />
                      </div>
                    </>
                  )}

                  {selectedBlockData.type === "text" && (
                    <div className="space-y-1">
                      <Label>Content</Label>
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
                      <div className="space-y-2">
                        <Label>Image</Label>
                        {selectedBlockData.src && (
                          <img src={selectedBlockData.src} alt="" className="w-full h-24 object-cover rounded" />
                        )}
                        <MediaPicker
                          value={selectedBlockData.src}
                          onSelect={(url) => updateBlockWithHistory(selectedBlock!, { src: url })}
                          trigger={
                            <Button variant="outline" size="sm" className="w-full">
                              <ImageIcon className="h-4 w-4 mr-2" />
                              {selectedBlockData.src ? "Change Image" : "Select Image"}
                            </Button>
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Alt Text</Label>
                        <Input
                          value={selectedBlockData.alt || ""}
                          onChange={(e) => updateBlock(selectedBlock!, { alt: e.target.value })}
                          onBlur={() => saveToHistory(blocks)}
                          placeholder="Image description"
                        />
                      </div>
                    </>
                  )}

                  {selectedBlockData.type === "button" && (
                    <>
                      <div className="space-y-1">
                        <Label>Button Text</Label>
                        <Input
                          value={selectedBlockData.buttonText || ""}
                          onChange={(e) => updateBlock(selectedBlock!, { buttonText: e.target.value })}
                          onBlur={() => saveToHistory(blocks)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Button URL</Label>
                        <Input
                          value={selectedBlockData.buttonUrl || ""}
                          onChange={(e) => updateBlock(selectedBlock!, { buttonUrl: e.target.value })}
                          onBlur={() => saveToHistory(blocks)}
                          placeholder="https://..."
                        />
                      </div>
                    </>
                  )}

                  {selectedBlockData.type === "product" && (
                    <>
                      <div className="space-y-1">
                        <Label>Product Name</Label>
                        <Input
                          value={selectedBlockData.content || ""}
                          onChange={(e) => updateBlock(selectedBlock!, { content: e.target.value })}
                          onBlur={() => saveToHistory(blocks)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Product Image</Label>
                        <MediaPicker
                          value={selectedBlockData.src}
                          onSelect={(url) => updateBlockWithHistory(selectedBlock!, { src: url })}
                          trigger={
                            <Button variant="outline" size="sm" className="w-full">
                              <ImageIcon className="h-4 w-4 mr-2" />
                              {selectedBlockData.src ? "Change Image" : "Select Image"}
                            </Button>
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Product URL</Label>
                        <Input
                          value={selectedBlockData.buttonUrl || ""}
                          onChange={(e) => updateBlock(selectedBlock!, { buttonUrl: e.target.value })}
                          onBlur={() => saveToHistory(blocks)}
                          placeholder="https://..."
                        />
                      </div>
                    </>
                  )}

                  {(selectedBlockData.type === "divider" || selectedBlockData.type === "spacer") && (
                    <p className="text-sm text-muted-foreground">
                      No settings for this block type.
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
                  Click a block to edit its settings
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
