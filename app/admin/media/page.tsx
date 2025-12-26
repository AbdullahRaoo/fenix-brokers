"use client"

import { useState, useEffect, useTransition, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Upload, Trash2, Loader2, Copy, Check, Image as ImageIcon, Search, Grid, List, Edit, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth, Can } from "@/components/auth-context"
import { getMediaFiles, uploadMedia, deleteMedia, deleteMultipleMedia, type MediaItem } from "@/app/actions/media"
import { Checkbox } from "@/components/ui/checkbox"
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

interface ExtendedMediaItem extends MediaItem {
    alt?: string
    customName?: string
}

export default function MediaPage() {
    const [files, setFiles] = useState<ExtendedMediaItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isPending, startTransition] = useTransition()
    const [isUploading, setIsUploading] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [editFile, setEditFile] = useState<ExtendedMediaItem | null>(null)
    const [editName, setEditName] = useState("")
    const [editAlt, setEditAlt] = useState("")
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
            // Load any saved metadata from localStorage
            const savedMeta = localStorage.getItem("media_meta") || "{}"
            const meta = JSON.parse(savedMeta)
            setFiles(result.data.map(f => ({
                ...f,
                customName: meta[f.name]?.customName || f.name,
                alt: meta[f.name]?.alt || "",
            })))
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

    const handleDelete = (fileName: string) => {
        startTransition(async () => {
            const result = await deleteMedia(fileName)
            if (result.success) {
                toast({ title: "File deleted" })
                setFiles(files.filter(f => f.name !== fileName))
                setSelectedFiles(prev => {
                    const next = new Set(prev)
                    next.delete(fileName)
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
                setFiles(files.filter(f => !selectedFiles.has(f.name)))
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

    const toggleSelect = (fileName: string) => {
        setSelectedFiles(prev => {
            const next = new Set(prev)
            if (next.has(fileName)) {
                next.delete(fileName)
            } else {
                next.add(fileName)
            }
            return next
        })
    }

    const toggleSelectAll = () => {
        if (selectedFiles.size === filteredFiles.length) {
            setSelectedFiles(new Set())
        } else {
            setSelectedFiles(new Set(filteredFiles.map(f => f.name)))
        }
    }

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    const openEditModal = (file: ExtendedMediaItem) => {
        setEditFile(file)
        setEditName(file.customName || file.name)
        setEditAlt(file.alt || "")
    }

    const saveFileMetadata = () => {
        if (!editFile) return

        // Save to localStorage
        const savedMeta = localStorage.getItem("media_meta") || "{}"
        const meta = JSON.parse(savedMeta)
        meta[editFile.name] = {
            customName: editName,
            alt: editAlt,
        }
        localStorage.setItem("media_meta", JSON.stringify(meta))

        // Update state
        setFiles(files.map(f =>
            f.name === editFile.name ? { ...f, customName: editName, alt: editAlt } : f
        ))

        toast({ title: "File details saved" })
        setEditFile(null)
    }

    const filteredFiles = files.filter(f =>
        (f.customName || f.name).toLowerCase().includes(searchQuery.toLowerCase())
    )

    const isImage = (type: string) => type.startsWith("image/")

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
                            <CardDescription>{files.length} file{files.length !== 1 ? "s" : ""}</CardDescription>
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
                                            This action cannot be undone. These files will be permanently removed.
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
                                    key={file.name}
                                    className={`relative group rounded-lg border-2 overflow-hidden transition-all ${selectedFiles.has(file.name) ? "border-primary" : "border-transparent hover:border-muted"
                                        }`}
                                >
                                    {can("media.delete") && (
                                        <div className="absolute top-2 left-2 z-10">
                                            <Checkbox
                                                checked={selectedFiles.has(file.name)}
                                                onCheckedChange={() => toggleSelect(file.name)}
                                                className="bg-background/80"
                                            />
                                        </div>
                                    )}
                                    <div className="aspect-square bg-muted">
                                        {isImage(file.type) ? (
                                            <img
                                                src={file.url}
                                                alt={file.alt || file.customName || file.name}
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
                                                {copiedUrl === file.url ? (
                                                    <Check className="h-4 w-4" />
                                                ) : (
                                                    <Copy className="h-4 w-4" />
                                                )}
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                onClick={() => openEditModal(file)}
                                                title="Edit details"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                onClick={() => window.open(file.url, "_blank")}
                                                title="View full size"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <Can permission="media.delete">
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(file.name)}
                                                disabled={isPending}
                                            >
                                                <Trash2 className="h-4 w-4 mr-1" />
                                                Delete
                                            </Button>
                                        </Can>
                                    </div>
                                    <div className="p-2 bg-card">
                                        <p className="text-xs truncate font-medium">{file.customName || file.name}</p>
                                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredFiles.map((file) => (
                                <div
                                    key={file.name}
                                    className={`flex items-center gap-4 p-3 rounded-lg border ${selectedFiles.has(file.name) ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                                        }`}
                                >
                                    {can("media.delete") && (
                                        <Checkbox
                                            checked={selectedFiles.has(file.name)}
                                            onCheckedChange={() => toggleSelect(file.name)}
                                        />
                                    )}
                                    <div className="w-12 h-12 rounded bg-muted overflow-hidden flex-shrink-0">
                                        {isImage(file.type) ? (
                                            <img src={file.url} alt={file.alt || file.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{file.customName || file.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatFileSize(file.size)} • {file.type}
                                            {file.alt && <span className="ml-2">• Alt: {file.alt}</span>}
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
                                                onClick={() => handleDelete(file.name)}
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
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Media Details</DialogTitle>
                        <DialogDescription>Update the display name and alt text for this file.</DialogDescription>
                    </DialogHeader>
                    {editFile && (
                        <div className="space-y-4">
                            <div className="flex justify-center">
                                <img
                                    src={editFile.url}
                                    alt={editFile.alt || editFile.name}
                                    className="max-h-40 rounded-lg object-contain"
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
                                <p className="text-xs text-muted-foreground">
                                    Alt text helps screen readers and improves SEO.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>File URL</Label>
                                <div className="flex gap-2">
                                    <Input value={editFile.url} readOnly className="text-xs" />
                                    <Button variant="outline" size="icon" onClick={() => handleCopyUrl(editFile.url)}>
                                        {copiedUrl === editFile.url ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Original filename: {editFile.name}
                                </p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditFile(null)}>Cancel</Button>
                        <Button onClick={saveFileMetadata}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
