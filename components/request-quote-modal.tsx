"use client"

import type React from "react"
import { useState, useTransition } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, X, FileText, CheckCircle2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { submitQuoteRequest, uploadAttachment } from "@/app/actions/inquiries"

interface RequestQuoteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: {
    id: string
    name: string
    brand: string
    category: string
    image?: string
    specifications?: Array<{ key: string; value: string }>
  }
}

export function RequestQuoteModal({ open, onOpenChange, product }: RequestQuoteModalProps) {
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    quantity: "",
    requirements: "",
  })
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "Archivo muy grande",
          description: "El archivo debe ser menor a 10MB",
          variant: "destructive",
        })
        return
      }
      setFile(selectedFile)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      let attachmentUrl: string | undefined

      // Upload file if selected
      if (file) {
        setIsUploading(true)
        const formDataUpload = new FormData()
        formDataUpload.append("file", file)

        const uploadResult = await uploadAttachment(formDataUpload)
        setIsUploading(false)

        if (uploadResult.error) {
          toast({
            title: "Error al subir archivo",
            description: uploadResult.error,
            variant: "destructive",
          })
          return
        }
        attachmentUrl = uploadResult.url || undefined
      }

      const result = await submitQuoteRequest({
        productId: product.id,
        productName: product.name,
        companyName: formData.companyName,
        contactPerson: formData.contactPerson,
        email: formData.email,
        quantity: parseInt(formData.quantity),
        requirements: formData.requirements || undefined,
        attachmentUrl,
      })

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "¡Solicitud de cotización enviada!",
        description: "Te responderemos en un plazo de 24 horas.",
      })

      // Reset form
      setFormData({
        companyName: "",
        contactPerson: "",
        email: "",
        quantity: "",
        requirements: "",
      })
      setFile(null)
      onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] lg:max-w-7xl max-h-[95vh] overflow-y-auto p-0">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Left Side - Product Context */}
          <div className="lg:w-1/3 bg-muted/30 p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-border flex flex-col justify-center">
            <h3 className="text-2xl font-semibold mb-8">Solicitando Cotización Para:</h3>

            <div className="aspect-square rounded-2xl overflow-hidden bg-background mb-8 shadow-lg max-w-sm mx-auto w-full">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-2xl mb-2">{product.name}</h4>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="bg-background px-3 py-1 rounded-full border border-border">Código: {product.id}</span>
                  <span className="bg-background px-3 py-1 rounded-full border border-border">Marca: {product.brand}</span>
                </div>
              </div>

              {/* Key Specifications */}
              {product.specifications && product.specifications.length > 0 && (
                <div className="pt-6 border-t border-border">
                  <h5 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground">Especificaciones:</h5>
                  <ul className="space-y-3">
                    {product.specifications.slice(0, 5).map((spec, index) => (
                      <li key={index} className="flex items-start gap-3 text-base">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">
                          <span className="font-medium text-foreground">{spec.key}:</span> {spec.value}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="lg:w-2/3 p-8 lg:p-12 bg-card">
            <div className="mb-10 max-w-2xl">
              <h2 className="text-3xl font-bold mb-4">Solicitar Cotización</h2>
              <p className="text-lg text-muted-foreground">
                Por favor completa los detalles a continuación. Nuestro equipo revisará tu solicitud y te proporcionará una cotización personalizada en 24 horas.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="companyName" className="text-base">
                    Nombre de la Empresa <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="companyName"
                    placeholder="Nombre de tu empresa"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    required
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="contactPerson" className="text-base">
                    Persona de Contacto <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="contactPerson"
                    placeholder="Tu nombre completo"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    required
                    className="h-12 text-base"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-base">
                    Correo Electrónico <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="correo@empresa.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="quantity" className="text-base">
                    Cantidad <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="Número de unidades"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                    className="h-12 text-base"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="requirements" className="text-base">Requisitos Especiales</Label>
                <Textarea
                  id="requirements"
                  placeholder="Por favor comparte cualquier requisito específico, personalizaciones o preguntas sobre este producto..."
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  rows={5}
                  className="resize-none text-base min-h-[120px]"
                />
              </div>

              {/* File Upload */}
              <div className="space-y-3">
                <Label className="text-base">Adjuntar RFP/Documento (Opcional)</Label>
                <div className="border-2 border-dashed border-border rounded-xl p-8 hover:border-primary/50 transition-all bg-muted/10 group cursor-pointer">
                  {!file ? (
                    <label htmlFor="file-upload" className="cursor-pointer block w-full h-full">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                          <Upload className="h-8 w-8 text-primary" />
                        </div>
                        <p className="text-lg font-medium mb-2">Haz clic para subir o arrastra y suelta</p>
                        <p className="text-sm text-muted-foreground">PDF, DOC, DOCX hasta 10MB</p>
                      </div>
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                      />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between bg-card p-4 rounded-lg border border-border shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-lg">{file.name}</p>
                          <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={handleRemoveFile} className="h-10 w-10">
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="flex-1 bg-transparent h-14 text-base border-2"
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <Button type="submit" size="lg" className="flex-[2] h-14 text-base shadow-lg hover:shadow-xl transition-all" disabled={isPending}>
                  {isPending ? "Enviando Solicitud..." : "Enviar Solicitud de Cotización"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
