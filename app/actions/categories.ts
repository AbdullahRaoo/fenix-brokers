'use server'

import { supabaseAdmin } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export interface Category {
    id: string
    name: string
    slug: string
    description: string | null
    image_url: string | null
    created_at: string
    updated_at: string
}

// Generate URL-friendly slug from name
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
}

// Get all categories
export async function getCategories(): Promise<{ data: Category[] | null; error: string | null }> {
    try {
        const { data, error } = await supabaseAdmin
            .from('categories')
            .select('*')
            .order('name', { ascending: true })

        if (error) {
            console.error('Error fetching categories:', error)
            return { data: null, error: error.message }
        }

        return { data: data as Category[], error: null }
    } catch (error) {
        console.error('Error in getCategories:', error)
        return { data: null, error: 'Error al obtener categorías' }
    }
}

// Get single category by ID
export async function getCategoryById(id: string): Promise<{ data: Category | null; error: string | null }> {
    try {
        const { data, error } = await supabaseAdmin
            .from('categories')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            console.error('Error fetching category:', error)
            return { data: null, error: error.message }
        }

        return { data: data as Category, error: null }
    } catch (error) {
        console.error('Error in getCategoryById:', error)
        return { data: null, error: 'Error al obtener categoría' }
    }
}

// Create a new category
export async function createCategory(data: {
    name: string
    description?: string
    image_url?: string
}): Promise<{ data: Category | null; error: string | null }> {
    try {
        const slug = generateSlug(data.name)

        // Check if slug already exists
        const { data: existing } = await supabaseAdmin
            .from('categories')
            .select('id')
            .eq('slug', slug)
            .single()

        if (existing) {
            return { data: null, error: 'Ya existe una categoría con este nombre' }
        }

        const { data: newCategory, error } = await supabaseAdmin
            .from('categories')
            .insert({
                name: data.name,
                slug,
                description: data.description || null,
                image_url: data.image_url || null,
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating category:', error)
            return { data: null, error: error.message }
        }

        revalidatePath('/admin/categories')
        revalidatePath('/catalog')
        revalidatePath('/')

        return { data: newCategory as Category, error: null }
    } catch (error) {
        console.error('Error in createCategory:', error)
        return { data: null, error: 'Error al crear categoría' }
    }
}

// Update an existing category
export async function updateCategory(
    id: string,
    data: {
        name?: string
        description?: string
        image_url?: string
    }
): Promise<{ data: Category | null; error: string | null }> {
    try {
        const updateData: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        }

        if (data.name) {
            updateData.name = data.name
            updateData.slug = generateSlug(data.name)
        }
        if (data.description !== undefined) {
            updateData.description = data.description || null
        }
        if (data.image_url !== undefined) {
            updateData.image_url = data.image_url || null
        }

        const { data: updatedCategory, error } = await supabaseAdmin
            .from('categories')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error updating category:', error)
            return { data: null, error: error.message }
        }

        revalidatePath('/admin/categories')
        revalidatePath('/catalog')
        revalidatePath('/')

        return { data: updatedCategory as Category, error: null }
    } catch (error) {
        console.error('Error in updateCategory:', error)
        return { data: null, error: 'Error al actualizar categoría' }
    }
}

// Delete a category
export async function deleteCategory(id: string): Promise<{ success: boolean; error: string | null }> {
    try {
        const { error } = await supabaseAdmin
            .from('categories')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting category:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/categories')
        revalidatePath('/catalog')
        revalidatePath('/')

        return { success: true, error: null }
    } catch (error) {
        console.error('Error in deleteCategory:', error)
        return { success: false, error: 'Error al eliminar categoría' }
    }
}

// Get product count for a category (counts from products table)
export async function getCategoryProductCount(categoryName: string): Promise<{ count: number; error: string | null }> {
    try {
        const { count, error } = await supabaseAdmin
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('category', categoryName)
            .eq('status', 'published')

        if (error) {
            console.error('Error getting category product count:', error)
            return { count: 0, error: error.message }
        }

        return { count: count || 0, error: null }
    } catch (error) {
        console.error('Error in getCategoryProductCount:', error)
        return { count: 0, error: 'Error al obtener conteo de productos' }
    }
}

// Get all category names (for product forms)
export async function getCategoryNames(): Promise<{ data: string[]; error: string | null }> {
    try {
        const { data, error } = await supabaseAdmin
            .from('categories')
            .select('name')
            .order('name', { ascending: true })

        if (error) {
            console.error('Error fetching category names:', error)
            return { data: [], error: error.message }
        }

        const names = data.map(c => c.name)
        return { data: names, error: null }
    } catch (error) {
        console.error('Error in getCategoryNames:', error)
        return { data: [], error: 'Error al obtener nombres de categorías' }
    }
}
