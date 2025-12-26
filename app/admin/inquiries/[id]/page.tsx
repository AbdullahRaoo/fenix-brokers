"use client"

import { use, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Send } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface Inquiry {
  id: string
  productId: string
  productName: string
  quantity: string
  companyName: string
  contactName: string
  email: string
  phone: string
  notes: string
  status: "New" | "In Progress" | "Closed"
  adminNotes: string
  createdAt: string
  conversation: { sender: "admin" | "customer"; message: string; timestamp: string }[]
}

export default function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { toast } = useToast()

  const [inquiry, setInquiry] = useState<Inquiry | null>(null)
  const [status, setStatus] = useState<Inquiry["status"]>("New")
  const [replyMessage, setReplyMessage] = useState("")
  const [conversation, setConversation] = useState<Inquiry["conversation"]>([])
  const [customerHistory, setCustomerHistory] = useState<
    Array<{ id: string; productName: string; date: string; status: string }>
  >([])

  useEffect(() => {
    // Load inquiry from localStorage
    const inquiries = JSON.parse(localStorage.getItem("inquiries") || "[]")
    const found = inquiries.find((inq: Inquiry) => inq.id === resolvedParams.id)

    if (found) {
      setInquiry(found)
      setStatus(found.status)
      setConversation(found.conversation || [])

      const allInquiries = inquiries.filter((inq: Inquiry) => inq.email === found.email && inq.id !== found.id)
      setCustomerHistory(
        allInquiries.map((inq: Inquiry) => ({
          id: inq.id,
          productName: inq.productName,
          date: inq.createdAt,
          status: inq.status,
        })),
      )
    }
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

    const newMessage = {
      sender: "admin" as const,
      message: replyMessage,
      timestamp: new Date().toISOString(),
    }

    const updatedConversation = [...conversation, newMessage]
    setConversation(updatedConversation)

    // Update localStorage
    const inquiries = JSON.parse(localStorage.getItem("inquiries") || "[]")
    const updated = inquiries.map((inq: Inquiry) =>
      inq.id === resolvedParams.id ? { ...inq, conversation: updatedConversation, status } : inq,
    )
    localStorage.setItem("inquiries", JSON.stringify(updated))

    toast({
      title: "Reply sent",
      description: "Your message has been sent to the customer via email.",
    })

    setReplyMessage("")
  }

  const handleUpdateStatus = (newStatus: Inquiry["status"]) => {
    setStatus(newStatus)

    // Update localStorage
    const inquiries = JSON.parse(localStorage.getItem("inquiries") || "[]")
    const updated = inquiries.map((inq: Inquiry) =>
      inq.id === resolvedParams.id ? { ...inq, status: newStatus } : inq,
    )
    localStorage.setItem("inquiries", JSON.stringify(updated))

    toast({
      title: "Status updated",
      description: `Inquiry status changed to ${newStatus}.`,
    })
  }

  if (!inquiry) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading inquiry...</p>
        </div>
      </div>
    )
  }

  const getStatusColor = (inquiryStatus: Inquiry["status"]) => {
    switch (inquiryStatus) {
      case "New":
        return "bg-primary/10 text-primary hover:bg-primary/20"
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
            <p className="text-muted-foreground">Inquiry ID: {inquiry.id}</p>
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
                  <p className="font-medium">{inquiry.companyName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Contact Name</p>
                  <p className="font-medium">{inquiry.contactName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Email</p>
                  <p className="font-medium">{inquiry.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Phone</p>
                  <p className="font-medium">{inquiry.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Inquiry Date</p>
                  <p className="font-medium">{new Date(inquiry.createdAt).toLocaleDateString()}</p>
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
                  <p className="font-medium">{inquiry.productName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Quantity Requested</p>
                  <p className="font-medium">{inquiry.quantity}</p>
                </div>
              </div>

              {inquiry.notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Customer Message</p>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm">{inquiry.notes}</p>
                  </div>
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
              {conversation.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No conversation yet</p>
              ) : (
                <div className="space-y-3">
                  {conversation.map((msg, idx) => (
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

          <Card>
            <CardHeader>
              <CardTitle>Customer History</CardTitle>
              <CardDescription>Previous inquiries from this email address</CardDescription>
            </CardHeader>
            <CardContent>
              {customerHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  This is the first inquiry from this customer
                </p>
              ) : (
                <div className="space-y-3">
                  {customerHistory.map((history) => (
                    <div
                      key={history.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border"
                    >
                      <div>
                        <p className="font-medium text-sm">{history.productName}</p>
                        <p className="text-xs text-muted-foreground">{new Date(history.date).toLocaleDateString()}</p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={
                          history.status === "New"
                            ? "bg-primary/10 text-primary"
                            : history.status === "In Progress"
                              ? "bg-yellow-500/10 text-yellow-600"
                              : "bg-green-500/10 text-green-600"
                        }
                      >
                        {history.status}
                      </Badge>
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
              <Button onClick={handleSendReply} className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Send Reply
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
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
