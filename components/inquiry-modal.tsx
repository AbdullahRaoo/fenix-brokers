"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface InquiryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: {
    id: string
    name: string
    brand: string
    category: string
  }
}

export default function InquiryModal({ open, onOpenChange, product }: InquiryModalProps) {
  const [quantity, setQuantity] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Store inquiry in localStorage (will be moved to database later)
    const inquiries = JSON.parse(localStorage.getItem("inquiries") || "[]")
    inquiries.push({
      id: `INQ-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      quantity,
      companyName,
      notes,
      status: "New",
      adminNotes: "",
      createdAt: new Date().toISOString(),
    })
    localStorage.setItem("inquiries", JSON.stringify(inquiries))

    toast({
      title: "¡Solicitud de cotización enviada!",
      description: "Te responderemos en un plazo de 24 horas.",
    })

    setQuantity("")
    setCompanyName("")
    setNotes("")
    setIsSubmitting(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4 mx-auto">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl">Solicitar Cotización</DialogTitle>
          <DialogDescription className="text-center">
            Completa el formulario a continuación y te enviaremos una cotización personalizada en 24 horas
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="product-name">Producto</Label>
            <Input id="product-name" value={`${product.name} (${product.id})`} readOnly className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Cantidad</Label>
            <Input
              id="quantity"
              type="number"
              placeholder="Ingresa la cantidad"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Nombre de la Empresa</Label>
            <Input
              id="company"
              placeholder="Nombre de tu empresa"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas Adicionales</Label>
            <Textarea
              id="notes"
              placeholder="Cualquier requisito específico o preguntas..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
