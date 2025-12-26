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
        title: "Validation Error",
        description: "Please fill in all required fields.",
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

      toast({ title: "Campaign created!", description: "You can now send it from the marketing dashboard." })
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
            Back to Marketing
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mb-2">Create Campaign</h1>
        <p className="text-muted-foreground">Set up a new email campaign</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
            <CardDescription>Basic information about your campaign</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name *</Label>
              <Input
                id="name"
                placeholder="e.g., January Newsletter"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template">Email Template *</Label>
              {templates.length === 0 ? (
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-2">No templates available</p>
                  <Button size="sm" asChild>
                    <Link href="/admin/marketing/templates/new">Create Template</Link>
                  </Button>
                </div>
              ) : (
                <Select value={templateId} onValueChange={handleTemplateChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
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
              <Label htmlFor="subject">Email Subject *</Label>
              <Input
                id="subject"
                placeholder="e.g., New Products Available This Month!"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">This is what recipients will see in their inbox</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recipients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-primary">{subscriberCount}</p>
              <p className="text-sm text-muted-foreground">Active subscribers will receive this campaign</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-3">
            <Button onClick={handleSave} className="w-full" disabled={isPending || templates.length === 0}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Campaign"
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Campaign will be saved as Draft. You can send it from the marketing dashboard.
            </p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/admin/marketing">Cancel</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
