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
        return { data: null, error: "Failed to fetch templates" }
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
        return { data: null, error: "Template not found" }
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

        if (error) throw error

        revalidatePath("/admin/marketing")
        return { data: data as EmailTemplate, error: null }
    } catch (error) {
        console.error("Error creating template:", error)
        return { data: null, error: "Failed to create template" }
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
        return { data: null, error: "Failed to update template" }
    }
}

// Delete template
export async function deleteTemplate(id: string) {
    try {
        const { error } = await supabaseAdmin
            .from("email_templates")
            .delete()
            .eq("id", id)

        if (error) throw error

        revalidatePath("/admin/marketing")
        return { success: true, error: null }
    } catch (error) {
        console.error("Error deleting template:", error)
        return { success: false, error: "Failed to delete template" }
    }
}

// Generate Outlook-compatible HTML from content blocks
function generateHtmlFromBlocks(blocks: object[], templateName: string): string {
    const blockHtml = (blocks as Array<{ type: string; content?: string; src?: string; alt?: string; level?: number; buttonText?: string; buttonUrl?: string }>).map(block => {
        switch (block.type) {
            case "heading":
                const headingTag = block.level === 1 ? "h1" : block.level === 2 ? "h2" : "h3"
                const fontSize = block.level === 1 ? "28px" : block.level === 2 ? "24px" : "20px"
                return `
          <tr>
            <td style="padding: 20px 30px 10px 30px;">
              <${headingTag} style="margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: ${fontSize}; font-weight: 600; color: #1a1a1a; line-height: 1.3;">
                ${escapeHtml(block.content || "")}
              </${headingTag}>
            </td>
          </tr>`

            case "text":
                return `
          <tr>
            <td style="padding: 10px 30px;">
              <p style="margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 16px; color: #4a4a4a; line-height: 1.6;">
                ${escapeHtml(block.content || "")}
              </p>
            </td>
          </tr>`

            case "image":
                return `
          <tr>
            <td style="padding: 15px 30px;">
              <!--[if mso]>
              <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:540px;">
              <v:fill type="frame" src="${block.src || ""}" />
              </v:rect>
              <![endif]-->
              <!--[if !mso]><!-->
              <img src="${block.src || ""}" alt="${escapeHtml(block.alt || "")}" width="540" style="display: block; width: 100%; max-width: 540px; height: auto; border: 0; border-radius: 8px;" />
              <!--<![endif]-->
            </td>
          </tr>`

            case "button":
                return `
          <tr>
            <td style="padding: 20px 30px;" align="center">
              <!--[if mso]>
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${block.buttonUrl || "#"}" style="height:48px;v-text-anchor:middle;width:200px;" arcsize="10%" strokecolor="#ec4899" fillcolor="#ec4899">
                <w:anchorlock/>
                <center style="color:#ffffff;font-family:'Segoe UI',Tahoma,sans-serif;font-size:16px;font-weight:600;">${escapeHtml(block.buttonText || "Click Here")}</center>
              </v:roundrect>
              <![endif]-->
              <!--[if !mso]><!-->
              <a href="${block.buttonUrl || "#"}" target="_blank" style="display: inline-block; background-color: #ec4899; color: #ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 6px; mso-padding-alt: 0;">
                ${escapeHtml(block.buttonText || "Click Here")}
              </a>
              <!--<![endif]-->
            </td>
          </tr>`

            case "divider":
                return `
          <tr>
            <td style="padding: 20px 30px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                <tr>
                  <td style="border-top: 1px solid #e5e5e5;"></td>
                </tr>
              </table>
            </td>
          </tr>`

            case "spacer":
                return `
          <tr>
            <td style="height: 30px; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>`

            case "product":
                return `
          <tr>
            <td style="padding: 15px 30px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="background-color: #f9fafb; border-radius: 8px;">
                <tr>
                  <td width="120" style="padding: 15px;">
                    <img src="${block.src || "/placeholder.svg"}" alt="${escapeHtml(block.alt || "Product")}" width="100" style="display: block; border-radius: 6px;" />
                  </td>
                  <td style="padding: 15px;">
                    <p style="margin: 0 0 8px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 16px; font-weight: 600; color: #1a1a1a;">
                      ${escapeHtml(block.content || "")}
                    </p>
                    <a href="${block.buttonUrl || "#"}" style="font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 14px; color: #ec4899; text-decoration: none;">View Product →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`

            default:
                return ""
        }
    }).join("")

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
          
          <!-- Header with logo -->
          <tr>
            <td style="padding: 30px 30px 20px 30px; background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%);" align="center">
              <!--[if mso]>
              <table role="presentation" border="0" cellspacing="0" cellpadding="0">
              <tr>
              <td style="background-color: #ec4899; padding: 30px;">
              <![endif]-->
              <table border="0" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td align="center">
                    <span style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">✨ Fenix Brokers</span>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 8px;">
                    <span style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; color: rgba(255,255,255,0.9);">Premium Wholesale Cosmetics & Fragrances</span>
                  </td>
                </tr>
              </table>
              <!--[if mso]>
              </td>
              </tr>
              </table>
              <![endif]-->
            </td>
          </tr>
          
          <!-- Dynamic content blocks -->
          ${blockHtml}
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #1a1a1a;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                <tr>
                  <td align="center" style="padding-bottom: 15px;">
                    <span style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; color: #a3a3a3;">
                      © 2025 Fenix Brokers. All rights reserved.
                    </span>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 15px;">
                    <a href="{{unsubscribe_url}}" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 12px; color: #737373; text-decoration: underline;">Unsubscribe</a>
                    <span style="color: #404040;"> | </span>
                    <a href="https://fenixbrokers.com" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 12px; color: #737373; text-decoration: underline;">Visit Website</a>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <span style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 11px; color: #525252;">
                      You received this email because you subscribed to our newsletter.
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
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
