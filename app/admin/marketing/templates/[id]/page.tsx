"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getTemplateById } from "@/app/actions/templates"

// This page redirects to the editor with the template loaded
export default function TemplateEditPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function checkTemplate() {
            const result = await getTemplateById(resolvedParams.id)

            if (result.error || !result.data) {
                setError("Plantilla no encontrada")
                return
            }

            // Redirect to editor with template ID
            router.replace(`/admin/marketing/templates/editor?id=${resolvedParams.id}`)
        }

        checkTemplate()
    }, [resolvedParams.id, router])

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Plantilla No Encontrada</h1>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <button
                        onClick={() => router.push("/admin/marketing")}
                        className="text-primary hover:underline"
                    >
                        Volver a Marketing
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-muted-foreground">Cargando plantilla...</p>
            </div>
        </div>
    )
}
