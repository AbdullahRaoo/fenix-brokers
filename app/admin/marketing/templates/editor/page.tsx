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
  Box, Loader2, Save, Undo, Redo, ChevronUp, ChevronDown, Sparkles, Upload, Search, Check, Eye, Layers, X, ChevronRight
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { getPresetById, type TemplateBlock } from "@/lib/template-presets"
import { createTemplate, getTemplateById, updateTemplate, generatePreviewHtml } from "@/app/actions/templates"
import { getMediaFiles, uploadMedia, deleteMedia, type MediaItem } from "@/app/actions/media"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RichTextEditor } from "@/components/rich-text-editor"

const blockTypes = [
  { type: "section", label: "Sección", icon: Box },
  { type: "columns", label: "Columnas", icon: Box },
  { type: "logo", label: "Logo", icon: Box },
  { type: "heading", label: "Encabezado", icon: Type },
  { type: "text", label: "Párrafo", icon: Type },
  { type: "image", label: "Imagen", icon: ImageIcon },
  { type: "button", label: "Botón", icon: Square },
  { type: "divider", label: "Divisor", icon: Minus },
  { type: "spacer", label: "Espaciador", icon: Box },
  { type: "product", label: "Producto", icon: Box },
  { type: "footer", label: "Pie", icon: Box },
]

// Social media platforms
const socialPlatforms = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'custom', label: 'Custom' },
]

// Brand colors for quick selection
const brandColors = [
  { value: '#00bed6', label: 'Brand Cyan' },
  { value: '#0a0a0a', label: 'Dark' },
  { value: '#ffffff', label: 'White' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#f8fafc', label: 'Light Gray' },
  { value: '#1a1a1a', label: 'Text Dark' },
  { value: '#6b7280', label: 'Text Gray' },
]

// Outlook-approved web-safe fonts for email
const emailFonts = [
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Helvetica, Arial, sans-serif', label: 'Helvetica' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Trebuchet MS, sans-serif', label: 'Trebuchet MS' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Tahoma, sans-serif', label: 'Tahoma' },
  { value: 'Courier New, monospace', label: 'Courier New' },
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
  const [templateId, setTemplateId] = useState<string | null>(null)
  const [showStructure, setShowStructure] = useState(false)
  // Nested element selection: { parentId, type: 'section' | 'column', columnIndex?, itemIndex }
  const [selectedNested, setSelectedNested] = useState<{
    parentId: string
    type: 'section' | 'column'
    columnIndex?: number
    itemIndex: number
  } | null>(null)
  // Structure panel position for dragging
  const [structurePos, setStructurePos] = useState({ x: 16, y: 80 })

  // Media picker state - kept separate to avoid re-renders
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false)
  const [mediaPickerBlockId, setMediaPickerBlockId] = useState<string | null>(null)
  const [mediaFiles, setMediaFiles] = useState<MediaItem[]>([])
  const [mediaLoading, setMediaLoading] = useState(false)
  const [mediaUploading, setMediaUploading] = useState(false)
  const [mediaSearch, setMediaSearch] = useState("")
  const [mediaSelected, setMediaSelected] = useState<string | null>(null)
  const [mediaPickerIsNested, setMediaPickerIsNested] = useState(false)
  const [deletingMediaId, setDeletingMediaId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const initializedRef = useRef(false)

  // Preview dialog state
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewHtml, setPreviewHtml] = useState("")

  // Load preset or existing template on mount - only once
  useEffect(() => {
    if (initializedRef.current) return

    const loadContent = async () => {
      // Check if we're editing an existing template
      const id = searchParams.get("id")
      if (id) {
        initializedRef.current = true
        const result = await getTemplateById(id)
        if (result.data) {
          setTemplateId(id)
          setName(result.data.name)
          setSubject(result.data.subject)
          const templateBlocks = (result.data.content as TemplateBlock[]).map(b => ({
            ...b,
            id: b.id || genId()
          }))
          setBlocks(templateBlocks)
          setHistory([templateBlocks])
          setHistoryIndex(0)
        }
        return
      }

      // Otherwise load preset
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
    }

    loadContent()
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

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          redo()
        } else {
          undo()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [historyIndex, history])

  // Create a new block with defaults based on type
  const createBlockFromType = (type: TemplateBlock["type"]): TemplateBlock => ({
    id: genId(),
    type,
    content: type === "heading" ? "Nuevo Encabezado" : type === "text" ? "Ingresa tu texto aquí..." : undefined,
    level: type === "heading" ? 2 : undefined,
    buttonText: type === "button" ? "Haz clic aquí" : undefined,
    buttonUrl: type === "button" ? "#" : undefined,
    src: type === "image" || type === "product" ? "" : type === "logo" ? "/logos/PNG/logo-fenix-brokers-1.png" : undefined,
    alt: type === "image" ? "" : type === "logo" ? "Fenix Brokers" : undefined,
    textAlign: type === "logo" || type === "footer" ? "center" : undefined,
    backgroundColor: type === "logo" ? "#0a0a0a" : type === "footer" ? "#f8fafc" : type === "section" ? "#f8fafc" : type === "columns" ? "#ffffff" : undefined,
    padding: type === "logo" ? 20 : type === "footer" ? 20 : type === "section" ? 25 : type === "columns" ? 15 : undefined,
    socialLinks: type === "footer" ? [
      { platform: 'instagram' as const, url: 'https://instagram.com/fenixbrokers' },
      { platform: 'linkedin' as const, url: 'https://linkedin.com/company/fenixbrokers' }
    ] : undefined,
    companyName: type === "footer" ? "Fenix Brokers" : undefined,
    address: type === "footer" ? "35004 Las Palmas de GC, Spain" : undefined,
    unsubscribeText: type === "footer" ? "Darse de baja" : undefined,
    textColor: type === "footer" ? "#6b7280" : undefined,
    children: type === "section" ? [] : undefined,
    columns: type === "columns" ? [[], []] : undefined,
  })

  const addBlock = (type: TemplateBlock["type"]) => {
    const newBlock = createBlockFromType(type)
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

  // Update nested element inside section or column
  const updateNestedElement = (updates: Partial<TemplateBlock>) => {
    if (!selectedNested) return
    const { parentId, type, columnIndex, itemIndex } = selectedNested

    const newBlocks = blocks.map(block => {
      if (block.id !== parentId) return block

      if (type === 'section' && block.children) {
        const newChildren = block.children.map((child, i) =>
          i === itemIndex ? { ...child, ...updates } : child
        )
        return { ...block, children: newChildren }
      }

      if (type === 'column' && block.columns && columnIndex !== undefined) {
        const newColumns = block.columns.map((col, ci) =>
          ci === columnIndex
            ? col.map((item, i) => i === itemIndex ? { ...item, ...updates } : item)
            : col
        )
        return { ...block, columns: newColumns }
      }

      return block
    })

    setBlocks(newBlocks)
    saveToHistory(newBlocks)
  }

  // Get currently selected nested element data
  const getSelectedNestedData = (): TemplateBlock | null => {
    if (!selectedNested) return null
    const { parentId, type, columnIndex, itemIndex } = selectedNested
    const parent = blocks.find(b => b.id === parentId)
    if (!parent) return null

    if (type === 'section' && parent.children) {
      return parent.children[itemIndex] || null
    }
    if (type === 'column' && parent.columns && columnIndex !== undefined) {
      return parent.columns[columnIndex]?.[itemIndex] || null
    }
    return null
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

  // Move nested element within a section or column
  const moveNestedElement = (parentId: string, parentType: 'section' | 'column', columnIndex: number | undefined, itemIndex: number, direction: 'up' | 'down') => {
    const newBlocks = blocks.map(block => {
      if (block.id !== parentId) return block

      if (parentType === 'section' && block.children) {
        const children = [...block.children]
        const swapIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1
        if (swapIndex < 0 || swapIndex >= children.length) return block
          ;[children[itemIndex], children[swapIndex]] = [children[swapIndex], children[itemIndex]]
        return { ...block, children }
      }

      if (parentType === 'column' && block.columns && columnIndex !== undefined) {
        const newColumns = block.columns.map((col, ci) => {
          if (ci !== columnIndex) return col
          const colArr = [...col]
          const swapIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1
          if (swapIndex < 0 || swapIndex >= colArr.length) return col
            ;[colArr[itemIndex], colArr[swapIndex]] = [colArr[swapIndex], colArr[itemIndex]]
          return colArr
        })
        return { ...block, columns: newColumns }
      }

      return block
    })

    setBlocks(newBlocks)
    saveToHistory(newBlocks)

    // Update selection to follow the moved element
    if (selectedNested?.parentId === parentId && selectedNested?.itemIndex === itemIndex) {
      const newIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1
      setSelectedNested({ ...selectedNested, itemIndex: newIndex })
    }
  }

  // Swap columns within a columns block (left  right)
  const swapColumns = (blockId: string, colIndex: number, direction: 'left' | 'right') => {
    const newBlocks = blocks.map(block => {
      if (block.id !== blockId || !block.columns) return block
      const cols = [...block.columns]
      const swapIndex = direction === 'left' ? colIndex - 1 : colIndex + 1
      if (swapIndex < 0 || swapIndex >= cols.length) return block
        ;[cols[colIndex], cols[swapIndex]] = [cols[swapIndex], cols[colIndex]]
      return { ...block, columns: cols }
    })
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

  // Drop into a section's children
  const handleDropIntoSection = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault()
    e.stopPropagation()

    // Check if this is a new block from sidebar
    const blockType = e.dataTransfer.getData('blockType')
    if (blockType) {
      // Don't allow dropping sections/columns/footer into sections
      if (blockType === 'section' || blockType === 'columns' || blockType === 'footer') return

      const newBlock = createBlockFromType(blockType as TemplateBlock["type"])
      const newBlocks = blocks.map(b =>
        b.id === sectionId
          ? { ...b, children: [...(b.children || []), newBlock] }
          : b
      )
      setBlocks(newBlocks)
      saveToHistory(newBlocks)
      return
    }

    // Existing block drag
    if (!draggedBlock) return
    const draggedBlockData = blocks.find(b => b.id === draggedBlock)
    if (!draggedBlockData) return

    // Don't allow dropping sections/columns into sections
    if (draggedBlockData.type === 'section' || draggedBlockData.type === 'columns' || draggedBlockData.type === 'footer') return

    // Remove block from main blocks array
    const newBlocks = blocks.filter(b => b.id !== draggedBlock)

    // Add to section's children
    const sectionIndex = newBlocks.findIndex(b => b.id === sectionId)
    if (sectionIndex !== -1) {
      const section = newBlocks[sectionIndex]
      newBlocks[sectionIndex] = {
        ...section,
        children: [...(section.children || []), { ...draggedBlockData }]
      }
    }

    setBlocks(newBlocks)
    saveToHistory(newBlocks)
    setDraggedBlock(null)
  }

  // Drop into a column
  const handleDropIntoColumn = (e: React.DragEvent, columnsBlockId: string, columnIndex: number) => {
    e.preventDefault()
    e.stopPropagation()

    // Check if this is a new block from sidebar
    const blockType = e.dataTransfer.getData('blockType')
    if (blockType) {
      // Don't allow dropping sections/columns/footer into columns
      if (blockType === 'section' || blockType === 'columns' || blockType === 'footer') return

      const newBlock = createBlockFromType(blockType as TemplateBlock["type"])
      const newBlocks = blocks.map(b => {
        if (b.id === columnsBlockId) {
          const newColumns = [...(b.columns || [[], []])]
          newColumns[columnIndex] = [...newColumns[columnIndex], newBlock]
          return { ...b, columns: newColumns }
        }
        return b
      })
      setBlocks(newBlocks)
      saveToHistory(newBlocks)
      return
    }

    // Existing block drag
    if (!draggedBlock) return

    const draggedBlockData = blocks.find(b => b.id === draggedBlock)
    if (!draggedBlockData) return

    // Don't allow dropping sections/columns/footer into columns
    if (draggedBlockData.type === 'section' || draggedBlockData.type === 'columns' || draggedBlockData.type === 'footer') return

    // Remove block from main blocks array
    const newBlocks = blocks.filter(b => b.id !== draggedBlock)

    // Add to column
    const colsIndex = newBlocks.findIndex(b => b.id === columnsBlockId)
    if (colsIndex !== -1) {
      const colsBlock = newBlocks[colsIndex]
      const newColumns = [...(colsBlock.columns || [[], []])]
      newColumns[columnIndex] = [...newColumns[columnIndex], { ...draggedBlockData }]
      newBlocks[colsIndex] = { ...colsBlock, columns: newColumns }
    }

    setBlocks(newBlocks)
    saveToHistory(newBlocks)
    setDraggedBlock(null)
  }

  // Media picker functions
  const openMediaPicker = async (blockId: string) => {
    setMediaPickerBlockId(blockId)

    // Check if this is for a nested element
    if (blockId === 'nested' && selectedNested) {
      setMediaPickerIsNested(true)
      const nestedData = getSelectedNestedData()
      setMediaSelected(nestedData?.src || null)
    } else {
      setMediaPickerIsNested(false)
      const block = blocks.find(b => b.id === blockId)
      setMediaSelected(block?.src || null)
    }

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
    const fileArray = Array.from(files)
    let successCount = 0
    const rejectedFiles: string[] = []

    // Process files in batches of 3
    const BATCH_SIZE = 3
    for (let i = 0; i < fileArray.length; i += BATCH_SIZE) {
      const batch = fileArray.slice(i, i + BATCH_SIZE)

      await Promise.all(batch.map(async (file) => {
        // Enforce 4MB hard limit
        if (file.size > 4 * 1024 * 1024) {
          rejectedFiles.push(file.name)
          return
        }

        try {
          const formData = new FormData()
          formData.append("file", file)

          const result = await uploadMedia(formData)
          if (result.data) {
            setMediaFiles(prev => [result.data!, ...prev])
            if (!mediaSelected) {
              setMediaSelected(result.data.url)
            }
            successCount++
          } else {
            console.error(`Failed to upload ${file.name}:`, result.error)
            toast({ title: `Upload failed: ${file.name}`, description: result.error, variant: "destructive" })
          }
        } catch (err) {
          console.error(`Exception uploading ${file.name}:`, err)
          toast({ title: `Upload error: ${file.name}`, description: "Unexpected error", variant: "destructive" })
        }
      }))
    }

    if (successCount > 0) {
      toast({ title: `Uploaded ${successCount} images` })
    }

    if (rejectedFiles.length > 0) {
      toast({
        title: `${rejectedFiles.length} archivo(s) rechazado(s) (>4MB)`,
        description: rejectedFiles.join(", "),
        variant: "destructive",
        duration: 10000
      })
    }

    setMediaUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const confirmMediaSelection = () => {
    if (mediaSelected) {
      if (mediaPickerIsNested && selectedNested) {
        // Update nested element inside section or column
        updateNestedElement({ src: mediaSelected })
      } else if (mediaPickerBlockId) {
        // Update regular top-level block
        updateBlockWithHistory(mediaPickerBlockId, { src: mediaSelected })
      }
    }
    setMediaPickerOpen(false)
    setMediaPickerBlockId(null)
    setMediaSelected(null)
    setMediaSearch("")
    setMediaPickerIsNested(false)
  }

  const handleSave = () => {
    if (!name || !subject) {
      toast({
        title: "Error de Validación",
        description: "Por favor ingresa un nombre y asunto.",
        variant: "destructive",
      })
      return
    }

    startTransition(async () => {
      let result

      if (templateId) {
        // Update existing template
        result = await updateTemplate(templateId, {
          name,
          subject,
          content: blocks,
        })
      } else {
        // Create new template
        result = await createTemplate({
          name,
          subject,
          content: blocks,
        })
      }

      if (result.error) {
        toast({ title: "Error", description: result.error, variant: "destructive" })
        return
      }

      toast({ title: templateId ? "¡Plantilla actualizada!" : "¡Plantilla guardada!" })
      router.push("/admin/marketing")
    })
  }

  const selectedBlockData = blocks.find(b => b.id === selectedBlock)
  const filteredMediaFiles = mediaFiles.filter(f =>
    f.display_name.toLowerCase().includes(mediaSearch.toLowerCase()) && (f.mime_type?.startsWith("image/") ?? false)
  )

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-border bg-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/marketing/templates/new">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-pink-500" />
            <span className="font-bold">Editor de Email</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex <= 0}>
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1}>
            <Redo className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              const result = await generatePreviewHtml(blocks, name || "Vista Previa de Email")
              if (result.html) {
                setPreviewHtml(result.html)
                setPreviewOpen(true)
              } else {
                toast({ title: "Error", description: result.error || "Error al generar vista previa", variant: "destructive" })
              }
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            Vista Previa
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Guardar Plantilla
          </Button>
        </div>
      </header>

      {/* Template Name/Subject Bar */}
      <div className="border-b border-border bg-card px-4 py-2 flex gap-4">
        <div className="flex-1">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre de la plantilla..."
            className="h-8"
          />
        </div>
        <div className="flex-1">
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Asunto del email..."
            className="h-8"
          />
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex min-h-0">
        {/* Block Palette */}
        <aside className="w-48 border-r border-border bg-card p-3 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-muted-foreground">BLOQUES</p>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setShowStructure(!showStructure)}
              title="Alternar Panel de Estructura"
            >
              <Layers className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="space-y-1">
            {blockTypes.map((bt) => (
              <div
                key={bt.type}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('blockType', bt.type)
                  e.dataTransfer.effectAllowed = 'copy'
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted cursor-grab active:cursor-grabbing transition-colors"
              >
                <bt.icon className="h-4 w-4 text-muted-foreground" />
                <span>{bt.label}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Canvas */}
        <main className="flex-1 overflow-auto bg-muted/30 p-6">
          <div
            className="max-w-[600px] mx-auto bg-white rounded-lg shadow-lg overflow-hidden"
            onDragOver={(e) => {
              e.preventDefault()
              e.dataTransfer.dropEffect = 'copy'
            }}
            onDrop={(e) => {
              const blockType = e.dataTransfer.getData('blockType')
              if (blockType) {
                addBlock(blockType as TemplateBlock["type"])
              }
            }}
          >
            {/* Email Content */}
            <div className="p-4 space-y-2 min-h-[200px]">
              {blocks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-gray-200 rounded-lg">
                  <p className="mb-2">Suelta bloques aquí</p>
                  <p className="text-sm">o arrastra desde el panel izquierdo</p>
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
                      <div
                        className={`font-bold ${block.level === 1 ? "text-2xl" : block.level === 2 ? "text-xl" : "text-lg"}`}
                        style={{ color: block.textColor || '#1a1a1a', fontFamily: block.fontFamily || 'Arial, sans-serif' }}
                        dangerouslySetInnerHTML={{ __html: block.content || "Encabezado" }}
                      />
                    )}
                    {block.type === "text" && (
                      <div
                        className="prose prose-sm max-w-none"
                        style={{ color: block.textColor || '#6b7280', fontFamily: block.fontFamily || 'Arial, sans-serif', textAlign: block.textAlign || 'left' }}
                        dangerouslySetInnerHTML={{ __html: block.content || "Texto del párrafo..." }}
                      />
                    )}
                    {block.type === "image" && (
                      <div
                        className={`bg-gray-100 rounded flex overflow-hidden p-2 ${block.textAlign === 'left' ? 'justify-start' :
                          block.textAlign === 'right' ? 'justify-end' : 'justify-center'
                          }`}
                      >
                        {block.src ? (
                          <img
                            src={block.src}
                            alt={block.alt}
                            style={{
                              width: `${block.fontSize || 100}%`,
                              maxWidth: '100%',
                              borderRadius: `${block.borderRadius || 0}px`,
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <div className="text-center text-muted-foreground py-8 w-full">
                            <ImageIcon className="h-8 w-8 mx-auto mb-1" />
                            <p className="text-xs">Clic para agregar imagen</p>
                          </div>
                        )}
                      </div>
                    )}
                    {block.type === "button" && (
                      <div className={`py-2 flex ${block.textAlign === 'left' ? 'justify-start' :
                        block.textAlign === 'right' ? 'justify-end' : 'justify-center'
                        }`}>
                        <span
                          className="inline-block px-6 py-2 rounded font-medium"
                          style={{
                            backgroundColor: block.buttonColor || '#00bed6',
                            color: block.buttonTextColor || '#ffffff',
                            fontFamily: block.fontFamily || 'Arial, sans-serif'
                          }}
                        >
                          {block.buttonText || "Botón"}
                        </span>
                      </div>
                    )}
                    {block.type === "divider" && (
                      <hr style={{ borderColor: block.borderColor || '#e5e5e5' }} />
                    )}
                    {block.type === "spacer" && <div style={{ height: block.padding || 30 }} />}
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
                          <p className="font-medium">{block.content || "Nombre del Producto"}</p>
                          <span style={{ color: block.buttonColor || '#00bed6' }} className="text-sm">Ver Producto →</span>
                        </div>
                      </div>
                    )}
                    {block.type === "logo" && (
                      <div
                        className="-mx-4"
                        style={{
                          backgroundColor: block.backgroundColor || '#ffffff',
                          textAlign: block.textAlign || 'center',
                          paddingTop: block.paddingTop ?? 25,
                          paddingRight: block.paddingRight ?? 0,
                          paddingBottom: block.paddingBottom ?? 25,
                          paddingLeft: block.paddingLeft ?? 0
                        }}
                      >
                        {block.src ? (
                          <img
                            src={block.src}
                            alt={block.alt}
                            style={{
                              height: block.fontSize || 50,
                              borderRadius: block.borderRadius ?? 5,
                              display: 'inline-block'
                            }}
                          />
                        ) : (
                          <span className="text-white font-bold">Logo</span>
                        )}
                      </div>
                    )}
                    {block.type === "section" && (
                      <div
                        className={`-mx-4 py-4 px-4 transition-all relative ${draggedBlock ? 'ring-2 ring-cyan-500 ring-inset' : ''
                          }`}
                        style={{ backgroundColor: block.backgroundColor || '#f8fafc', padding: block.padding || 20 }}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDropIntoSection(e, block.id)}
                      >
                        {/* Internal move controls */}
                        <div className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 rounded px-1 py-0.5 shadow-sm">
                          <span className="text-[10px] text-muted-foreground mr-1">Section</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'up'); }}
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'down'); }}
                            disabled={index === blocks.length - 1}
                          >
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </div>
                        {block.children && block.children.length > 0 ? (
                          <div className="space-y-2">
                            {block.children.map((child, i) => {
                              const isSelected = selectedNested?.parentId === block.id && selectedNested?.type === 'section' && selectedNested?.itemIndex === i
                              return (
                                <div
                                  key={i}
                                  className={`relative p-2 rounded cursor-pointer transition-all ${isSelected ? 'ring-2 ring-pink-500 bg-pink-50/50' : 'hover:ring-1 hover:ring-gray-300'
                                    }`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedBlock(null)
                                    setSelectedNested({ parentId: block.id, type: 'section', itemIndex: i })
                                  }}
                                >
                                  {/* Render actual visual content based on type */}
                                  {child.type === 'heading' && (() => {
                                    const levelClass = child.level === 1 ? 'text-2xl' : child.level === 3 ? 'text-base' : 'text-lg'
                                    const HeadingTag = child.level === 1 ? 'h1' : child.level === 3 ? 'h3' : 'h2'
                                    return (
                                      <HeadingTag
                                        style={{ color: child.textColor || '#1a1a1a', textAlign: child.textAlign, fontFamily: child.fontFamily }}
                                        className={`font-semibold ${levelClass}`}
                                        dangerouslySetInnerHTML={{ __html: child.content || 'Heading' }}
                                      />
                                    )
                                  })()}
                                  {child.type === 'text' && (
                                    <div
                                      style={{ color: child.textColor || '#6b7280', textAlign: child.textAlign, fontFamily: child.fontFamily }}
                                      className="text-sm prose prose-sm max-w-none"
                                      dangerouslySetInnerHTML={{ __html: child.content || 'Text content...' }}
                                    />
                                  )}
                                  {child.type === 'image' && (
                                    <div style={{ textAlign: child.textAlign || 'left' }}>
                                      {child.src ? (
                                        <img
                                          src={child.src}
                                          alt={child.alt}
                                          style={{
                                            width: `${child.fontSize || 100}%`,
                                            borderRadius: child.borderRadius || 0,
                                            display: 'inline-block'
                                          }}
                                        />
                                      ) : (
                                        <div className="h-20 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">Image</div>
                                      )}
                                    </div>
                                  )}
                                  {child.type === 'button' && (
                                    <div style={{ textAlign: child.textAlign || 'left' }}>
                                      <span style={{
                                        backgroundColor: child.buttonColor || '#00bed6',
                                        color: child.buttonTextColor || '#fff',
                                        fontFamily: child.fontFamily
                                      }} className="inline-block px-4 py-2 rounded text-sm font-medium">
                                        {child.buttonText || 'Button'}
                                      </span>
                                    </div>
                                  )}
                                  {/* Delete button on hover */}
                                  <div className={`absolute -right-2 -top-2 flex gap-0.5 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                    {i > 0 && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5 bg-white shadow"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          moveNestedElement(block.id, 'section', undefined, i, 'up')
                                        }}
                                      >
                                        <ChevronUp className="h-3 w-3" />
                                      </Button>
                                    )}
                                    {block.children && i < block.children.length - 1 && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5 bg-white shadow"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          moveNestedElement(block.id, 'section', undefined, i, 'down')
                                        }}
                                      >
                                        <ChevronDown className="h-3 w-3" />
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-5 w-5 bg-white shadow text-destructive"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        const newChildren = block.children?.filter((_, idx) => idx !== i) || []
                                        updateBlockWithHistory(block.id, { children: newChildren })
                                        if (isSelected) setSelectedNested(null)
                                      }}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <div className={`text-center py-6 border-2 border-dashed rounded-lg transition-colors ${draggedBlock ? 'border-cyan-500 bg-cyan-50' : 'border-gray-300'
                            }`}>
                            <p className="text-xs text-muted-foreground">
                              {draggedBlock ? '⬇ Soltar bloque aquí' : 'Arrastra bloques aquí'}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    {block.type === "columns" && (
                      <div
                        className="-mx-4 py-4 px-4 relative"
                        style={{ backgroundColor: block.backgroundColor || '#ffffff' }}
                      >
                        {/* Internal move controls */}
                        <div className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 rounded px-1 py-0.5 shadow-sm z-10">
                          <span className="text-[10px] text-muted-foreground mr-1">Columns</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'up'); }}
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'down'); }}
                            disabled={index === blocks.length - 1}
                          >
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex gap-3">
                          {(block.columns || [[], []]).map((col, colIndex) => (
                            <div
                              key={colIndex}
                              className={`flex-1 min-h-[60px] p-3 rounded transition-all ${draggedBlock ? 'ring-2 ring-purple-500 bg-purple-50/50' : ''
                                }`}
                              style={{ backgroundColor: draggedBlock ? undefined : 'rgba(0,0,0,0.02)' }}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDropIntoColumn(e, block.id, colIndex)}
                            >
                              {col.length > 0 ? (
                                <div className="space-y-2">
                                  {col.map((item, i) => {
                                    const isSelected = selectedNested?.parentId === block.id && selectedNested?.type === 'column' && selectedNested?.columnIndex === colIndex && selectedNested?.itemIndex === i
                                    return (
                                      <div
                                        key={i}
                                        className={`relative p-1.5 rounded cursor-pointer transition-all ${isSelected ? 'ring-2 ring-pink-500 bg-pink-50/50' : 'hover:ring-1 hover:ring-gray-300'
                                          }`}
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setSelectedBlock(null)
                                          setSelectedNested({ parentId: block.id, type: 'column', columnIndex: colIndex, itemIndex: i })
                                        }}
                                      >
                                        {/* Render actual visual content based on type */}
                                        {item.type === 'heading' && (() => {
                                          const levelClass = item.level === 1 ? 'text-xl' : item.level === 3 ? 'text-sm' : 'text-base'
                                          const HeadingTag = item.level === 1 ? 'h1' : item.level === 3 ? 'h3' : 'h2'
                                          return (
                                            <HeadingTag
                                              style={{ color: item.textColor || '#1a1a1a', textAlign: item.textAlign, fontFamily: item.fontFamily }}
                                              className={`font-semibold ${levelClass}`}
                                              dangerouslySetInnerHTML={{ __html: item.content || 'Heading' }}
                                            />
                                          )
                                        })()}
                                        {item.type === 'text' && (
                                          <div
                                            style={{ color: item.textColor || '#6b7280', textAlign: item.textAlign, fontFamily: item.fontFamily }}
                                            className="text-sm prose prose-sm max-w-none"
                                            dangerouslySetInnerHTML={{ __html: item.content || 'Text...' }}
                                          />
                                        )}
                                        {item.type === 'image' && (
                                          <div style={{ textAlign: item.textAlign || 'left' }}>
                                            {item.src ? (
                                              <img
                                                src={item.src}
                                                alt={item.alt}
                                                style={{
                                                  width: `${item.fontSize || 100}%`,
                                                  borderRadius: item.borderRadius || 0,
                                                  display: 'inline-block'
                                                }}
                                              />
                                            ) : (
                                              <div className="h-16 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">Image</div>
                                            )}
                                          </div>
                                        )}
                                        {item.type === 'button' && (
                                          <div style={{ textAlign: item.textAlign || 'left' }}>
                                            <span style={{
                                              backgroundColor: item.buttonColor || '#00bed6',
                                              color: item.buttonTextColor || '#fff',
                                              fontFamily: item.fontFamily
                                            }} className="inline-block px-3 py-1.5 rounded text-sm font-medium">
                                              {item.buttonText || 'Button'}
                                            </span>
                                          </div>
                                        )}
                                        {/* Delete button on hover */}
                                        <div className={`absolute -right-1 -top-1 flex gap-0.5 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                          {i > 0 && (
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-4 w-4 bg-white shadow"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                moveNestedElement(block.id, 'column', colIndex, i, 'up')
                                              }}
                                            >
                                              <ChevronUp className="h-2.5 w-2.5" />
                                            </Button>
                                          )}
                                          {i < col.length - 1 && (
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-4 w-4 bg-white shadow"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                moveNestedElement(block.id, 'column', colIndex, i, 'down')
                                              }}
                                            >
                                              <ChevronDown className="h-2.5 w-2.5" />
                                            </Button>
                                          )}
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-4 w-4 bg-white shadow text-destructive"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              const newCols = [...(block.columns || [[], []])]
                                              newCols[colIndex] = newCols[colIndex].filter((_, idx) => idx !== i)
                                              updateBlockWithHistory(block.id, { columns: newCols })
                                              if (isSelected) setSelectedNested(null)
                                            }}
                                          >
                                            <Trash2 className="h-2.5 w-2.5" />
                                          </Button>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              ) : (
                                <div className={`text-center py-4 border-2 border-dashed rounded transition-colors ${draggedBlock ? 'border-purple-500' : 'border-gray-200'
                                  }`}>
                                  <p className="text-[10px] text-muted-foreground">
                                    {draggedBlock ? 'Soltar aquí' : 'Soltar bloques'}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {block.type === "footer" && (
                      <div
                        className="-mx-4 py-4 px-4"
                        style={{ backgroundColor: block.backgroundColor || '#f8fafc', color: block.textColor || '#6b7280', textAlign: block.textAlign || 'center' }}
                      >
                        {/* Social Icons in Footer */}
                        {block.socialLinks && block.socialLinks.length > 0 && (
                          <div className="flex justify-center gap-3 mb-3">
                            {block.socialLinks.map((link, i) => {
                              const iconUrls: Record<string, string> = {
                                facebook: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Facebook_icon_2013.svg',
                                instagram: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg',
                                linkedin: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png',
                                twitter: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg',
                                youtube: 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg',
                                tiktok: 'https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg',
                              }
                              return (
                                <div key={i} className="w-6 h-6 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                                  <img
                                    src={link.platform === 'custom' ? (link.iconUrl || '') : (iconUrls[link.platform] || iconUrls.facebook)}
                                    alt={link.platform}
                                    className="w-4 h-4 object-contain"
                                  />
                                </div>
                              )
                            })}
                          </div>
                        )}
                        <p className="font-medium text-sm">© {new Date().getFullYear()} {block.companyName || "Nombre de la Empresa"}</p>
                        <p className="text-xs">{block.address || "Dirección"}</p>
                        <p className="text-xs underline mt-1 cursor-pointer">{block.unsubscribeText || "Darse de baja"}</p>
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

          </div>
        </main>

        {/* Settings Panel */}
        <aside className="w-72 border-l border-border bg-card p-4 overflow-y-auto">
          <p className="text-xs font-medium text-muted-foreground mb-3">AJUSTES</p>

          {/* Nested element editor */}
          {selectedNested && !selectedBlock && (() => {
            const nestedData = getSelectedNestedData()
            if (!nestedData) return null
            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium capitalize">{nestedData.type} (Nested)</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => setSelectedNested(null)}
                  >
                    Volver
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Dentro de {selectedNested.type === 'section' ? 'Sección' : `Columna ${(selectedNested.columnIndex || 0) + 1}`}
                </p>

                {/* Heading editor */}
                {nestedData.type === 'heading' && (
                  <>
                    <div className="space-y-1">
                      <Label className="text-xs">Heading Level</Label>
                      <Select value={String(nestedData.level || 2)} onValueChange={(v) => updateNestedElement({ level: parseInt(v) })}>
                        <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">H1 - Large</SelectItem>
                          <SelectItem value="2">H2 - Medium</SelectItem>
                          <SelectItem value="3">H3 - Small</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Fuente</Label>
                      <Select value={nestedData.fontFamily || "Arial, sans-serif"} onValueChange={(v) => updateNestedElement({ fontFamily: v })}>
                        <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {emailFonts.map(font => (
                            <SelectItem key={font.value} value={font.value}>{font.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <RichTextEditor
                      value={nestedData.content || ""}
                      onChange={(val) => updateNestedElement({ content: val })}
                      label="Texto del Encabezado"
                      placeholder="Ingresa encabezado..."
                      textColor={nestedData.textColor || "#1a1a1a"}
                      onTextColorChange={(color) => updateNestedElement({ textColor: color })}
                      minHeight="60px"
                    />
                  </>
                )}

                {/* Text editor */}
                {nestedData.type === 'text' && (
                  <>
                    <div className="space-y-1">
                      <Label className="text-xs">Fuente</Label>
                      <Select value={nestedData.fontFamily || "Arial, sans-serif"} onValueChange={(v) => updateNestedElement({ fontFamily: v })}>
                        <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {emailFonts.map(font => (
                            <SelectItem key={font.value} value={font.value}>{font.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <RichTextEditor
                      value={nestedData.content || ""}
                      onChange={(val) => updateNestedElement({ content: val })}
                      label="Contenido"
                      placeholder="Ingresa tu texto aquí..."
                      textColor={nestedData.textColor || "#1a1a1a"}
                      onTextColorChange={(color) => updateNestedElement({ textColor: color })}
                    />
                  </>
                )}

                {/* Button editor */}
                {nestedData.type === 'button' && (
                  <>
                    <div className="space-y-1">
                      <Label className="text-xs">Texto del Botón</Label>
                      <Input value={nestedData.buttonText || ''} onChange={(e) => updateNestedElement({ buttonText: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Fuente</Label>
                      <Select value={nestedData.fontFamily || "Arial, sans-serif"} onValueChange={(v) => updateNestedElement({ fontFamily: v })}>
                        <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {emailFonts.map(font => (
                            <SelectItem key={font.value} value={font.value}>{font.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">URL</Label>
                      <Input value={nestedData.buttonUrl || ''} onChange={(e) => updateNestedElement({ buttonUrl: e.target.value })} placeholder="https://..." />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Color del Botón</Label>
                        <Input type="color" value={nestedData.buttonColor || '#00bed6'} onChange={(e) => updateNestedElement({ buttonColor: e.target.value })} className="h-8" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Color del Texto</Label>
                        <Input type="color" value={nestedData.buttonTextColor || '#ffffff'} onChange={(e) => updateNestedElement({ buttonTextColor: e.target.value })} className="h-8" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Posición del Botón</Label>
                      <div className="flex gap-1">
                        {(['left', 'center', 'right'] as const).map(align => (
                          <Button
                            key={align}
                            variant={nestedData.textAlign === align ? "default" : "outline"}
                            size="sm"
                            className="flex-1 h-7 text-xs capitalize"
                            onClick={() => updateNestedElement({ textAlign: align })}
                          >
                            {align}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Image editor */}
                {nestedData.type === 'image' && (
                  <>
                    {nestedData.src && (
                      <img src={nestedData.src} alt="" className="w-full h-24 object-cover rounded mb-2" />
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mb-2"
                      onClick={() => openMediaPicker('nested')}
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      {nestedData.src ? "Cambiar Imagen" : "Seleccionar Imagen"}
                    </Button>
                    <div className="space-y-1">
                      <Label className="text-xs">Texto Alt</Label>
                      <Input value={nestedData.alt || ''} onChange={(e) => updateNestedElement({ alt: e.target.value })} placeholder="Descripción de la imagen" className="h-8" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Width: {nestedData.fontSize || 100}%</Label>
                      <input
                        type="range"
                        min="25"
                        max="100"
                        step="5"
                        value={nestedData.fontSize || 100}
                        onChange={(e) => updateNestedElement({ fontSize: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>25%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Alignment</Label>
                      <div className="flex gap-1">
                        {(['left', 'center', 'right'] as const).map(align => (
                          <Button
                            key={align}
                            variant={nestedData.textAlign === align ? "default" : "outline"}
                            size="sm"
                            className="flex-1 h-7 text-xs capitalize"
                            onClick={() => updateNestedElement({ textAlign: align })}
                          >
                            {align}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Border Radius: {nestedData.borderRadius || 0}px</Label>
                      <input
                        type="range"
                        min="0"
                        max="24"
                        value={nestedData.borderRadius || 0}
                        onChange={(e) => updateNestedElement({ borderRadius: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  </>
                )}
              </div>
            )
          })()}

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
                    <Label className="text-xs">Font Family</Label>
                    <Select
                      value={selectedBlockData.fontFamily || "Arial, sans-serif"}
                      onValueChange={(v) => updateBlockWithHistory(selectedBlock!, { fontFamily: v })}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {emailFonts.map(font => (
                          <SelectItem key={font.value} value={font.value}>{font.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <RichTextEditor
                    value={selectedBlockData.content || ""}
                    onChange={(val) => updateBlock(selectedBlock!, { content: val })}
                    onBlur={() => saveToHistory(blocks)}
                    label="Texto del Encabezado"
                    placeholder="Ingresa encabezado..."
                    textColor={selectedBlockData.textColor || "#1a1a1a"}
                    onTextColorChange={(color) => updateBlockWithHistory(selectedBlock!, { textColor: color })}
                    minHeight="60px"
                  />
                </>
              )}

              {selectedBlockData.type === "text" && (
                <>
                  <div className="space-y-1">
                    <Label className="text-xs">Familia de Fuente</Label>
                    <Select
                      value={selectedBlockData.fontFamily || "Arial, sans-serif"}
                      onValueChange={(v) => updateBlockWithHistory(selectedBlock!, { fontFamily: v })}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {emailFonts.map(font => (
                          <SelectItem key={font.value} value={font.value}>{font.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <RichTextEditor
                    value={selectedBlockData.content || ""}
                    onChange={(value) => updateBlock(selectedBlock!, { content: value })}
                    onBlur={() => saveToHistory(blocks)}
                    label="Contenido"
                    placeholder="Ingresa tu texto aquí..."
                    textColor={selectedBlockData.textColor || "#1a1a1a"}
                    onTextColorChange={(color) => updateBlockWithHistory(selectedBlock!, { textColor: color })}
                  />
                </>
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
                    {selectedBlockData.src ? "Cambiar Imagen" : "Seleccionar Imagen"}
                  </Button>
                  <div className="space-y-1">
                    <Label className="text-xs">Texto Alternativo</Label>
                    <Input
                      value={selectedBlockData.alt || ""}
                      onChange={(e) => updateBlock(selectedBlock!, { alt: e.target.value })}
                      onBlur={() => saveToHistory(blocks)}
                      className="h-8"
                      placeholder="Descripción de la imagen"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Ancho: {selectedBlockData.fontSize || 100}%</Label>
                    <input
                      type="range"
                      min="25"
                      max="100"
                      step="5"
                      value={selectedBlockData.fontSize || 100}
                      onChange={(e) => updateBlockWithHistory(selectedBlock!, { fontSize: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>25%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Alineación</Label>
                    <div className="flex gap-1">
                      {(['left', 'center', 'right'] as const).map(align => (
                        <Button
                          key={align}
                          variant={selectedBlockData.textAlign === align ? "default" : "outline"}
                          size="sm"
                          className="flex-1 h-7 text-xs capitalize"
                          onClick={() => updateBlockWithHistory(selectedBlock!, { textAlign: align })}
                        >
                          {align === 'left' ? 'Izq' : align === 'center' ? 'Centro' : 'Der'}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Radio del Borde: {selectedBlockData.borderRadius || 0}px</Label>
                    <input
                      type="range"
                      min="0"
                      max="24"
                      value={selectedBlockData.borderRadius || 0}
                      onChange={(e) => updateBlockWithHistory(selectedBlock!, { borderRadius: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </>
              )}

              {selectedBlockData.type === "button" && (
                <>
                  <div className="space-y-1">
                    <Label className="text-xs">Texto del Botón</Label>
                    <Input
                      value={selectedBlockData.buttonText || ""}
                      onChange={(e) => updateBlock(selectedBlock!, { buttonText: e.target.value })}
                      onBlur={() => saveToHistory(blocks)}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Familia de Fuente</Label>
                    <Select
                      value={selectedBlockData.fontFamily || "Arial, sans-serif"}
                      onValueChange={(v) => updateBlockWithHistory(selectedBlock!, { fontFamily: v })}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {emailFonts.map(font => (
                          <SelectItem key={font.value} value={font.value}>{font.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">URL del Botón</Label>
                    <Input
                      value={selectedBlockData.buttonUrl || ""}
                      onChange={(e) => updateBlock(selectedBlock!, { buttonUrl: e.target.value })}
                      onBlur={() => saveToHistory(blocks)}
                      className="h-8"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Color del Botón</Label>
                      <input
                        type="color"
                        value={selectedBlockData.buttonColor || "#00bed6"}
                        onChange={(e) => updateBlockWithHistory(selectedBlock!, { buttonColor: e.target.value })}
                        className="w-full h-8 rounded border cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Color del Texto</Label>
                      <input
                        type="color"
                        value={selectedBlockData.buttonTextColor || "#ffffff"}
                        onChange={(e) => updateBlockWithHistory(selectedBlock!, { buttonTextColor: e.target.value })}
                        className="w-full h-8 rounded border cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Posición del Botón</Label>
                    <div className="flex gap-1">
                      {(['left', 'center', 'right'] as const).map(align => (
                        <Button
                          key={align}
                          variant={selectedBlockData.textAlign === align ? "default" : "outline"}
                          size="sm"
                          className="flex-1 h-7 text-xs capitalize"
                          onClick={() => updateBlockWithHistory(selectedBlock!, { textAlign: align })}
                        >
                          {align === 'left' ? 'Izq' : align === 'center' ? 'Centro' : 'Der'}
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {selectedBlockData.type === "logo" && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => openMediaPicker(selectedBlock!)}
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    {selectedBlockData.src ? "Cambiar Logo" : "Seleccionar Logo"}
                  </Button>
                  {selectedBlockData.src && (
                    <div className="p-2 bg-muted rounded-lg">
                      <img
                        src={selectedBlockData.src}
                        alt="Vista previa del logo"
                        className="w-full h-auto max-h-16 object-contain"
                        style={{ borderRadius: selectedBlockData.borderRadius || 0 }}
                      />
                    </div>
                  )}
                  <div className="space-y-1">
                    <Label className="text-xs">Alineación del Logo</Label>
                    <div className="flex gap-1">
                      {(['left', 'center', 'right'] as const).map(align => (
                        <Button
                          key={align}
                          variant={selectedBlockData.textAlign === align ? "default" : "outline"}
                          size="sm"
                          className="flex-1 h-7 text-xs capitalize"
                          onClick={() => updateBlockWithHistory(selectedBlock!, { textAlign: align })}
                        >
                          {align === 'left' ? 'Izq' : align === 'center' ? 'Centro' : 'Der'}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Tamaño del Logo: {selectedBlockData.fontSize || 50}px</Label>
                    <input
                      type="range"
                      min="40"
                      max="300"
                      step="10"
                      value={selectedBlockData.fontSize || 50}
                      onChange={(e) => updateBlockWithHistory(selectedBlock!, { fontSize: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>40px</span>
                      <span>170px</span>
                      <span>300px</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Radio del Borde: {selectedBlockData.borderRadius ?? 5}px</Label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={selectedBlockData.borderRadius ?? 5}
                      onChange={(e) => updateBlockWithHistory(selectedBlock!, { borderRadius: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Relleno (por lado)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Superior: {selectedBlockData.paddingTop ?? 25}px</Label>
                        <input
                          type="range"
                          min="0"
                          max="60"
                          value={selectedBlockData.paddingTop ?? 25}
                          onChange={(e) => updateBlockWithHistory(selectedBlock!, { paddingTop: parseInt(e.target.value) })}
                          className="w-full h-2"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Inferior: {selectedBlockData.paddingBottom ?? 25}px</Label>
                        <input
                          type="range"
                          min="0"
                          max="60"
                          value={selectedBlockData.paddingBottom ?? 25}
                          onChange={(e) => updateBlockWithHistory(selectedBlock!, { paddingBottom: parseInt(e.target.value) })}
                          className="w-full h-2"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Izquierda: {selectedBlockData.paddingLeft ?? 0}px</Label>
                        <input
                          type="range"
                          min="0"
                          max="60"
                          value={selectedBlockData.paddingLeft ?? 0}
                          onChange={(e) => updateBlockWithHistory(selectedBlock!, { paddingLeft: parseInt(e.target.value) })}
                          className="w-full h-2"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Derecha: {selectedBlockData.paddingRight ?? 0}px</Label>
                        <input
                          type="range"
                          min="0"
                          max="60"
                          value={selectedBlockData.paddingRight ?? 0}
                          onChange={(e) => updateBlockWithHistory(selectedBlock!, { paddingRight: parseInt(e.target.value) })}
                          className="w-full h-2"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Color de Fondo</Label>
                    <input
                      type="color"
                      value={selectedBlockData.backgroundColor || "#ffffff"}
                      onChange={(e) => updateBlockWithHistory(selectedBlock!, { backgroundColor: e.target.value })}
                      className="w-full h-8 rounded border cursor-pointer"
                    />
                  </div>
                </>
              )}

              {selectedBlockData.type === "section" && (
                <>
                  <p className="text-xs text-muted-foreground mb-3">
                    Arrastra bloques desde el lienzo a esta sección
                  </p>
                  <div className="space-y-1">
                    <Label className="text-xs">Color de Fondo</Label>
                    <input
                      type="color"
                      value={selectedBlockData.backgroundColor || "#f8fafc"}
                      onChange={(e) => updateBlockWithHistory(selectedBlock!, { backgroundColor: e.target.value })}
                      className="w-full h-8 rounded border cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Relleno: {selectedBlockData.padding || 25}px</Label>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      value={selectedBlockData.padding || 25}
                      onChange={(e) => updateBlockWithHistory(selectedBlock!, { padding: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  {selectedBlockData.children && selectedBlockData.children.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-3">
                      Contiene {selectedBlockData.children.length} bloque(s)
                    </p>
                  )}
                </>
              )}

              {selectedBlockData.type === "columns" && (
                <>
                  <p className="text-xs text-muted-foreground mb-3">
                    Arrastra bloques desde el lienzo a las columnas
                  </p>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Diseño</Label>
                    <div className="grid grid-cols-3 gap-1">
                      {[2, 3, 4].map(num => (
                        <Button
                          key={num}
                          variant={(selectedBlockData.columns?.length || 2) === num ? "default" : "outline"}
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => {
                            const currentCols = selectedBlockData.columns || [[], []]
                            let newCols: typeof currentCols = []
                            for (let i = 0; i < num; i++) {
                              newCols.push(currentCols[i] || [])
                            }
                            updateBlockWithHistory(selectedBlock!, { columns: newCols })
                          }}
                        >
                          {num} Col
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Color de Fondo</Label>
                    <input
                      type="color"
                      value={selectedBlockData.backgroundColor || "#ffffff"}
                      onChange={(e) => updateBlockWithHistory(selectedBlock!, { backgroundColor: e.target.value })}
                      className="w-full h-8 rounded border cursor-pointer"
                    />
                  </div>
                </>
              )}

              {selectedBlockData.type === "product" && (
                <>
                  <div className="space-y-1">
                    <Label className="text-xs">Nombre del Producto</Label>
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
                    {selectedBlockData.src ? "Cambiar Imagen" : "Seleccionar Imagen"}
                  </Button>
                  <div className="space-y-1">
                    <Label className="text-xs">URL del Producto</Label>
                    <Input
                      value={selectedBlockData.buttonUrl || ""}
                      onChange={(e) => updateBlock(selectedBlock!, { buttonUrl: e.target.value })}
                      onBlur={() => saveToHistory(blocks)}
                      className="h-8"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Color de Acento</Label>
                    <div className="flex gap-1 flex-wrap">
                      {brandColors.slice(0, 4).map(c => (
                        <button
                          key={c.value}
                          className="w-6 h-6 rounded border-2"
                          style={{ backgroundColor: c.value, borderColor: selectedBlockData.buttonColor === c.value ? '#000' : 'transparent' }}
                          onClick={() => updateBlockWithHistory(selectedBlock!, { buttonColor: c.value })}
                          title={c.label}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              {selectedBlockData.type === "footer" && (
                <>
                  {/* Social Links Management */}
                  <Label className="text-xs font-semibold">Social Links</Label>
                  {(selectedBlockData.socialLinks || []).map((link, index) => (
                    <div key={index} className="flex gap-1 items-center">
                      <Select
                        value={link.platform}
                        onValueChange={(value) => {
                          const newLinks = [...(selectedBlockData.socialLinks || [])]
                          newLinks[index] = { ...link, platform: value as typeof link.platform }
                          updateBlockWithHistory(selectedBlock!, { socialLinks: newLinks })
                        }}
                      >
                        <SelectTrigger className="h-7 text-xs flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {socialPlatforms.map(p => (
                            <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        value={link.url}
                        onChange={(e) => {
                          const newLinks = [...(selectedBlockData.socialLinks || [])]
                          newLinks[index] = { ...link, url: e.target.value }
                          updateBlock(selectedBlock!, { socialLinks: newLinks })
                        }}
                        onBlur={() => saveToHistory(blocks)}
                        className="h-7 text-xs flex-1"
                        placeholder="URL"
                      />
                      {link.platform === 'custom' && (
                        <Input
                          value={link.iconUrl || ''}
                          onChange={(e) => {
                            const newLinks = [...(selectedBlockData.socialLinks || [])]
                            newLinks[index] = { ...link, iconUrl: e.target.value }
                            updateBlock(selectedBlock!, { socialLinks: newLinks })
                          }}
                          onBlur={() => saveToHistory(blocks)}
                          className="h-7 text-xs flex-1"
                          placeholder="Icon URL"
                        />
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => {
                          const newLinks = (selectedBlockData.socialLinks || []).filter((_, i) => i !== index)
                          updateBlockWithHistory(selectedBlock!, { socialLinks: newLinks })
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      const newLinks = [...(selectedBlockData.socialLinks || []), { platform: 'instagram' as const, url: '' }]
                      updateBlockWithHistory(selectedBlock!, { socialLinks: newLinks })
                    }}
                  >
                    + Añadir Enlace Social
                  </Button>

                  <div className="border-t pt-3 mt-3" />

                  <div className="space-y-1">
                    <Label className="text-xs">Nombre de la Empresa</Label>
                    <Input
                      value={selectedBlockData.companyName || ""}
                      onChange={(e) => updateBlock(selectedBlock!, { companyName: e.target.value })}
                      onBlur={() => saveToHistory(blocks)}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Dirección</Label>
                    <Input
                      value={selectedBlockData.address || ""}
                      onChange={(e) => updateBlock(selectedBlock!, { address: e.target.value })}
                      onBlur={() => saveToHistory(blocks)}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Texto de Cancelar Suscripción</Label>
                    <Input
                      value={selectedBlockData.unsubscribeText || ""}
                      onChange={(e) => updateBlock(selectedBlock!, { unsubscribeText: e.target.value })}
                      onBlur={() => saveToHistory(blocks)}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Color de Fondo</Label>
                    <input
                      type="color"
                      value={selectedBlockData.backgroundColor || "#f8fafc"}
                      onChange={(e) => updateBlockWithHistory(selectedBlock!, { backgroundColor: e.target.value })}
                      className="w-full h-8 rounded border cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Color del Texto</Label>
                    <input
                      type="color"
                      value={selectedBlockData.textColor || "#6b7280"}
                      onChange={(e) => updateBlockWithHistory(selectedBlock!, { textColor: e.target.value })}
                      className="w-full h-8 rounded border cursor-pointer"
                    />
                  </div>
                </>
              )}

              {selectedBlockData.type === "divider" && (
                <div className="space-y-1">
                  <Label className="text-xs">Color de Línea</Label>
                  <div className="flex gap-1 flex-wrap">
                    {brandColors.map(c => (
                      <button
                        key={c.value}
                        className="w-6 h-6 rounded border-2"
                        style={{ backgroundColor: c.value, borderColor: selectedBlockData.borderColor === c.value ? '#000' : 'transparent' }}
                        onClick={() => updateBlockWithHistory(selectedBlock!, { borderColor: c.value })}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>
              )}

              {selectedBlockData.type === "spacer" && (
                <div className="space-y-1">
                  <Label className="text-xs">Altura: {selectedBlockData.padding || 30}px</Label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={selectedBlockData.padding || 30}
                    onChange={(e) => updateBlockWithHistory(selectedBlock!, { padding: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              )}

              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() => deleteBlock(selectedBlock!)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Bloque
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Haz clic en un bloque para editar
            </p>
          )}
        </aside>
      </div>

      {/* Media Picker Dialog */}
      <Dialog open={mediaPickerOpen} onOpenChange={setMediaPickerOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Seleccionar Imagen</DialogTitle>
            <DialogDescription>Elige de tu biblioteca o sube una nueva</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="library" className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="library">Biblioteca</TabsTrigger>
              <TabsTrigger value="upload">Subir</TabsTrigger>
            </TabsList>

            <TabsContent value="library" className="flex-1 flex flex-col min-h-0 mt-4">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
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
                    <p>Sin imágenes</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {filteredMediaFiles.map((file) => (
                      <button
                        key={file.id}
                        type="button"
                        onClick={() => setMediaSelected(file.url)}
                        className={`relative aspect-square rounded overflow-hidden border-2 ${mediaSelected === file.url ? "border-pink-500" : "border-transparent hover:border-gray-300"
                          }`}
                      >
                        <img src={file.url} alt={file.alt_text || file.display_name} className="w-full h-full object-cover" />
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
                multiple
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
                  {mediaUploading ? "Subiendo..." : "Seleccionar Archivos"}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">Tamaño máximo: 4MB por imagen</p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between items-center pt-4 border-t mt-4">
            <div className="flex items-center gap-2">
              {mediaSelected && (
                <div className="flex items-center gap-2">
                  <img src={mediaSelected} alt="" className="h-10 w-10 rounded object-cover border" />
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={!!deletingMediaId}
                    onClick={async () => {
                      const file = mediaFiles.find(f => f.url === mediaSelected)
                      if (!file) return

                      if (!confirm("¿Estás seguro de que deseas eliminar esta imagen?")) return

                      setDeletingMediaId(file.id)
                      const result = await deleteMedia(file.id)
                      setDeletingMediaId(null)

                      if (result.success) {
                        setMediaFiles(prev => prev.filter(f => f.id !== file.id))
                        setMediaSelected(null)
                        toast({ title: "Imagen eliminada" })
                      } else {
                        toast({ title: "Error al eliminar", description: result.error, variant: "destructive" })
                      }
                    }}
                  >
                    {deletingMediaId === mediaFiles.find(f => f.url === mediaSelected)?.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Eliminando...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setMediaPickerOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={confirmMediaSelection} disabled={!mediaSelected}>
                Seleccionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>Vista Previa del Email</DialogTitle>
            <DialogDescription>
              Así se verá tu email en las bandejas de entrada de los destinatarios
            </DialogDescription>
          </DialogHeader>
          <div className="h-[80vh] overflow-auto bg-gray-100 p-6">
            <div className="max-w-[650px] mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
              <iframe
                srcDoc={previewHtml}
                title="Vista Previa del Email"
                className="w-full h-full min-h-[700px] border-0"
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Structure Navigator Panel */}
      {showStructure && (
        <div
          className="fixed w-64 bg-zinc-900 text-zinc-100 rounded-lg shadow-2xl z-50 overflow-hidden"
          style={{ left: structurePos.x, top: structurePos.y }}
        >
          <div
            className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 cursor-move select-none"
            onMouseDown={(e) => {
              e.preventDefault()
              const startX = e.clientX - structurePos.x
              const startY = e.clientY - structurePos.y
              const onMove = (e: MouseEvent) => {
                setStructurePos({ x: e.clientX - startX, y: e.clientY - startY })
              }
              const onUp = () => {
                window.removeEventListener('mousemove', onMove)
                window.removeEventListener('mouseup', onUp)
              }
              window.addEventListener('mousemove', onMove)
              window.addEventListener('mouseup', onUp)
            }}
          >
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              <span className="text-sm font-medium">Estructura</span>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-white" onClick={() => setShowStructure(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="max-h-[400px] overflow-y-auto p-2 text-xs">
            {blocks.length === 0 ? (
              <p className="text-zinc-500 text-center py-4">Sin bloques</p>
            ) : (
              <div className="space-y-0.5">
                {blocks.map((block, i) => (
                  <div key={block.id}>
                    <div
                      className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors group ${selectedBlock === block.id ? 'bg-zinc-700' : 'hover:bg-zinc-800'
                        }`}
                      onClick={() => setSelectedBlock(block.id)}
                    >
                      <Box className="h-3 w-3 text-zinc-500" />
                      <span className="capitalize flex-1">{block.type}</span>
                      {/* Move buttons */}
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {i > 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-zinc-400 hover:text-white hover:bg-zinc-600"
                            onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'up'); }}
                          >
                            <ChevronUp className="h-3 w-3" />
                          </Button>
                        )}
                        {i < blocks.length - 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-zinc-400 hover:text-white hover:bg-zinc-600"
                            onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'down'); }}
                          >
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      {(block.type === 'section' && block.children?.length) || (block.type === 'columns' && block.columns?.some(c => c.length > 0)) ? (
                        <ChevronRight className="h-3 w-3 text-zinc-500" />
                      ) : null}
                    </div>
                    {/* Section children */}
                    {block.type === 'section' && block.children && block.children.length > 0 && (
                      <div className="ml-4 border-l border-zinc-800 pl-2 mt-0.5 space-y-0.5">
                        {block.children.map((child, ci) => (
                          <div
                            key={ci}
                            className="flex items-center gap-2 px-2 py-1 rounded text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 group cursor-pointer"
                            onClick={() => {
                              setSelectedBlock(null)
                              setSelectedNested({ parentId: block.id, type: 'section', itemIndex: ci })
                            }}
                          >
                            <Box className="h-2.5 w-2.5 text-zinc-600" />
                            <span className="capitalize flex-1">{child.type}</span>
                            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              {ci > 0 && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-4 w-4 text-zinc-400 hover:text-white hover:bg-zinc-600"
                                  onClick={(e) => { e.stopPropagation(); moveNestedElement(block.id, 'section', undefined, ci, 'up'); }}
                                >
                                  <ChevronUp className="h-2.5 w-2.5" />
                                </Button>
                              )}
                              {ci < (block.children?.length || 0) - 1 && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-4 w-4 text-zinc-400 hover:text-white hover:bg-zinc-600"
                                  onClick={(e) => { e.stopPropagation(); moveNestedElement(block.id, 'section', undefined, ci, 'down'); }}
                                >
                                  <ChevronDown className="h-2.5 w-2.5" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Column children */}
                    {block.type === 'columns' && block.columns && (
                      <div className="ml-4 border-l border-zinc-800 pl-2 mt-0.5 space-y-0.5">
                        {block.columns.map((col, colIdx) => (
                          <div key={colIdx}>
                            <div className="flex items-center gap-2 px-2 py-0.5 text-zinc-500 group hover:bg-zinc-800 rounded">
                              <span className="flex-1">Col {colIdx + 1}</span>
                              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                {colIdx > 0 && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4 text-zinc-400 hover:text-white hover:bg-zinc-600"
                                    onClick={(e) => { e.stopPropagation(); swapColumns(block.id, colIdx, 'left'); }}
                                    title="Move column left"
                                  >
                                    <ChevronUp className="h-2.5 w-2.5 -rotate-90" />
                                  </Button>
                                )}
                                {colIdx < (block.columns?.length || 0) - 1 && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4 text-zinc-400 hover:text-white hover:bg-zinc-600"
                                    onClick={(e) => { e.stopPropagation(); swapColumns(block.id, colIdx, 'right'); }}
                                    title="Move column right"
                                  >
                                    <ChevronDown className="h-2.5 w-2.5 -rotate-90" />
                                  </Button>
                                )}
                              </div>
                            </div>
                            {col.length > 0 && (
                              <div className="ml-3 border-l border-zinc-800 pl-2 space-y-0.5">
                                {col.map((item, itemIdx) => (
                                  <div
                                    key={itemIdx}
                                    className="flex items-center gap-2 px-2 py-1 rounded text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 group cursor-pointer"
                                    onClick={() => {
                                      setSelectedBlock(null)
                                      setSelectedNested({ parentId: block.id, type: 'column', columnIndex: colIdx, itemIndex: itemIdx })
                                    }}
                                  >
                                    <Box className="h-2.5 w-2.5 text-zinc-600" />
                                    <span className="capitalize flex-1">{item.type}</span>
                                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                      {itemIdx > 0 && (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-4 w-4 text-zinc-400 hover:text-white hover:bg-zinc-600"
                                          onClick={(e) => { e.stopPropagation(); moveNestedElement(block.id, 'column', colIdx, itemIdx, 'up'); }}
                                        >
                                          <ChevronUp className="h-2.5 w-2.5" />
                                        </Button>
                                      )}
                                      {itemIdx < col.length - 1 && (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-4 w-4 text-zinc-400 hover:text-white hover:bg-zinc-600"
                                          onClick={(e) => { e.stopPropagation(); moveNestedElement(block.id, 'column', colIdx, itemIdx, 'down'); }}
                                        >
                                          <ChevronDown className="h-2.5 w-2.5" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )
      }
    </div >
  )
}
