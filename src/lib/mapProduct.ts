import type { Product } from './products'

// Normalize a raw DB row (inventory/products table) into the Product shape used by the UI
export function mapProduct(row: any): Product {
	return {
		id: String(row.id),
		name: row.name || 'Untitled',
		description: row.description ?? '',
		price: Number(row.price ?? 0),
		image: row.image || '/brand-icon.png',
		images: Array.isArray(row.images) ? row.images : [],
		category: row.category || 'misc',
		tags: Array.isArray(row.tags) ? row.tags : [],
		created_at: row.created_at || new Date().toISOString(),
		active: typeof row.active === 'boolean' ? row.active : true,
	}
}

// Note: We intentionally do NOT filter out inactive products globally so they can
// still appear in listings (with an "Out of Stock" state handled at card level).
