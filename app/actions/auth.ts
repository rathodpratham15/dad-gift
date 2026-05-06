'use server'

import { signIn, signOut } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { AuthError } from 'next-auth'

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const user = await prisma.user.findUnique({ where: { email }, select: { role: true } })
  const redirectTo = user?.role === 'admin' ? '/admin/properties' : '/dashboard'

  try {
    await signIn('credentials', { email, password, redirectTo })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Invalid email or password.' }
    }
    throw error
  }
}

export async function adminLoginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || user.role !== 'admin') {
    return { error: 'Invalid credentials or insufficient permissions.' }
  }

  try {
    await signIn('credentials', { email, password, redirectTo: '/admin/properties' })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Invalid email or password.' }
    }
    throw error
  }
}

export async function registerAction(formData: FormData) {
  const firstName = (formData.get('firstName') as string)?.trim()
  const lastName = (formData.get('lastName') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string
  const passwordConfirmation = formData.get('passwordConfirmation') as string

  if (password !== passwordConfirmation) return { error: 'Passwords do not match.' }
  if (password.length < 8) return { error: 'Password must be at least 8 characters.' }
  if (!/[A-Z]/.test(password)) return { error: 'Password must contain at least one uppercase letter.' }
  if (!/[a-z]/.test(password)) return { error: 'Password must contain at least one lowercase letter.' }
  if (!/[0-9]/.test(password)) return { error: 'Password must contain at least one number.' }
  if (!/[^A-Za-z0-9]/.test(password)) return { error: 'Password must contain at least one special character.' }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return { error: 'An account with this email already exists.' }

  const hashed = await bcrypt.hash(password, 12)
  await prisma.user.create({
    data: { firstName, lastName, email, password: hashed, role: 'user', isActive: true },
  })

  try {
    await signIn('credentials', { email, password, redirectTo: '/dashboard' })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Account created but login failed. Please sign in manually.' }
    }
    throw error
  }
}

export async function updateProfileAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated.' }

  const userId = parseInt(session.user.id)
  const firstName = (formData.get('firstName') as string)?.trim()
  const lastName = (formData.get('lastName') as string)?.trim()
  const currentPassword = (formData.get('currentPassword') as string) || ''
  const newPassword = (formData.get('newPassword') as string) || ''
  const confirmPassword = (formData.get('confirmPassword') as string) || ''

  if (!firstName) return { error: 'First name is required.' }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return { error: 'User not found.' }

  const updateData: Record<string, unknown> = { firstName, lastName: lastName || '' }

  if (newPassword) {
    if (newPassword.length < 8) return { error: 'New password must be at least 8 characters.' }
    if (!/[A-Z]/.test(newPassword)) return { error: 'New password must contain at least one uppercase letter.' }
    if (!/[a-z]/.test(newPassword)) return { error: 'New password must contain at least one lowercase letter.' }
    if (!/[0-9]/.test(newPassword)) return { error: 'New password must contain at least one number.' }
    if (!/[^A-Za-z0-9]/.test(newPassword)) return { error: 'New password must contain at least one special character.' }
    if (newPassword !== confirmPassword) return { error: 'New passwords do not match.' }
    if (user.password) {
      const valid = await bcrypt.compare(currentPassword, user.password)
      if (!valid) return { error: 'Current password is incorrect.' }
    }
    updateData.password = await bcrypt.hash(newPassword, 12)
  }

  await prisma.user.update({ where: { id: userId }, data: updateData })
  return { success: 'Profile updated successfully.' }
}

export async function logoutAction() {
  await signOut({ redirectTo: '/' })
}

export async function adminLogoutAction() {
  await signOut({ redirectTo: '/admin/login' })
}
