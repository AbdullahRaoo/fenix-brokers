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

        for (const file of Array.from(uploadedFiles)) {
            const formData = new FormData()
            formData.append("file", file)

            const result = await uploadMedia(formData)
            if (result.data) {
                successCount++
            }
        }

        toast({
            title: "Upload complete",
            description: `${successCount} file${successCount !== 1 ? "s" : ""} uploaded`,
        })

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
                toast({ title: "File deleted" })
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
                toast({ title: `${result.count} files deleted` })
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
        toast({ title: "URL copied to clipboard" })
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
        if (!bytes) return "Unknown"
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

            toast({ title: "Details updated" })
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
            title: "File renamed",
            description: usage && (usage.products > 0 || usage.templates > 0)
                ? `Updated ${usage.products} product(s) and ${usage.templates} template(s)`
                : "URL has been updated"
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
                    <h1 className="text-3xl font-bold mb-2">Media Library</h1>
                    <p className="text-muted-foreground">Manage images and files for products and emails</p>
                </div>
                <Can permission="media.upload">
                    <div className="flex gap-2">
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
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload
                                </>
                            )}
                        </Button>
                    </div>
                </Can>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Files</CardTitle>
                            <CardDescription>{files.length} file{files.length !== 1 ? "s" : ""} in library</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search files..."
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
                            <span className="text-sm">{selectedFiles.size} selected</span>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Selected
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete {selectedFiles.size} files?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will permanently delete these files. Any products or templates using them will show broken images.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeleteSelected} className="bg-destructive">
                                            Delete
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
                            <p className="text-lg mb-2">No media files</p>
                            <p className="text-sm">Upload images to use in products and emails</p>
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
                                                title="Copy URL"
                                            >
                                                {copiedUrl === file.url ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                onClick={() => openEditModal(file)}
                                                title="Edit"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                onClick={() => window.open(file.url, "_blank")}
                                                title="View"
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
                                                Delete
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
                                            {formatFileSize(file.size_bytes)} • {file.mime_type || "Unknown type"}
                                        </p>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => handleCopyUrl(file.url)} title="Copy URL">
                                            {copiedUrl === file.url ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => openEditModal(file)} title="Edit">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => window.open(file.url, "_blank")} title="View">
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
                        <DialogTitle>Edit Media</DialogTitle>
                        <DialogDescription>Update file details or rename to change the URL.</DialogDescription>
                    </DialogHeader>
                    {editFile && (
                        <Tabs defaultValue="details">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="details">Details</TabsTrigger>
                                <TabsTrigger value="rename">Rename (Change URL)</TabsTrigger>
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
                                    <Label htmlFor="edit-name">Display Name</Label>
                                    <Input
                                        id="edit-name"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        placeholder="Enter display name..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-alt">Alt Text</Label>
                                    <Textarea
                                        id="edit-alt"
                                        value={editAlt}
                                        onChange={(e) => setEditAlt(e.target.value)}
                                        placeholder="Describe this image for accessibility..."
                                        rows={2}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Current URL</Label>
                                    <div className="flex gap-2">
                                        <Input value={editFile.url} readOnly className="text-xs font-mono" />
                                        <Button variant="outline" size="icon" onClick={() => handleCopyUrl(editFile.url)}>
                                            {copiedUrl === editFile.url ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>

                                <Button onClick={handleSaveMetadata} className="w-full" disabled={isPending}>
                                    {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    Save Details
                                </Button>
                            </TabsContent>

                            <TabsContent value="rename" className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="rename-name">New File Name</Label>
                                    <Input
                                        id="rename-name"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        placeholder="Enter new name..."
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        This will create a new URL. Special characters will be replaced with dashes.
                                    </p>
                                </div>

                                {usage !== null && (usage.products > 0 || usage.templates > 0) && (
                                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                        <div className="flex items-start gap-2">
                                            <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-yellow-600">This file is in use</p>
                                                <p className="text-xs text-yellow-600/80">
                                                    Used in {usage.products} product{usage.products !== 1 ? "s" : ""} and {usage.templates} template{usage.templates !== 1 ? "s" : ""}.
                                                    Renaming will automatically update all references.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {usage === null && (
                                    <div className="flex items-center justify-center py-2">
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        <span className="text-sm text-muted-foreground">Checking usage...</span>
                                    </div>
                                )}

                                <Button onClick={handleRename} className="w-full" disabled={isRenaming || !editName}>
                                    {isRenaming ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Renaming...
                                        </>
                                    ) : (
                                        "Rename & Update References"
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
