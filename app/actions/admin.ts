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
  revalidatePath('/profile')
  return { success: `User role updated to ${role}.` }
}

export async function requestAdminAccessAction() {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated.' }

  const userId = parseInt(session.user.id)
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return { error: 'User not found.' }
  if (user.role === 'admin') return { error: 'You already have admin access.' }

  const existingPending = await prisma.adminAccessRequest.findFirst({
    where: { userId, status: 'pending' },
  })
  if (existingPending) return { success: 'Your request is already pending review.' }

  await prisma.adminAccessRequest.create({ data: { userId } })
  revalidatePath('/profile')
  return { success: 'Admin access request sent to the super admin.' }
}

export async function approveAdminAccessRequestAction(requestId: number) {
  const session = await auth()
  if (!session?.user?.email || !isSuperAdminEmail(session.user.email)) {
    return { error: 'Only the super admin can grant admin access.' }
  }

  const request = await prisma.adminAccessRequest.findUnique({ where: { id: requestId } })
  if (!request) return { error: 'Request not found.' }
  if (request.status !== 'pending') return { error: 'This request has already been resolved.' }

  await prisma.$transaction([
    prisma.user.update({ where: { id: request.userId }, data: { role: 'admin' } }),
    prisma.adminAccessRequest.update({
      where: { id: requestId },
      data: { status: 'approved', resolvedAt: new Date() },
    }),
  ])

  revalidatePath('/profile')
  revalidatePath('/admin/users')
  return { success: 'Admin access granted.' }
}
