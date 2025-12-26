"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface Inquiry {
  id: string
  productId: string
  productName: string
  quantity: string
  companyName: string
  notes: string
  status: "New" | "In Progress" | "Closed"
  adminNotes: string
  createdAt: string
}

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [tempStatus, setTempStatus] = useState<Inquiry["status"]>("New")
  const [tempAdminNotes, setTempAdminNotes] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    // Load inquiries from localStorage
    const storedInquiries = JSON.parse(localStorage.getItem("inquiries") || "[]")
    setInquiries(storedInquiries)
  }, [])

  const filteredInquiries = inquiries.filter(
    (inquiry) =>
      inquiry.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.id.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleViewInquiry = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry)
    setTempStatus(inquiry.status)
    setTempAdminNotes(inquiry.adminNotes)
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (selectedInquiry) {
      const updatedInquiries = inquiries.map((inq) =>
        inq.id === selectedInquiry.id ? { ...inq, status: tempStatus, adminNotes: tempAdminNotes } : inq,
      )
      setInquiries(updatedInquiries)
      localStorage.setItem("inquiries", JSON.stringify(updatedInquiries))

      toast({
        title: "Inquiry updated",
        description: "The inquiry has been successfully updated.",
      })
      setDialogOpen(false)
    }
  }

  const getStatusColor = (status: Inquiry["status"]) => {
    switch (status) {
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
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Inquiry Management</h1>
        <p className="text-muted-foreground">Track and respond to customer quote requests</p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by product, company, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Inquiry ID</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No inquiries found
                </TableCell>
              </TableRow>
            ) : (
              filteredInquiries.map((inquiry) => (
                <TableRow key={inquiry.id}>
                  <TableCell className="font-mono text-sm">{inquiry.id}</TableCell>
                  <TableCell className="font-medium">{inquiry.productName}</TableCell>
                  <TableCell>{inquiry.companyName}</TableCell>
                  <TableCell>{inquiry.quantity}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusColor(inquiry.status)}>
                      {inquiry.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(inquiry.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/inquiries/${inquiry.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Inquiry Details Dialog */}
      {selectedInquiry && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Inquiry Details</DialogTitle>
              <DialogDescription>Review and update the inquiry information</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {/* Inquiry Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Inquiry ID</p>
                  <p className="font-mono text-sm">{selectedInquiry.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Created</p>
                  <p className="text-sm">{new Date(selectedInquiry.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Product</p>
                  <p className="font-medium">{selectedInquiry.productName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Quantity</p>
                  <p className="font-medium">{selectedInquiry.quantity}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground mb-1">Company</p>
                  <p className="font-medium">{selectedInquiry.companyName}</p>
                </div>
                {selectedInquiry.notes && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground mb-1">Customer Notes</p>
                    <p className="text-sm">{selectedInquiry.notes}</p>
                  </div>
                )}
              </div>

              {/* Status Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={tempStatus} onValueChange={(value: Inquiry["status"]) => setTempStatus(value)}>
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

              {/* Admin Notes */}
              <div className="space-y-2">
                <Label htmlFor="admin-notes">Admin Notes</Label>
                <Textarea
                  id="admin-notes"
                  placeholder="Add internal notes about this inquiry..."
                  value={tempAdminNotes}
                  onChange={(e) => setTempAdminNotes(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button onClick={handleSave} className="flex-1">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
