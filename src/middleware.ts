import { NextRequest, NextResponse } from 'next/server'

// Basic Auth for /admin routes (and /api/admin)
export function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl
	if (!pathname.startsWith('/admin')) return NextResponse.next()

	// Allow Supabase-auth mode (role-based) to bypass Basic Auth.
	// Note: Middleware runs at the Edge; prefer NEXT_PUBLIC_ env as a build-time constant fallback.
	const mode = (process.env.ADMIN_AUTH_MODE || process.env.NEXT_PUBLIC_ADMIN_AUTH_MODE || '').toLowerCase()
	if (mode === 'supabase') {
		return NextResponse.next()
	}

	// Use server env vars; set in Vercel Project Settings → Environment Variables
	const user = process.env.ADMIN_USER || process.env.NEXT_PUBLIC_ADMIN_USER || 'admin'
	const pass = process.env.ADMIN_PASS || process.env.NEXT_PUBLIC_ADMIN_PASS || 'admin'

	const authHeader = req.headers.get('authorization') || ''
	if (!authHeader.startsWith('Basic ')) {
		return new NextResponse('Unauthorized', {
			status: 401,
			headers: { 'WWW-Authenticate': 'Basic realm="Admin"' },
		})
	}
	const base64 = authHeader.slice(6)
	let decoded = ''
	try { decoded = Buffer.from(base64, 'base64').toString('utf8') } catch {}
	const [u, p] = decoded.split(':')
	if (u !== user || p !== pass) {
		return new NextResponse('Unauthorized', {
			status: 401,
			headers: { 'WWW-Authenticate': 'Basic realm="Admin"' },
		})
	}

	return NextResponse.next()
}

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] }
