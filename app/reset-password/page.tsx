'use client'

import { useState, useMemo, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { resetPasswordAction } from '@/app/actions/password-reset'
import { Eye, EyeOff, Check, X, CheckCircle, AlertTriangle } from 'lucide-react'

const RULES = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'Uppercase letter (A–Z)', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter (a–z)', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Number (0–9)', test: (p: string) => /[0-9]/.test(p) },
  { label: 'Special character (!@#$…)', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

function getStrength(password: string) {
  if (!password) return null
  const allMet = RULES.every((r) => r.test(password))
  if (!allMet) return { level: 1, label: 'Weak', color: 'bg-red-500', text: 'text-red-600' }
  if (password.length < 10) return { level: 2, label: 'Okay', color: 'bg-amber-400', text: 'text-amber-600' }
  if (password.length < 14) return { level: 3, label: 'Strong', color: 'bg-green-500', text: 'text-green-600' }
  return { level: 4, label: 'Very Strong', color: 'bg-emerald-500', text: 'text-emerald-600' }
}

function ResetForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const strength = useMemo(() => getStrength(password), [password])
  const rulesPassed = useMemo(() => RULES.map((r) => r.test(password)), [password])
  const confirmMatch = confirm.length > 0 && confirm === password
  const confirmMismatch = confirm.length > 0 && confirm !== password

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (!rulesPassed.every(Boolean)) { setError('Please meet all password requirements.'); return }
    setLoading(true); setError(null)
    const fd = new FormData(e.currentTarget)
    if (token) fd.set('token', token)
    const result = await resetPasswordAction(fd)
    if (result?.error) { setError(result.error); setLoading(false) }
    else setDone(true)
  }

  const inputCls = (valid?: boolean, invalid?: boolean) =>
    `w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors ${
      invalid ? 'border-red-400 focus:border-red-500'
      : valid ? 'border-green-400 focus:border-green-500'
      : 'border-gray-200 focus:border-black'
    }`

  if (!token) return (
    <div className="text-center">
      <span className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="h-7 w-7 text-amber-500" />
      </span>
      <h2 className="text-xl font-bold text-black mb-2">Invalid reset link</h2>
      <p className="text-gray-500 text-sm mb-6">This link is missing a token. Please request a new one.</p>
      <Link href="/forgot-password" className="text-sm font-semibold text-black hover:underline">Request new link →</Link>
    </div>
  )

  if (done) return (
    <div className="text-center">
      <span className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
        <CheckCircle className="h-8 w-8 text-green-500" />
      </span>
      <h2 className="text-2xl font-bold text-black mb-2">Password updated!</h2>
      <p className="text-gray-500 text-sm mb-8">You can now sign in with your new password.</p>
      <Link href="/login" className="inline-block py-3 px-8 rounded-xl bg-black text-white text-sm font-semibold hover:bg-black/85 transition-all">
        Go to Login
      </Link>
    </div>
  )

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black">Set new password</h1>
        <p className="text-gray-500 text-sm mt-1">Choose a strong password for your account.</p>
      </div>

      {error && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-start gap-2">
          <X className="h-4 w-4 mt-0.5 shrink-0" />{error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="token" value={token} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password" required autoComplete="new-password"
              placeholder="Create a strong password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              className={`${inputCls()} pr-11`}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {password.length > 0 && strength && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                {[1,2,3,4].map((seg) => (
                  <div key={seg} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${seg <= strength.level ? strength.color : 'bg-gray-100'}`} />
                ))}
              </div>
              <p className={`text-xs font-medium ${strength.text}`}>{strength.label}</p>
            </div>
          )}

          {password.length > 0 && (
            <ul className="mt-2 space-y-0.5">
              {RULES.map((rule, i) => (
                <li key={i} className={`flex items-center gap-1.5 text-xs transition-colors ${rulesPassed[i] ? 'text-green-600' : 'text-gray-400'}`}>
                  {rulesPassed[i] ? <Check className="h-3 w-3 shrink-0" /> : <X className="h-3 w-3 shrink-0" />}
                  {rule.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              name="passwordConfirmation" required autoComplete="new-password"
              placeholder="Repeat your password"
              value={confirm} onChange={(e) => setConfirm(e.target.value)}
              className={`${inputCls(confirmMatch, confirmMismatch)} pr-11`}
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {confirmMismatch && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><X className="h-3 w-3" /> Passwords don&apos;t match</p>}
          {confirmMatch && <p className="mt-1 text-xs text-green-600 flex items-center gap-1"><Check className="h-3 w-3" /> Passwords match</p>}
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full py-3 rounded-xl bg-black text-white text-sm font-semibold hover:bg-black/85 active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {loading ? 'Updating…' : 'Reset Password'}
        </button>
      </form>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* Illustration panel */}
      <div
        className="relative w-full lg:w-1/2 lg:min-h-screen flex flex-col items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #A8D5E2 0%, #c8e8f0 60%, #e8f4f8 100%)',
          minHeight: '200px',
        }}
      >
        <div className="absolute top-4 left-5 lg:top-8 lg:left-8 z-10">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo-white.png" alt="Realest" width={40} height={40} className="h-10 w-10 object-contain" />
            <span className="text-xl lg:text-2xl font-bold text-black/75">Realest</span>
          </Link>
        </div>

        <Image
          src="/Reset-password.svg"
          alt="Reset password illustration"
          width={360}
          height={360}
          className="w-32 h-32 sm:w-40 sm:h-40 lg:w-[320px] lg:h-[320px] object-contain mt-8 lg:mt-0 lg:mb-8 drop-shadow-md"
          priority
        />

        <div className="hidden lg:flex flex-col items-center text-center max-w-xs px-4 mb-4">
          <h2 className="text-2xl font-bold text-black/75 mb-2">Create a strong password</h2>
          <p className="text-black/50 text-sm leading-relaxed">
            Your new password should be unique and hard to guess. Use a mix of letters, numbers, and symbols.
          </p>
        </div>

        <div className="hidden lg:block absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-white/20" />
        <div className="hidden lg:block absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/15" />
      </div>

      {/* Form panel */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-start
                      bg-white rounded-t-3xl -mt-5 px-6 pt-8 pb-12
                      lg:w-1/2 lg:rounded-none lg:mt-0 lg:justify-center lg:py-12 lg:min-h-screen overflow-y-auto">
        <div className="w-full max-w-sm">
          <Suspense fallback={<div className="text-center text-gray-400 text-sm py-8">Loading…</div>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
