"use server"

import { supabaseAdmin } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export interface MediaItem {
    id: string
    storage_path: string
    display_name: string
    alt_text: string | null
    url: string
    mime_type: string | null
    size_bytes: number | null
    created_at: string
    updated_at: string
}

// Upload file to Supabase Storage and create database record
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
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from("media")
            .upload(fileName, file, {
                cacheControl: "3600",
                upsert: false,
            })

        if (uploadError) {
            console.error("Upload error:", uploadError)
            return { data: null, error: uploadError.message }
        }

        // Get public URL
        const { data: urlData } = supabaseAdmin.storage
            .from("media")
            .getPublicUrl(uploadData.path)

        // Create database record
        const { data: dbData, error: dbError } = await supabaseAdmin
            .from("media")
            .insert({
                storage_path: fileName,
                display_name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension for display
                url: urlData.publicUrl,
                mime_type: file.type,
                size_bytes: file.size,
            })
            .select()
            .single()

        if (dbError) {
            console.error("Database error:", dbError)
            // Clean up uploaded file
            await supabaseAdmin.storage.from("media").remove([fileName])
            return { data: null, error: dbError.message }
        }

        revalidatePath("/admin/media")
        return { data: dbData as MediaItem, error: null }
    } catch (error) {
        console.error("Error in uploadMedia:", error)
        return { data: null, error: "Failed to upload file" }
    }
}

// List all media files from database
export async function getMediaFiles(): Promise<{ data: MediaItem[] | null; error: string | null }> {
    try {
        const { data, error } = await supabaseAdmin
            .from("media")
            .select("*")
            .order("created_at", { ascending: false })

        if (error) {
            console.error("Database error:", error)
            return { data: null, error: error.message }
        }

        return { data: data as MediaItem[], error: null }
    } catch (error) {
        console.error("Error in getMediaFiles:", error)
        return { data: null, error: "Failed to list files" }
    }
}

// Get single media file
export async function getMediaById(id: string): Promise<{ data: MediaItem | null; error: string | null }> {
    try {
        const { data, error } = await supabaseAdmin
            .from("media")
            .select("*")
            .eq("id", id)
            .single()

        if (error) {
            return { data: null, error: "Media not found" }
        }

        return { data: data as MediaItem, error: null }
    } catch (error) {
        console.error("Error in getMediaById:", error)
        return { data: null, error: "Failed to get media" }
    }
}

// Update media metadata (display name, alt text)
export async function updateMedia(
    id: string,
    updates: { display_name?: string; alt_text?: string }
): Promise<{ data: MediaItem | null; error: string | null }> {
    try {
        const { data, error } = await supabaseAdmin
            .from("media")
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq("id", id)
            .select()
            .single()

        if (error) {
            return { data: null, error: error.message }
        }

        revalidatePath("/admin/media")
        return { data: data as MediaItem, error: null }
    } catch (error) {
        console.error("Error in updateMedia:", error)
        return { data: null, error: "Failed to update media" }
    }
}

// Rename media file (changes URL)
export async function renameMedia(
    id: string,
    newFileName: string
): Promise<{ data: MediaItem | null; error: string | null }> {
    try {
        // Get current media record
        const { data: media, error: getError } = await supabaseAdmin
            .from("media")
            .select("*")
            .eq("id", id)
            .single()

        if (getError || !media) {
            return { data: null, error: "Media not found" }
        }

        const oldPath = media.storage_path
        const ext = oldPath.split(".").pop()
        const sanitizedName = newFileName.toLowerCase().replace(/[^a-z0-9-]/g, "-")
        const timestamp = Date.now()
        const newPath = `${sanitizedName}-${timestamp}.${ext}`

        // Download the file
        const { data: fileData, error: downloadError } = await supabaseAdmin.storage
            .from("media")
            .download(oldPath)

        if (downloadError || !fileData) {
            console.error("Download error:", downloadError)
            return { data: null, error: "Failed to download file for rename" }
        }

        // Upload with new name
        const { error: uploadError } = await supabaseAdmin.storage
            .from("media")
            .upload(newPath, fileData, {
                cacheControl: "3600",
                upsert: false,
            })

        if (uploadError) {
            console.error("Upload error:", uploadError)
            return { data: null, error: "Failed to upload renamed file" }
        }

        // Get new public URL
        const { data: urlData } = supabaseAdmin.storage
            .from("media")
            .getPublicUrl(newPath)

        const newUrl = urlData.publicUrl
        const oldUrl = media.url

        // Update database record
        const { data: updatedMedia, error: updateError } = await supabaseAdmin
            .from("media")
            .update({
                storage_path: newPath,
                url: newUrl,
                display_name: newFileName,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .select()
            .single()

        if (updateError) {
            // Clean up the new file
            await supabaseAdmin.storage.from("media").remove([newPath])
            return { data: null, error: "Failed to update database" }
        }

        // Update all references
        await updateAllReferences(oldUrl, newUrl)

        // Delete old file
        await supabaseAdmin.storage.from("media").remove([oldPath])

        revalidatePath("/admin/media")
        revalidatePath("/admin/products")
        revalidatePath("/admin/marketing")

        return { data: updatedMedia as MediaItem, error: null }
    } catch (error) {
        console.error("Error in renameMedia:", error)
        return { data: null, error: "Failed to rename file" }
    }
}

// Update all references to a media URL
async function updateAllReferences(oldUrl: string, newUrl: string): Promise<void> {
    try {
        // Update products - images array
        const { data: products } = await supabaseAdmin
            .from("products")
            .select("id, images")

        if (products) {
            for (const product of products) {
                if (product.images && Array.isArray(product.images)) {
                    const updatedImages = product.images.map((img: string) =>
                        img === oldUrl ? newUrl : img
                    )
                    if (JSON.stringify(updatedImages) !== JSON.stringify(product.images)) {
                        await supabaseAdmin
                            .from("products")
                            .update({ images: updatedImages })
                            .eq("id", product.id)
                    }
                }
            }
        }

        // Update email templates - content blocks
        const { data: templates } = await supabaseAdmin
            .from("email_templates")
            .select("id, content")

        if (templates) {
            for (const template of templates) {
                if (template.content) {
                    const contentStr = JSON.stringify(template.content)
                    if (contentStr.includes(oldUrl)) {
                        const updatedContent = JSON.parse(contentStr.replace(new RegExp(escapeRegex(oldUrl), "g"), newUrl))
                        await supabaseAdmin
                            .from("email_templates")
                            .update({ content: updatedContent })
                            .eq("id", template.id)
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error updating references:", error)
    }
}

function escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

// Delete media file
export async function deleteMedia(id: string): Promise<{ success: boolean; error: string | null }> {
    try {
        // Get media record
        const { data: media, error: getError } = await supabaseAdmin
            .from("media")
            .select("storage_path")
            .eq("id", id)
            .single()

        if (getError || !media) {
            return { success: false, error: "Media not found" }
        }

        // Delete from storage
        const { error: storageError } = await supabaseAdmin.storage
            .from("media")
            .remove([media.storage_path])

        if (storageError) {
            console.error("Storage delete error:", storageError)
        }

        // Delete from database
        const { error: dbError } = await supabaseAdmin
            .from("media")
            .delete()
            .eq("id", id)

        if (dbError) {
            return { success: false, error: dbError.message }
        }

        revalidatePath("/admin/media")
        return { success: true, error: null }
    } catch (error) {
        console.error("Error in deleteMedia:", error)
        return { success: false, error: "Failed to delete file" }
    }
}

// Delete multiple media files
export async function deleteMultipleMedia(ids: string[]): Promise<{ success: boolean; count: number; error: string | null }> {
    try {
        let deletedCount = 0

        for (const id of ids) {
            const result = await deleteMedia(id)
            if (result.success) deletedCount++
        }

        revalidatePath("/admin/media")
        return { success: true, count: deletedCount, error: null }
    } catch (error) {
        console.error("Error in deleteMultipleMedia:", error)
        return { success: false, count: 0, error: "Failed to delete files" }
    }
}

// Get usage count for a media file
export async function getMediaUsage(id: string): Promise<{ products: number; templates: number }> {
    try {
        const { data: media } = await supabaseAdmin
            .from("media")
            .select("url")
            .eq("id", id)
            .single()

        if (!media) return { products: 0, templates: 0 }

        // Count products using this URL
        const { data: products } = await supabaseAdmin
            .from("products")
            .select("id, images")

        let productCount = 0
        if (products) {
            for (const product of products) {
                if (product.images && product.images.includes(media.url)) {
                    productCount++
                }
            }
        }

        // Count templates using this URL
        const { data: templates } = await supabaseAdmin
            .from("email_templates")
            .select("id, content")

        let templateCount = 0
        if (templates) {
            for (const template of templates) {
                if (template.content && JSON.stringify(template.content).includes(media.url)) {
                    templateCount++
                }
            }
        }

        return { products: productCount, templates: templateCount }
    } catch (error) {
        console.error("Error getting media usage:", error)
        return { products: 0, templates: 0 }
    }
}
