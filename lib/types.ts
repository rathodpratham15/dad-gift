export interface Property {
  id: number
  title: string
  slug: string
  description: string | null
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  latitude: number | null
  longitude: number | null
  price: number
  propertyType: 'house' | 'shop' | 'godown' | 'land' | 'commercial' | 'other'
  propertyTypeOther?: string | null
  bedrooms: number | null
  bathrooms: number | null
  squareFeet: number | null
  yearBuilt: number | null
  status: 'for_sale' | 'rental'
  featured: boolean
  rating: number | null
  isPopular: boolean
  overallRating?: number | null
  ratingCount?: number
  distanceKm?: number | null
  mainImage: string | null
  images: string[]
  videos?: string[]
  agentId: number | null
  agent?: Agent
  features: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

export interface Agent {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string | null
  bio: string | null
  photo: string | null
  licenseNumber: string | null
  yearsOfExperience: number | null
  specialties: string[]
  socialLinks: Record<string, string> | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string | null
  content: string
  featuredImage: string | null
  category: string | null
  authorId: number | null
  author?: Agent
  tags: string[]
  published: boolean
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface Testimonial {
  id: number
  clientName: string
  clientPhoto: string | null
  content: string
  rating: number | null
  propertyType: string | null
  propertyId: number | null
  property?: {
    id: number
    title: string
    slug: string
  } | null
  featured: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export interface Contact {
  id: number
  userId: number | null
  name: string
  email: string
  phone: string | null
  subject: string | null
  message: string
  adminResponse: string | null
  agentId: number | null
  status: 'new' | 'read' | 'replied' | 'archived'
  createdAt: string
  updatedAt: string
}

export interface PaginatedResult<T> {
  data: T[]
  meta: {
    currentPage: number
    lastPage: number
    perPage: number
    total: number
  }
}
