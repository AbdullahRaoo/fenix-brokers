"use client"

import { useState, useEffect, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { createCampaign } from "@/app/actions/campaigns"
import { getEmailTemplates } from "@/app/actions/templates"
import { getSubscriberCount } from "@/app/actions/subscribers"
import type { EmailTemplate } from "@/types/database"

export default function NewCampaignPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(true)

  const [name, setName] = useState("")
  const [subject, setSubject] = useState("")
  const [templateId, setTemplateId] = useState("")
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [subscriberCount, setSubscriberCount] = useState(0)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      const [templatesRes, countRes] = await Promise.all([
        getEmailTemplates(),
        getSubscriberCount(),
      ])

      if (templatesRes.data) setTemplates(templatesRes.data)
      if (countRes.count !== undefined) setSubscriberCount(countRes.count)

      setIsLoading(false)
    }
    loadData()
  }, [])

  const handleTemplateChange = (id: string) => {
    setTemplateId(id)
    const template = templates.find(t => t.id === id)
    if (template && !subject) {
      setSubject(template.subject)
    }
  }

  const handleSave = () => {
    if (!name || !subject || !templateId) {
      toast({
        title: "Error de Validación",
        description: "Por favor completa todos los campos requeridos.",
        variant: "destructive",
      })
      return
    }

    startTransition(async () => {
      const result = await createCampaign({
        name,
        subject,
        template_id: templateId,
      })

      if (result.error) {
        toast({ title: "Error", description: result.error, variant: "destructive" })
        return
      }

      toast({ title: "¡Campaña creada!", description: "Ahora puedes enviarla desde el panel de marketing." })
      router.push("/admin/marketing")
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/admin/marketing">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Marketing
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mb-2">Crear Campaña</h1>
        <p className="text-muted-foreground">Configura una nueva campaña de correo</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalles de la Campaña</CardTitle>
            <CardDescription>Información básica sobre tu campaña</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Campaña *</Label>
              <Input
                id="name"
                placeholder="ej., Boletín de Enero"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template">Plantilla de Email *</Label>
              {templates.length === 0 ? (
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-2">No hay plantillas disponibles</p>
                  <Button size="sm" asChild>
                    <Link href="/admin/marketing/templates/new">Crear Plantilla</Link>
                  </Button>
                </div>
              ) : (
                <Select value={templateId} onValueChange={handleTemplateChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una plantilla" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Asunto del Email *</Label>
              <Input
                id="subject"
                placeholder="ej., ¡Nuevos Productos Disponibles Este Mes!"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Esto es lo que verán los destinatarios en su bandeja de entrada</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Destinatarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-primary">{subscriberCount}</p>
              <p className="text-sm text-muted-foreground">Los suscriptores activos recibirán esta campaña</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-3">
            <Button onClick={handleSave} className="w-full" disabled={isPending || templates.length === 0}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear Campaña"
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              La campaña se guardará como Borrador. Puedes enviarla desde el panel de marketing.
            </p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/admin/marketing">Cancelar</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
