"use server"

import { supabaseAdmin } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export interface MediaItem {
    name: string
    url: string
    size: number
    type: string
    created_at: string
}

// Upload file to Supabase Storage
export async function uploadMedia(formData: FormData): Promise<{ data: MediaItem | null; error: string | null }> {
    try {
        const file = formData.get("file") as File
        if (!file) {
            return { data: null, error: "No file provided" }
        }

        // Generate unique filename
        const ext = file.name.split(".").pop()
        const timestamp = Date.now()
        const randomStr = Math.random().toString(36).substring(2, 8)
        const fileName = `${timestamp}-${randomStr}.${ext}`

        // Upload to 'media' bucket
        const { data, error } = await supabaseAdmin.storage
            .from("media")
            .upload(fileName, file, {
                cacheControl: "3600",
                upsert: false,
            })

        if (error) {
            console.error("Upload error:", error)
            return { data: null, error: error.message }
        }

        // Get public URL
        const { data: urlData } = supabaseAdmin.storage
            .from("media")
            .getPublicUrl(data.path)

        const mediaItem: MediaItem = {
            name: fileName,
            url: urlData.publicUrl,
            size: file.size,
            type: file.type,
            created_at: new Date().toISOString(),
        }

        revalidatePath("/admin/media")
        return { data: mediaItem, error: null }
    } catch (error) {
        console.error("Error in uploadMedia:", error)
        return { data: null, error: "Failed to upload file" }
    }
}

// List all media files
export async function getMediaFiles(): Promise<{ data: MediaItem[] | null; error: string | null }> {
    try {
        const { data, error } = await supabaseAdmin.storage
            .from("media")
            .list("", {
                limit: 100,
                sortBy: { column: "created_at", order: "desc" },
            })

        if (error) {
            console.error("List error:", error)
            return { data: null, error: error.message }
        }

        // Get public URLs for each file
        const mediaItems: MediaItem[] = data
            .filter(file => !file.name.startsWith(".")) // Exclude hidden files
            .map(file => {
                const { data: urlData } = supabaseAdmin.storage
                    .from("media")
                    .getPublicUrl(file.name)

                return {
                    name: file.name,
                    url: urlData.publicUrl,
                    size: file.metadata?.size || 0,
                    type: file.metadata?.mimetype || "unknown",
                    created_at: file.created_at || "",
                }
            })

        return { data: mediaItems, error: null }
    } catch (error) {
        console.error("Error in getMediaFiles:", error)
        return { data: null, error: "Failed to list files" }
    }
}

// Delete media file
export async function deleteMedia(fileName: string): Promise<{ success: boolean; error: string | null }> {
    try {
        const { error } = await supabaseAdmin.storage
            .from("media")
            .remove([fileName])

        if (error) {
            console.error("Delete error:", error)
            return { success: false, error: error.message }
        }

        revalidatePath("/admin/media")
        return { success: true, error: null }
    } catch (error) {
        console.error("Error in deleteMedia:", error)
        return { success: false, error: "Failed to delete file" }
    }
}

// Delete multiple media files
export async function deleteMultipleMedia(fileNames: string[]): Promise<{ success: boolean; count: number; error: string | null }> {
    try {
        const { error } = await supabaseAdmin.storage
            .from("media")
            .remove(fileNames)

        if (error) {
            console.error("Delete error:", error)
            return { success: false, count: 0, error: error.message }
        }

        revalidatePath("/admin/media")
        return { success: true, count: fileNames.length, error: null }
    } catch (error) {
        console.error("Error in deleteMultipleMedia:", error)
        return { success: false, count: 0, error: "Failed to delete files" }
    }
}
