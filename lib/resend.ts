import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({
    to,
    subject,
    html,
    from = 'ProSupply <onboarding@resend.dev>',
}: {
    to: string | string[]
    subject: string
    html: string
    from?: string
}) {
    try {
        const { data, error } = await resend.emails.send({
            from,
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
        })

        if (error) {
            console.error('Resend error:', error)
            return { success: false, error }
        }

        return { success: true, data }
    } catch (error) {
        console.error('Email send error:', error)
        return { success: false, error }
    }
}

export { resend }
