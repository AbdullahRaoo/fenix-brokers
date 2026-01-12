"use server"

import { supabaseAdmin } from "@/lib/supabase"
import { sendEmail } from "@/lib/resend"
import { revalidatePath } from "next/cache"
import type { Campaign, Subscriber } from "@/types/database"
import { getTemplateById } from "./templates"
import { requirePermission } from "./auth"

// Get all campaigns
export async function getCampaigns() {
    try {
        const { data, error } = await supabaseAdmin
            .from("campaigns")
            .select("*")
            .order("created_at", { ascending: false })

        if (error) throw error
        return { data: data as Campaign[], error: null }
    } catch (error) {
        console.error("Error fetching campaigns:", error)
        return { data: null, error: "Error al obtener campañas" }
    }
}

// Get single campaign
export async function getCampaignById(id: string) {
    try {
        const { data, error } = await supabaseAdmin
            .from("campaigns")
            .select("*")
            .eq("id", id)
            .single()

        if (error) throw error
        return { data: data as Campaign, error: null }
    } catch (error) {
        console.error("Error fetching campaign:", error)
        return { data: null, error: "Campaña no encontrada" }
    }
}

// Create campaign
export async function createCampaign(input: {
    name: string
    template_id: string
    subject: string
    scheduled_at?: string
}) {
    try {
        // ✅ SECURITY: Verify user has create permission
        await requirePermission('campaigns.create')

        const { data, error } = await supabaseAdmin
            .from("campaigns")
            .insert({
                name: input.name,
                template_id: input.template_id,
                subject: input.subject,
                status: input.scheduled_at ? "Scheduled" : "Draft",
                scheduled_at: input.scheduled_at || null,
                sent_count: 0,
                open_count: 0,
                click_count: 0,
            })
            .select()
            .single()

        if (error) {
            console.error("Supabase error creating campaign:", error)
            return { data: null, error: error.message || "Error al crear campaña" }
        }

        revalidatePath("/admin/marketing")
        return { data: data as Campaign, error: null }
    } catch (error) {
        console.error("Error creating campaign:", error)
        const errorMessage = error instanceof Error ? error.message : "Error al crear campaña"
        return { data: null, error: errorMessage }
    }
}

// Update campaign
export async function updateCampaign(id: string, input: {
    name?: string
    template_id?: string
    subject?: string
    status?: Campaign["status"]
    scheduled_at?: string | null
}) {
    try {
        // ✅ SECURITY: Verify user has create permission
        await requirePermission('campaigns.create')

        const updateData: Record<string, unknown> = {}

        if (input.name) updateData.name = input.name
        if (input.template_id) updateData.template_id = input.template_id
        if (input.subject) updateData.subject = input.subject
        if (input.status) updateData.status = input.status
        if (input.scheduled_at !== undefined) updateData.scheduled_at = input.scheduled_at
        updateData.updated_at = new Date().toISOString()

        const { data, error } = await supabaseAdmin
            .from("campaigns")
            .update(updateData)
            .eq("id", id)
            .select()
            .single()

        if (error) throw error

        revalidatePath("/admin/marketing")
        return { data: data as Campaign, error: null }
    } catch (error) {
        console.error("Error updating campaign:", error)
        return { data: null, error: "Error al actualizar campaña" }
    }
}

// Delete campaign
export async function deleteCampaign(id: string) {
    try {
        // ✅ SECURITY: Verify user has delete permission
        await requirePermission('campaigns.delete')

        const { error } = await supabaseAdmin
            .from("campaigns")
            .delete()
            .eq("id", id)

        if (error) throw error

        revalidatePath("/admin/marketing")
        return { success: true, error: null }
    } catch (error) {
        console.error("Error deleting campaign:", error)
        return { success: false, error: "Error al eliminar campaña" }
    }
}

// Send campaign to all active subscribers
export async function sendCampaign(campaignId: string) {
    try {
        // ✅ SECURITY: Verify user has send permission
        await requirePermission('campaigns.send')

        // Get campaign
        const campaignResult = await getCampaignById(campaignId)
        if (!campaignResult.data) {
            return { success: false, error: "Campaña no encontrada" }
        }
        const campaign = campaignResult.data

        // Get template
        const templateResult = await getTemplateById(campaign.template_id)
        if (!templateResult.data) {
            return { success: false, error: "Plantilla no encontrada" }
        }
        const template = templateResult.data

        // Get active subscribers
        const { data: subscribers, error: subError } = await supabaseAdmin
            .from("subscribers")
            .select("*")
            .eq("status", "active")

        if (subError) throw subError
        if (!subscribers || subscribers.length === 0) {
            return { success: false, error: "No se encontraron suscriptores activos" }
        }

        // Update campaign status to sending
        await supabaseAdmin
            .from("campaigns")
            .update({ status: "Sending" })
            .eq("id", campaignId)

        let sentCount = 0
        const errors: string[] = []

        // Send emails in batches of 10
        const batchSize = 10
        for (let i = 0; i < subscribers.length; i += batchSize) {
            const batch = subscribers.slice(i, i + batchSize)

            const sendPromises = batch.map(async (subscriber: Subscriber) => {
                try {
                    // Personalize HTML content
                    const personalizedHtml = template.html_content
                        ?.replace(/\{\{name\}\}/g, subscriber.name || "Suscriptor")
                        .replace(/\{\{email\}\}/g, subscriber.email)
                        .replace(/\{\{unsubscribe_url\}\}/g, `https://fenixbrokers.com/unsubscribe?email=${encodeURIComponent(subscriber.email)}`)

                    console.log(`Sending email to ${subscriber.email}...`)

                    const result = await sendEmail({
                        to: subscriber.email,
                        subject: campaign.subject,
                        html: personalizedHtml || "",
                    })

                    if (result.success) {
                        console.log(`✓ Email sent to ${subscriber.email}`)
                        sentCount++
                    } else {
                        console.error(`✗ Failed to send to ${subscriber.email}:`, result.error)
                        errors.push(`${subscriber.email}: ${result.error}`)
                    }
                } catch (err) {
                    console.error(`✗ Exception sending to ${subscriber.email}:`, err)
                    errors.push(subscriber.email)
                }
            })

            await Promise.all(sendPromises)

            // Small delay between batches to avoid rate limits
            if (i + batchSize < subscribers.length) {
                await new Promise(resolve => setTimeout(resolve, 1000))
            }
        }

        // Update campaign with final stats
        if (sentCount > 0) {
            await supabaseAdmin
                .from("campaigns")
                .update({
                    status: "Sent",
                    sent_at: new Date().toISOString(),
                    sent_count: sentCount,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", campaignId)
        } else {
            // If no emails were sent, revert to Draft and log warning
            console.warn("Campaign processing completed but 0 emails were sent.")
            await supabaseAdmin
                .from("campaigns")
                .update({
                    status: "Draft",
                    // metrics remain 0
                })
                .eq("id", campaignId)

            // If we have errors, return the first one as the main error
            if (errors.length > 0) {
                return {
                    success: false,
                    error: `No se enviaron emails. Errores: ${errors.slice(0, 3).join(", ")}`,
                    sentCount: 0,
                    totalSubscribers: subscribers.length,
                    errors
                }
            }
        }

        revalidatePath("/admin/marketing")

        return {
            success: sentCount > 0,
            sentCount,
            totalSubscribers: subscribers.length,
            errors: errors.length > 0 ? errors : null,
            error: sentCount === 0 ? "No se enviaron emails (verifique configuración de Resend)" : null
        }
    } catch (error) {
        console.error("Error sending campaign:", error)

        // Update campaign status to failed
        await supabaseAdmin
            .from("campaigns")
            .update({ status: "Draft" })
            .eq("id", campaignId)

        return { success: false, error: "Error al enviar campaña: " + (error instanceof Error ? error.message : "Error desconocido") }
    }
}

// Preview campaign email (returns HTML)
export async function previewCampaign(campaignId: string) {
    try {
        const campaignResult = await getCampaignById(campaignId)
        if (!campaignResult.data) {
            return { html: null, error: "Campaña no encontrada" }
        }

        const templateResult = await getTemplateById(campaignResult.data.template_id)
        if (!templateResult.data) {
            return { html: null, error: "Plantilla no encontrada" }
        }

        // Replace placeholders with sample data
        const previewHtml = templateResult.data.html_content
            ?.replace(/\{\{name\}\}/g, "John Doe")
            .replace(/\{\{email\}\}/g, "john@example.com")
            .replace(/\{\{unsubscribe_url\}\}/g, "#")

        return { html: previewHtml, error: null }
    } catch (error) {
        console.error("Error previewing campaign:", error)
        return { html: null, error: "Error al previsualizar campaña" }
    }
}
