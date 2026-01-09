'use server'

import { supabaseAdmin } from '@/lib/supabase'
import type { Subscriber } from '@/types/database'
import { revalidatePath } from 'next/cache'

/**
 * Extract a readable name from an email address
 * Industry-standard approach: parse the local part (before @)
 * Examples:
 *   john.smith@company.com -> John Smith
 *   jane_doe@email.com -> Jane Doe
 *   marketing@brand.com -> Marketing
 *   info@company.com -> Info
 */
function extractNameFromEmail(email: string): string {
    const localPart = email.split('@')[0] || ''

    // Replace common separators with spaces
    const normalized = localPart
        .replace(/[._-]/g, ' ')  // Replace dots, underscores, hyphens with spaces
        .replace(/\d+/g, '')     // Remove numbers
        .trim()

    if (!normalized) {
        return 'Subscriber'
    }

    // Capitalize each word
    return normalized
        .split(' ')
        .filter(word => word.length > 0)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
}

// Subscribe a new email
export async function subscribeEmail(data: {
    email: string
    name?: string
    company?: string
}): Promise<{ success: boolean; error: string | null; alreadySubscribed?: boolean }> {
    try {
        // Check for existing subscriber
        const { data: existing } = await supabaseAdmin
            .from('subscribers')
            .select('id, status')
            .eq('email', data.email.toLowerCase())
            .single()

        if (existing) {
            // If already subscribed and active, just return success
            if (existing.status === 'active') {
                return { success: true, error: null, alreadySubscribed: true }
            }

            // If unsubscribed, reactivate
            await supabaseAdmin
                .from('subscribers')
                .update({ status: 'active' })
                .eq('id', existing.id)

            return { success: true, error: null }
        }

        // Auto-extract name from email if not provided
        const subscriberName = data.name?.trim() || extractNameFromEmail(data.email)

        // Insert new subscriber
        const { error } = await supabaseAdmin
            .from('subscribers')
            .insert({
                email: data.email.toLowerCase(),
                name: subscriberName,
                company: data.company || null,
                status: 'active',
            })

        if (error) {
            console.error('Error subscribing:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/subscribers')

        return { success: true, error: null }
    } catch (error) {
        console.error('Error in subscribeEmail:', error)
        return { success: false, error: 'Error al suscribirse' }
    }
}

// Get all subscribers
export async function getSubscribers(options?: {
    status?: 'active' | 'unsubscribed'
    search?: string
}): Promise<{ data: Subscriber[] | null; error: string | null }> {
    try {
        let query = supabaseAdmin
            .from('subscribers')
            .select('*')
            .order('subscribed_at', { ascending: false })

        if (options?.status) {
            query = query.eq('status', options.status)
        }
        if (options?.search) {
            query = query.or(`email.ilike.%${options.search}%,name.ilike.%${options.search}%,company.ilike.%${options.search}%`)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching subscribers:', error)
            return { data: null, error: error.message }
        }

        return { data: data as Subscriber[], error: null }
    } catch (error) {
        console.error('Error in getSubscribers:', error)
        return { data: null, error: 'Error al obtener suscriptores' }
    }
}

// Unsubscribe an email
export async function unsubscribeEmail(id: string): Promise<{ success: boolean; error: string | null }> {
    try {
        const { error } = await supabaseAdmin
            .from('subscribers')
            .update({ status: 'unsubscribed' })
            .eq('id', id)

        if (error) {
            console.error('Error unsubscribing:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/subscribers')

        return { success: true, error: null }
    } catch (error) {
        console.error('Error in unsubscribeEmail:', error)
        return { success: false, error: 'Error al cancelar suscripción' }
    }
}

// Delete subscriber (hard delete for GDPR compliance)
export async function deleteSubscriber(id: string): Promise<{ success: boolean; error: string | null }> {
    try {
        const { error } = await supabaseAdmin
            .from('subscribers')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting subscriber:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/subscribers')

        return { success: true, error: null }
    } catch (error) {
        console.error('Error in deleteSubscriber:', error)
        return { success: false, error: 'Error al eliminar suscriptor' }
    }
}

// Get subscriber count
export async function getSubscriberCount(): Promise<{ count: number; error: string | null }> {
    try {
        const { count, error } = await supabaseAdmin
            .from('subscribers')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active')

        if (error) {
            console.error('Error counting subscribers:', error)
            return { count: 0, error: error.message }
        }

        return { count: count || 0, error: null }
    } catch (error) {
        console.error('Error in getSubscriberCount:', error)
        return { count: 0, error: 'Error al contar suscriptores' }
    }
}
