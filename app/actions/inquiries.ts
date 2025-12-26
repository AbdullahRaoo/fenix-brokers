'use server'

import { supabaseAdmin } from '@/lib/supabase'
import { sendEmail } from '@/lib/resend'
import type { Inquiry } from '@/types/database'
import { revalidatePath } from 'next/cache'

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
        return { data: null, error: 'Failed to submit quote request' }
    }
}

// Get all inquiries
export async function getInquiries(options?: {
    status?: string
    search?: string
}): Promise<{ data: Inquiry[] | null; error: string | null }> {
    try {
        let query = supabaseAdmin
            .from('inquiries')
            .select('*')
            .order('created_at', { ascending: false })

        if (options?.status) {
            query = query.eq('status', options.status)
        }
        if (options?.search) {
            query = query.or(`company_name.ilike.%${options.search}%,product_name.ilike.%${options.search}%,email.ilike.%${options.search}%`)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching inquiries:', error)
            return { data: null, error: error.message }
        }

        return { data: data as Inquiry[], error: null }
    } catch (error) {
        console.error('Error in getInquiries:', error)
        return { data: null, error: 'Failed to fetch inquiries' }
    }
}

// Get single inquiry by ID
export async function getInquiryById(id: string): Promise<{ data: Inquiry | null; error: string | null }> {
    try {
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
        return { data: null, error: 'Failed to fetch inquiry' }
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
        return { data: null, error: 'Failed to update inquiry' }
    }
}

// Send reply to customer
export async function replyToInquiry(
    id: string,
    message: string
): Promise<{ success: boolean; error: string | null }> {
    try {
        // Get the inquiry first
        const { data: inquiry, error: fetchError } = await supabaseAdmin
            .from('inquiries')
            .select('*')
            .eq('id', id)
            .single()

        if (fetchError || !inquiry) {
            return { success: false, error: 'Inquiry not found' }
        }

        // Send email to customer
        const emailResult = await sendEmail({
            to: inquiry.email,
            subject: `Re: Quote Request - ${inquiry.product_name}`,
            html: `
        <h2>Response to Your Quote Request</h2>
        <p>Dear ${inquiry.contact_person},</p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><em>Original Request:</em></p>
        <p><strong>Product:</strong> ${inquiry.product_name}</p>
        <p><strong>Quantity:</strong> ${inquiry.quantity}</p>
        <hr>
        <p>Best regards,<br>ProSupply Wholesale Team</p>
      `,
        })

        if (!emailResult.success) {
            return { success: false, error: 'Failed to send email' }
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
        return { success: false, error: 'Failed to reply to inquiry' }
    }
}

// Upload file to Supabase Storage
export async function uploadAttachment(file: File): Promise<{ url: string | null; error: string | null }> {
    try {
        const fileName = `${Date.now()}-${file.name}`

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
        return { url: null, error: 'Failed to upload file' }
    }
}
