'use server'

import { supabaseAdmin } from '@/lib/supabase'
import { sendEmail } from '@/lib/resend'
import type { Inquiry } from '@/types/database'
import { revalidatePath } from 'next/cache'
import { requirePermission } from './auth'

// Security constants
const ALLOWED_ATTACHMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024 // 10MB

// Escape search input to prevent SQL injection
function escapeSearchTerm(term: string): string {
    return term
        .replace(/[%_\\]/g, '\\$&')
        .replace(/'/g, "''")
        .slice(0, 100)
}

// Escape HTML to prevent XSS in emails
function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
}

// Submit a new quote request
export async function submitQuoteRequest(formData: {
    productId?: string
    productName: string
    companyName: string
    contactPerson: string
    email: string
    quantity: number
    requirements?: string
    attachmentUrl?: string
}): Promise<{ data: Inquiry | null; error: string | null }> {
    try {
        const { data, error } = await supabaseAdmin
            .from('inquiries')
            .insert({
                product_id: formData.productId || null,
                product_name: formData.productName,
                company_name: formData.companyName,
                contact_person: formData.contactPerson,
                email: formData.email,
                quantity: formData.quantity,
                requirements: formData.requirements || null,
                attachment_url: formData.attachmentUrl || null,
                status: 'New',
                admin_notes: null,
                message_threads: [],
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating inquiry:', error)
            return { data: null, error: error.message }
        }

        // Send notification email to admin
        await sendEmail({
            to: 'admin@example.com', // TODO: Make this configurable
            subject: `New Quote Request: ${formData.productName}`,
            html: `
        <h2>New Quote Request Received</h2>
        <p><strong>Product:</strong> ${formData.productName}</p>
        <p><strong>Company:</strong> ${formData.companyName}</p>
        <p><strong>Contact:</strong> ${formData.contactPerson}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Quantity:</strong> ${formData.quantity}</p>
        ${formData.requirements ? `<p><strong>Requirements:</strong> ${formData.requirements}</p>` : ''}
        <p><a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/inquiries/${data.id}">View in Admin</a></p>
      `,
        })

        revalidatePath('/admin/inquiries')

        return { data: data as Inquiry, error: null }
    } catch (error) {
        console.error('Error in submitQuoteRequest:', error)
        return { data: null, error: 'Error al enviar solicitud de cotización' }
    }
}

// Get all inquiries
export async function getInquiries(options?: {
    status?: string
    search?: string
}): Promise<{ data: Inquiry[] | null; error: string | null }> {
    try {
        // ✅ SECURITY: Verify user has view permission
        await requirePermission('inquiries.view')

        let query = supabaseAdmin
            .from('inquiries')
            .select('*')
            .order('created_at', { ascending: false })

        if (options?.status) {
            query = query.eq('status', options.status)
        }
        if (options?.search) {
            // ✅ SECURITY: Escape search term
            const safeSearch = escapeSearchTerm(options.search)
            query = query.or(`company_name.ilike.%${safeSearch}%,product_name.ilike.%${safeSearch}%,email.ilike.%${safeSearch}%`)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching inquiries:', error)
            return { data: null, error: error.message }
        }

        return { data: data as Inquiry[], error: null }
    } catch (error) {
        console.error('Error in getInquiries:', error)
        return { data: null, error: 'Error al obtener consultas' }
    }
}

// Get single inquiry by ID
export async function getInquiryById(id: string): Promise<{ data: Inquiry | null; error: string | null }> {
    try {
        // ✅ SECURITY: Verify user has view permission
        await requirePermission('inquiries.view')

        const { data, error } = await supabaseAdmin
            .from('inquiries')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            console.error('Error fetching inquiry:', error)
            return { data: null, error: error.message }
        }

        return { data: data as Inquiry, error: null }
    } catch (error) {
        console.error('Error in getInquiryById:', error)
        return { data: null, error: 'Error al obtener consulta' }
    }
}

// Update inquiry status and notes
export async function updateInquiry(
    id: string,
    data: {
        status?: Inquiry['status']
        admin_notes?: string
    }
): Promise<{ data: Inquiry | null; error: string | null }> {
    try {
        // ✅ SECURITY: Verify user has reply permission
        await requirePermission('inquiries.reply')

        const { data: inquiry, error } = await supabaseAdmin
            .from('inquiries')
            .update(data)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error updating inquiry:', error)
            return { data: null, error: error.message }
        }

        revalidatePath('/admin/inquiries')
        revalidatePath(`/admin/inquiries/${id}`)

        return { data: inquiry as Inquiry, error: null }
    } catch (error) {
        console.error('Error in updateInquiry:', error)
        return { data: null, error: 'Error al actualizar consulta' }
    }
}

// Send reply to customer
export async function replyToInquiry(
    id: string,
    message: string
): Promise<{ success: boolean; error: string | null }> {
    try {
        // ✅ SECURITY: Verify user has reply permission
        await requirePermission('inquiries.reply')

        // Get the inquiry first
        const { data: inquiry, error: fetchError } = await supabaseAdmin
            .from('inquiries')
            .select('*')
            .eq('id', id)
            .single()

        if (fetchError || !inquiry) {
            return { success: false, error: 'Consulta no encontrada' }
        }

        // ✅ SECURITY: Escape message content to prevent XSS
        const safeMessage = escapeHtml(message)

        // Send email to customer
        const emailResult = await sendEmail({
            to: inquiry.email,
            subject: `Re: Quote Request - ${escapeHtml(inquiry.product_name)}`,
            html: `
        <h2>Response to Your Quote Request</h2>
        <p>Dear ${escapeHtml(inquiry.contact_person)},</p>
        <p>${safeMessage.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><em>Original Request:</em></p>
        <p><strong>Product:</strong> ${escapeHtml(inquiry.product_name)}</p>
        <p><strong>Quantity:</strong> ${inquiry.quantity}</p>
        <hr>
        <p>Best regards,<br>ProSupply Wholesale Team</p>
      `,
        })

        if (!emailResult.success) {
            return { success: false, error: 'Error al enviar email' }
        }

        // Update message threads and status
        const messageThreads = inquiry.message_threads || []
        messageThreads.push({
            sender: 'admin',
            message,
            timestamp: new Date().toISOString(),
        })

        await supabaseAdmin
            .from('inquiries')
            .update({
                message_threads: messageThreads,
                status: inquiry.status === 'New' ? 'In Progress' : inquiry.status,
            })
            .eq('id', id)

        revalidatePath('/admin/inquiries')
        revalidatePath(`/admin/inquiries/${id}`)

        return { success: true, error: null }
    } catch (error) {
        console.error('Error in replyToInquiry:', error)
        return { success: false, error: 'Error al responder consulta' }
    }
}

// Upload file to Supabase Storage
export async function uploadAttachment(file: File): Promise<{ url: string | null; error: string | null }> {
    try {
        // ✅ SECURITY: Verify user is authenticated (public users can also submit)
        // Note: This is called from public quote form, so no permission check

        // ✅ SECURITY: Validate file type
        if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type)) {
            return { url: null, error: `Tipo de archivo no permitido. Permitidos: PDF, Word, imágenes` }
        }

        // ✅ SECURITY: Validate file size
        if (file.size > MAX_ATTACHMENT_SIZE) {
            return { url: null, error: `Archivo demasiado grande. Máximo: ${MAX_ATTACHMENT_SIZE / 1024 / 1024}MB` }
        }

        // ✅ SECURITY: Sanitize filename
        const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '-').toLowerCase()
        const fileName = `${Date.now()}-${safeFilename}`

        const { data, error } = await supabaseAdmin.storage
            .from('attachments')
            .upload(fileName, file)

        if (error) {
            console.error('Error uploading file:', error)
            return { url: null, error: error.message }
        }

        const { data: urlData } = supabaseAdmin.storage
            .from('attachments')
            .getPublicUrl(data.path)

        return { url: urlData.publicUrl, error: null }
    } catch (error) {
        console.error('Error in uploadAttachment:', error)
        return { url: null, error: 'Error al subir archivo' }
    }
}
