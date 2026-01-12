import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Security headers to add to all responses
const securityHeaders = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-XSS-Protection': '1; mode=block',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

// Routes that require authentication
const protectedRoutes = ['/admin']

// Routes that should redirect to admin if already authenticated
const authRoutes = ['/login']

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Get session token from cookie
    const sessionToken = request.cookies.get('admin_session')?.value

    // Check if route requires protection
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    const isAuthRoute = authRoutes.some(route => pathname === route)

    // Create response with security headers
    const response = NextResponse.next()
    Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
    })

    // If accessing protected route without session cookie, redirect to login
    // Note: Full JWT validation happens in server actions via requireAuth()
    if (isProtectedRoute && !sessionToken) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
    }

    // If already has session cookie and trying to access login, redirect to admin
    if (isAuthRoute && sessionToken) {
        return NextResponse.redirect(new URL('/admin', request.url))
    }

    return response
}

export const config = {
    matcher: [
        // Match admin and login routes only
        '/admin/:path*',
        '/login',
    ],
}
