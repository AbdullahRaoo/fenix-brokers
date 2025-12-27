'use server'

import { supabaseAdmin } from '@/lib/supabase'
import type { Product } from '@/types/database'
import { revalidatePath } from 'next/cache'

// Generate URL-friendly slug from title
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
}

export type ProductStatus = 'draft' | 'published' | 'trash'

// Get all products (with optional filters)
export async function getProducts(options?: {
    category?: string
    brand?: string
    search?: string
    sortBy?: 'newest' | 'price-high' | 'price-low' | 'alphabetical'
    status?: ProductStatus | 'all'
    includeArchived?: boolean
    limit?: number
}): Promise<{ data: Product[] | null; error: string | null }> {
    try {
        let query = supabaseAdmin
            .from('products')
            .select('*')

        // Filter by status
        if (options?.status && options.status !== 'all') {
            query = query.eq('status', options.status)
        } else if (!options?.status) {
            // Default: show only published for public, exclude trash
            query = query.neq('status', 'trash')
        }

        // Apply filters
        if (options?.category) {
            query = query.eq('category', options.category)
        }
        if (options?.brand) {
            query = query.eq('brand', options.brand)
        }
        if (options?.search) {
            query = query.or(`title.ilike.%${options.search}%,slug.ilike.%${options.search}%,brand.ilike.%${options.search}%`)
        }

        // Apply sorting
        switch (options?.sortBy) {
            case 'newest':
                query = query.order('created_at', { ascending: false })
                break
            case 'price-high':
                query = query.order('price', { ascending: false, nullsFirst: false })
                break
            case 'price-low':
                query = query.order('price', { ascending: true, nullsFirst: false })
                break
            case 'alphabetical':
                query = query.order('title', { ascending: true })
                break
            default:
                query = query.order('created_at', { ascending: false })
        }

        // Apply limit if specified
        if (options?.limit) {
            query = query.limit(options.limit)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching products:', error)
            return { data: null, error: error.message }
        }

        return { data: data as Product[], error: null }
    } catch (error) {
        console.error('Error in getProducts:', error)
        return { data: null, error: 'Failed to fetch products' }
    }
}

// Get single product by slug (only published)
export async function getProductBySlug(slug: string): Promise<{ data: Product | null; error: string | null }> {
    try {
        const { data, error } = await supabaseAdmin
            .from('products')
            .select('*')
            .eq('slug', slug)
            .eq('status', 'published')
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return { data: null, error: 'Product not found' }
            }
            console.error('Error fetching product:', error)
            return { data: null, error: error.message }
        }

        return { data: data as Product, error: null }
    } catch (error) {
        console.error('Error in getProductBySlug:', error)
        return { data: null, error: 'Failed to fetch product' }
    }
}

// Get single product by ID (any status)
export async function getProductById(id: string): Promise<{ data: Product | null; error: string | null }> {
    try {
        const { data, error } = await supabaseAdmin
            .from('products')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            console.error('Error fetching product:', error)
            return { data: null, error: error.message }
        }

        return { data: data as Product, error: null }
    } catch (error) {
        console.error('Error in getProductById:', error)
        return { data: null, error: 'Failed to fetch product' }
    }
}

// Create a new product
export async function createProduct(productData: {
    title: string
    brand?: string
    category?: string
    price?: number
    short_description?: string
    full_description?: string
    specs?: { key: string; value: string }[]
    seo_metadata?: { meta_title?: string; meta_description?: string }
    images?: string[]
    stock_status?: string
    status?: ProductStatus
}): Promise<{ data: Product | null; error: string | null }> {
    try {
        // Generate slug from title
        let slug = generateSlug(productData.title)

        // Check for duplicate slug and append number if needed
        const { data: existingProducts } = await supabaseAdmin
            .from('products')
            .select('slug')
            .like('slug', `${slug}%`)

        if (existingProducts && existingProducts.length > 0) {
            slug = `${slug}-${existingProducts.length + 1}`
        }

        const { data, error } = await supabaseAdmin
            .from('products')
            .insert({
                ...productData,
                slug,
                specs: productData.specs || [],
                seo_metadata: productData.seo_metadata || {},
                images: productData.images || [],
                stock_status: productData.stock_status || 'In Stock',
                status: productData.status || 'draft',
                is_archived: false,
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating product:', error)
            return { data: null, error: error.message }
        }

        revalidatePath('/admin/products')
        revalidatePath('/catalog')

        return { data: data as Product, error: null }
    } catch (error) {
        console.error('Error in createProduct:', error)
        return { data: null, error: 'Failed to create product' }
    }
}

// Update a product
export async function updateProduct(
    id: string,
    productData: Partial<{
        title: string
        brand: string
        category: string
        price: number
        short_description: string
        full_description: string
        specs: { key: string; value: string }[]
        seo_metadata: { meta_title?: string; meta_description?: string }
        images: string[]
        stock_status: string
        status: ProductStatus
    }>
): Promise<{ data: Product | null; error: string | null }> {
    try {
        // If title is being updated, regenerate slug
        let updateData: Record<string, unknown> = { ...productData }
        if (productData.title) {
            let slug = generateSlug(productData.title)

            // Check for duplicate slug (excluding current product)
            const { data: existingProducts } = await supabaseAdmin
                .from('products')
                .select('slug')
                .like('slug', `${slug}%`)
                .neq('id', id)

            if (existingProducts && existingProducts.length > 0) {
                slug = `${slug}-${existingProducts.length + 1}`
            }

            updateData = { ...updateData, slug }
        }

        const { data, error } = await supabaseAdmin
            .from('products')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error updating product:', error)
            return { data: null, error: error.message }
        }

        revalidatePath('/admin/products')
        revalidatePath('/catalog')
        revalidatePath(`/product/${data.slug}`)

        return { data: data as Product, error: null }
    } catch (error) {
        console.error('Error in updateProduct:', error)
        return { data: null, error: 'Failed to update product' }
    }
}

// Move product to trash (soft delete)
export async function trashProduct(id: string): Promise<{ success: boolean; error: string | null }> {
    try {
        const { error } = await supabaseAdmin
            .from('products')
            .update({ status: 'trash' })
            .eq('id', id)

        if (error) {
            console.error('Error trashing product:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/products')
        revalidatePath('/catalog')

        return { success: true, error: null }
    } catch (error) {
        console.error('Error in trashProduct:', error)
        return { success: false, error: 'Failed to trash product' }
    }
}

// Restore product from trash
export async function restoreProduct(id: string): Promise<{ success: boolean; error: string | null }> {
    try {
        const { error } = await supabaseAdmin
            .from('products')
            .update({ status: 'draft' })
            .eq('id', id)

        if (error) {
            console.error('Error restoring product:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/products')

        return { success: true, error: null }
    } catch (error) {
        console.error('Error in restoreProduct:', error)
        return { success: false, error: 'Failed to restore product' }
    }
}

// Permanently delete product (hard delete)
export async function deleteProductPermanently(id: string): Promise<{ success: boolean; error: string | null }> {
    try {
        const { error } = await supabaseAdmin
            .from('products')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting product:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/products')
        revalidatePath('/catalog')

        return { success: true, error: null }
    } catch (error) {
        console.error('Error in deleteProductPermanently:', error)
        return { success: false, error: 'Failed to delete product' }
    }
}

// Empty trash (delete all trashed products permanently)
export async function emptyTrash(): Promise<{ success: boolean; count: number; error: string | null }> {
    try {
        const { data, error } = await supabaseAdmin
            .from('products')
            .delete()
            .eq('status', 'trash')
            .select('id')

        if (error) {
            console.error('Error emptying trash:', error)
            return { success: false, count: 0, error: error.message }
        }

        revalidatePath('/admin/products')

        return { success: true, count: data?.length || 0, error: null }
    } catch (error) {
        console.error('Error in emptyTrash:', error)
        return { success: false, count: 0, error: 'Failed to empty trash' }
    }
}

// Publish product
export async function publishProduct(id: string): Promise<{ success: boolean; error: string | null }> {
    try {
        const { error } = await supabaseAdmin
            .from('products')
            .update({ status: 'published' })
            .eq('id', id)

        if (error) {
            console.error('Error publishing product:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/products')
        revalidatePath('/catalog')

        return { success: true, error: null }
    } catch (error) {
        console.error('Error in publishProduct:', error)
        return { success: false, error: 'Failed to publish product' }
    }
}

// Unpublish product (back to draft)
export async function unpublishProduct(id: string): Promise<{ success: boolean; error: string | null }> {
    try {
        const { error } = await supabaseAdmin
            .from('products')
            .update({ status: 'draft' })
            .eq('id', id)

        if (error) {
            console.error('Error unpublishing product:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/products')
        revalidatePath('/catalog')

        return { success: true, error: null }
    } catch (error) {
        console.error('Error in unpublishProduct:', error)
        return { success: false, error: 'Failed to unpublish product' }
    }
}

// Get distinct categories (only from published products)
export async function getCategories(): Promise<{ data: string[]; error: string | null }> {
    try {
        const { data, error } = await supabaseAdmin
            .from('products')
            .select('category')
            .eq('status', 'published')
            .not('category', 'is', null)

        if (error) {
            console.error('Error fetching categories:', error)
            return { data: [], error: error.message }
        }

        const categories = [...new Set(data.map(p => p.category).filter(Boolean))] as string[]
        return { data: categories, error: null }
    } catch (error) {
        console.error('Error in getCategories:', error)
        return { data: [], error: 'Failed to fetch categories' }
    }
}

// Get distinct brands (only from published products)
export async function getBrands(): Promise<{ data: string[]; error: string | null }> {
    try {
        const { data, error } = await supabaseAdmin
            .from('products')
            .select('brand')
            .eq('status', 'published')
            .not('brand', 'is', null)

        if (error) {
            console.error('Error fetching brands:', error)
            return { data: [], error: error.message }
        }

        const brands = [...new Set(data.map(p => p.brand).filter(Boolean))] as string[]
        return { data: brands, error: null }
    } catch (error) {
        console.error('Error in getBrands:', error)
        return { data: [], error: 'Failed to fetch brands' }
    }
}

// Get product counts by status
export async function getProductCounts(): Promise<{
    all: number
    draft: number
    published: number
    trash: number
    error: string | null
}> {
    try {
        const [allRes, draftRes, publishedRes, trashRes] = await Promise.all([
            supabaseAdmin.from('products').select('id', { count: 'exact', head: true }).neq('status', 'trash'),
            supabaseAdmin.from('products').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
            supabaseAdmin.from('products').select('id', { count: 'exact', head: true }).eq('status', 'published'),
            supabaseAdmin.from('products').select('id', { count: 'exact', head: true }).eq('status', 'trash'),
        ])

        return {
            all: allRes.count || 0,
            draft: draftRes.count || 0,
            published: publishedRes.count || 0,
            trash: trashRes.count || 0,
            error: null,
        }
    } catch (error) {
        console.error('Error in getProductCounts:', error)
        return { all: 0, draft: 0, published: 0, trash: 0, error: 'Failed to get counts' }
    }
}
