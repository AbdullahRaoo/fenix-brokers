import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Default from email - in production, use your verified domain
// For testing, Resend allows sending from onboarding@resend.dev
const DEFAULT_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Fenix Brokers <onboarding@resend.dev>'

export async function sendEmail({
    to,
    subject,
    html,
    from = DEFAULT_FROM_EMAIL,
}: {
    to: string | string[]
    subject: string
    html: string
    from?: string
}) {
    // Check if API key is configured
    if (!process.env.RESEND_API_KEY) {
        console.error('RESEND_API_KEY is not configured')
        return { success: false, error: 'Email service not configured. Please add RESEND_API_KEY to your environment.' }
    }

    try {
        const { data, error } = await resend.emails.send({
            from,
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
        })

        if (error) {
            console.error('Resend error:', error)
            return { success: false, error: error.message || 'Failed to send email' }
        }

        return { success: true, data }
    } catch (error) {
        console.error('Email send error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to send email'
        return { success: false, error: errorMessage }
    }
}

export { resend }

