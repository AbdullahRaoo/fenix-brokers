"use client"

import { useState, useEffect, useTransition, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Loader2, Image as ImageIcon, Search, Check, X } from "lucide-react"
import { getMediaFiles, uploadMedia, type MediaItem } from "@/app/actions/media"
import { useToast } from "@/hooks/use-toast"

interface MediaPickerProps {
    value?: string
    onSelect: (url: string) => void
    trigger?: React.ReactNode
}

export function MediaPicker({ value, onSelect, trigger }: MediaPickerProps) {
    const [open, setOpen] = useState(false)
    const [files, setFiles] = useState<MediaItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isUploading, setIsUploading] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedUrl, setSelectedUrl] = useState<string | null>(value || null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { toast } = useToast()

    useEffect(() => {
        if (open) {
            loadFiles()
        }
    }, [open])

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
        const file = uploadedFiles[0]
        const formData = new FormData()
        formData.append("file", file)

        const result = await uploadMedia(formData)
        if (result.data) {
            toast({ title: "File uploaded" })
            setSelectedUrl(result.data.url)
            await loadFiles()
        } else {
            toast({ title: "Upload failed", description: result.error, variant: "destructive" })
        }

        setIsUploading(false)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const handleSelect = () => {
        if (selectedUrl) {
            onSelect(selectedUrl)
            setOpen(false)
        }
    }

    const filteredFiles = files.filter(f =>
        f.display_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (f.mime_type?.startsWith("image/") ?? false)
    )

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" type="button">
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Select Image
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Select Image</DialogTitle>
                    <DialogDescription>Choose from your media library or upload a new image</DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="library" className="flex-1 flex flex-col min-h-0">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="library">Media Library</TabsTrigger>
                        <TabsTrigger value="upload">Upload New</TabsTrigger>
                    </TabsList>

                    <TabsContent value="library" className="flex-1 flex flex-col min-h-0 mt-4">
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search images..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        <div className="flex-1 overflow-auto">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                </div>
                            ) : filteredFiles.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No images found</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-4 gap-3">
                                    {filteredFiles.map((file) => (
                                        <button
                                            key={file.id}
                                            type="button"
                                            onClick={() => setSelectedUrl(file.url)}
                                            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedUrl === file.url
                                                ? "border-primary ring-2 ring-primary/20"
                                                : "border-transparent hover:border-muted"
                                                }`}
                                        >
                                            <img
                                                src={file.url}
                                                alt={file.alt_text || file.display_name}
                                                className="w-full h-full object-cover"
                                            />
                                            {selectedUrl === file.url && (
                                                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                                    <Check className="h-8 w-8 text-white drop-shadow-lg" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="upload" className="flex-1 flex flex-col items-center justify-center mt-4">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleUpload}
                            disabled={isUploading}
                        />
                        <div className="text-center">
                            <div className="w-32 h-32 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center mx-auto mb-4">
                                {isUploading ? (
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                ) : (
                                    <Upload className="h-8 w-8 text-muted-foreground" />
                                )}
                            </div>
                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                            >
                                {isUploading ? "Uploading..." : "Choose File"}
                            </Button>
                            <p className="text-xs text-muted-foreground mt-2">
                                PNG, JPG, GIF up to 10MB
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-between items-center pt-4 border-t mt-4">
                    <div className="flex items-center gap-2">
                        {selectedUrl && (
                            <>
                                <img src={selectedUrl} alt="Selected" className="h-10 w-10 rounded object-cover" />
                                <Button variant="ghost" size="icon" onClick={() => setSelectedUrl(null)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSelect} disabled={!selectedUrl}>
                            Select Image
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
