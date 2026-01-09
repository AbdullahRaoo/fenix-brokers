"use server"

import { supabaseAdmin } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import type { EmailTemplate } from "@/types/database"

// Get all templates
export async function getEmailTemplates() {
  try {
    const { data, error } = await supabaseAdmin
      .from("email_templates")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error
    return { data: data as EmailTemplate[], error: null }
  } catch (error) {
    console.error("Error fetching templates:", error)
    return { data: null, error: "Error al obtener plantillas" }
  }
}

// Get single template
export async function getTemplateById(id: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("email_templates")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error
    return { data: data as EmailTemplate, error: null }
  } catch (error) {
    console.error("Error fetching template:", error)
    return { data: null, error: "Plantilla no encontrada" }
  }
}

// Create template
export async function createTemplate(input: {
  name: string
  subject: string
  content: object[]
  html_content?: string
}) {
  try {
    // Generate HTML from content blocks
    const htmlContent = generateHtmlFromBlocks(input.content, input.name)

    const { data, error } = await supabaseAdmin
      .from("email_templates")
      .insert({
        name: input.name,
        subject: input.subject,
        content: input.content,
        html_content: htmlContent,
      })
      .select()
      .single()

    if (error) {
      console.error("Supabase error creating template:", error)
      return { data: null, error: error.message || "Error al crear plantilla" }
    }

    revalidatePath("/admin/marketing")
    return { data: data as EmailTemplate, error: null }
  } catch (error) {
    console.error("Error creating template:", error)
    const errorMessage = error instanceof Error ? error.message : "Error al crear plantilla"
    return { data: null, error: errorMessage }
  }
}

// Update template
export async function updateTemplate(id: string, input: {
  name?: string
  subject?: string
  content?: object[]
}) {
  try {
    const updateData: Record<string, unknown> = {}

    if (input.name) updateData.name = input.name
    if (input.subject) updateData.subject = input.subject
    if (input.content) {
      updateData.content = input.content
      updateData.html_content = generateHtmlFromBlocks(input.content, input.name || "Newsletter")
    }
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabaseAdmin
      .from("email_templates")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    revalidatePath("/admin/marketing")
    return { data: data as EmailTemplate, error: null }
  } catch (error) {
    console.error("Error updating template:", error)
    return { data: null, error: "Error al actualizar plantilla" }
  }
}

// Delete template
export async function deleteTemplate(id: string) {
  try {
    // First, update any campaigns that reference this template to remove the reference
    const { error: updateError } = await supabaseAdmin
      .from("campaigns")
      .update({ template_id: null })
      .eq("template_id", id)

    if (updateError) {
      console.error("Error updating campaigns:", updateError)
      // Continue with delete attempt even if campaign update fails
    }

    // Now delete the template
    const { error } = await supabaseAdmin
      .from("email_templates")
      .delete()
      .eq("id", id)

    if (error) throw error

    revalidatePath("/admin/marketing")
    return { success: true, error: null }
  } catch (error) {
    console.error("Error deleting template:", error)
    return { success: false, error: "Error al eliminar plantilla. Puede estar referenciada por campañas." }
  }
}

// Generate preview HTML from blocks (for editor preview)
export async function generatePreviewHtml(blocks: object[], templateName: string = "Preview") {
  try {
    const html = generateHtmlFromBlocks(blocks, templateName)
    return { html, error: null }
  } catch (error) {
    console.error("Error generating preview:", error)
    return { html: null, error: "Error al generar vista previa" }
  }
}

// Extended block type for HTML generation
interface HtmlBlock {
  type: string
  content?: string
  src?: string
  alt?: string
  level?: number
  buttonText?: string
  buttonUrl?: string
  // Styling
  backgroundColor?: string
  textColor?: string
  textAlign?: 'left' | 'center' | 'right'
  fontWeight?: 'normal' | 'bold'
  fontSize?: number
  borderRadius?: number
  padding?: number
  paddingTop?: number
  paddingRight?: number
  paddingBottom?: number
  paddingLeft?: number
  buttonColor?: string
  buttonTextColor?: string
  borderColor?: string
  fontFamily?: string
  // Social
  socialLinks?: Array<{ platform: string; url: string }>
  // Footer
  companyName?: string
  address?: string
  unsubscribeText?: string
  // Section children
  children?: HtmlBlock[]
  // Columns block
  columns?: HtmlBlock[][]
}

// Social media icon colors
const SOCIAL_COLORS: Record<string, string> = {
  facebook: '#1877F2',
  instagram: '#E4405F',
  linkedin: '#0A66C2',
  twitter: '#1DA1F2',
  youtube: '#FF0000',
  tiktok: '#000000',
}

// Generate Outlook-compatible HTML from content blocks
function generateHtmlFromBlocks(blocks: object[], templateName: string): string {
  const blockHtml = (blocks as HtmlBlock[]).map(block => {
    // Get styling with defaults
    const bgColor = block.backgroundColor || ''
    const txtColor = block.textColor || '#1a1a1a'
    const txtAlign = block.textAlign || 'left'
    const fntWeight = block.fontWeight || 'normal'
    const fntSize = block.fontSize || 16
    const brdRadius = block.borderRadius || 0
    const pad = block.padding || 15
    const btnColor = block.buttonColor || '#00bed6'
    const btnTxtColor = block.buttonTextColor || '#ffffff'
    const brdColor = block.borderColor || '#e5e5e5'
    const fntFamily = block.fontFamily || 'Arial, sans-serif'

    switch (block.type) {
      case "logo":
        // Logo block with per-side padding
        const logoHeight = block.fontSize || 50
        const logoBorderRadius = block.borderRadius ?? 5
        const logoPadTop = block.paddingTop ?? 25
        const logoPadRight = block.paddingRight ?? 0
        const logoPadBottom = block.paddingBottom ?? 25
        const logoPadLeft = block.paddingLeft ?? 0
        return `
          <tr>
            <td style="padding: ${logoPadTop}px ${logoPadRight}px ${logoPadBottom}px ${logoPadLeft}px; background-color: ${bgColor || '#ffffff'};" align="${txtAlign}">
              <img src="${block.src || ''}" alt="${escapeHtml(block.alt || 'Logo')}" height="${logoHeight}" style="display: inline-block; height: ${logoHeight}px; width: auto; border: 0;${logoBorderRadius ? ` border-radius: ${logoBorderRadius}px;` : ''}" />
            </td>
          </tr>`

      case "heading":
        const headingTag = block.level === 1 ? "h1" : block.level === 2 ? "h2" : "h3"
        const headingSize = block.level === 1 ? 28 : block.level === 2 ? 24 : 20
        const finalSize = block.fontSize || headingSize
        return `
          <tr>
            <td style="padding: ${pad}px 30px;${bgColor ? ` background-color: ${bgColor};` : ''}">
              <${headingTag} style="margin: 0; font-family: ${fntFamily}; font-size: ${finalSize}px; font-weight: ${fntWeight === 'bold' ? '700' : '600'}; color: ${txtColor}; line-height: 1.3; text-align: ${txtAlign};">
                ${sanitizeHtml(block.content || "")}
              </${headingTag}>
            </td>
          </tr>`

      case "text":
        const bgStyle = bgColor ? `background-color: ${bgColor}; padding: ${pad}px; border-radius: ${brdRadius}px;` : ''
        return `
          <tr>
            <td style="padding: ${pad}px 30px;">
              <div style="${bgStyle}">
                <div style="margin: 0; font-family: ${fntFamily}; font-size: ${fntSize}px; color: ${txtColor}; line-height: 1.6; text-align: ${txtAlign}; font-weight: ${fntWeight === 'bold' ? '600' : '400'};">
                  ${sanitizeHtml(block.content || "")}
                </div>
              </div>
            </td>
          </tr>`

      case "image":
        const imgWidth = block.fontSize || 100 // Using fontSize for width percentage
        const imgMaxWidth = Math.round(540 * (imgWidth / 100))
        return `
          <tr>
            <td style="padding: ${pad}px 30px;" align="${txtAlign}">
              <!--[if mso]>
              <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:${imgMaxWidth}px;">
              <v:fill type="frame" src="${block.src || ""}" />
              </v:rect>
              <![endif]-->
              <!--[if !mso]><!-->
              <img src="${block.src || ""}" alt="${escapeHtml(block.alt || "")}" width="${imgMaxWidth}" style="display: block; width: ${imgWidth}%; max-width: ${imgMaxWidth}px; height: auto; border: 0;${brdRadius ? ` border-radius: ${brdRadius}px;` : ''}" />
              <!--<![endif]-->
            </td>
          </tr>`

      case "button":
        return `
          <tr>
            <td style="padding: ${pad}px 30px;" align="${txtAlign}">
              <!--[if mso]>
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${block.buttonUrl || "#"}" style="height:48px;v-text-anchor:middle;width:200px;" arcsize="10%" strokecolor="${btnColor}" fillcolor="${btnColor}">
                <w:anchorlock/>
                <center style="color:${btnTxtColor};font-family:'Segoe UI',Tahoma,sans-serif;font-size:16px;font-weight:600;">${escapeHtml(block.buttonText || "Click Here")}</center>
              </v:roundrect>
              <![endif]-->
              <!--[if !mso]><!-->
              <a href="${block.buttonUrl || "#"}" target="_blank" style="display: inline-block; background-color: ${btnColor}; color: ${btnTxtColor}; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 6px; mso-padding-alt: 0;">
                ${escapeHtml(block.buttonText || "Click Here")}
              </a>
              <!--<![endif]-->
            </td>
          </tr>`

      case "divider":
        return `
          <tr>
            <td style="padding: ${pad}px 30px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                <tr>
                  <td style="border-top: 2px solid ${brdColor};"></td>
                </tr>
              </table>
            </td>
          </tr>`

      case "spacer":
        const spacerHeight = block.padding || 30
        return `
          <tr>
            <td style="height: ${spacerHeight}px; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>`

      case "section":
        // Section block - a container with background color and padding for grouping content
        const sectionBg = block.backgroundColor || ''
        const sectionPad = block.padding || 20
        return `
          <tr>
            <td style="${sectionBg ? `background-color: ${sectionBg};` : ''} padding: ${sectionPad}px 30px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                ${block.children ? (block.children as HtmlBlock[]).map(child => {
          // Recursively generate HTML for child blocks with full styling support
          const childColor = child.textColor || '#1a1a1a'
          const childAlign = child.textAlign || 'left'
          const childFont = child.fontFamily || 'Arial, sans-serif'

          switch (child.type) {
            case 'heading':
              const hLevel = child.level || 2
              const hSize = hLevel === 1 ? 24 : hLevel === 3 ? 16 : 20
              return `<tr><td style="padding: 8px 0; text-align: ${childAlign};"><h${hLevel} style="margin: 0; font-family: ${childFont}; font-size: ${hSize}px; color: ${childColor}; font-weight: 600;">${sanitizeHtml(child.content || '')}</h${hLevel}></td></tr>`
            case 'text':
              return `<tr><td style="padding: 8px 0; text-align: ${childAlign};"><div style="margin: 0; font-family: ${childFont}; font-size: 15px; color: ${childColor}; line-height: 1.5;">${sanitizeHtml(child.content || '')}</div></td></tr>`
            case 'image':
              if (!child.src) return ''
              const imgW = child.fontSize || 100
              const imgR = child.borderRadius || 0
              return `<tr><td style="padding: 8px 0; text-align: ${childAlign};"><img src="${child.src}" alt="${escapeHtml(child.alt || '')}" style="display: inline-block; width: ${imgW}%; max-width: 100%; border-radius: ${imgR}px;" /></td></tr>`
            case 'button':
              const btnC = child.buttonColor || '#00bed6'
              const btnT = child.buttonTextColor || '#ffffff'
              return `<tr><td style="padding: 8px 0; text-align: ${childAlign};"><a href="${child.buttonUrl || '#'}" style="display: inline-block; background-color: ${btnC}; color: ${btnT}; font-family: ${childFont}; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 6px;">${escapeHtml(child.buttonText || 'Button')}</a></td></tr>`
            default:
              return ''
          }
        }).join('') : ''}
              </table>
            </td>
          </tr>`

      case "columns":
        // Multi-column layout using nested tables for email compatibility
        const colCount = block.columns?.length || 2
        const colWidth = Math.floor(100 / colCount)
        const colBg = block.backgroundColor || '#ffffff'
        const colPad = block.padding || 15

        // Generate content for each column
        const generateColumnContent = (colBlocks: HtmlBlock[]) => {
          return colBlocks.map(item => {
            const itemColor = item.textColor || '#1a1a1a'
            const itemAlign = item.textAlign || 'left'
            const itemFont = item.fontFamily || 'Arial, sans-serif'

            switch (item.type) {
              case 'heading':
                const hLevel = item.level || 2
                const hSize = hLevel === 1 ? 20 : hLevel === 3 ? 14 : 16
                return `<div style="margin: 0 0 10px 0; text-align: ${itemAlign};"><h${hLevel} style="margin: 0; font-family: ${itemFont}; font-size: ${hSize}px; font-weight: 600; color: ${itemColor};">${sanitizeHtml(item.content || '')}</h${hLevel}></div>`
              case 'text':
                return `<div style="margin: 0 0 10px 0; font-family: ${itemFont}; font-size: 14px; color: ${itemColor}; line-height: 1.5; text-align: ${itemAlign};">${sanitizeHtml(item.content || '')}</div>`
              case 'image':
                if (!item.src) return ''
                const imgWidth = item.fontSize || 100
                return `<div style="margin-bottom: 10px; text-align: ${itemAlign};"><img src="${item.src}" alt="${escapeHtml(item.alt || '')}" style="display: inline-block; width: ${imgWidth}%; max-width: 100%; border-radius: ${item.borderRadius || 0}px;" /></div>`
              case 'button':
                const btnBg = item.buttonColor || '#00bed6'
                const btnTxt = item.buttonTextColor || '#ffffff'
                return `<div style="margin-bottom: 10px; text-align: ${itemAlign};"><a href="${item.buttonUrl || '#'}" style="display: inline-block; background-color: ${btnBg}; color: ${btnTxt}; font-family: ${itemFont}; font-size: 14px; font-weight: 600; text-decoration: none; padding: 10px 20px; border-radius: 4px;">${escapeHtml(item.buttonText || 'Button')}</a></div>`
              default:
                return ''
            }
          }).join('')
        }

        const columnsHtml = (block.columns || [[], []]).map((col, idx) => `
          <td width="${colWidth}%" style="vertical-align: top; padding: ${colPad}px;">
            ${generateColumnContent(col as HtmlBlock[])}
          </td>
        `).join('')

        return `
          <tr>
            <td style="padding: ${colPad}px 30px; background-color: ${colBg};">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                <tr>
                  ${columnsHtml}
                </tr>
              </table>
            </td>
          </tr>`

      case "product":
        return `
          <tr>
            <td style="padding: ${pad}px 30px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="background-color: #f9fafb; border-radius: 8px;">
                <tr>
                  <td width="120" style="padding: 15px;">
                    <img src="${block.src || "/placeholder.svg"}" alt="${escapeHtml(block.alt || "Product")}" width="100" style="display: block; border-radius: 6px;" />
                  </td>
                  <td style="padding: 15px;">
                    <p style="margin: 0 0 8px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 16px; font-weight: 600; color: #1a1a1a;">
                      ${escapeHtml(block.content || "")}
                    </p>
                    <a href="${block.buttonUrl || "#"}" style="font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 14px; color: ${btnColor}; text-decoration: none;">View Product →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`

      case "social":
        if (!block.socialLinks || block.socialLinks.length === 0) return ''
        const socialHtml = block.socialLinks.map(link => {
          const color = SOCIAL_COLORS[link.platform] || '#333333'
          // Use hosted icons that work in all email clients
          const iconUrl = getSocialIconUrl(link.platform)
          return `<a href="${link.url}" target="_blank" style="display: inline-block; margin: 0 6px; text-decoration: none;">
            <table cellpadding="0" cellspacing="0" border="0" role="presentation">
              <tr>
                <td style="background-color: ${color}; border-radius: 50%; width: 36px; height: 36px; text-align: center; vertical-align: middle;">
                  <img src="${iconUrl}" alt="${link.platform}" width="18" height="18" style="display: block; margin: 0 auto; border: 0;" />
                </td>
              </tr>
            </table>
          </a>`
        }).join('')
        return `
          <tr>
            <td style="padding: ${pad}px 30px;" align="${txtAlign}">
              <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="display: inline-block;">
                <tr>
                  <td>${socialHtml}</td>
                </tr>
              </table>
            </td>
          </tr>`

      case "footer":
        // Social icons in footer
        let footerSocialHtml = ''
        if (block.socialLinks && block.socialLinks.length > 0) {
          const socialIconsHtml = block.socialLinks.map(link => {
            const color = SOCIAL_COLORS[link.platform] || '#333333'
            const iconUrl = getSocialIconUrl(link.platform)
            return `<a href="${link.url}" target="_blank" style="display: inline-block; margin: 0 6px; text-decoration: none;">
              <table cellpadding="0" cellspacing="0" border="0" role="presentation">
                <tr>
                  <td style="background-color: ${color}; border-radius: 50%; width: 32px; height: 32px; text-align: center; vertical-align: middle;">
                    <img src="${iconUrl}" alt="${link.platform}" width="16" height="16" style="display: block; margin: 0 auto; border: 0;" />
                  </td>
                </tr>
              </table>
            </a>`
          }).join('')
          footerSocialHtml = `
            <tr>
              <td align="${txtAlign}" style="padding-bottom: 15px;">
                <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="display: inline-block;">
                  <tr>
                    <td>${socialIconsHtml}</td>
                  </tr>
                </table>
              </td>
            </tr>`
        }
        const currentYear = new Date().getFullYear()
        return `
          <tr>
            <td style="padding: 25px 30px; background-color: ${bgColor || '#f8fafc'};">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                ${footerSocialHtml}
                <tr>
                  <td align="${txtAlign}" style="padding-bottom: 10px;">
                    <span style="font-family: ${fntFamily}; font-size: 14px; color: ${txtColor}; font-weight: 600;">
                      © ${currentYear} ${escapeHtml(block.companyName || 'Fenix Brokers')}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td align="${txtAlign}" style="padding-bottom: 10px;">
                    <span style="font-family: ${fntFamily}; font-size: 12px; color: ${txtColor};">
                      ${escapeHtml(block.address || '')}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td align="${txtAlign}">
                    <a href="{{unsubscribe_url}}" style="font-family: ${fntFamily}; font-size: 12px; color: ${txtColor}; text-decoration: underline;">
                      ${escapeHtml(block.unsubscribeText || 'Unsubscribe')}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`

      default:
        return ""
    }
  }).join("")

  // Helper for social icon URLs - using Wikimedia Commons for reliability
  function getSocialIconUrl(platform: string): string {
    // Wikimedia Commons SVG icons (reliable, public domain)
    const icons: Record<string, string> = {
      facebook: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Facebook_icon_2013.svg',
      instagram: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg',
      linkedin: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png',
      twitter: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg',
      youtube: 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg',
      tiktok: 'https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg',
    }
    return icons[platform] || 'https://upload.wikimedia.org/wikipedia/commons/6/6a/External_link_font_awesome.svg'
  }

  // Full Outlook-compatible HTML email template
  return `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>${escapeHtml(templateName)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <style>
    table {border-collapse: collapse;}
    .spacer {mso-line-height-rule: exactly;}
  </style>
  <![endif]-->
  <style type="text/css">
    /* Reset styles */
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
    }
    table {
      border-collapse: collapse !important;
    }
    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }
    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .email-bg { background-color: #1a1a1a !important; }
      .email-content { background-color: #262626 !important; }
      .text-dark { color: #f5f5f5 !important; }
      .text-muted { color: #a3a3a3 !important; }
    }
    /* Mobile responsive */
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        max-width: 100% !important;
      }
      .mobile-padding {
        padding-left: 20px !important;
        padding-right: 20px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5;" class="email-bg">
  <!-- Preview text (hidden) -->
  <div style="display: none; font-size: 1px; color: #f5f5f5; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${escapeHtml(templateName)} - Fenix Brokers Newsletter
  </div>
  
  <!-- Email wrapper table -->
  <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="background-color: #f5f5f5;" class="email-bg">
    <tr>
      <td align="center" style="padding: 40px 10px;">
        <!--[if mso]>
        <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="600" align="center">
        <tr>
        <td>
        <![endif]-->
        
        <!-- Email content container -->
        <table border="0" cellpadding="0" cellspacing="0" width="600" class="email-container" role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);" class="email-content">
          
          <!-- Dynamic content blocks -->
          ${blockHtml}
          
        </table>
        <!--[if mso]>
        </td>
        </tr>
        </table>
        <![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`
}

// Helper to escape HTML
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, m => map[m])
}

// Helper to sanitize HTML content - allows safe formatting tags while removing dangerous scripts
function sanitizeHtml(html: string): string {
  if (!html) return ''

  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

  // Remove event handlers (onclick, onload, onerror, etc.)
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '')
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*[^\s>]*/gi, '')

  // Remove javascript: URLs
  sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"')

  // Remove style expressions (for IE)
  sanitized = sanitized.replace(/expression\s*\([^)]*\)/gi, '')

  // Allow safe tags: formatting, lists, alignment divs, etc.
  // The content from rich text editor includes: strong, em, u, span (with style), div (with style), ul, ol, li, br, font

  return sanitized
}
