"use client"

import { useEffect, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download, Loader2, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getSubscribers, unsubscribeEmail, deleteSubscriber } from "@/app/actions/subscribers"
import type { Subscriber } from "@/types/database"

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  useEffect(() => {
    async function loadSubscribers() {
      setIsLoading(true)
      const result = await getSubscribers({
        search: searchQuery || undefined,
      })

      if (result.data) {
        setSubscribers(result.data)
      }
      setIsLoading(false)
    }

    loadSubscribers()
  }, [searchQuery])

  const handleUnsubscribe = (id: string) => {
    startTransition(async () => {
      const result = await unsubscribeEmail(id)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      // Update local state
      setSubscribers(subscribers.map(sub =>
        sub.id === id ? { ...sub, status: 'unsubscribed' as const } : sub
      ))

      toast({
        title: "Unsubscribed",
        description: "Subscriber has been unsubscribed.",
      })
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteSubscriber(id)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      // Update local state
      setSubscribers(subscribers.filter(sub => sub.id !== id))

      toast({
        title: "Deleted",
        description: "Subscriber has been removed.",
      })
    })
  }

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
    const headers = ["Name", "Email", "Company", "Status", "Subscribed Date"]
    const rows = subscribers.map((sub) => [
      sub.name || "",
      sub.email,
      sub.company || "",
      sub.status,
      new Date(sub.subscribed_at).toLocaleDateString()
    ])

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

  const activeCount = subscribers.filter(s => s.status === 'active').length

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
            placeholder="Search by name, email, or company..."
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
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Subscribed Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground">Loading subscribers...</p>
                </TableCell>
              </TableRow>
            ) : subscribers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No subscribers found
                </TableCell>
              </TableRow>
            ) : (
              subscribers.map((subscriber) => (
                <TableRow key={subscriber.id}>
                  <TableCell className="font-medium">{subscriber.name || "-"}</TableCell>
                  <TableCell className="text-muted-foreground">{subscriber.email}</TableCell>
                  <TableCell className="text-muted-foreground">{subscriber.company || "-"}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={subscriber.status === 'active'
                        ? "bg-green-500/10 text-green-600"
                        : "bg-muted text-muted-foreground"
                      }
                    >
                      {subscriber.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(subscriber.subscribed_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      {subscriber.status === 'active' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUnsubscribe(subscriber.id)}
                          disabled={isPending}
                        >
                          Unsubscribe
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(subscriber.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Stats */}
      {subscribers.length > 0 && (
        <div className="mt-6 p-4 bg-card border border-border rounded-lg flex gap-6">
          <p className="text-sm text-muted-foreground">
            Total: <span className="font-semibold text-foreground">{subscribers.length}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Active: <span className="font-semibold text-green-600">{activeCount}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Unsubscribed: <span className="font-semibold text-foreground">{subscribers.length - activeCount}</span>
          </p>
        </div>
      )}
    </div>
  )
}
