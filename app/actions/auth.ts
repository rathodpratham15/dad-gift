'use server'

import { signIn, signOut } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
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

export async function logoutAction() {
  await signOut({ redirectTo: '/' })
}

export async function adminLogoutAction() {
  await signOut({ redirectTo: '/admin/login' })
}
