import { NextRequest, NextResponse } from 'next/server'

// Basic Auth for /admin routes
export function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl
	if (!pathname.startsWith('/admin')) return NextResponse.next()

	const user = process.env.ADMIN_USER || 'admin'
	const pass = process.env.ADMIN_PASS || 'admin'

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

export const config = { matcher: ['/admin/:path*'] }
