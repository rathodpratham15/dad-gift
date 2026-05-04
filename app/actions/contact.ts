'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function submitContactAction(formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  const phone = (formData.get('phone') as string)?.trim() || null
  const subject = (formData.get('subject') as string)?.trim() || null
  const message = (formData.get('message') as string)?.trim()
  const agentId = formData.get('agentId') ? parseInt(formData.get('agentId') as string) : null

  if (!name || !email || !message) return { error: 'Name, email, and message are required.' }

  const session = await auth()
  const userId = session?.user?.id ? parseInt(session.user.id) : null

  await prisma.contact.create({
    data: {
      userId,
      name,
      email,
      phone,
      subject,
      message,
      agentId: agentId && !isNaN(agentId) ? agentId : null,
      status: 'new',
    },
  })

  return { success: "Thank you for your message! We'll get back to you soon." }
}

export async function submitTestimonialAction(formData: FormData) {
  const clientName = (formData.get('clientName') as string)?.trim()
  const content = (formData.get('content') as string)?.trim()
  const ratingRaw = formData.get('rating')
  const propertyIdRaw = formData.get('propertyId')
  const clientPhotoUrl = (formData.get('clientPhotoUrl') as string)?.trim() || null

  if (!clientName || !content) return { error: 'Name and testimonial content are required.' }

  const propertyId = propertyIdRaw ? parseInt(propertyIdRaw as string) : null
  const rating = ratingRaw ? Math.max(0, Math.min(5, parseFloat(ratingRaw as string))) : null

  let property = null
  if (propertyId && !isNaN(propertyId)) {
    property = await prisma.property.findUnique({ where: { id: propertyId } })
  }

  await prisma.testimonial.create({
    data: {
      clientName,
      clientPhoto: clientPhotoUrl,
      content,
      rating: isNaN(rating as number) ? null : rating,
      propertyType: property
        ? property.propertyType === 'other' && property.propertyTypeOther
          ? property.propertyTypeOther
          : property.propertyType
        : null,
      propertyId: property?.id || null,
      featured: false,
      order: 0,
    },
  })

  return { success: 'Thank you! Your testimonial has been submitted for review.' }
}
