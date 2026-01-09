"use client"

import { PublicHeader } from "@/components/public-header"
import { Footer } from "@/components/footer"
import { FileText } from "lucide-react"

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen">
            <PublicHeader />

            {/* Hero Section */}
            <section className="relative py-16 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <FileText className="h-7 w-7 text-primary" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                        Términos de <span className="text-primary">Servicio</span>
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Última actualización: Enero 2025
                    </p>
                </div>
            </section>

            {/* Content */}
            <section className="py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="prose prose-lg dark:prose-invert max-w-none">

                        <div className="bg-card border border-border rounded-2xl p-8 mb-8">
                            <h2 className="text-2xl font-bold mb-4 text-foreground">1. Aceptación de los Términos</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Al acceder y utilizar el sitio web de Fenix Brokers, usted acepta estar sujeto a estos
                                Términos de Servicio y todas las leyes y regulaciones aplicables. Si no está de acuerdo
                                con alguno de estos términos, no debe utilizar este sitio. Los materiales contenidos en
                                este sitio web están protegidos por las leyes de derechos de autor y marcas registradas aplicables.
                            </p>
                        </div>

                        <div className="bg-card border border-border rounded-2xl p-8 mb-8">
                            <h2 className="text-2xl font-bold mb-4 text-foreground">2. Servicios de Venta Mayorista</h2>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                Fenix Brokers proporciona servicios de distribución mayorista de productos cosméticos
                                y de belleza. Nuestros servicios están destinados exclusivamente a empresas y profesionales
                                del sector. Al utilizar nuestros servicios, usted confirma que:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>Es una empresa legalmente constituida o un profesional del sector</li>
                                <li>Tiene capacidad legal para celebrar contratos vinculantes</li>
                                <li>Toda la información proporcionada es veraz y precisa</li>
                                <li>Utilizará los productos adquiridos conforme a las normativas aplicables</li>
                            </ul>
                        </div>

                        <div className="bg-card border border-border rounded-2xl p-8 mb-8">
                            <h2 className="text-2xl font-bold mb-4 text-foreground">3. Pedidos y Pagos</h2>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                Al realizar un pedido a través de Fenix Brokers:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>Los precios están sujetos a cambios sin previo aviso hasta la confirmación del pedido</li>
                                <li>Todos los pedidos están sujetos a aceptación y disponibilidad</li>
                                <li>Los términos de pago acordados deben cumplirse según lo establecido</li>
                                <li>Los pedidos mínimos pueden variar según la categoría de producto</li>
                                <li>Las facturas se emitirán conforme a la normativa fiscal española</li>
                            </ul>
                        </div>

                        <div className="bg-card border border-border rounded-2xl p-8 mb-8">
                            <h2 className="text-2xl font-bold mb-4 text-foreground">4. Envíos y Entregas</h2>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                Las condiciones de envío son las siguientes:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>Los plazos de entrega son estimados y no garantizados</li>
                                <li>El riesgo de pérdida se transfiere al comprador en el momento de la entrega al transportista</li>
                                <li>Es responsabilidad del comprador verificar el estado de la mercancía en el momento de la recepción</li>
                                <li>Las reclamaciones por daños de transporte deben realizarse dentro de las 48 horas siguientes a la recepción</li>
                            </ul>
                        </div>

                        <div className="bg-card border border-border rounded-2xl p-8 mb-8">
                            <h2 className="text-2xl font-bold mb-4 text-foreground">5. Devoluciones y Garantías</h2>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                Nuestra política de devoluciones contempla:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>Los productos defectuosos serán reemplazados o reembolsados</li>
                                <li>Las devoluciones por error del cliente pueden estar sujetas a cargos de reposición</li>
                                <li>Los productos deben estar en su embalaje original y sin abrir</li>
                                <li>Las solicitudes de devolución deben realizarse dentro de los 14 días posteriores a la recepción</li>
                                <li>Algunos productos pueden estar excluidos de devolución por razones de higiene o seguridad</li>
                            </ul>
                        </div>

                        <div className="bg-card border border-border rounded-2xl p-8 mb-8">
                            <h2 className="text-2xl font-bold mb-4 text-foreground">6. Propiedad Intelectual</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Todos los contenidos de este sitio web, incluyendo pero no limitándose a textos,
                                gráficos, logotipos, imágenes y software, son propiedad de Fenix Brokers o sus
                                proveedores de contenido y están protegidos por las leyes de propiedad intelectual.
                                Queda prohibida la reproducción, distribución o modificación de cualquier contenido
                                sin autorización expresa por escrito.
                            </p>
                        </div>

                        <div className="bg-card border border-border rounded-2xl p-8 mb-8">
                            <h2 className="text-2xl font-bold mb-4 text-foreground">7. Limitación de Responsabilidad</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Fenix Brokers no será responsable de daños indirectos, incidentales, especiales o
                                consecuentes que resulten del uso o la imposibilidad de uso de nuestros servicios.
                                Nuestra responsabilidad máxima estará limitada al valor del pedido en cuestión.
                                Esta limitación se aplicará en la máxima medida permitida por la ley aplicable.
                            </p>
                        </div>

                        <div className="bg-card border border-border rounded-2xl p-8 mb-8">
                            <h2 className="text-2xl font-bold mb-4 text-foreground">8. Ley Aplicable y Jurisdicción</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Estos términos se regirán e interpretarán de acuerdo con las leyes de España.
                                Cualquier disputa que surja en relación con estos términos estará sujeta a la
                                jurisdicción exclusiva de los tribunales de Las Palmas de Gran Canaria, España.
                            </p>
                        </div>

                        <div className="bg-card border border-border rounded-2xl p-8">
                            <h2 className="text-2xl font-bold mb-4 text-foreground">9. Contacto</h2>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                Para cualquier consulta sobre estos términos de servicio, puede contactarnos en:
                            </p>
                            <div className="text-muted-foreground">
                                <p><strong>Fenix Brokers</strong></p>
                                <p>Email: ebono@fenixbrokers.com</p>
                                <p>Teléfono: +34 615 582 177</p>
                                <p>Dirección: 35004 Las Palmas de GC, España</p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
