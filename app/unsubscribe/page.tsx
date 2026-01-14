"use client"

import { useEffect, useState, useTransition } from "react"
import { useSearchParams } from "next/navigation"
import { PublicHeader } from "@/components/public-header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Loader2, Mail, ArrowRight } from "lucide-react"
import Link from "next/link"
import { unsubscribeByEmail } from "@/app/actions/subscribers"

export default function UnsubscribePage() {
    const searchParams = useSearchParams()
    const email = searchParams.get("email")

    const [status, setStatus] = useState<"loading" | "success" | "error" | "no-email">("loading")
    const [errorMessage, setErrorMessage] = useState("")

    useEffect(() => {
        async function processUnsubscribe() {
            if (!email) {
                setStatus("no-email")
                return
            }

            const result = await unsubscribeByEmail(email)

            if (result.success) {
                setStatus("success")
            } else {
                setStatus("error")
                setErrorMessage(result.error || "Error al procesar la solicitud")
            }
        }

        processUnsubscribe()
    }, [email])

    return (
        <div className="min-h-screen flex flex-col">
            <PublicHeader />

            <main className="flex-1 flex items-center justify-center py-20">
                <div className="max-w-md mx-auto px-4 text-center">
                    {status === "loading" && (
                        <div className="space-y-4">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                            </div>
                            <h1 className="text-2xl font-bold">Procesando...</h1>
                            <p className="text-muted-foreground">
                                Estamos procesando tu solicitud de baja.
                            </p>
                        </div>
                    )}

                    {status === "success" && (
                        <div className="space-y-6">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 className="h-10 w-10 text-green-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold mb-2">¡Te has dado de baja!</h1>
                                <p className="text-muted-foreground">
                                    Has sido eliminado de nuestra lista de correo. Ya no recibirás más emails de marketing.
                                </p>
                            </div>
                            <div className="pt-4 border-t border-border">
                                <p className="text-sm text-muted-foreground mb-4">
                                    ¿Te diste de baja por error?
                                </p>
                                <Button asChild variant="outline">
                                    <Link href="/contact">
                                        Contáctanos <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    )}

                    {status === "error" && (
                        <div className="space-y-6">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                                <XCircle className="h-10 w-10 text-red-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold mb-2">Error</h1>
                                <p className="text-muted-foreground">
                                    {errorMessage}
                                </p>
                            </div>
                            <Button asChild>
                                <Link href="/contact">
                                    <Mail className="mr-2 h-4 w-4" />
                                    Contactar Soporte
                                </Link>
                            </Button>
                        </div>
                    )}

                    {status === "no-email" && (
                        <div className="space-y-6">
                            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                                <Mail className="h-10 w-10 text-amber-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold mb-2">Email no proporcionado</h1>
                                <p className="text-muted-foreground">
                                    No se encontró una dirección de email válida. Por favor usa el enlace del correo que recibiste.
                                </p>
                            </div>
                            <Button asChild>
                                <Link href="/">
                                    Volver al Inicio <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    )
}
