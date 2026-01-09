"use client"

import type React from "react"

import Link from "next/link"
import { Sparkles, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useTransition } from "react"
import { subscribeEmail } from "@/app/actions/subscribers"
import { useToast } from "@/hooks/use-toast"

export function Footer() {
  const [email, setEmail] = useState("")
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      startTransition(async () => {
        const result = await subscribeEmail({ email })

        if (result.error) {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          })
          return
        }

        toast({
          title: result.alreadySubscribed ? "¡Ya estás suscrito!" : "¡Gracias!",
          description: result.alreadySubscribed
            ? "Este correo ya está en nuestra lista."
            : "Te has suscrito a nuestro boletín.",
        })

        localStorage.setItem("has_subscribed", "true")
        localStorage.setItem("subscribed_at", new Date().toISOString())
        setEmail("")
      })
    }
  }

  return (
    <footer className="border-t border-border/40 bg-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/logos/PNG/logo-fenix-brokers-1.png"
                alt="Fenix Brokers"
                className="h-12 w-auto object-contain rounded-lg"
              />
            </div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Tu broker global de cosméticos de confianza para productos de belleza premium. Marcas auténticas, precios B2B competitivos.
            </p>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>
                <strong>Correo:</strong>{" "}
                <a href="mailto:ebono@fenixbrokers.com" className="hover:text-primary transition-colors">
                  ebono@fenixbrokers.com
                </a>
              </p>
              <p>
                <strong>Teléfono:</strong>{" "}
                <a href="tel:+34615582177" className="hover:text-primary transition-colors">
                  +34 615 582 177
                </a>
              </p>
              <p>
                <strong>Ubicación:</strong> Las Palmas de GC, España
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-base">Enlaces Rápidos</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="hover:text-foreground transition-colors">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-foreground transition-colors">
                  Acceso Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4 text-base">Categorías</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/catalog?category=Perfumes" className="hover:text-foreground transition-colors">
                  Perfumes
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=Skincare" className="hover:text-foreground transition-colors">
                  Cuidado de la Piel
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=Makeup" className="hover:text-foreground transition-colors">
                  Maquillaje
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=Hair Care" className="hover:text-foreground transition-colors">
                  Cuidado del Cabello
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="hover:text-foreground transition-colors">
                  Ver Todo
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h3 className="font-semibold mb-4 text-base">Boletín</h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Recibe las últimas novedades y ofertas exclusivas.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <Input
                type="email"
                placeholder="Ingresa tu correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background"
              />
              <Button type="submit" className="w-full" disabled={isPending}>
                <Mail className="mr-2 h-4 w-4" />
                {isPending ? "Suscribiendo..." : "Suscribirse"}
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/40 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            &copy; 2025 Fenix Brokers. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">
              Política de Privacidad
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Términos de Servicio
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
