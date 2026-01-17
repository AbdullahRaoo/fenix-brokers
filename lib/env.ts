// Environment variable validation
// Call this in layout.tsx or middleware to ensure all required env vars are set

const requiredEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'RESEND_API_KEY',
    'NEXT_PUBLIC_BASE_URL',
    'ADMIN_EMAIL'
] as const

export function validateEnv() {
    if (typeof window !== 'undefined') {
        // Only validate on server
        return
    }

    const missing: string[] = []

    for (const varName of requiredEnvVars) {
        if (!process.env[varName]) {
            missing.push(varName)
        }
    }

    if (missing.length > 0) {
        throw new Error(
            `❌ Missing required environment variables:\n${missing.map(v => `  - ${v}`).join('\n')}\n\nPlease add them to your .env file.`
        )
    }

    console.log('✅ All required environment variables are set')
}
