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

// Logo URL
const LOGO_URL = '/logos/PNG/logo-fenix-brokers-1.png'

export const templatePresets: TemplatePreset[] = [
    {
        id: "product-announcement",
        name: "Product Announcement",
        description: "Clean product showcase with hero image",
        thumbnail: "/templates/product-announcement.png",
        category: "promotional",
        blocks: [
            // Header with logo
            { id: genId(), type: "logo", src: LOGO_URL, alt: "Fenix Brokers", textAlign: 'center', padding: 25, backgroundColor: BRAND.white },

            // Hero Section
            {
                id: genId(), type: "section", backgroundColor: BRAND.white, padding: 25, children: [
                    { id: genId(), type: "heading", content: "New Arrivals Are Here", level: 1, textAlign: 'center', textColor: BRAND.text },
                    { id: genId(), type: "text", content: "Discover our latest collection of premium cosmetics and fragrances, carefully curated for wholesale partners.", textAlign: 'center', textColor: BRAND.textMuted },
                    { id: genId(), type: "image", src: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600", alt: "New cosmetics collection", borderRadius: 8 },
                    { id: genId(), type: "button", buttonText: "Browse Collection", buttonUrl: "https://fenixbrokers.com/catalog", buttonColor: BRAND.primary, buttonTextColor: BRAND.white, textAlign: 'center' },
                ]
            },

            // Featured Products Section
            {
                id: genId(), type: "section", backgroundColor: BRAND.lightBg, padding: 25, children: [
                    { id: genId(), type: "heading", content: "Featured Products", level: 2, textAlign: 'center', textColor: BRAND.primary },
                ]
            },

            // Products columns
            {
                id: genId(), type: "columns", backgroundColor: BRAND.lightBg, columns: [
                    [
                        { id: genId(), type: "image", src: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=200", alt: "Luxury Perfume Set", borderRadius: 8 },
                        { id: genId(), type: "heading", content: "Luxury Perfume Set", level: 3, textAlign: 'center', textColor: BRAND.text },
                        { id: genId(), type: "button", buttonText: "View Details", buttonUrl: "#", buttonColor: BRAND.primary, buttonTextColor: BRAND.white, textAlign: 'center' },
                    ],
                    [
                        { id: genId(), type: "image", src: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200", alt: "Premium Skincare Bundle", borderRadius: 8 },
                        { id: genId(), type: "heading", content: "Premium Skincare Bundle", level: 3, textAlign: 'center', textColor: BRAND.text },
                        { id: genId(), type: "button", buttonText: "View Details", buttonUrl: "#", buttonColor: BRAND.primary, buttonTextColor: BRAND.white, textAlign: 'center' },
                    ],
                ]
            },

            // Footer
            {
                id: genId(), type: "footer", companyName: "Fenix Brokers", address: "35004 Las Palmas de GC, Spain", unsubscribeText: "Unsubscribe from this list", textAlign: 'center', textColor: BRAND.textMuted, backgroundColor: BRAND.lightBg, padding: 25,
                socialLinks: [
                    { platform: 'instagram', url: 'https://instagram.com/fenixbrokers' },
                    { platform: 'linkedin', url: 'https://linkedin.com/company/fenixbrokers' }
                ]
            },
        ],
    },
    {
        id: "monthly-newsletter",
        name: "Monthly Newsletter",
        description: "Regular updates with news and product highlights",
        thumbnail: "/templates/newsletter.png",
        category: "newsletter",
        blocks: [
            // Header
            { id: genId(), type: "logo", src: LOGO_URL, alt: "Fenix Brokers", textAlign: 'center', padding: 25, backgroundColor: BRAND.white },

            // Intro Section
            {
                id: genId(), type: "section", backgroundColor: BRAND.white, padding: 25, children: [
                    { id: genId(), type: "heading", content: "Monthly Newsletter", level: 1, textAlign: 'center', textColor: BRAND.text },
                    { id: genId(), type: "text", content: "Your monthly digest of beauty industry trends, new products, and exclusive deals.", textAlign: 'center', textColor: BRAND.textMuted },
                ]
            },

            // News Section
            {
                id: genId(), type: "section", backgroundColor: BRAND.lightBg, padding: 25, children: [
                    { id: genId(), type: "heading", content: "Industry News", level: 2, textColor: BRAND.primary },
                    { id: genId(), type: "text", content: "The beauty industry continues to see strong growth in clean beauty products. Our new organic skincare line is now available for pre-order with special wholesale pricing.", textColor: BRAND.text },
                    { id: genId(), type: "button", buttonText: "Read More", buttonUrl: "#", buttonColor: BRAND.primary, buttonTextColor: BRAND.white },
                ]
            },

            // Top Sellers Section
            {
                id: genId(), type: "section", backgroundColor: BRAND.white, padding: 25, children: [
                    { id: genId(), type: "heading", content: "Top Sellers This Month", level: 2, textAlign: 'center', textColor: BRAND.primary },
                ]
            },

            // Products columns
            {
                id: genId(), type: "columns", backgroundColor: BRAND.white, columns: [
                    [
                        { id: genId(), type: "image", src: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=200", alt: "Rose Gold Palette", borderRadius: 8 },
                        { id: genId(), type: "heading", content: "Rose Gold Palette", level: 3, textAlign: 'center', textColor: BRAND.text },
                    ],
                    [
                        { id: genId(), type: "image", src: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200", alt: "Vitamin C Serum", borderRadius: 8 },
                        { id: genId(), type: "heading", content: "Vitamin C Serum", level: 3, textAlign: 'center', textColor: BRAND.text },
                    ],
                ]
            },

            // Pro Tip Section
            {
                id: genId(), type: "section", backgroundColor: BRAND.lightBg, padding: 25, children: [
                    { id: genId(), type: "heading", content: "Pro Tip", level: 2, textColor: BRAND.primary },
                    { id: genId(), type: "text", content: "Bundle complementary products to increase average order value. Our skincare sets have a 40% higher conversion rate than individual items.", textColor: BRAND.text },
                ]
            },

            // Footer
            {
                id: genId(), type: "footer", companyName: "Fenix Brokers", address: "35004 Las Palmas de GC, Spain", unsubscribeText: "Unsubscribe", textAlign: 'center', textColor: BRAND.textMuted, backgroundColor: BRAND.lightBg, padding: 25,
                socialLinks: [
                    { platform: 'instagram', url: 'https://instagram.com/fenixbrokers' },
                    { platform: 'linkedin', url: 'https://linkedin.com/company/fenixbrokers' }
                ]
            },
        ],
    },
    {
        id: "sale-event",
        name: "Sale Event",
        description: "Bold promotional email for sales and discounts",
        thumbnail: "/templates/sale.png",
        category: "promotional",
        blocks: [
            // Header
            { id: genId(), type: "logo", src: LOGO_URL, alt: "Fenix Brokers", textAlign: 'center', padding: 25, backgroundColor: BRAND.white },

            // Sale Banner Section
            {
                id: genId(), type: "section", backgroundColor: BRAND.primary, padding: 30, children: [
                    { id: genId(), type: "heading", content: "FLASH SALE", level: 1, textAlign: 'center', textColor: BRAND.white, fontWeight: 'bold' },
                    { id: genId(), type: "heading", content: "Up to 40% Off Wholesale Prices", level: 2, textAlign: 'center', textColor: BRAND.white },
                ]
            },

            // Content Section
            {
                id: genId(), type: "section", backgroundColor: BRAND.white, padding: 25, children: [
                    { id: genId(), type: "text", content: "For 48 hours only, enjoy exclusive discounts on our best-selling cosmetics and fragrances. Stock up and maximize your margins!", textAlign: 'center', textColor: BRAND.textMuted },
                    { id: genId(), type: "image", src: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600", alt: "Sale", borderRadius: 8 },
                    { id: genId(), type: "button", buttonText: "Shop the Sale", buttonUrl: "https://fenixbrokers.com/sale", buttonColor: BRAND.primary, buttonTextColor: BRAND.white, textAlign: 'center' },
                ]
            },

            // Best Deals Section
            {
                id: genId(), type: "section", backgroundColor: BRAND.lightBg, padding: 25, children: [
                    { id: genId(), type: "heading", content: "Best Deals", level: 2, textColor: BRAND.primary, textAlign: 'center' },
                ]
            },

            // Deals columns
            {
                id: genId(), type: "columns", backgroundColor: BRAND.lightBg, columns: [
                    [
                        { id: genId(), type: "image", src: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=200", alt: "Designer Fragrance", borderRadius: 8 },
                        { id: genId(), type: "heading", content: "Designer Fragrance - 35% OFF", level: 3, textAlign: 'center', textColor: BRAND.text },
                    ],
                    [
                        { id: genId(), type: "image", src: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=200", alt: "Makeup Kit", borderRadius: 8 },
                        { id: genId(), type: "heading", content: "Makeup Kit - 40% OFF", level: 3, textAlign: 'center', textColor: BRAND.text },
                    ],
                ]
            },

            // Urgency Section
            {
                id: genId(), type: "section", backgroundColor: BRAND.white, padding: 20, children: [
                    { id: genId(), type: "text", content: "Offer ends in 48 hours. Use code FLASH40 at checkout.", textAlign: 'center', fontWeight: 'bold', textColor: BRAND.primary },
                ]
            },

            // Footer
            {
                id: genId(), type: "footer", companyName: "Fenix Brokers", address: "35004 Las Palmas de GC, Spain", unsubscribeText: "Unsubscribe", textAlign: 'center', textColor: BRAND.textMuted, backgroundColor: BRAND.lightBg, padding: 25,
                socialLinks: [
                    { platform: 'instagram', url: 'https://instagram.com/fenixbrokers' },
                    { platform: 'linkedin', url: 'https://linkedin.com/company/fenixbrokers' }
                ]
            },
        ],
    },
    {
        id: "welcome-email",
        name: "Welcome Email",
        description: "Warm introduction for new wholesale partners",
        thumbnail: "/templates/welcome.png",
        category: "welcome",
        blocks: [
            // Header
            { id: genId(), type: "logo", src: LOGO_URL, alt: "Fenix Brokers", textAlign: 'center', padding: 25, backgroundColor: BRAND.white },

            // Welcome Section
            {
                id: genId(), type: "section", backgroundColor: BRAND.white, padding: 25, children: [
                    { id: genId(), type: "heading", content: "Welcome to Fenix Brokers", level: 1, textAlign: 'center', textColor: BRAND.primary },
                    { id: genId(), type: "text", content: "We're thrilled to have you as a wholesale partner. You now have access to premium cosmetics and fragrances at the best wholesale prices.", textAlign: 'center', textColor: BRAND.textMuted },
                    { id: genId(), type: "image", src: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600", alt: "Welcome", borderRadius: 8 },
                ]
            },

            // Getting Started Section
            {
                id: genId(), type: "section", backgroundColor: BRAND.lightBg, padding: 25, children: [
                    { id: genId(), type: "heading", content: "Getting Started", level: 2, textColor: BRAND.primary },
                    { id: genId(), type: "text", content: "Here's how to make the most of your partnership:\n\n• Browse our catalog of 500+ products\n• Request quotes for bulk orders\n• Get dedicated support from our team", textColor: BRAND.text },
                    { id: genId(), type: "button", buttonText: "Browse Catalog", buttonUrl: "https://fenixbrokers.com/catalog", buttonColor: BRAND.primary, buttonTextColor: BRAND.white, textAlign: 'center' },
                ]
            },

            // Support Section
            {
                id: genId(), type: "section", backgroundColor: BRAND.white, padding: 25, children: [
                    { id: genId(), type: "heading", content: "Need Help?", level: 2, textColor: BRAND.primary },
                    { id: genId(), type: "text", content: "Our team is here for you. Reply to this email or contact us for any questions.", textColor: BRAND.textMuted },
                ]
            },

            // Footer
            {
                id: genId(), type: "footer", companyName: "Fenix Brokers", address: "35004 Las Palmas de GC, Spain", unsubscribeText: "Unsubscribe", textAlign: 'center', textColor: BRAND.textMuted, backgroundColor: BRAND.lightBg, padding: 25,
                socialLinks: [
                    { platform: 'instagram', url: 'https://instagram.com/fenixbrokers' },
                    { platform: 'linkedin', url: 'https://linkedin.com/company/fenixbrokers' }
                ]
            },
        ],
    },
    {
        id: "blank",
        name: "Blank Template",
        description: "Start from scratch with minimal structure",
        thumbnail: "/templates/blank.png",
        category: "newsletter",
        blocks: [
            { id: genId(), type: "logo", src: LOGO_URL, alt: "Fenix Brokers", textAlign: 'center', padding: 25, backgroundColor: BRAND.white },

            // Main Content Section 
            {
                id: genId(), type: "section", backgroundColor: BRAND.white, padding: 30, children: [
                    { id: genId(), type: "heading", content: "Your Email Title", level: 1, textAlign: 'center', textColor: BRAND.text },
                    { id: genId(), type: "text", content: "Start writing your content here. Drag more blocks from the sidebar to build your email.", textAlign: 'center', textColor: BRAND.textMuted },
                ]
            },

            // Footer
            {
                id: genId(), type: "footer", companyName: "Fenix Brokers", address: "35004 Las Palmas de GC, Spain", unsubscribeText: "Unsubscribe", textAlign: 'center', textColor: BRAND.textMuted, backgroundColor: BRAND.lightBg, padding: 25,
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
