"use client"

import { useEffect, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Eye, Loader2 } from "lucide-react"
import Link from "next/link"
import { getInquiries } from "@/app/actions/inquiries"
import type { Inquiry } from "@/types/database"

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    async function loadInquiries() {
      setIsLoading(true)
      const result = await getInquiries({
        status: statusFilter === "all" ? undefined : statusFilter,
        search: searchQuery || undefined,
      })

      if (result.data) {
        setInquiries(result.data)
      }
      setIsLoading(false)
    }

    loadInquiries()
  }, [searchQuery, statusFilter])

  const getStatusColor = (status: Inquiry["status"]) => {
    switch (status) {
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
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Gestión de Consultas</h1>
        <p className="text-muted-foreground">Seguimiento y respuesta a solicitudes de cotización</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por producto, empresa o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los Estados</SelectItem>
            <SelectItem value="New">Nuevo</SelectItem>
            <SelectItem value="Viewed">Visto</SelectItem>
            <SelectItem value="In Progress">En Progreso</SelectItem>
            <SelectItem value="Closed">Cerrado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Inquiries Table */}
      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Consulta</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground">Cargando consultas...</p>
                </TableCell>
              </TableRow>
            ) : inquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No se encontraron consultas
                </TableCell>
              </TableRow>
            ) : (
              inquiries.map((inquiry) => (
                <TableRow key={inquiry.id}>
                  <TableCell className="font-mono text-sm">{inquiry.id.slice(0, 8)}</TableCell>
                  <TableCell className="font-medium">{inquiry.product_name}</TableCell>
                  <TableCell>{inquiry.company_name}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{inquiry.contact_person}</p>
                      <p className="text-xs text-muted-foreground">{inquiry.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{inquiry.quantity}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusColor(inquiry.status)}>
                      {inquiry.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(inquiry.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/inquiries/${inquiry.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
