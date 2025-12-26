// Role-based permission system

export type Role = "admin" | "editor" | "viewer"

export const permissions = {
    // Product permissions
    "products.view": ["admin", "editor", "viewer"],
    "products.create": ["admin", "editor"],
    "products.edit": ["admin", "editor"],
    "products.delete": ["admin"],
    "products.publish": ["admin", "editor"],

    // User management
    "users.view": ["admin"],
    "users.create": ["admin"],
    "users.edit": ["admin"],
    "users.delete": ["admin"],

    // Inquiries
    "inquiries.view": ["admin", "editor", "viewer"],
    "inquiries.reply": ["admin", "editor"],
    "inquiries.delete": ["admin"],

    // Subscribers
    "subscribers.view": ["admin", "editor", "viewer"],
    "subscribers.export": ["admin", "editor"],
    "subscribers.delete": ["admin"],

    // Marketing
    "campaigns.view": ["admin", "editor", "viewer"],
    "campaigns.create": ["admin", "editor"],
    "campaigns.send": ["admin", "editor"],
    "campaigns.delete": ["admin"],
    "templates.create": ["admin", "editor"],
    "templates.delete": ["admin"],

    // Media
    "media.view": ["admin", "editor", "viewer"],
    "media.upload": ["admin", "editor"],
    "media.delete": ["admin"],

    // Settings
    "settings.view": ["admin", "editor", "viewer"],
    "settings.edit": ["admin"],
} as const

export type Permission = keyof typeof permissions

export function hasPermission(role: Role, permission: Permission): boolean {
    const allowedRoles = permissions[permission]
    return allowedRoles.includes(role)
}

export function canAccess(role: Role, ...requiredPermissions: Permission[]): boolean {
    return requiredPermissions.every(p => hasPermission(role, p))
}

// Helper to check multiple permissions and return which ones are allowed
export function getPermissions(role: Role, ...perms: Permission[]): Record<Permission, boolean> {
    const result = {} as Record<Permission, boolean>
    for (const p of perms) {
        result[p] = hasPermission(role, p)
    }
    return result
}

// Role display names
export const roleLabels: Record<Role, string> = {
    admin: "Administrator",
    editor: "Editor",
    viewer: "Viewer",
}

// Role descriptions
export const roleDescriptions: Record<Role, string> = {
    admin: "Full access to all features including user management and deletion",
    editor: "Can create and edit content, send campaigns, but cannot delete or manage users",
    viewer: "Read-only access to view dashboard data",
}
