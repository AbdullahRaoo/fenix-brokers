"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, Mail, Users, Send, Eye } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function ReviewPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [subjectLine, setSubjectLine] = useState("New Products Available")
  const [preheader, setPreheader] = useState("Check out our latest additions")
  const [testEmail, setTestEmail] = useState("")
  const [emailBlocks, setEmailBlocks] = useState([])

  useEffect(() => {
    const stored = sessionStorage.getItem("emailBlocks")
    if (stored) {
      setEmailBlocks(JSON.parse(stored))
    }
  }, [])

  const generateEmailHTML = () => {
    // Generate HTML from blocks
    let bodyContent = ""

    emailBlocks.forEach((block: any) => {
      switch (block.type) {
        case "text":
          bodyContent += `<div style="padding: 20px; text-align: center;"><p style="margin: 0; color: #111827;">${block.content}</p></div>`
          break
        case "image":
          bodyContent += `<div style="padding: 20px;"><img src="${block.imageUrl}" style="width: 100%; height: auto; border-radius: 8px;" /></div>`
          break
        case "button":
          bodyContent += `<div style="padding: 20px; text-align: center;"><a href="${block.buttonUrl}" style="display: inline-block; background-color: #6366f1; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">${block.buttonText}</a></div>`
          break
        case "spacer":
          bodyContent += `<div style="height: ${block.spacerHeight}px;"></div>`
          break
        case "product":
          bodyContent += `<div style="padding: 20px;"><div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;"><img src="${block.product.image}" style="width: 100%; height: 200px; object-fit: cover;" /><div style="padding: 16px;"><p style="color: #6b7280; font-size: 12px; margin-bottom: 4px;">${block.product.brand}</p><h3 style="color: #111827; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">${block.product.name}</h3><a href="#" style="display: inline-block; background-color: #6366f1; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">View Product</a></div></div></div>`
          break
      }
    })

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subjectLine}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background-color: #0f172a; padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">ProSupply Wholesale</h1>
            <p style="color: #e2e8f0; margin-top: 8px; font-size: 14px;">${preheader}</p>
        </div>
        <div>
            ${bodyContent}
        </div>
        <div style="background-color: #0f172a; color: #e2e8f0; padding: 30px 20px; text-align: center; font-size: 14px;">
            <p style="margin: 0;">&copy; 2025 ProSupply Wholesale. All rights reserved.</p>
            <p style="margin-top: 8px;">Your trusted B2B partner</p>
        </div>
    </div>
</body>
</html>`
  }

  const handleSendTest = () => {
    if (!testEmail) {
      toast({
        title: "Email required",
        description: "Please enter an email address to send the test.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Test email sent!",
      description: `A test email has been sent to ${testEmail}`,
    })
  }

  const handleSendCampaign = () => {
    toast({
      title: "Campaign scheduled!",
      description: "Your email campaign has been scheduled successfully.",
    })

    // Clear session storage
    sessionStorage.removeItem("emailBlocks")

    // Navigate back to marketing dashboard
    setTimeout(() => {
      router.push("/admin/marketing")
    }, 1500)
  }

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/admin/marketing/create/editor">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Editor
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mb-2">Review & Send</h1>
        <p className="text-muted-foreground">Step 3 of 3: Review your campaign and send</p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold mb-2">
              ✓
            </div>
            <span className="text-sm font-medium">Template</span>
          </div>
          <div className="h-px w-20 bg-border" />
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold mb-2">
              ✓
            </div>
            <span className="text-sm font-medium">Design</span>
          </div>
          <div className="h-px w-20 bg-border" />
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold mb-2">
              3
            </div>
            <span className="text-sm font-medium">Review</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Left - Campaign Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
              <CardDescription>Configure final details before sending</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  value={subjectLine}
                  onChange={(e) => setSubjectLine(e.target.value)}
                  placeholder="Enter subject line..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preheader">Pre-header Text</Label>
                <Input
                  id="preheader"
                  value={preheader}
                  onChange={(e) => setPreheader(e.target.value)}
                  placeholder="Enter pre-header text..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recipient Summary</CardTitle>
              <CardDescription>Who will receive this campaign</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-lg">1,523 Subscribers</p>
                  <p className="text-sm text-muted-foreground">All active subscribers will receive this email</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Send Test Email</CardTitle>
              <CardDescription>Preview the email in your inbox</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="testEmail">Test Email Address</Label>
                <Input
                  id="testEmail"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
              <Button onClick={handleSendTest} variant="outline" className="w-full bg-transparent">
                <Mail className="h-4 w-4 mr-2" />
                Send Test
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right - Preview */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Email Preview</CardTitle>
                  <CardDescription>Final preview of your campaign</CardDescription>
                </div>
                <Eye className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="border border-border rounded-lg overflow-hidden">
                <iframe srcDoc={generateEmailHTML()} className="w-full h-[700px] bg-white" title="Email Preview" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link href="/admin/marketing/create/editor">Back to Editor</Link>
        </Button>
        <Button onClick={handleSendCampaign} size="lg" className="bg-green-600 hover:bg-green-700">
          <Send className="h-4 w-4 mr-2" />
          Send Campaign
        </Button>
      </div>
    </div>
  )
}
