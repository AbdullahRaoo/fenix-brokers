// Pre-built email template presets - Modern, Outlook-compatible designs

export interface SocialLink {
    platform: 'facebook' | 'instagram' | 'linkedin' | 'twitter' | 'youtube' | 'tiktok' | 'custom'
    url: string
    iconUrl?: string // For custom icons
}

export interface TemplateBlock {
    id: string
    type: "heading" | "text" | "image" | "button" | "divider" | "spacer" | "product" | "columns" | "logo" | "social" | "footer" | "section"
    content?: string
    src?: string
    alt?: string
    level?: number
    buttonText?: string
    buttonUrl?: string
    columns?: TemplateBlock[][]

    // Styling properties
    backgroundColor?: string
    textColor?: string
    textAlign?: 'left' | 'center' | 'right'
    fontWeight?: 'normal' | 'bold'
    fontSize?: number // in pixels (also used for image width percentage)
    borderRadius?: number // in pixels
    padding?: number // in pixels (uniform padding)
    paddingTop?: number // in pixels
    paddingRight?: number // in pixels
    paddingBottom?: number // in pixels
    paddingLeft?: number // in pixels
    fontFamily?: string // for email-safe fonts

    // Button specific styling
    buttonColor?: string
    buttonTextColor?: string

    // Divider styling
    borderColor?: string

    // Social links (for social block)
    socialLinks?: SocialLink[]

    // Footer content
    companyName?: string
    address?: string
    unsubscribeText?: string

    // Section block - nested content
    children?: TemplateBlock[]
}

export interface TemplatePreset {
    id: string
    name: string
    description: string
    thumbnail: string
    category: "promotional" | "newsletter" | "announcement" | "welcome"
    blocks: TemplateBlock[]
}

// Helper to generate unique IDs
const genId = () => Math.random().toString(36).substring(2, 9)

// Fenix Brokers Brand Colors - Light mode, NO gradients (Outlook compatible)
const BRAND = {
    primary: '#00bed6',      // Cyan - main brand color
    primaryDark: '#0099ac',  // Darker cyan for headers
    dark: '#0f172a',         // Slate dark for header background
    text: '#1e293b',         // Slate dark text
    textMuted: '#64748b',    // Slate muted text
    white: '#ffffff',        // White
    lightBg: '#f8fafc',      // Slate 50 - light background
    border: '#e2e8f0',       // Slate 200 - borders
}

// Default logo URL - the actual logo is fetched from site_settings.logo_url in the database
// This is used as a fallback when settings haven't been configured
const LOGO_URL = '/logos/PNG/logo-fenix-brokers-1.png'

export const templatePresets: TemplatePreset[] = [
    {
        id: "product-announcement",
        name: "Anuncio de Producto",
        description: "Vitrina limpia de productos con imagen destacada",
        thumbnail: "/templates/product-announcement.png",
        category: "promotional",
        blocks: [
            // Header with logo
            { id: genId(), type: "logo", src: LOGO_URL, alt: "Fenix Brokers", textAlign: 'center', padding: 25, backgroundColor: BRAND.white },

            // Hero Section
            {
                id: genId(), type: "section", backgroundColor: BRAND.white, padding: 25, children: [
                    { id: genId(), type: "heading", content: "Los Nuevos Productos Han Llegado", level: 1, textAlign: 'center', textColor: BRAND.text },
                    { id: genId(), type: "text", content: "Descubre nuestra última colección de cosméticos y fragancias premium, cuidadosamente seleccionada para socios mayoristas.", textAlign: 'center', textColor: BRAND.textMuted },
                    { id: genId(), type: "image", src: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600", alt: "Nueva colección de cosméticos", borderRadius: 8 },
                    { id: genId(), type: "button", buttonText: "Ver Colección", buttonUrl: "https://fenixbrokers.com/catalog", buttonColor: BRAND.primary, buttonTextColor: BRAND.white, textAlign: 'center' },
                ]
            },

            // Featured Products Section
            {
                id: genId(), type: "section", backgroundColor: BRAND.lightBg, padding: 25, children: [
                    { id: genId(), type: "heading", content: "Productos Destacados", level: 2, textAlign: 'center', textColor: BRAND.primary },
                ]
            },

            // Products columns
            {
                id: genId(), type: "columns", backgroundColor: BRAND.lightBg, columns: [
                    [
                        { id: genId(), type: "image", src: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=200", alt: "Set de Perfumes de Lujo", borderRadius: 8 },
                        { id: genId(), type: "heading", content: "Set de Perfumes de Lujo", level: 3, textAlign: 'center', textColor: BRAND.text },
                        { id: genId(), type: "button", buttonText: "Ver Detalles", buttonUrl: "#", buttonColor: BRAND.primary, buttonTextColor: BRAND.white, textAlign: 'center' },
                    ],
                    [
                        { id: genId(), type: "image", src: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200", alt: "Pack de Cuidado de Piel Premium", borderRadius: 8 },
                        { id: genId(), type: "heading", content: "Pack de Cuidado de Piel Premium", level: 3, textAlign: 'center', textColor: BRAND.text },
                        { id: genId(), type: "button", buttonText: "Ver Detalles", buttonUrl: "#", buttonColor: BRAND.primary, buttonTextColor: BRAND.white, textAlign: 'center' },
                    ],
                ]
            },

            // Footer
            {
                id: genId(), type: "footer", companyName: "Fenix Brokers", address: "35004 Las Palmas de GC, España", unsubscribeText: "Darse de baja de esta lista", textAlign: 'center', textColor: BRAND.textMuted, backgroundColor: BRAND.lightBg, padding: 25,
                socialLinks: [
                    { platform: 'instagram', url: 'https://instagram.com/fenixbrokers' },
                    { platform: 'linkedin', url: 'https://linkedin.com/company/fenixbrokers' }
                ]
            },
        ],
    },
    {
        id: "monthly-newsletter",
        name: "Boletín Mensual",
        description: "Actualizaciones regulares con noticias y productos destacados",
        thumbnail: "/templates/newsletter.png",
        category: "newsletter",
        blocks: [
            // Header
            { id: genId(), type: "logo", src: LOGO_URL, alt: "Fenix Brokers", textAlign: 'center', padding: 25, backgroundColor: BRAND.white },

            // Intro Section
            {
                id: genId(), type: "section", backgroundColor: BRAND.white, padding: 25, children: [
                    { id: genId(), type: "heading", content: "Boletín Mensual", level: 1, textAlign: 'center', textColor: BRAND.text },
                    { id: genId(), type: "text", content: "Tu resumen mensual de tendencias de la industria de belleza, nuevos productos y ofertas exclusivas.", textAlign: 'center', textColor: BRAND.textMuted },
                ]
            },

            // News Section
            {
                id: genId(), type: "section", backgroundColor: BRAND.lightBg, padding: 25, children: [
                    { id: genId(), type: "heading", content: "Noticias de la Industria", level: 2, textColor: BRAND.primary },
                    { id: genId(), type: "text", content: "La industria de la belleza continúa viendo un fuerte crecimiento en productos de belleza limpia. Nuestra nueva línea de cuidado de piel orgánico ya está disponible para pre-pedido con precios especiales mayoristas.", textColor: BRAND.text },
                    { id: genId(), type: "button", buttonText: "Leer Más", buttonUrl: "#", buttonColor: BRAND.primary, buttonTextColor: BRAND.white },
                ]
            },

            // Top Sellers Section
            {
                id: genId(), type: "section", backgroundColor: BRAND.white, padding: 25, children: [
                    { id: genId(), type: "heading", content: "Más Vendidos Este Mes", level: 2, textAlign: 'center', textColor: BRAND.primary },
                ]
            },

            // Products columns
            {
                id: genId(), type: "columns", backgroundColor: BRAND.white, columns: [
                    [
                        { id: genId(), type: "image", src: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=200", alt: "Paleta Oro Rosa", borderRadius: 8 },
                        { id: genId(), type: "heading", content: "Paleta Oro Rosa", level: 3, textAlign: 'center', textColor: BRAND.text },
                    ],
                    [
                        { id: genId(), type: "image", src: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200", alt: "Sérum Vitamina C", borderRadius: 8 },
                        { id: genId(), type: "heading", content: "Sérum Vitamina C", level: 3, textAlign: 'center', textColor: BRAND.text },
                    ],
                ]
            },

            // Pro Tip Section
            {
                id: genId(), type: "section", backgroundColor: BRAND.lightBg, padding: 25, children: [
                    { id: genId(), type: "heading", content: "Consejo Pro", level: 2, textColor: BRAND.primary },
                    { id: genId(), type: "text", content: "Combina productos complementarios para aumentar el valor promedio del pedido. Nuestros sets de cuidado de piel tienen una tasa de conversión un 40% mayor que los artículos individuales.", textColor: BRAND.text },
                ]
            },

            // Footer
            {
                id: genId(), type: "footer", companyName: "Fenix Brokers", address: "35004 Las Palmas de GC, España", unsubscribeText: "Darse de baja", textAlign: 'center', textColor: BRAND.textMuted, backgroundColor: BRAND.lightBg, padding: 25,
                socialLinks: [
                    { platform: 'instagram', url: 'https://instagram.com/fenixbrokers' },
                    { platform: 'linkedin', url: 'https://linkedin.com/company/fenixbrokers' }
                ]
            },
        ],
    },
    {
        id: "sale-event",
        name: "Evento de Ofertas",
        description: "Email promocional llamativo para ventas y descuentos",
        thumbnail: "/templates/sale.png",
        category: "promotional",
        blocks: [
            // Header
            { id: genId(), type: "logo", src: LOGO_URL, alt: "Fenix Brokers", textAlign: 'center', padding: 25, backgroundColor: BRAND.white },

            // Sale Banner Section
            {
                id: genId(), type: "section", backgroundColor: BRAND.primary, padding: 30, children: [
                    { id: genId(), type: "heading", content: "VENTA RELÁMPAGO", level: 1, textAlign: 'center', textColor: BRAND.white, fontWeight: 'bold' },
                    { id: genId(), type: "heading", content: "Hasta 40% de Descuento en Precios Mayoristas", level: 2, textAlign: 'center', textColor: BRAND.white },
                ]
            },

            // Content Section
            {
                id: genId(), type: "section", backgroundColor: BRAND.white, padding: 25, children: [
                    { id: genId(), type: "text", content: "Solo por 48 horas, disfruta de descuentos exclusivos en nuestros cosméticos y fragancias más vendidos. ¡Abastécete y maximiza tus márgenes!", textAlign: 'center', textColor: BRAND.textMuted },
                    { id: genId(), type: "image", src: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600", alt: "Oferta", borderRadius: 8 },
                    { id: genId(), type: "button", buttonText: "Comprar la Oferta", buttonUrl: "https://fenixbrokers.com/sale", buttonColor: BRAND.primary, buttonTextColor: BRAND.white, textAlign: 'center' },
                ]
            },

            // Best Deals Section
            {
                id: genId(), type: "section", backgroundColor: BRAND.lightBg, padding: 25, children: [
                    { id: genId(), type: "heading", content: "Mejores Ofertas", level: 2, textColor: BRAND.primary, textAlign: 'center' },
                ]
            },

            // Deals columns
            {
                id: genId(), type: "columns", backgroundColor: BRAND.lightBg, columns: [
                    [
                        { id: genId(), type: "image", src: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=200", alt: "Fragancia de Diseñador", borderRadius: 8 },
                        { id: genId(), type: "heading", content: "Fragancia de Diseñador - 35% DESC", level: 3, textAlign: 'center', textColor: BRAND.text },
                    ],
                    [
                        { id: genId(), type: "image", src: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=200", alt: "Kit de Maquillaje", borderRadius: 8 },
                        { id: genId(), type: "heading", content: "Kit de Maquillaje - 40% DESC", level: 3, textAlign: 'center', textColor: BRAND.text },
                    ],
                ]
            },

            // Urgency Section
            {
                id: genId(), type: "section", backgroundColor: BRAND.white, padding: 20, children: [
                    { id: genId(), type: "text", content: "La oferta termina en 48 horas. Usa el código FLASH40 al pagar.", textAlign: 'center', fontWeight: 'bold', textColor: BRAND.primary },
                ]
            },

            // Footer
            {
                id: genId(), type: "footer", companyName: "Fenix Brokers", address: "35004 Las Palmas de GC, España", unsubscribeText: "Darse de baja", textAlign: 'center', textColor: BRAND.textMuted, backgroundColor: BRAND.lightBg, padding: 25,
                socialLinks: [
                    { platform: 'instagram', url: 'https://instagram.com/fenixbrokers' },
                    { platform: 'linkedin', url: 'https://linkedin.com/company/fenixbrokers' }
                ]
            },
        ],
    },
    {
        id: "welcome-email",
        name: "Email de Bienvenida",
        description: "Introducción cálida para nuevos socios mayoristas",
        thumbnail: "/templates/welcome.png",
        category: "welcome",
        blocks: [
            // Header
            { id: genId(), type: "logo", src: LOGO_URL, alt: "Fenix Brokers", textAlign: 'center', padding: 25, backgroundColor: BRAND.white },

            // Welcome Section
            {
                id: genId(), type: "section", backgroundColor: BRAND.white, padding: 25, children: [
                    { id: genId(), type: "heading", content: "Bienvenido a Fenix Brokers", level: 1, textAlign: 'center', textColor: BRAND.primary },
                    { id: genId(), type: "text", content: "Estamos encantados de tenerte como socio mayorista. Ahora tienes acceso a cosméticos y fragancias premium a los mejores precios mayoristas.", textAlign: 'center', textColor: BRAND.textMuted },
                    { id: genId(), type: "image", src: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600", alt: "Bienvenido", borderRadius: 8 },
                ]
            },

            // Getting Started Section
            {
                id: genId(), type: "section", backgroundColor: BRAND.lightBg, padding: 25, children: [
                    { id: genId(), type: "heading", content: "Cómo Empezar", level: 2, textColor: BRAND.primary },
                    { id: genId(), type: "text", content: "Así puedes aprovechar al máximo tu asociación:\n\n• Explora nuestro catálogo de más de 500 productos\n• Solicita cotizaciones para pedidos al por mayor\n• Obtén soporte dedicado de nuestro equipo", textColor: BRAND.text },
                    { id: genId(), type: "button", buttonText: "Ver Catálogo", buttonUrl: "https://fenixbrokers.com/catalog", buttonColor: BRAND.primary, buttonTextColor: BRAND.white, textAlign: 'center' },
                ]
            },

            // Support Section
            {
                id: genId(), type: "section", backgroundColor: BRAND.white, padding: 25, children: [
                    { id: genId(), type: "heading", content: "¿Necesitas Ayuda?", level: 2, textColor: BRAND.primary },
                    { id: genId(), type: "text", content: "Nuestro equipo está aquí para ti. Responde a este email o contáctanos para cualquier pregunta.", textColor: BRAND.textMuted },
                ]
            },

            // Footer
            {
                id: genId(), type: "footer", companyName: "Fenix Brokers", address: "35004 Las Palmas de GC, España", unsubscribeText: "Darse de baja", textAlign: 'center', textColor: BRAND.textMuted, backgroundColor: BRAND.lightBg, padding: 25,
                socialLinks: [
                    { platform: 'instagram', url: 'https://instagram.com/fenixbrokers' },
                    { platform: 'linkedin', url: 'https://linkedin.com/company/fenixbrokers' }
                ]
            },
        ],
    },
    {
        id: "blank",
        name: "Plantilla en Blanco",
        description: "Comienza desde cero con estructura mínima",
        thumbnail: "/templates/blank.png",
        category: "newsletter",
        blocks: [
            { id: genId(), type: "logo", src: LOGO_URL, alt: "Fenix Brokers", textAlign: 'center', padding: 25, backgroundColor: BRAND.white },

            // Main Content Section 
            {
                id: genId(), type: "section", backgroundColor: BRAND.white, padding: 30, children: [
                    { id: genId(), type: "heading", content: "Título de Tu Email", level: 1, textAlign: 'center', textColor: BRAND.text },
                    { id: genId(), type: "text", content: "Comienza a escribir tu contenido aquí. Arrastra más bloques desde la barra lateral para crear tu email.", textAlign: 'center', textColor: BRAND.textMuted },
                ]
            },

            // Footer
            {
                id: genId(), type: "footer", companyName: "Fenix Brokers", address: "35004 Las Palmas de GC, España", unsubscribeText: "Darse de baja", textAlign: 'center', textColor: BRAND.textMuted, backgroundColor: BRAND.lightBg, padding: 25,
                socialLinks: [
                    { platform: 'instagram', url: 'https://instagram.com/fenixbrokers' },
                    { platform: 'linkedin', url: 'https://linkedin.com/company/fenixbrokers' }
                ]
            },
        ],
    },
]

export function getPresetById(id: string): TemplatePreset | undefined {
    return templatePresets.find(p => p.id === id)
}

export function getPresetsByCategory(category: TemplatePreset["category"]): TemplatePreset[] {
    return templatePresets.filter(p => p.category === category)
}
