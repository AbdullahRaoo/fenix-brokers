"use client"

import { useState, useEffect, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Loader2, CheckCircle, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getSession, updateAdminUser, changePassword, type AdminUser } from "@/app/actions/auth"
import { MediaPicker } from "@/components/media-picker"
import { getSetting, updateSettings } from "@/app/actions/settings"

export default function SettingsPage() {
  const { toast } = useToast()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  // General Settings
  const [siteName, setSiteName] = useState("")
  const [logo, setLogo] = useState("")

  // Profile
  const [name, setName] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)

      // Load user session
      const session = await getSession()
      if (session.user) {
        setUser(session.user)
        setName(session.user.name)
      }

      // Load site settings from database
      const [logoResult, siteNameResult] = await Promise.all([
        getSetting("logo_url"),
        getSetting("site_name")
      ])

      if (logoResult.data?.value) {
        setLogo(logoResult.data.value)
      }
      if (siteNameResult.data?.value) {
        setSiteName(siteNameResult.data.value)
      }

      setIsLoading(false)
    }
    loadData()
  }, [])

  const handleSaveGeneral = async () => {
    setIsSavingSettings(true)

    const result = await updateSettings([
      { key: "logo_url", value: logo || null },
      { key: "site_name", value: siteName || null }
    ])

    setIsSavingSettings(false)

    if (result.success) {
      toast({
        title: "Configuración guardada",
        description: "La configuración general ha sido actualizada.",
      })
    } else {
      toast({
        title: "Error",
        description: result.error || "Error al guardar configuración",
        variant: "destructive"
      })
    }
  }

  const handleSaveProfile = () => {
    if (!user) return

    startTransition(async () => {
      const result = await updateAdminUser(user.id, { name })

      if (result.success) {
        toast({ title: "Perfil actualizado" })
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      }
    })
  }

  const handleChangePassword = () => {
    if (!user) return

    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Las contraseñas no coinciden", variant: "destructive" })
      return
    }

    if (newPassword.length < 6) {
      toast({ title: "Error", description: "La contraseña debe tener al menos 6 caracteres", variant: "destructive" })
      return
    }

    startTransition(async () => {
      const result = await changePassword(user.id, newPassword)

      if (result.success) {
        toast({ title: "Contraseña actualizada" })
        setNewPassword("")
        setConfirmPassword("")
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      }
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Configuración</h1>
        <p className="text-muted-foreground">Administra tu perfil y preferencias</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="general">Configuración del Sitio</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tu Perfil</CardTitle>
              <CardDescription>Actualiza tu información personal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">El correo no puede ser cambiado</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nombre para Mostrar</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                />
              </div>

              <div className="space-y-2">
                <Label>Rol</Label>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium capitalize">
                    {user?.role}
                  </span>
                  <span className="text-xs text-muted-foreground">Contacta a un administrador para cambiar tu rol</span>
                </div>
              </div>

              <Button onClick={handleSaveProfile} disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Guardar Perfil
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cambiar Contraseña</CardTitle>
              <CardDescription>Actualiza la contraseña de tu cuenta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nueva Contraseña</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ingresa nueva contraseña"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirma la nueva contraseña"
                />
              </div>

              <Button onClick={handleChangePassword} disabled={isPending || !newPassword}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Actualizar Contraseña
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* General/Site Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Marca del Sitio</CardTitle>
              <CardDescription>Configura el nombre y logo del sitio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site-name">Nombre del Sitio</Label>
                <Input
                  id="site-name"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="Nombre de tu sitio"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Logo</Label>
                <div className="flex items-center gap-4">
                  {logo ? (
                    <div className="relative w-16 h-16 rounded-lg border border-border overflow-hidden bg-muted">
                      <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setLogo("")}
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-sm hover:bg-destructive/90"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <MediaPicker
                      onSelect={(url) => setLogo(url)}
                      trigger={
                        <Button variant="outline" size="sm" type="button">
                          <Upload className="h-4 w-4 mr-2" />
                          {logo ? "Cambiar Logo" : "Subir Logo"}
                        </Button>
                      }
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveGeneral} disabled={isSavingSettings}>
                {isSavingSettings ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Guardar Configuración
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Integraciones</CardTitle>
              <CardDescription>Servicios conectados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Supabase</p>
                    <p className="text-sm text-muted-foreground">Base de Datos y Autenticación</p>
                  </div>
                </div>
                <span className="text-sm text-green-600">Conectado</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Resend</p>
                    <p className="text-sm text-muted-foreground">Envío de Correos</p>
                  </div>
                </div>
                <span className="text-sm text-green-600">Conectado</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
