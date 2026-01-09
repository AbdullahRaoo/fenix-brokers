"use client"

import { useEffect, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Mail, TrendingUp, Send, FileText, Trash2, Loader2, Eye, Play } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getCampaigns, deleteCampaign, sendCampaign } from "@/app/actions/campaigns"
import { getEmailTemplates, deleteTemplate } from "@/app/actions/templates"
import { getSubscriberCount } from "@/app/actions/subscribers"
import type { Campaign, EmailTemplate } from "@/types/database"
import { useToast } from "@/hooks/use-toast"

export default function MarketingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [subscriberCount, setSubscriberCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)

      const [campaignsRes, templatesRes, countRes] = await Promise.all([
        getCampaigns(),
        getEmailTemplates(),
        getSubscriberCount(),
      ])

      if (campaignsRes.data) setCampaigns(campaignsRes.data)
      if (templatesRes.data) setTemplates(templatesRes.data)
      if (countRes.count !== undefined) setSubscriberCount(countRes.count)

      setIsLoading(false)
    }

    loadData()
  }, [])

  const handleDeleteCampaign = (id: string, name: string) => {
    if (!confirm(`¿Eliminar campaña "${name}"?`)) return

    startTransition(async () => {
      const result = await deleteCampaign(id)
      if (result.success) {
        setCampaigns(campaigns.filter(c => c.id !== id))
        toast({ title: "Campaña eliminada" })
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      }
    })
  }

  const handleDeleteTemplate = (id: string, name: string) => {
    if (!confirm(`¿Eliminar plantilla "${name}"?`)) return

    startTransition(async () => {
      const result = await deleteTemplate(id)
      if (result.success) {
        setTemplates(templates.filter(t => t.id !== id))
        toast({ title: "Plantilla eliminada" })
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      }
    })
  }

  const handleSendCampaign = (id: string, name: string) => {
    if (!confirm(`¿Enviar campaña "${name}" a ${subscriberCount} suscriptores?`)) return

    startTransition(async () => {
      toast({ title: "Enviando...", description: "La campaña se está enviando." })

      const result = await sendCampaign(id)

      if (result.success) {
        toast({
          title: "¡Campaña enviada!",
          description: `Enviada a ${result.sentCount} de ${result.totalSubscribers} suscriptores.`
        })
        // Reload campaigns
        const res = await getCampaigns()
        if (res.data) setCampaigns(res.data)
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      }
    })
  }

  const getStatusColor = (status: Campaign["status"]) => {
    switch (status) {
      case "Draft": return "bg-muted text-muted-foreground"
      case "Scheduled": return "bg-yellow-500/10 text-yellow-600"
      case "Sending": return "bg-blue-500/10 text-blue-600"
      case "Sent": return "bg-green-500/10 text-green-600"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const sentCampaigns = campaigns.filter(c => c.status === "Sent")
  const avgOpenRate = sentCampaigns.length > 0
    ? Math.round(sentCampaigns.reduce((sum, c) => sum + (c.open_count / Math.max(c.sent_count, 1)) * 100, 0) / sentCampaigns.length)
    : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Email Marketing</h1>
          <p className="text-muted-foreground">Administra campañas y plantillas de boletines</p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href="/admin/marketing/templates/new">
              <FileText className="h-4 w-4 mr-2" />
              Nueva Plantilla
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/marketing/campaigns/new">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Campaña
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-6">
        <TabsList>
          <TabsTrigger value="campaigns">Campañas</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Campañas</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{campaigns.length}</div>
                <p className="text-xs text-muted-foreground">{sentCampaigns.length} enviadas</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Suscriptores Activos</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{subscriberCount}</div>
                <p className="text-xs text-muted-foreground">Listos para recibir</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Correos Enviados</CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {sentCampaigns.reduce((sum, c) => sum + c.sent_count, 0)}
                </div>
                <p className="text-xs text-muted-foreground">Todo el tiempo</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasa de Apertura Prom.</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgOpenRate}%</div>
                <p className="text-xs text-muted-foreground">Entre campañas</p>
              </CardContent>
            </Card>
          </div>

          {/* Campaigns Table */}
          <Card>
            <CardHeader>
              <CardTitle>Todas las Campañas</CardTitle>
              <CardDescription>Ver y administrar tus campañas de email</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : campaigns.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aún no hay campañas. <Link href="/admin/marketing/campaigns/new" className="text-primary hover:underline">Crea tu primera campaña</Link>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Asunto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Enviados</TableHead>
                      <TableHead>Creada</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map(campaign => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">{campaign.name}</TableCell>
                        <TableCell className="text-muted-foreground">{campaign.subject}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={getStatusColor(campaign.status)}>
                            {campaign.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{campaign.sent_count || 0}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(campaign.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            {campaign.status === "Draft" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSendCampaign(campaign.id, campaign.name)}
                                disabled={isPending}
                              >
                                <Play className="h-4 w-4 mr-1" />
                                Enviar
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => handleDeleteCampaign(campaign.id, campaign.name)}
                              disabled={isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Plantillas de Email</CardTitle>
              <CardDescription>Diseños reutilizables de boletines</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : templates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aún no hay plantillas. <Link href="/admin/marketing/templates/new" className="text-primary hover:underline">Crea tu primera plantilla</Link>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Asunto</TableHead>
                      <TableHead>Creada</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map(template => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell className="text-muted-foreground">{template.subject}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(template.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin/marketing/templates/${template.id}`}>
                                Editar
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => handleDeleteTemplate(template.id, template.name)}
                              disabled={isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
