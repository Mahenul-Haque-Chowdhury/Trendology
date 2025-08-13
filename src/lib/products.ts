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
  {
    id: '4',
    name: 'Ceramic Vase',
    description: 'Handmade ceramic vase for fresh or dried flowers.',
    price: 39.0,
    image: 'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1523419409543-56528f3f2313?q=80&w=1200&auto=format&fit=crop'
    ],
    category: 'decor',
    tags: ['decor', 'vase', 'handmade'],
  },
  {
    id: '5',
    name: 'Cozy Throw Blanket',
    description: 'Ultra-soft throw blanket for your sofa or bed.',
    price: 49.0,
    image: 'https://images.unsplash.com/photo-1543946602-08b3f2f9b5b5?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1543946602-08b3f2f9b5b5?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200&auto=format&fit=crop'
    ],
    category: 'home',
    tags: ['blanket', 'cozy', 'home'],
  },
  {
    id: '6',
    name: 'Wireless Headphones',
    description: 'Noise-cancelling over-ear headphones with 30h battery.',
    price: 199.0,
    image: 'https://images.unsplash.com/photo-1518443929151-66f48f1a8b2a?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1518443929151-66f48f1a8b2a?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518441943037-7db8d4f1b4af?q=80&w=1200&auto=format&fit=crop'
    ],
    category: 'electronics',
    tags: ['audio', 'headphones', 'wireless'],
  },
  {
    id: '7',
    name: 'Wall Art Print',
    description: 'Minimal abstract art print on premium matte paper.',
    price: 29.0,
    image: 'https://images.unsplash.com/photo-1526498460520-4c246339dccb?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1526498460520-4c246339dccb?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1200&auto=format&fit=crop'
    ],
    category: 'decor',
    tags: ['art', 'print', 'minimal'],
  },
  {
    id: '8',
    name: 'Coffee Table',
    description: 'Solid wood coffee table with rounded edges.',
    price: 249.0,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200&auto=format&fit=crop'
    ],
    category: 'furniture',
    tags: ['table', 'living', 'wood'],
  },
  {
    id: '9',
    name: 'Standing Desk',
    description: 'Electric height-adjustable desk for ergonomic work.',
    price: 499.0,
    image: 'https://images.unsplash.com/photo-1593642532973-d31b6557fa68?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1593642532973-d31b6557fa68?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop'
    ],
    category: 'office',
    tags: ['desk', 'ergonomic', 'workspace'],
  },
  {
    id: '10',
    name: 'Floor Lamp',
    description: 'Tall floor lamp with linen shade and warm glow.',
    price: 89.0,
    image: 'https://images.unsplash.com/photo-1493666438817-866a91353ca9?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1493666438817-866a91353ca9?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1473186505569-9c61870c11f9?q=80&w=1200&auto=format&fit=crop'
    ],
    category: 'lighting',
    tags: ['lamp', 'lighting', 'floor'],
  },
  {
    id: '11',
    name: 'Planter Set',
    description: 'Set of 3 ceramic planters with drainage trays.',
    price: 34.0,
    image: 'https://images.unsplash.com/photo-1460355976672-71c3f0a4bdac?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1460355976672-71c3f0a4bdac?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?q=80&w=1200&auto=format&fit=crop'
    ],
    category: 'garden',
    tags: ['plants', 'planter', 'ceramic'],
  },
  {
    id: '12',
    name: 'Kitchen Knife Set',
    description: 'Stainless steel knife set with magnetic block.',
    price: 119.0,
    image: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b4?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1558036117-15d82a90b9b4?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1498575207490-3e0b1e19d5f4?q=80&w=1200&auto=format&fit=crop'
    ],
    category: 'kitchen',
    tags: ['kitchen', 'knife', 'steel'],
  },
  {
    id: '13',
    name: 'Yoga Mat',
    description: 'Non-slip yoga mat with carry strap.',
    price: 35.0,
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1549576490-b0b4831ef60a?q=80&w=1200&auto=format&fit=crop'
    ],
    category: 'fitness',
    tags: ['fitness', 'yoga', 'mat'],
  },
]
