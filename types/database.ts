// Database types matching Supabase schema

export interface Product {
    id: string
    title: string
    slug: string
    brand: string | null
    category: string | null
    price: number | null
    short_description: string | null
    full_description: string | null
    specs: { key: string; value: string }[]
    seo_metadata: {
        meta_title?: string
        meta_description?: string
    }
    images: string[]
    stock_status: string
    status: 'draft' | 'published' | 'trash'
    is_archived: boolean
    created_at: string
    updated_at: string
}

export interface Subscriber {
    id: string
    email: string
    name: string | null
    company: string | null
    status: 'active' | 'unsubscribed'
    subscribed_at: string
}

export interface Inquiry {
    id: string
    product_id: string | null
    product_name: string | null
    company_name: string
    contact_person: string
    email: string
    quantity: number | null
    requirements: string | null
    attachment_url: string | null
    status: 'New' | 'Viewed' | 'In Progress' | 'Closed'
    admin_notes: string | null
    message_threads: {
        sender: 'admin' | 'customer'
        message: string
        timestamp: string
    }[]
    created_at: string
    updated_at: string
}

export interface EmailTemplate {
    id: string
    name: string
    subject: string
    content: object[]
    html_content: string | null
    created_at: string
    updated_at: string
}

export interface Campaign {
    id: string
    name: string
    subject: string
    template_id: string
    status: 'Draft' | 'Scheduled' | 'Sending' | 'Sent'
    scheduled_at: string | null
    sent_at: string | null
    sent_count: number
    open_count: number
    click_count: number
    created_at: string
    updated_at: string
}

// Email Builder Types
export type BlockType = 'heading' | 'richtext' | 'image' | 'divider' | 'social' | 'product'

export interface EmailBlock {
    id: string
    type: BlockType
    content?: string
    imageUrl?: string
    product?: {
        id: string
        name: string
        brand: string
        image: string
        price?: number
    }
}

// Supabase Database type helper
export interface Database {
    public: {
        Tables: {
            products: {
                Row: Product
                Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>
            }
            subscribers: {
                Row: Subscriber
                Insert: Omit<Subscriber, 'id' | 'subscribed_at'>
                Update: Partial<Omit<Subscriber, 'id' | 'subscribed_at'>>
            }
            inquiries: {
                Row: Inquiry
                Insert: Omit<Inquiry, 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Inquiry, 'id' | 'created_at' | 'updated_at'>>
            }
            email_templates: {
                Row: EmailTemplate
                Insert: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>>
            }
            campaigns: {
                Row: Campaign
                Insert: Omit<Campaign, 'id' | 'created_at'>
                Update: Partial<Omit<Campaign, 'id' | 'created_at'>>
            }
        }
    }
}
