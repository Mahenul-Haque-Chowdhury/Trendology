export type Product = {
  id: string
  name: string
  description: string
  price: number
  image: string
  images?: string[]
  category: string
  tags: string[]
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Minimal Chair',
    description: 'A clean, modern chair perfect for home or office.',
    price: 129.0,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1549187774-b4e9b0445b41?q=80&w=1200&auto=format&fit=crop'
    ],
    category: 'furniture',
    tags: ['chair', 'minimal', 'home'],
  },
  {
    id: '2',
    name: 'Wooden Desk',
    description: 'Sleek wooden desk with ample space for productivity.',
    price: 299.0,
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505692794403-34d4982f88aa?q=80&w=1200&auto=format&fit=crop'
    ],
    category: 'office',
    tags: ['desk', 'wood', 'workspace'],
  },
  {
    id: '3',
    name: 'Table Lamp',
    description: 'Soft warm lighting with adjustable head and dimmer.',
    price: 59.0,
    image: 'https://images.unsplash.com/photo-1493666438817-866a91353ca9?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1493666438817-866a91353ca9?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1473186505569-9c61870c11f9?q=80&w=1200&auto=format&fit=crop'
    ],
    category: 'lighting',
    tags: ['lamp', 'lighting', 'warm'],
  },
]
