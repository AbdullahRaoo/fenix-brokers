"use server"

import { supabaseAdmin } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

// Types for admin users
export interface AdminUser {
    id: string
    email: string
    name: string
    role: "admin" | "editor" | "viewer"
    avatar_url?: string
    created_at: string
    last_login_at?: string
}

// Login with email/password
export async function loginAdmin(email: string, password: string) {
    try {
        const { data, error } = await supabaseAdmin.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            console.error("Login error:", error)
            return { success: false, error: error.message, user: null }
        }

        if (!data.user) {
            return { success: false, error: "Login failed", user: null }
        }

        // Check if user exists in our admin_users table
        const { data: adminUser, error: adminError } = await supabaseAdmin
            .from("admin_users")
            .select("*")
            .eq("id", data.user.id)
            .single()

        if (adminError || !adminUser) {
            // Sign out if not an admin user
            await supabaseAdmin.auth.signOut()
            return { success: false, error: "You are not authorized as an admin", user: null }
        }

        // Update last login
        await supabaseAdmin
            .from("admin_users")
            .update({ last_login_at: new Date().toISOString() })
            .eq("id", data.user.id)

        // Set session cookie
        const cookieStore = await cookies()
        cookieStore.set("admin_session", data.session?.access_token || "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        })

        return {
            success: true,
            error: null,
            user: {
                id: adminUser.id,
                email: adminUser.email,
                name: adminUser.name,
                role: adminUser.role,
                avatar_url: adminUser.avatar_url,
            }
        }
    } catch (error) {
        console.error("Login error:", error)
        return { success: false, error: "An unexpected error occurred", user: null }
    }
}

// Logout
export async function logoutAdmin() {
    try {
        await supabaseAdmin.auth.signOut()

        const cookieStore = await cookies()
        cookieStore.delete("admin_session")

        return { success: true, error: null }
    } catch (error) {
        console.error("Logout error:", error)
        return { success: false, error: "Failed to logout" }
    }
}

// Get current session
export async function getSession() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get("admin_session")?.value

        if (!token) {
            return { user: null, isAuthenticated: false }
        }

        const { data, error } = await supabaseAdmin.auth.getUser(token)

        if (error || !data.user) {
            return { user: null, isAuthenticated: false }
        }

        // Get admin user data
        const { data: adminUser } = await supabaseAdmin
            .from("admin_users")
            .select("*")
            .eq("id", data.user.id)
            .single()

        if (!adminUser) {
            return { user: null, isAuthenticated: false }
        }

        return {
            user: adminUser as AdminUser,
            isAuthenticated: true
        }
    } catch {
        return { user: null, isAuthenticated: false }
    }
}

// Get all admin users
export async function getAdminUsers() {
    try {
        const { data, error } = await supabaseAdmin
            .from("admin_users")
            .select("*")
            .order("created_at", { ascending: false })

        if (error) throw error
        return { data: data as AdminUser[], error: null }
    } catch (error) {
        console.error("Error fetching admin users:", error)
        return { data: null, error: "Failed to fetch users" }
    }
}

// Create admin user (Supabase Auth + admin_users table)
export async function createAdminUser(input: {
    email: string
    password: string
    name: string
    role: "admin" | "editor" | "viewer"
}) {
    try {
        // Create auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: input.email,
            password: input.password,
            email_confirm: true,
        })

        if (authError) {
            console.error("Auth creation error:", authError)
            return { success: false, error: authError.message }
        }

        if (!authData.user) {
            return { success: false, error: "Failed to create user" }
        }

        // Create admin_users record
        const { error: insertError } = await supabaseAdmin
            .from("admin_users")
            .insert({
                id: authData.user.id,
                email: input.email,
                name: input.name,
                role: input.role,
            })

        if (insertError) {
            // Rollback: delete auth user if admin record fails
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
            console.error("Insert error:", insertError)
            return { success: false, error: insertError.message }
        }

        revalidatePath("/admin/users")
        return { success: true, error: null }
    } catch (error) {
        console.error("Error creating admin user:", error)
        return { success: false, error: "Failed to create user" }
    }
}

// Update admin user
export async function updateAdminUser(id: string, input: {
    name?: string
    role?: "admin" | "editor" | "viewer"
    avatar_url?: string
}) {
    try {
        const updateData: Record<string, unknown> = {}
        if (input.name) updateData.name = input.name
        if (input.role) updateData.role = input.role
        if (input.avatar_url !== undefined) updateData.avatar_url = input.avatar_url

        const { error } = await supabaseAdmin
            .from("admin_users")
            .update(updateData)
            .eq("id", id)

        if (error) throw error

        revalidatePath("/admin/users")
        return { success: true, error: null }
    } catch (error) {
        console.error("Error updating admin user:", error)
        return { success: false, error: "Failed to update user" }
    }
}

// Delete admin user
export async function deleteAdminUser(id: string) {
    try {
        // Delete from admin_users table
        const { error: deleteError } = await supabaseAdmin
            .from("admin_users")
            .delete()
            .eq("id", id)

        if (deleteError) throw deleteError

        // Delete from Supabase Auth
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id)
        if (authError) {
            console.error("Auth deletion error:", authError)
            // Continue even if auth deletion fails (user is already removed from admin_users)
        }

        revalidatePath("/admin/users")
        return { success: true, error: null }
    } catch (error) {
        console.error("Error deleting admin user:", error)
        return { success: false, error: "Failed to delete user" }
    }
}

// Change password
export async function changePassword(userId: string, newPassword: string) {
    try {
        const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            password: newPassword,
        })

        if (error) throw error

        return { success: true, error: null }
    } catch (error) {
        console.error("Error changing password:", error)
        return { success: false, error: "Failed to change password" }
    }
}
