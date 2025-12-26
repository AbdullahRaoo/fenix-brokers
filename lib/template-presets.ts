// Pre-built email template presets

export interface TemplateBlock {
    id: string
    type: "heading" | "text" | "image" | "button" | "divider" | "spacer" | "product" | "columns"
    content?: string
    src?: string
    alt?: string
    level?: number
    buttonText?: string
    buttonUrl?: string
    columns?: TemplateBlock[][]
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

export const templatePresets: TemplatePreset[] = [
    {
        id: "product-announcement",
        name: "Product Announcement",
        description: "Showcase new products with hero image and featured items",
        thumbnail: "/templates/product-announcement.png",
        category: "promotional",
        blocks: [
            { id: genId(), type: "heading", content: "New Arrivals Are Here! ✨", level: 1 },
            { id: genId(), type: "text", content: "Discover our latest collection of premium cosmetics and fragrances, carefully curated for wholesale partners." },
            { id: genId(), type: "image", src: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600", alt: "New cosmetics collection" },
            { id: genId(), type: "spacer" },
            { id: genId(), type: "heading", content: "Featured Products", level: 2 },
            { id: genId(), type: "product", content: "Luxury Perfume Set", src: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=200", buttonUrl: "#" },
            { id: genId(), type: "product", content: "Premium Skincare Bundle", src: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200", buttonUrl: "#" },
            { id: genId(), type: "spacer" },
            { id: genId(), type: "button", buttonText: "View Full Catalog", buttonUrl: "https://fenixbrokers.com/catalog" },
            { id: genId(), type: "divider" },
            { id: genId(), type: "text", content: "Questions? Reply to this email or contact us at sales@fenixbrokers.com" },
        ],
    },
    {
        id: "monthly-newsletter",
        name: "Monthly Newsletter",
        description: "Regular updates with articles, tips, and product highlights",
        thumbnail: "/templates/newsletter.png",
        category: "newsletter",
        blocks: [
            { id: genId(), type: "heading", content: "Fenix Brokers Monthly", level: 1 },
            { id: genId(), type: "text", content: "Your monthly digest of beauty industry trends, new products, and exclusive deals for our wholesale partners." },
            { id: genId(), type: "divider" },
            { id: genId(), type: "heading", content: "📰 Industry News", level: 2 },
            { id: genId(), type: "text", content: "The beauty industry continues to see strong growth in clean beauty products. Our new organic skincare line is now available for pre-order." },
            { id: genId(), type: "button", buttonText: "Read More", buttonUrl: "#" },
            { id: genId(), type: "spacer" },
            { id: genId(), type: "heading", content: "🌟 Top Sellers This Month", level: 2 },
            { id: genId(), type: "product", content: "Rose Gold Palette", src: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=200", buttonUrl: "#" },
            { id: genId(), type: "product", content: "Vitamin C Serum", src: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200", buttonUrl: "#" },
            { id: genId(), type: "divider" },
            { id: genId(), type: "heading", content: "💡 Pro Tip", level: 2 },
            { id: genId(), type: "text", content: "Bundle complementary products to increase average order value. Our skincare sets have a 40% higher conversion rate than individual items." },
        ],
    },
    {
        id: "sale-event",
        name: "Sale Event",
        description: "Bold promotional email for sales and special offers",
        thumbnail: "/templates/sale.png",
        category: "promotional",
        blocks: [
            { id: genId(), type: "heading", content: "🔥 FLASH SALE", level: 1 },
            { id: genId(), type: "heading", content: "Up to 40% Off Wholesale Prices", level: 2 },
            { id: genId(), type: "text", content: "For 48 hours only, enjoy exclusive discounts on our best-selling cosmetics and fragrances. Stock up and maximize your margins!" },
            { id: genId(), type: "image", src: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600", alt: "Sale banner" },
            { id: genId(), type: "button", buttonText: "Shop the Sale →", buttonUrl: "https://fenixbrokers.com/sale" },
            { id: genId(), type: "spacer" },
            { id: genId(), type: "heading", content: "Best Deals", level: 2 },
            { id: genId(), type: "product", content: "Designer Fragrance Collection - 35% OFF", src: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=200", buttonUrl: "#" },
            { id: genId(), type: "product", content: "Makeup Essentials Kit - 40% OFF", src: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=200", buttonUrl: "#" },
            { id: genId(), type: "divider" },
            { id: genId(), type: "text", content: "⏰ Offer ends in 48 hours. Use code FLASH40 at checkout." },
        ],
    },
    {
        id: "welcome-email",
        name: "Welcome Email",
        description: "Warm introduction for new wholesale partners",
        thumbnail: "/templates/welcome.png",
        category: "welcome",
        blocks: [
            { id: genId(), type: "heading", content: "Welcome to Fenix Brokers! 🎉", level: 1 },
            { id: genId(), type: "text", content: "We're thrilled to have you as a wholesale partner. You now have access to premium cosmetics and fragrances at the best wholesale prices." },
            { id: genId(), type: "image", src: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600", alt: "Welcome" },
            { id: genId(), type: "spacer" },
            { id: genId(), type: "heading", content: "Getting Started", level: 2 },
            { id: genId(), type: "text", content: "Here's how to make the most of your partnership:" },
            { id: genId(), type: "text", content: "✅ Browse our catalog of 500+ products\n✅ Request quotes for bulk orders\n✅ Get dedicated support from our team" },
            { id: genId(), type: "button", buttonText: "Browse Catalog", buttonUrl: "https://fenixbrokers.com/catalog" },
            { id: genId(), type: "divider" },
            { id: genId(), type: "heading", content: "Need Help?", level: 2 },
            { id: genId(), type: "text", content: "Our team is here for you. Reply to this email or contact support@fenixbrokers.com for any questions." },
        ],
    },
    {
        id: "blank",
        name: "Blank Template",
        description: "Start from scratch with a clean canvas",
        thumbnail: "/templates/blank.png",
        category: "newsletter",
        blocks: [
            { id: genId(), type: "heading", content: "Your Newsletter Title", level: 1 },
            { id: genId(), type: "text", content: "Start writing your content here..." },
        ],
    },
]

export function getPresetById(id: string): TemplatePreset | undefined {
    return templatePresets.find(p => p.id === id)
}

export function getPresetsByCategory(category: TemplatePreset["category"]): TemplatePreset[] {
    return templatePresets.filter(p => p.category === category)
}
