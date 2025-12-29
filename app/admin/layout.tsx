"use client"

import type React from "react"

import { useState, useEffect, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, LayoutDashboard, FileText, Users, Menu, X, Settings, Megaphone, User, LogOut, Package, UserCog, Image, FolderTree } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getSession, logoutAdmin, type AdminUser } from "@/app/actions/auth"
import { AuthProvider } from "@/components/auth-context"
import { hasPermission, type Permission, type Role } from "@/lib/permissions"

const navItems: { href: string; label: string; icon: React.ElementType; permission?: Permission }[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package, permission: "products.view" },
  { href: "/admin/categories", label: "Categories", icon: FolderTree, permission: "products.view" },
  { href: "/admin/media", label: "Media", icon: Image, permission: "media.view" },
  { href: "/admin/inquiries", label: "Inquiries", icon: FileText, permission: "inquiries.view" },
  { href: "/admin/subscribers", label: "Subscribers", icon: Users, permission: "subscribers.view" },
  { href: "/admin/marketing", label: "Marketing", icon: Megaphone, permission: "campaigns.view" },
  { href: "/admin/users", label: "Users", icon: UserCog, permission: "users.view" },
  { href: "/admin/settings", label: "Settings", icon: Settings, permission: "settings.view" },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [, startTransition] = useTransition()

  useEffect(() => {
    async function checkAuth() {
      setIsLoading(true)
      const session = await getSession()

      if (!session.isAuthenticated || !session.user) {
        router.push("/login")
        return
      }

      setUser(session.user)
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAdmin()
      router.push("/login")
      router.refresh()
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const userRole = user.role as Role

  // Filter nav items based on user permissions
  const visibleNavItems = navItems.filter(item => {
    if (!item.permission) return true
    return hasPermission(userRole, item.permission)
  })

  return (
    <AuthProvider user={user}>
      <div className="min-h-screen flex">
        {/* Mobile Sidebar Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed lg:sticky top-0 left-0 z-50 h-screen w-64 border-r border-border bg-card transition-transform duration-300",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          )}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <Link href="/admin" className="flex items-center gap-2">
                <img
                  src="/logos/PNG/logo-fenix-brokers-1.png"
                  alt="Fenix Admin"
                  className="h-10 w-auto object-contain rounded-lg"
                />
              </Link>
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {visibleNavItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm",
                      isActive
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-border">
              <div className="px-3 py-2 text-xs text-muted-foreground">
                Signed in as <span className="font-medium text-foreground capitalize">{user.role}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar */}
          <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-sm">
            <div className="flex items-center gap-4 px-4 sm:px-6 lg:px-8 py-4">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex-1" />
              <ThemeToggle />
              <Button asChild variant="outline" size="sm">
                <Link href="/">View Site</Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin/settings" className="cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">{children}</main>
        </div>
      </div>
    </AuthProvider>
  )
}
