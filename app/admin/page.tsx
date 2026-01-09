"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, FileText, Mail, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalInquiries: 0,
    totalSubscribers: 0,
    newInquiries: 0,
  })

  useEffect(() => {
    // Load stats from localStorage
    const inquiries = JSON.parse(localStorage.getItem("inquiries") || "[]")
    const subscribers = JSON.parse(localStorage.getItem("subscribers") || "[]")

    setStats({
      totalProducts: 8, // From dummy data
      totalInquiries: inquiries.length,
      totalSubscribers: subscribers.length,
      newInquiries: inquiries.filter((inq: any) => inq.status === "New").length,
    })
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Panel de Control</h1>
        <p className="text-muted-foreground">¡Bienvenido! Aquí tienes un resumen de tu plataforma.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">Activos en catálogo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solicitudes de Cotización</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInquiries}</div>
            <p className="text-xs text-muted-foreground">{stats.newInquiries} nuevas esta semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suscriptores</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubscribers}</div>
            <p className="text-xs text-muted-foreground">Suscriptores del boletín</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.5%</div>
            <p className="text-xs text-muted-foreground">+2.5% desde el mes pasado</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Tareas administrativas comunes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href="/admin/products"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <Package className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Gestionar Productos</p>
                <p className="text-sm text-muted-foreground">Agregar, editar o eliminar productos</p>
              </div>
            </Link>
            <Link
              href="/admin/inquiries"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Revisar Consultas</p>
                <p className="text-sm text-muted-foreground">Responder a solicitudes de cotización</p>
              </div>
            </Link>
            <Link
              href="/admin/email-campaigns"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Crear Campaña</p>
                <p className="text-sm text-muted-foreground">Generar campañas de email</p>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimas actualizaciones del sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.newInquiries > 0 && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                <div>
                  <p className="font-medium text-sm">{stats.newInquiries} nuevas solicitudes de cotización</p>
                  <p className="text-xs text-muted-foreground">Requieren tu atención</p>
                </div>
              </div>
            )}
            {stats.totalSubscribers > 0 && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                <div>
                  <p className="font-medium text-sm">{stats.totalSubscribers} suscriptores del boletín</p>
                  <p className="text-xs text-muted-foreground">Listos para campañas</p>
                </div>
              </div>
            )}
            {stats.newInquiries === 0 && stats.totalSubscribers === 0 && (
              <p className="text-sm text-muted-foreground">Sin actividad reciente</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
