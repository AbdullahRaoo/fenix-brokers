"use server"

import { supabaseAdmin } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { requirePermission } from "./auth"

export interface SiteSetting {
    id: string
    key: string
    value: string | null
    created_at: string
    updated_at: string
}

// Get all site settings
export async function getSiteSettings() {
    try {
        const { data, error } = await supabaseAdmin
            .from("site_settings")
            .select("*")
            .order("key")

        if (error) {
            console.error("Error fetching site settings:", error)
            return { data: null, error: error.message }
        }

        return { data: data as SiteSetting[], error: null }
    } catch (error) {
        console.error("Error fetching site settings:", error)
        return { data: null, error: "Error al obtener configuración del sitio" }
    }
}

// Get a specific setting by key
export async function getSetting(key: string) {
    try {
        const { data, error } = await supabaseAdmin
            .from("site_settings")
            .select("*")
            .eq("key", key)
            .single()

        if (error) {
            if (error.code === "PGRST116") {
                // No rows found - return null value, not an error
                return { data: null, error: null }
            }
            console.error(`Error fetching setting ${key}:`, error)
            return { data: null, error: error.message }
        }

        return { data: data as SiteSetting, error: null }
    } catch (error) {
        console.error(`Error fetching setting ${key}:`, error)
        return { data: null, error: "Error al obtener configuración" }
    }
}

// Update a setting value (upsert - creates if doesn't exist)
export async function updateSetting(key: string, value: string | null) {
    try {
        // ✅ SECURITY: Verify user has settings edit permission
        await requirePermission('settings.edit')

        const { data, error } = await supabaseAdmin
            .from("site_settings")
            .upsert(
                {
                    key,
                    value,
                    updated_at: new Date().toISOString()
                } as never,
                {
                    onConflict: "key",
                    ignoreDuplicates: false
                }
            )
            .select()
            .single()

        if (error) {
            console.error(`Error updating setting ${key}:`, error)
            return { data: null, error: error.message }
        }

        revalidatePath("/")
        revalidatePath("/admin/settings")
        return { data: data as SiteSetting, error: null }
    } catch (error) {
        console.error(`Error updating setting ${key}:`, error)
        return { data: null, error: "Error al actualizar configuración" }
    }
}

// Update multiple settings at once
export async function updateSettings(settings: { key: string; value: string | null }[]) {
    try {
        // ✅ SECURITY: Verify user has settings edit permission
        await requirePermission('settings.edit')

        const updates = settings.map(s => ({
            key: s.key,
            value: s.value,
            updated_at: new Date().toISOString()
        }))

        const { error } = await supabaseAdmin
            .from("site_settings")
            .upsert(updates as never[], {
                onConflict: "key",
                ignoreDuplicates: false
            })

        if (error) {
            console.error("Error updating settings:", error)
            return { success: false, error: error.message }
        }

        revalidatePath("/")
        revalidatePath("/admin/settings")
        return { success: true, error: null }
    } catch (error) {
        console.error("Error updating settings:", error)
        return { success: false, error: "Error al actualizar configuraciones" }
    }
}

// Get the site logo URL (convenience function)
export async function getSiteLogo() {
    const result = await getSetting("logo_url")
    return result.data?.value || "/logos/PNG/logo-fenix-brokers-1.png"
}

// Get the site name (convenience function)
export async function getSiteName() {
    const result = await getSetting("site_name")
    return result.data?.value || "Fenix Brokers"
}
