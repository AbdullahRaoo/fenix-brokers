"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { AdminUser } from "@/app/actions/auth"
import { hasPermission, type Permission, type Role } from "@/lib/permissions"

interface AuthContextType {
    user: AdminUser | null
    role: Role
    can: (permission: Permission) => boolean
    isAdmin: boolean
    isEditor: boolean
    isViewer: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({
    user,
    children
}: {
    user: AdminUser | null
    children: ReactNode
}) {
    const role = (user?.role || "viewer") as Role

    const can = (permission: Permission) => hasPermission(role, permission)

    const value: AuthContextType = {
        user,
        role,
        can,
        isAdmin: role === "admin",
        isEditor: role === "editor",
        isViewer: role === "viewer",
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}

// Helper component to conditionally render based on permission
export function Can({
    permission,
    children,
    fallback = null
}: {
    permission: Permission
    children: ReactNode
    fallback?: ReactNode
}) {
    const { can } = useAuth()
    return can(permission) ? <>{children}</> : <>{fallback}</>
}

// Helper component to show content only for specific roles
export function RoleGate({
    roles,
    children,
    fallback = null
}: {
    roles: Role[]
    children: ReactNode
    fallback?: ReactNode
}) {
    const { role } = useAuth()
    return roles.includes(role) ? <>{children}</> : <>{fallback}</>
}
