"use client"

import type React from "react"

import { useState, useTransition } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { subscribeEmail } from "@/app/actions/subscribers"

interface SubscriberModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function SubscriberModal({ open, onOpenChange }: SubscriberModalProps) {
  const [email, setEmail] = useState("")
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      // Name is automatically extracted from email on the server
      const result = await subscribeEmail({ email })

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      if (result.alreadySubscribed) {
        toast({
          title: "¡Ya estás suscrito!",
          description: "Este correo ya está en nuestra lista de boletín.",
        })
      } else {
        toast({
          title: "¡Suscripción exitosa!",
          description: "Gracias por suscribirte a nuestro boletín.",
        })
      }

      // Set a flag to prevent modal from showing again for 30 days
      localStorage.setItem("has_subscribed", "true")
      localStorage.setItem("subscribed_at", new Date().toISOString())

      setEmail("")
      onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mb-4 mx-auto">
            <Mail className="h-7 w-7 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl">Manténte Informado</DialogTitle>
          <DialogDescription className="text-center">
            Recibe ofertas exclusivas B2B, alertas de nuevos productos e información de la industria directamente en tu correo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="modal-email" className="sr-only">Correo Empresarial</Label>
            <Input
              id="modal-email"
              type="email"
              placeholder="tu.nombre@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 text-base"
              aria-label="Tu correo electrónico empresarial"
            />
          </div>
          <Button type="submit" className="w-full h-12 text-base" disabled={isPending}>
            {isPending ? (
              "Suscribiendo..."
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Suscribirse Ahora
              </>
            )}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Sin spam, nunca. Cancela cuando quieras.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}

