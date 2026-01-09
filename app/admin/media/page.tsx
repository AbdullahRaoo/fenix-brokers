"use client"

import { useState, useEffect, useTransition, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Upload, Trash2, Loader2, Copy, Check, Image as ImageIcon, Search, Grid, List, Edit, ExternalLink, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth, Can } from "@/components/auth-context"
import { getMediaFiles, uploadMedia, deleteMedia, deleteMultipleMedia, updateMedia, renameMedia, getMediaUsage, type MediaItem } from "@/app/actions/media"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function MediaPage() {
    const [files, setFiles] = useState<MediaItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isPending, startTransition] = useTransition()
    const [isUploading, setIsUploading] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [editFile, setEditFile] = useState<MediaItem | null>(null)
    const [editName, setEditName] = useState("")
    const [editAlt, setEditAlt] = useState("")
    const [isRenaming, setIsRenaming] = useState(false)
    const [usage, setUsage] = useState<{ products: number; templates: number } | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { toast } = useToast()
    const { can } = useAuth()

    useEffect(() => {
        loadFiles()
    }, [])

    async function loadFiles() {
        setIsLoading(true)
        const result = await getMediaFiles()
        if (result.data) {
            setFiles(result.data)
        }
        setIsLoading(false)
    }

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFiles = e.target.files
        if (!uploadedFiles || uploadedFiles.length === 0) return

        setIsUploading(true)
        let successCount = 0
        const rejectedFiles: string[] = []

        for (const file of Array.from(uploadedFiles)) {
            // Enforce 4MB hard limit
            if (file.size > 4 * 1024 * 1024) {
                rejectedFiles.push(file.name)
                continue
            }

            const formData = new FormData()
            formData.append("file", file)

            const result = await uploadMedia(formData)
            if (result.data) {
                successCount++
            } else {
                console.error(`Upload failed for ${file.name}:`, result.error)
                toast({
                    title: `Error al subir: ${file.name}`,
                    description: result.error || "Error desconocido",
                    variant: "destructive"
                })
            }
        }

        if (successCount > 0) {
            toast({
                title: "Subida completa",
                description: `${successCount} archivo${successCount !== 1 ? "s" : ""} subido${successCount !== 1 ? "s" : ""}`,
            })
        }

        if (rejectedFiles.length > 0) {
            toast({
                title: `${rejectedFiles.length} archivo(s) rechazado(s) (>4MB)`,
                description: rejectedFiles.join(", "),
                variant: "destructive",
                duration: 10000
            })
        }

        await loadFiles()
        setIsUploading(false)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const handleDelete = (id: string) => {
        startTransition(async () => {
            const result = await deleteMedia(id)
            if (result.success) {
                toast({ title: "Archivo eliminado" })
                setFiles(files.filter(f => f.id !== id))
                setSelectedFiles(prev => {
                    const next = new Set(prev)
                    next.delete(id)
                    return next
                })
            } else {
                toast({ title: "Error", description: result.error, variant: "destructive" })
            }
        })
    }

    const handleDeleteSelected = () => {
        startTransition(async () => {
            const result = await deleteMultipleMedia(Array.from(selectedFiles))
            if (result.success) {
                toast({ title: `${result.count} archivos eliminados` })
                await loadFiles()
                setSelectedFiles(new Set())
            } else {
                toast({ title: "Error", description: result.error, variant: "destructive" })
            }
        })
    }

    const handleCopyUrl = async (url: string) => {
        await navigator.clipboard.writeText(url)
        setCopiedUrl(url)
        toast({ title: "URL copiada al portapapeles" })
        setTimeout(() => setCopiedUrl(null), 2000)
    }

    const toggleSelect = (id: string) => {
        setSelectedFiles(prev => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }

    const toggleSelectAll = () => {
        if (selectedFiles.size === filteredFiles.length) {
            setSelectedFiles(new Set())
        } else {
            setSelectedFiles(new Set(filteredFiles.map(f => f.id)))
        }
    }

    const formatFileSize = (bytes: number | null) => {
        if (!bytes) return "Desconocido"
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    const openEditModal = async (file: MediaItem) => {
        setEditFile(file)
        setEditName(file.display_name)
        setEditAlt(file.alt_text || "")
        setUsage(null)

        // Load usage info
        const usageData = await getMediaUsage(file.id)
        setUsage(usageData)
    }

    const handleSaveMetadata = async () => {
        if (!editFile) return

        startTransition(async () => {
            const result = await updateMedia(editFile.id, {
                display_name: editName,
                alt_text: editAlt,
            })

            if (result.error) {
                toast({ title: "Error", description: result.error, variant: "destructive" })
                return
            }

            toast({ title: "Detalles actualizados" })
            await loadFiles()
            setEditFile(null)
        })
    }

    const handleRename = async () => {
        if (!editFile || !editName) return

        setIsRenaming(true)
        const result = await renameMedia(editFile.id, editName)
        setIsRenaming(false)

        if (result.error) {
            toast({ title: "Error", description: result.error, variant: "destructive" })
            return
        }

        toast({
            title: "Archivo renombrado",
            description: usage && (usage.products > 0 || usage.templates > 0)
                ? `Actualizado ${usage.products} producto(s) y ${usage.templates} plantilla(s)`
                : "La URL ha sido actualizada"
        })
        await loadFiles()
        setEditFile(null)
    }

    const filteredFiles = files.filter(f =>
        f.display_name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const isImage = (type: string | null) => type?.startsWith("image/") ?? false

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Biblioteca de Medios</h1>
                    <p className="text-muted-foreground">Administra imágenes y archivos para productos y correos</p>
                </div>
                <Can permission="media.upload">
                    <div className="text-center">
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={handleUpload}
                            disabled={isUploading}
                        />
                        <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                            {isUploading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Subiendo...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Subir
                                </>
                            )}
                        </Button>
                        <p className="text-xs text-muted-foreground mt-1">Tamaño máximo: 4MB por imagen</p>
                    </div>
                </Can>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Archivos</CardTitle>
                            <CardDescription>{files.length} archivo{files.length !== 1 ? "s" : ""} en biblioteca</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar archivos..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 w-64"
                                />
                            </div>
                            <div className="flex border rounded-lg">
                                <Button
                                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                                    size="icon"
                                    onClick={() => setViewMode("grid")}
                                >
                                    <Grid className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === "list" ? "secondary" : "ghost"}
                                    size="icon"
                                    onClick={() => setViewMode("list")}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                    {selectedFiles.size > 0 && can("media.delete") && (
                        <div className="flex items-center gap-4 mt-4 p-3 bg-muted rounded-lg">
                            <Checkbox
                                checked={selectedFiles.size === filteredFiles.length}
                                onCheckedChange={toggleSelectAll}
                            />
                            <span className="text-sm">{selectedFiles.size} seleccionado{selectedFiles.size !== 1 ? "s" : ""}</span>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Eliminar Seleccionados
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>¿Eliminar {selectedFiles.size} archivos?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esto eliminará permanentemente estos archivos. Los productos o plantillas que los usen mostrarán imágenes rotas.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeleteSelected} className="bg-destructive">
                                            Eliminar
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : filteredFiles.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                            <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg mb-2">Sin archivos de medios</p>
                            <p className="text-sm">Sube imágenes para usar en productos y correos</p>
                        </div>
                    ) : viewMode === "grid" ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {filteredFiles.map((file) => (
                                <div
                                    key={file.id}
                                    className={`relative group rounded-lg border-2 overflow-hidden transition-all ${selectedFiles.has(file.id) ? "border-primary" : "border-transparent hover:border-muted"
                                        }`}
                                >
                                    {can("media.delete") && (
                                        <div className="absolute top-2 left-2 z-10">
                                            <Checkbox
                                                checked={selectedFiles.has(file.id)}
                                                onCheckedChange={() => toggleSelect(file.id)}
                                                className="bg-background/80"
                                            />
                                        </div>
                                    )}
                                    <div className="aspect-square bg-muted">
                                        {isImage(file.mime_type) ? (
                                            <img
                                                src={file.url}
                                                alt={file.alt_text || file.display_name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                        <div className="flex gap-1">
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                onClick={() => handleCopyUrl(file.url)}
                                                title="Copiar URL"
                                            >
                                                {copiedUrl === file.url ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                onClick={() => openEditModal(file)}
                                                title="Editar"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                onClick={() => window.open(file.url, "_blank")}
                                                title="Ver"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <Can permission="media.delete">
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(file.id)}
                                                disabled={isPending}
                                            >
                                                <Trash2 className="h-4 w-4 mr-1" />
                                                Eliminar
                                            </Button>
                                        </Can>
                                    </div>
                                    <div className="p-2 bg-card">
                                        <p className="text-xs truncate font-medium">{file.display_name}</p>
                                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size_bytes)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredFiles.map((file) => (
                                <div
                                    key={file.id}
                                    className={`flex items-center gap-4 p-3 rounded-lg border ${selectedFiles.has(file.id) ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                                        }`}
                                >
                                    {can("media.delete") && (
                                        <Checkbox
                                            checked={selectedFiles.has(file.id)}
                                            onCheckedChange={() => toggleSelect(file.id)}
                                        />
                                    )}
                                    <div className="w-12 h-12 rounded bg-muted overflow-hidden flex-shrink-0">
                                        {isImage(file.mime_type) ? (
                                            <img src={file.url} alt={file.alt_text || file.display_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{file.display_name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatFileSize(file.size_bytes)} • {file.mime_type || "Tipo desconocido"}
                                        </p>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => handleCopyUrl(file.url)} title="Copiar URL">
                                            {copiedUrl === file.url ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => openEditModal(file)} title="Editar">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => window.open(file.url, "_blank")} title="Ver">
                                            <ExternalLink className="h-4 w-4" />
                                        </Button>
                                        <Can permission="media.delete">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive"
                                                onClick={() => handleDelete(file.id)}
                                                disabled={isPending}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </Can>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit Media Dialog */}
            <Dialog open={!!editFile} onOpenChange={(open) => !open && setEditFile(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Editar Medio</DialogTitle>
                        <DialogDescription>Actualiza detalles del archivo o renombra para cambiar la URL.</DialogDescription>
                    </DialogHeader>
                    {editFile && (
                        <Tabs defaultValue="details">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="details">Detalles</TabsTrigger>
                                <TabsTrigger value="rename">Renombrar (Cambiar URL)</TabsTrigger>
                            </TabsList>

                            <TabsContent value="details" className="space-y-4 mt-4">
                                <div className="flex justify-center">
                                    <img
                                        src={editFile.url}
                                        alt={editFile.alt_text || editFile.display_name}
                                        className="max-h-32 rounded-lg object-contain"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-name">Nombre para Mostrar</Label>
                                    <Input
                                        id="edit-name"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        placeholder="Ingresa nombre para mostrar..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-alt">Texto Alternativo</Label>
                                    <Textarea
                                        id="edit-alt"
                                        value={editAlt}
                                        onChange={(e) => setEditAlt(e.target.value)}
                                        placeholder="Describe esta imagen para accesibilidad..."
                                        rows={2}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>URL Actual</Label>
                                    <div className="flex gap-2">
                                        <Input value={editFile.url} readOnly className="text-xs font-mono" />
                                        <Button variant="outline" size="icon" onClick={() => handleCopyUrl(editFile.url)}>
                                            {copiedUrl === editFile.url ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>

                                <Button onClick={handleSaveMetadata} className="w-full" disabled={isPending}>
                                    {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    Guardar Detalles
                                </Button>
                            </TabsContent>

                            <TabsContent value="rename" className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="rename-name">Nuevo Nombre de Archivo</Label>
                                    <Input
                                        id="rename-name"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        placeholder="Ingresa nuevo nombre..."
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Esto creará una nueva URL. Los caracteres especiales serán reemplazados con guiones.
                                    </p>
                                </div>

                                {usage !== null && (usage.products > 0 || usage.templates > 0) && (
                                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                        <div className="flex items-start gap-2">
                                            <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-yellow-600">Este archivo está en uso</p>
                                                <p className="text-xs text-yellow-600/80">
                                                    Usado en {usage.products} producto{usage.products !== 1 ? "s" : ""} y {usage.templates} plantilla{usage.templates !== 1 ? "s" : ""}.
                                                    Renombrar actualizará automáticamente todas las referencias.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {usage === null && (
                                    <div className="flex items-center justify-center py-2">
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        <span className="text-sm text-muted-foreground">Verificando uso...</span>
                                    </div>
                                )}

                                <Button onClick={handleRename} className="w-full" disabled={isRenaming || !editName}>
                                    {isRenaming ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Renombrando...
                                        </>
                                    ) : (
                                        "Renombrar y Actualizar Referencias"
                                    )}
                                </Button>
                            </TabsContent>
                        </Tabs>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
