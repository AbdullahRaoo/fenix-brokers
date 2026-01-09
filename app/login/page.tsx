"use client"

import type React from "react"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Mail, Lock, ArrowLeft, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { loginAdmin } from "@/app/actions/auth"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Por favor ingresa tu correo y contraseña.")
      return
    }

    startTransition(async () => {
      const result = await loginAdmin(email, password)

      if (result.success && result.user) {
        toast({
          title: "Inicio de sesión exitoso",
          description: `¡Bienvenido de nuevo, ${result.user.name}!`,
        })
        router.push("/admin")
        router.refresh()
      } else {
        setError(result.error || "Correo o contraseña inválidos.")
      }
    })
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-secondary/20 rounded-full blur-2xl" />

      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative">
        <div className="max-w-md text-center">
          <Link href="/" className="inline-block mb-8">
            <img
              src="/logos/PNG/logo-fenix-brokers-1.png"
              alt="Fenix Brokers"
              className="h-20 w-auto mx-auto rounded-xl"
            />
          </Link>
          <h1 className="text-3xl font-bold mb-4">
            Bienvenido de Nuevo a <span className="text-primary">Fenix Brokers</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Accede a tu panel de administración para gestionar productos, pedidos y hacer crecer tu negocio mayorista de belleza.
          </p>

          {/* Features list */}
          <div className="space-y-4 text-left">
            {[
              "Gestiona tu catálogo de productos",
              "Rastrea pedidos y envíos",
              "Accede a análisis e informes",
              "Comunica con tus clientes",
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3 bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - Login form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-block">
              <img
                src="/logos/PNG/logo-fenix-brokers-1.png"
                alt="Fenix Brokers"
                className="h-16 w-auto mx-auto rounded-lg"
              />
            </Link>
          </div>

          <Card className="border-border/50 shadow-2xl backdrop-blur-sm bg-card/95">
            <CardHeader className="space-y-4 pb-6">
              <div className="text-center">
                <CardTitle className="text-2xl lg:text-3xl">Acceso Admin</CardTitle>
                <CardDescription className="text-base">
                  Ingresa tus credenciales para acceder al panel
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@fenixbrokers.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isPending}
                      autoComplete="email"
                      className="pl-10 h-12 text-base"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">Contraseña</Label>
                    <a href="#" className="text-xs text-primary hover:underline">
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Ingresa tu contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isPending}
                      autoComplete="current-password"
                      className="pl-10 h-12 text-base"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 animate-in fade-in-0 slide-in-from-top-2">
                    <p className="text-sm text-destructive font-medium">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Iniciando sesión...
                    </>
                  ) : (
                    "Iniciar Sesión"
                  )}
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-border/50 text-center">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                  Volver al sitio web
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Security note */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Lock className="h-3 w-3" />
              Protegido con encriptación de estándar industrial
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
