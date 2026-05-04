'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function createTestimonialAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id || (session.user as any).role !== 'admin') return { error: 'Unauthorized' }

  const propertyIdRaw = formData.get('propertyId')
  const propertyId = propertyIdRaw ? parseInt(propertyIdRaw as string) : null
  const property = propertyId && !isNaN(propertyId) ? await prisma.property.findUnique({ where: { id: propertyId } }) : null
  const ratingRaw = formData.get('rating')
  const rating = ratingRaw ? Math.max(0, Math.min(5, parseFloat(ratingRaw as string))) : null

  await prisma.testimonial.create({
    data: {
      clientName: (formData.get('clientName') as string)?.trim(),
      clientPhoto: (formData.get('clientPhoto') as string)?.trim() || null,
      content: (formData.get('content') as string)?.trim(),
      rating: isNaN(rating as number) ? null : rating,
      propertyType: property
        ? property.propertyType === 'other' && property.propertyTypeOther ? property.propertyTypeOther : property.propertyType
        : null,
      propertyId: property?.id || null,
      featured: formData.get('featured') === 'true',
      order: parseInt(formData.get('order') as string) || 0,
    },
  })

  redirect('/admin/testimonials')
}

export async function updateTestimonialAction(id: number, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id || (session.user as any).role !== 'admin') return { error: 'Unauthorized' }

  const propertyIdRaw = formData.get('propertyId')
  const propertyId = propertyIdRaw ? parseInt(propertyIdRaw as string) : null
  const property = propertyId && !isNaN(propertyId) ? await prisma.property.findUnique({ where: { id: propertyId } }) : null
  const ratingRaw = formData.get('rating')
  const rating = ratingRaw ? Math.max(0, Math.min(5, parseFloat(ratingRaw as string))) : null

  await prisma.testimonial.update({
    where: { id },
    data: {
      clientName: (formData.get('clientName') as string)?.trim(),
      clientPhoto: (formData.get('clientPhoto') as string)?.trim() || null,
      content: (formData.get('content') as string)?.trim(),
      rating: isNaN(rating as number) ? null : rating,
      propertyType: property
        ? property.propertyType === 'other' && property.propertyTypeOther ? property.propertyTypeOther : property.propertyType
        : null,
      propertyId: property?.id || null,
      featured: formData.get('featured') === 'true',
      order: parseInt(formData.get('order') as string) || 0,
    },
  })

  redirect('/admin/testimonials')
}

export async function deleteTestimonialAction(id: number) {
  const session = await auth()
  if (!session?.user?.id || (session.user as any).role !== 'admin') return { error: 'Unauthorized' }
  await prisma.testimonial.delete({ where: { id } })
  redirect('/admin/testimonials')
}
