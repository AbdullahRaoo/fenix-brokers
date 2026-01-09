"use client"

import { use, useEffect, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Send, Loader2, Package2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { getInquiryById, updateInquiry, replyToInquiry } from "@/app/actions/inquiries"
import type { Inquiry } from "@/types/database"

export default function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { toast } = useToast()

  const [inquiry, setInquiry] = useState<Inquiry | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [status, setStatus] = useState<Inquiry["status"]>("New")
  const [replyMessage, setReplyMessage] = useState("")
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    async function loadInquiry() {
      setIsLoading(true)
      const result = await getInquiryById(resolvedParams.id)

      if (result.error || !result.data) {
        setNotFound(true)
      } else {
        setInquiry(result.data)
        setStatus(result.data.status)
      }

      setIsLoading(false)
    }

    loadInquiry()
  }, [resolvedParams.id])

  const handleSendReply = () => {
    if (!replyMessage.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un mensaje antes de enviar.",
        variant: "destructive",
      })
      return
    }

    startTransition(async () => {
      const result = await replyToInquiry(resolvedParams.id, replyMessage)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Respuesta enviada",
        description: "Tu mensaje ha sido enviado al cliente por correo.",
      })

      // Reload inquiry to get updated message threads
      const updatedInquiry = await getInquiryById(resolvedParams.id)
      if (updatedInquiry.data) {
        setInquiry(updatedInquiry.data)
        setStatus(updatedInquiry.data.status)
      }

      setReplyMessage("")
    })
  }

  const handleUpdateStatus = (newStatus: Inquiry["status"]) => {
    setStatus(newStatus)

    startTransition(async () => {
      const result = await updateInquiry(resolvedParams.id, { status: newStatus })

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Estado actualizado",
        description: `El estado de la consulta cambió a ${newStatus}.`,
      })
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando consulta...</p>
        </div>
      </div>
    )
  }

  if (notFound || !inquiry) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Package2 className="h-16 w-16 text-muted-foreground opacity-50" />
          <h2 className="text-xl font-bold">Consulta No Encontrada</h2>
          <Button asChild>
            <Link href="/admin/inquiries">Volver a Consultas</Link>
          </Button>
        </div>
      </div>
    )
  }

  const getStatusColor = (inquiryStatus: Inquiry["status"]) => {
    switch (inquiryStatus) {
      case "New":
        return "bg-primary/10 text-primary hover:bg-primary/20"
      case "Viewed":
        return "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20"
      case "In Progress":
        return "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20"
      case "Closed":
        return "bg-green-500/10 text-green-600 hover:bg-green-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/admin/inquiries">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Consultas
          </Link>
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Detalles de Consulta</h1>
            <p className="text-muted-foreground">ID: {inquiry.id.slice(0, 8)}...</p>
          </div>
          <Badge variant="secondary" className={getStatusColor(status)}>
            {status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Inquiry Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Cliente</CardTitle>
              <CardDescription>Detalles sobre el cliente y su consulta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Nombre de Empresa</p>
                  <p className="font-medium">{inquiry.company_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Persona de Contacto</p>
                  <p className="font-medium">{inquiry.contact_person}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Correo</p>
                  <p className="font-medium">{inquiry.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Fecha de Consulta</p>
                  <p className="font-medium">{new Date(inquiry.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detalles del Producto</CardTitle>
              <CardDescription>Información sobre el producto solicitado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Producto</p>
                  <p className="font-medium">{inquiry.product_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Cantidad Solicitada</p>
                  <p className="font-medium">{inquiry.quantity}</p>
                </div>
              </div>

              {inquiry.requirements && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Requisitos del Cliente</p>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm">{inquiry.requirements}</p>
                  </div>
                </div>
              )}

              {inquiry.attachment_url && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Adjunto</p>
                  <a
                    href={inquiry.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm"
                  >
                    Ver Adjunto
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Conversation History */}
          <Card>
            <CardHeader>
              <CardTitle>Historial de Conversación</CardTitle>
              <CardDescription>Conversación por correo con el cliente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!inquiry.message_threads || inquiry.message_threads.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Aún no hay conversación</p>
              ) : (
                <div className="space-y-3">
                  {inquiry.message_threads.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg ${msg.sender === "admin" ? "bg-primary/10 ml-8" : "bg-muted mr-8"}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {msg.sender === "admin" ? "Tú" : "Cliente"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reply Interface */}
          <Card>
            <CardHeader>
              <CardTitle>Responder por Correo</CardTitle>
              <CardDescription>Envía una respuesta a la consulta del cliente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reply">Tu Mensaje</Label>
                <Textarea
                  id="reply"
                  placeholder="Escribe tu respuesta aquí..."
                  rows={6}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                />
              </div>
              <Button onClick={handleSendReply} className="w-full" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Respuesta
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Status & Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Estado</CardTitle>
              <CardDescription>Actualizar estado de la consulta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Estado de Consulta</Label>
                <Select value={status} onValueChange={(value: Inquiry["status"]) => handleUpdateStatus(value)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">Nuevo</SelectItem>
                    <SelectItem value="Viewed">Visto</SelectItem>
                    <SelectItem value="In Progress">En Progreso</SelectItem>
                    <SelectItem value="Closed">Cerrado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {inquiry.admin_notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notas de Administrador</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{inquiry.admin_notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
