'use server'

import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'

const BASE_URL = process.env.NEXTAUTH_URL || 'https://realestate.pratham.click'
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@realestate.pratham.click'

export async function forgotPasswordAction(formData: FormData) {
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  if (!email) return { error: 'Email is required.' }

  const user = await prisma.user.findUnique({ where: { email } })

  // Always return success to prevent email enumeration
  if (!user) return { success: true }

  // Delete any existing tokens for this email
  await prisma.passwordResetToken.deleteMany({ where: { email } })

  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60) // 1 hour

  await prisma.passwordResetToken.create({ data: { email, token, expiresAt } })

  const resetUrl = `${BASE_URL}/reset-password?token=${token}`

  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Reset your Realest password',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:16px">
        <h2 style="font-size:24px;font-weight:700;color:#0a0a0a;margin-bottom:8px">Reset your password</h2>
        <p style="color:#555;font-size:15px;line-height:1.6;margin-bottom:24px">
          We received a request to reset the password for your Realest account. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
        </p>
        <a href="${resetUrl}" style="display:inline-block;background:#0a0a0a;color:#fff;text-decoration:none;padding:14px 28px;border-radius:12px;font-size:15px;font-weight:600">
          Reset Password
        </a>
        <p style="color:#999;font-size:13px;margin-top:28px;line-height:1.5">
          If you didn't request a password reset, you can safely ignore this email — your password will remain unchanged.<br><br>
          Or copy this link: <a href="${resetUrl}" style="color:#0a0a0a">${resetUrl}</a>
        </p>
      </div>
    `,
  })

  return { success: true }
}

export async function resetPasswordAction(formData: FormData) {
  const token = (formData.get('token') as string)?.trim()
  const password = formData.get('password') as string
  const passwordConfirmation = formData.get('passwordConfirmation') as string

  if (!token) return { error: 'Invalid or missing reset token.' }
  if (password !== passwordConfirmation) return { error: 'Passwords do not match.' }
  if (password.length < 8) return { error: 'Password must be at least 8 characters.' }
  if (!/[A-Z]/.test(password)) return { error: 'Password must contain at least one uppercase letter.' }
  if (!/[a-z]/.test(password)) return { error: 'Password must contain at least one lowercase letter.' }
  if (!/[0-9]/.test(password)) return { error: 'Password must contain at least one number.' }
  if (!/[^A-Za-z0-9]/.test(password)) return { error: 'Password must contain at least one special character.' }

  const record = await prisma.passwordResetToken.findUnique({ where: { token } })
  if (!record) return { error: 'This reset link is invalid or has already been used.' }
  if (record.expiresAt < new Date()) {
    await prisma.passwordResetToken.delete({ where: { token } })
    return { error: 'This reset link has expired. Please request a new one.' }
  }

  const hashed = await bcrypt.hash(password, 12)
  await prisma.user.update({ where: { email: record.email }, data: { password: hashed } })
  await prisma.passwordResetToken.delete({ where: { token } })

  return { success: true }
}
