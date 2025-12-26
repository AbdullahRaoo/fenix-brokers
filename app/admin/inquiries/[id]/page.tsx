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
        description: "Please enter a message before sending.",
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
        title: "Reply sent",
        description: "Your message has been sent to the customer via email.",
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
        title: "Status updated",
        description: `Inquiry status changed to ${newStatus}.`,
      })
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading inquiry...</p>
        </div>
      </div>
    )
  }

  if (notFound || !inquiry) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Package2 className="h-16 w-16 text-muted-foreground opacity-50" />
          <h2 className="text-xl font-bold">Inquiry Not Found</h2>
          <Button asChild>
            <Link href="/admin/inquiries">Back to Inquiries</Link>
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
            Back to Inquiries
          </Link>
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Inquiry Details</h1>
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
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>Details about the customer and their inquiry</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Company Name</p>
                  <p className="font-medium">{inquiry.company_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Contact Person</p>
                  <p className="font-medium">{inquiry.contact_person}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Email</p>
                  <p className="font-medium">{inquiry.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Inquiry Date</p>
                  <p className="font-medium">{new Date(inquiry.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
              <CardDescription>Information about the requested product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Product</p>
                  <p className="font-medium">{inquiry.product_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Quantity Requested</p>
                  <p className="font-medium">{inquiry.quantity}</p>
                </div>
              </div>

              {inquiry.requirements && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Customer Requirements</p>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm">{inquiry.requirements}</p>
                  </div>
                </div>
              )}

              {inquiry.attachment_url && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Attachment</p>
                  <a
                    href={inquiry.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm"
                  >
                    View Attachment
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Conversation History */}
          <Card>
            <CardHeader>
              <CardTitle>Conversation History</CardTitle>
              <CardDescription>Email conversation with the customer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!inquiry.message_threads || inquiry.message_threads.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No conversation yet</p>
              ) : (
                <div className="space-y-3">
                  {inquiry.message_threads.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg ${msg.sender === "admin" ? "bg-primary/10 ml-8" : "bg-muted mr-8"}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {msg.sender === "admin" ? "You" : "Customer"}
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
              <CardTitle>Reply via Email</CardTitle>
              <CardDescription>Send a response to the customer's inquiry</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reply">Your Message</Label>
                <Textarea
                  id="reply"
                  placeholder="Type your reply here..."
                  rows={6}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                />
              </div>
              <Button onClick={handleSendReply} className="w-full" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Reply
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
              <CardTitle>Status Management</CardTitle>
              <CardDescription>Update inquiry status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Inquiry Status</Label>
                <Select value={status} onValueChange={(value: Inquiry["status"]) => handleUpdateStatus(value)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Viewed">Viewed</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {inquiry.admin_notes && (
            <Card>
              <CardHeader>
                <CardTitle>Admin Notes</CardTitle>
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
