'use server'

import { prisma } from '@/lib/prisma'
import { auth, isSuperAdminEmail } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

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

export async function updateUserRoleAction(userId: number, role: 'admin' | 'user') {
  const session = await auth()
  if (!session?.user?.email || !isSuperAdminEmail(session.user.email)) {
    return { error: 'Only the super admin can change user roles.' }
  }

  const target = await prisma.user.findUnique({ where: { id: userId } })
  if (!target) return { error: 'User not found.' }

  // Don't let the super admin demote themselves
  if (isSuperAdminEmail(target.email) && role !== 'admin') {
    return { error: 'You cannot remove your own super-admin access.' }
  }

  await prisma.user.update({ where: { id: userId }, data: { role } })
  revalidatePath('/admin/users')
  return { success: `User role updated to ${role}.` }
}
