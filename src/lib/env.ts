// Central place to read environment variables with optional validation.
// Avoids scattering process.env lookups throughout the codebase.

export const Env = {
	SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
	SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
}

export function hasSupabaseCreds() {
	return Boolean(Env.SUPABASE_URL && Env.SUPABASE_ANON_KEY)
}

export function requireEnv(name: keyof typeof Env) {
	const v = Env[name]
	if (!v) throw new Error(`Missing required env var: ${name}`)
	return v
}

// In development, surface a warning (not a crash) if Supabase isn't configured.
if (process.env.NODE_ENV !== 'production') {
	if (!hasSupabaseCreds()) {
		// eslint-disable-next-line no-console
		console.warn('[env] Supabase credentials not found; app will use local fallback product storage.')
	}
}
