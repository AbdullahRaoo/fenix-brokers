"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, FileText, Mail, TrendingUp, Users, ImageIcon, Folder, Send, Clock, CheckCircle2, AlertCircle, BarChart3 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getProductCounts, getCategoriesWithCount } from "@/app/actions/products"
import { getSubscriberCount } from "@/app/actions/subscribers"
import { getInquiries } from "@/app/actions/inquiries"
import { getCampaigns } from "@/app/actions/campaigns"
import { getCategories } from "@/app/actions/categories"
import type { Inquiry } from "@/types/database"

interface DashboardStats {
  products: {
    all: number
    published: number
    draft: number
    trash: number
  }
  subscribers: number
  inquiries: {
    total: number
    new: number
    inProgress: number
    closed: number
  }
  campaigns: {
    total: number
    sent: number
    draft: number
    scheduled: number
  }
  categories: number
}

interface RecentInquiry {
  id: string
  company_name: string
  product_name: string
  status: string
  created_at: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    products: { all: 0, published: 0, draft: 0, trash: 0 },
    subscribers: 0,
    inquiries: { total: 0, new: 0, inProgress: 0, closed: 0 },
    campaigns: { total: 0, sent: 0, draft: 0, scheduled: 0 },
    categories: 0
  })
  const [recentInquiries, setRecentInquiries] = useState<RecentInquiry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // Fetch all data in parallel
        const [productCounts, subscriberCount, inquiriesResult, campaignsResult, categoriesResult] = await Promise.all([
          getProductCounts(),
          getSubscriberCount(),
          getInquiries(),
          getCampaigns(),
          getCategories()
        ])

        // Process inquiries
        const inquiries = inquiriesResult.data || []
        const newInquiries = inquiries.filter((i: Inquiry) => i.status === "New").length
        const inProgressInquiries = inquiries.filter((i: Inquiry) => i.status === "In Progress").length
        const closedInquiries = inquiries.filter((i: Inquiry) => i.status === "Closed").length

        // Process campaigns
        const campaigns = campaignsResult.data || []
        const sentCampaigns = campaigns.filter((c: any) => c.status === "Sent").length
        const draftCampaigns = campaigns.filter((c: any) => c.status === "Draft").length
        const scheduledCampaigns = campaigns.filter((c: any) => c.status === "Scheduled").length

        // Get recent inquiries (last 5)
        const recent = inquiries.slice(0, 5).map((i: Inquiry) => ({
          id: i.id,
          company_name: i.company_name,
          product_name: i.product_name,
          status: i.status,
          created_at: i.created_at
        }))

        setStats({
          products: {
            all: productCounts.all,
            published: productCounts.published,
            draft: productCounts.draft,
            trash: productCounts.trash
          },
          subscribers: subscriberCount.count,
          inquiries: {
            total: inquiries.length,
            new: newInquiries,
            inProgress: inProgressInquiries,
            closed: closedInquiries
          },
          campaigns: {
            total: campaigns.length,
            sent: sentCampaigns,
            draft: draftCampaigns,
            scheduled: scheduledCampaigns
          },
          categories: categoriesResult.data?.length || 0
        })
        setRecentInquiries(recent)
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `hace ${diffMins} min`
    if (diffHours < 24) return `hace ${diffHours}h`
    if (diffDays < 7) return `hace ${diffDays}d`
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  }

  // Status color and icon
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "New":
        return { color: "text-blue-600", bg: "bg-blue-100", icon: AlertCircle }
      case "In Progress":
        return { color: "text-amber-600", bg: "bg-amber-100", icon: Clock }
      case "Closed":
        return { color: "text-green-600", bg: "bg-green-100", icon: CheckCircle2 }
      default:
        return { color: "text-gray-600", bg: "bg-gray-100", icon: FileText }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Panel de Control</h1>
        <p className="text-muted-foreground">¡Bienvenido! Aquí tienes un resumen de tu plataforma.</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Products Card */}
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Package className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.products.all}</div>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="text-green-600 font-medium">{stats.products.published} publicados</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-amber-600 font-medium">{stats.products.draft} borradores</span>
            </div>
          </CardContent>
        </Card>

        {/* Inquiries Card */}
        <Card className="border-l-4 border-l-amber-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cotizaciones</CardTitle>
            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
              <FileText className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inquiries.total}</div>
            <div className="flex items-center gap-2 mt-2 text-xs">
              {stats.inquiries.new > 0 && (
                <span className="text-blue-600 font-medium animate-pulse">{stats.inquiries.new} nuevas</span>
              )}
              {stats.inquiries.inProgress > 0 && (
                <>
                  {stats.inquiries.new > 0 && <span className="text-muted-foreground">•</span>}
                  <span className="text-amber-600 font-medium">{stats.inquiries.inProgress} en proceso</span>
                </>
              )}
              {stats.inquiries.new === 0 && stats.inquiries.inProgress === 0 && (
                <span className="text-muted-foreground">Sin pendientes</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Subscribers Card */}
        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suscriptores</CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <Users className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.subscribers}</div>
            <p className="text-xs text-muted-foreground mt-2">Suscriptores activos del boletín</p>
          </CardContent>
        </Card>

        {/* Campaigns Card */}
        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campañas</CardTitle>
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
              <Send className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.campaigns.total}</div>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="text-green-600 font-medium">{stats.campaigns.sent} enviadas</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-amber-600 font-medium">{stats.campaigns.draft} borradores</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorías</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.categories}</div>
            <p className="text-xs text-muted-foreground">Categorías de productos</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Respuesta</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.inquiries.total > 0
                ? Math.round((stats.inquiries.closed / stats.inquiries.total) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Cotizaciones cerradas</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efectividad Email</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.campaigns.total > 0
                ? Math.round((stats.campaigns.sent / stats.campaigns.total) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Campañas enviadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section - Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Tareas administrativas comunes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href="/admin/products/new"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors group"
            >
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Nuevo Producto</p>
                <p className="text-sm text-muted-foreground">Agregar un producto al catálogo</p>
              </div>
            </Link>
            <Link
              href="/admin/inquiries"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors group"
            >
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                <FileText className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Revisar Cotizaciones</p>
                <p className="text-sm text-muted-foreground">Responder a solicitudes pendientes</p>
              </div>
              {stats.inquiries.new > 0 && (
                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full animate-pulse">
                  {stats.inquiries.new}
                </span>
              )}
            </Link>
            <Link
              href="/admin/marketing/templates/new"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors group"
            >
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Mail className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Nueva Campaña</p>
                <p className="text-sm text-muted-foreground">Crear campaña de email marketing</p>
              </div>
            </Link>
            <Link
              href="/admin/categories"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors group"
            >
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <Folder className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Gestionar Categorías</p>
                <p className="text-sm text-muted-foreground">Organizar productos por categoría</p>
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Inquiries */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Cotizaciones Recientes</CardTitle>
              <CardDescription>Últimas solicitudes recibidas</CardDescription>
            </div>
            <Link
              href="/admin/inquiries"
              className="text-sm text-primary hover:underline"
            >
              Ver todas →
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentInquiries.length > 0 ? (
              recentInquiries.map((inquiry) => {
                const statusStyle = getStatusStyle(inquiry.status)
                const StatusIcon = statusStyle.icon
                return (
                  <Link
                    key={inquiry.id}
                    href={`/admin/inquiries/${inquiry.id}`}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className={`h-8 w-8 rounded-full ${statusStyle.bg} flex items-center justify-center flex-shrink-0`}>
                      <StatusIcon className={`h-4 w-4 ${statusStyle.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{inquiry.company_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{inquiry.product_name}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatRelativeTime(inquiry.created_at)}
                    </span>
                  </Link>
                )
              })
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay cotizaciones recientes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Product Status Overview */}
      {stats.products.all > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Estado de Productos</CardTitle>
            <CardDescription>Distribución de productos por estado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Published */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Publicados</span>
                  <span className="font-medium">{stats.products.published}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${(stats.products.published / stats.products.all) * 100}%` }}
                  />
                </div>
              </div>

              {/* Draft */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Borradores</span>
                  <span className="font-medium">{stats.products.draft}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${(stats.products.draft / stats.products.all) * 100}%` }}
                  />
                </div>
              </div>

              {/* Trash */}
              {stats.products.trash > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Papelera</span>
                    <span className="font-medium">{stats.products.trash}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full transition-all duration-500"
                      style={{ width: `${(stats.products.trash / (stats.products.all + stats.products.trash)) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
