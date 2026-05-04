'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { slugify } from '@/lib/utils'
import { redirect } from 'next/navigation'

async function generateUniqueSlug(title: string, excludeId?: number): Promise<string> {
  const base = slugify(title)
  let slug = base
  let counter = 1
  while (true) {
    const existing = await prisma.property.findUnique({ where: { slug } })
    if (!existing || existing.id === excludeId) break
    slug = `${base}-${counter++}`
  }
  return slug
}

export async function createPropertyAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id || (session.user as any).role !== 'admin') {
    return { error: 'Unauthorized' }
  }

  const title = (formData.get('title') as string)?.trim()
  if (!title) return { error: 'Title is required.' }

  const slug = await generateUniqueSlug(title)

  const parseF = (key: string) => {
    const v = formData.get(key) as string
    return v ? parseFloat(v) : null
  }
  const parseI = (key: string) => {
    const v = formData.get(key) as string
    return v ? parseInt(v) : null
  }
  const parseBool = (key: string) => {
    const v = formData.get(key) as string
    return ['true', '1', 'yes'].includes((v || '').toLowerCase())
  }

  let imagesJson: string[] = []
  let videosJson: string[] = []
  let featuresJson: Record<string, unknown> | null = null

  const imagesRaw = formData.get('images') as string
  const videosRaw = formData.get('videos') as string
  const featuresRaw = formData.get('features') as string

  try { imagesJson = imagesRaw ? JSON.parse(imagesRaw) : [] } catch {}
  try { videosJson = videosRaw ? JSON.parse(videosRaw) : [] } catch {}
  try { featuresJson = featuresRaw ? JSON.parse(featuresRaw) : null } catch {}

  const property = await prisma.property.create({
    data: {
      title,
      slug,
      description: (formData.get('description') as string) || null,
      address: (formData.get('address') as string)?.trim(),
      city: (formData.get('city') as string)?.trim(),
      state: (formData.get('state') as string)?.trim(),
      zipCode: (formData.get('zipCode') as string)?.trim(),
      country: (formData.get('country') as string)?.trim() || 'India',
      latitude: parseF('latitude'),
      longitude: parseF('longitude'),
      price: parseF('price') || 0,
      propertyType: (formData.get('propertyType') as string) || 'house',
      propertyTypeOther: (formData.get('propertyTypeOther') as string) || null,
      bedrooms: parseI('bedrooms'),
      bathrooms: parseF('bathrooms'),
      squareFeet: parseI('squareFeet'),
      yearBuilt: parseI('yearBuilt'),
      status: (formData.get('status') as string) || 'for_sale',
      featured: parseBool('featured'),
      rating: parseF('rating'),
      isPopular: parseBool('isPopular'),
      mainImage: (formData.get('mainImage') as string) || null,
      images: imagesJson,
      videos: videosJson,
      features: featuresJson as object ?? undefined,
      userId: parseInt(session.user.id),
    },
  })

  redirect(`/admin/properties/${property.id}/edit`)
}

export async function updatePropertyAction(id: number, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id || (session.user as any).role !== 'admin') {
    return { error: 'Unauthorized' }
  }

  const property = await prisma.property.findUnique({ where: { id } })
  if (!property) return { error: 'Property not found.' }

  const title = (formData.get('title') as string)?.trim()
  const slug = title && title !== property.title ? await generateUniqueSlug(title, id) : property.slug

  const parseF = (key: string, fallback: number | null = null) => {
    const v = formData.get(key) as string
    return v ? parseFloat(v) : fallback
  }
  const parseI = (key: string, fallback: number | null = null) => {
    const v = formData.get(key) as string
    return v ? parseInt(v) : fallback
  }
  const parseBool = (key: string, fallback: boolean) => {
    const v = formData.get(key) as string
    if (v === null || v === undefined || v === '') return fallback
    return ['true', '1', 'yes'].includes(v.toLowerCase())
  }

  let imagesJson: string[] = (property.images as string[]) || []
  let videosJson: string[] = (property.videos as string[]) || []
  let featuresJson = property.features

  const imagesRaw = formData.get('images') as string
  const videosRaw = formData.get('videos') as string
  const featuresRaw = formData.get('features') as string

  try { if (imagesRaw) imagesJson = JSON.parse(imagesRaw) } catch {}
  try { if (videosRaw) videosJson = JSON.parse(videosRaw) } catch {}
  try { if (featuresRaw) featuresJson = JSON.parse(featuresRaw) } catch {}

  await prisma.property.update({
    where: { id },
    data: {
      title: title || property.title,
      slug,
      description: (formData.get('description') as string) || null,
      address: (formData.get('address') as string)?.trim() || property.address,
      city: (formData.get('city') as string)?.trim() || property.city,
      state: (formData.get('state') as string)?.trim() || property.state,
      zipCode: (formData.get('zipCode') as string)?.trim() || property.zipCode,
      country: (formData.get('country') as string)?.trim() || property.country,
      latitude: parseF('latitude', property.latitude),
      longitude: parseF('longitude', property.longitude),
      price: parseF('price', property.price) || property.price,
      propertyType: (formData.get('propertyType') as string) || property.propertyType,
      propertyTypeOther: (formData.get('propertyTypeOther') as string) || null,
      bedrooms: parseI('bedrooms', property.bedrooms),
      bathrooms: parseF('bathrooms', property.bathrooms),
      squareFeet: parseI('squareFeet', property.squareFeet),
      yearBuilt: parseI('yearBuilt', property.yearBuilt),
      status: (formData.get('status') as string) || property.status,
      featured: parseBool('featured', property.featured),
      rating: parseF('rating', property.rating),
      isPopular: parseBool('isPopular', property.isPopular),
      mainImage: (formData.get('mainImage') as string) || property.mainImage,
      images: imagesJson,
      videos: videosJson,
      features: featuresJson as object ?? undefined,
    },
  })

  return { success: 'Property updated successfully!' }
}

export async function deletePropertyAction(id: number) {
  const session = await auth()
  if (!session?.user?.id || (session.user as any).role !== 'admin') {
    return { error: 'Unauthorized' }
  }
  await prisma.property.delete({ where: { id } })
  redirect('/admin/properties')
}
