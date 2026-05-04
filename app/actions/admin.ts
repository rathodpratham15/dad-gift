'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function updateContactStatusAction(id: number, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id || (session.user as any).role !== 'admin') return { error: 'Unauthorized' }

  const status = formData.get('status') as string
  const adminResponse = formData.get('adminResponse') as string | null

  await prisma.contact.update({
    where: { id },
    data: {
      status,
      adminResponse: adminResponse || null,
    },
  })

  return { success: 'Contact updated successfully!' }
}

export async function deleteContactAction(id: number) {
  const session = await auth()
  if (!session?.user?.id || (session.user as any).role !== 'admin') return { error: 'Unauthorized' }
  await prisma.contact.delete({ where: { id } })
  redirect('/admin/contacts')
}
