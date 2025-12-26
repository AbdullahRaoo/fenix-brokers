"use client"

import { useState, useEffect, useTransition, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Trash2, Loader2, Copy, Check, Image as ImageIcon, Search, Grid, List } from "lucide-react"
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

export default function MediaPage() {
    const [files, setFiles] = useState<MediaItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isPending, startTransition] = useTransition()
    const [isUploading, setIsUploading] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
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

    const filteredFiles = files.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
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
                                                alt={file.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            onClick={() => handleCopyUrl(file.url)}
                                        >
                                            {copiedUrl === file.url ? (
                                                <Check className="h-4 w-4" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                        </Button>
                                        <Can permission="media.delete">
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => handleDelete(file.name)}
                                                disabled={isPending}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </Can>
                                    </div>
                                    <div className="p-2 bg-card">
                                        <p className="text-xs truncate">{file.name}</p>
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
                                            <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)} • {file.type}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => handleCopyUrl(file.url)}>
                                            {copiedUrl === file.url ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                        <Can permission="media.delete">
                                            <Button
                                                variant="ghost"
                                                size="sm"
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
        </div>
    )
}
