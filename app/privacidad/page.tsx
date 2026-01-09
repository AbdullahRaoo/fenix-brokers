"use client"

import { PublicHeader } from "@/components/public-header"
import { Footer } from "@/components/footer"
import { Shield } from "lucide-react"

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen">
            <PublicHeader />

            {/* Hero Section */}
            <section className="relative py-16 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Shield className="h-7 w-7 text-primary" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                        Política de <span className="text-primary">Privacidad</span>
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
                            <h2 className="text-2xl font-bold mb-4 text-foreground">1. Información que Recopilamos</h2>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                En Fenix Brokers, recopilamos información que usted nos proporciona directamente cuando:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>Se registra para una cuenta o solicita información</li>
                                <li>Realiza un pedido o solicita una cotización</li>
                                <li>Se suscribe a nuestro boletín informativo</li>
                                <li>Se comunica con nuestro equipo de atención al cliente</li>
                                <li>Completa formularios en nuestro sitio web</li>
                            </ul>
                        </div>

                        <div className="bg-card border border-border rounded-2xl p-8 mb-8">
                            <h2 className="text-2xl font-bold mb-4 text-foreground">2. Uso de la Información</h2>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                Utilizamos la información recopilada para:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>Procesar y gestionar sus pedidos y solicitudes</li>
                                <li>Comunicarnos con usted sobre productos, servicios y promociones</li>
                                <li>Mejorar nuestros servicios y experiencia del usuario</li>
                                <li>Cumplir con obligaciones legales y regulatorias</li>
                                <li>Proteger contra actividades fraudulentas</li>
                            </ul>
                        </div>

                        <div className="bg-card border border-border rounded-2xl p-8 mb-8">
                            <h2 className="text-2xl font-bold mb-4 text-foreground">3. Protección de Datos</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger
                                sus datos personales contra el acceso no autorizado, la alteración, la divulgación
                                o la destrucción. Esto incluye encriptación SSL, servidores seguros y acceso
                                restringido a la información personal.
                            </p>
                        </div>

                        <div className="bg-card border border-border rounded-2xl p-8 mb-8">
                            <h2 className="text-2xl font-bold mb-4 text-foreground">4. Compartir Información</h2>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                No vendemos, alquilamos ni compartimos su información personal con terceros, excepto:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>Con proveedores de servicios que nos ayudan a operar nuestro negocio</li>
                                <li>Cuando sea requerido por ley o proceso legal</li>
                                <li>Para proteger nuestros derechos y seguridad</li>
                                <li>Con su consentimiento expreso</li>
                            </ul>
                        </div>

                        <div className="bg-card border border-border rounded-2xl p-8 mb-8">
                            <h2 className="text-2xl font-bold mb-4 text-foreground">5. Sus Derechos</h2>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                De acuerdo con el RGPD y la legislación española de protección de datos, usted tiene derecho a:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>Acceder a sus datos personales</li>
                                <li>Rectificar datos inexactos o incompletos</li>
                                <li>Solicitar la eliminación de sus datos</li>
                                <li>Oponerse al procesamiento de sus datos</li>
                                <li>Solicitar la portabilidad de sus datos</li>
                                <li>Retirar su consentimiento en cualquier momento</li>
                            </ul>
                        </div>

                        <div className="bg-card border border-border rounded-2xl p-8 mb-8">
                            <h2 className="text-2xl font-bold mb-4 text-foreground">6. Cookies</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Utilizamos cookies y tecnologías similares para mejorar su experiencia en nuestro sitio web,
                                analizar el tráfico del sitio y personalizar el contenido. Puede configurar su navegador
                                para rechazar cookies, aunque esto puede afectar la funcionalidad del sitio.
                            </p>
                        </div>

                        <div className="bg-card border border-border rounded-2xl p-8">
                            <h2 className="text-2xl font-bold mb-4 text-foreground">7. Contacto</h2>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                Para cualquier consulta sobre esta política de privacidad o el tratamiento de sus datos,
                                puede contactarnos en:
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
