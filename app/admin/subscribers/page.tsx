"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Subscriber {
  name: string
  email: string
  createdAt: string
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    // Load subscribers from localStorage
    const storedSubscribers = JSON.parse(localStorage.getItem("subscribers") || "[]")
    setSubscribers(storedSubscribers)
  }, [])

  const filteredSubscribers = subscribers.filter(
    (sub) =>
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleExportCSV = () => {
    if (subscribers.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no subscribers to export.",
        variant: "destructive",
      })
      return
    }

    // Create CSV content
    const headers = ["Name", "Email", "Subscribed Date"]
    const rows = subscribers.map((sub) => [sub.name, sub.email, new Date(sub.createdAt).toLocaleDateString()])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `subscribers-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export successful",
      description: `Exported ${subscribers.length} subscribers to CSV.`,
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Subscriber Management</h1>
          <p className="text-muted-foreground">Manage your newsletter subscribers</p>
        </div>
        <Button onClick={handleExportCSV} disabled={subscribers.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export to CSV
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Subscribed Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubscribers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  No subscribers found
                </TableCell>
              </TableRow>
            ) : (
              filteredSubscribers.map((subscriber, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{subscriber.name}</TableCell>
                  <TableCell className="text-muted-foreground">{subscriber.email}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(subscriber.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Stats */}
      {subscribers.length > 0 && (
        <div className="mt-6 p-4 bg-card border border-border rounded-lg">
          <p className="text-sm text-muted-foreground">
            Total Subscribers: <span className="font-semibold text-foreground">{subscribers.length}</span>
          </p>
        </div>
      )}
    </div>
  )
}
