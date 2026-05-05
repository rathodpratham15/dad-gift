'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { registerAction } from '@/app/actions/auth'
import { Eye, EyeOff, Check, X } from 'lucide-react'

const RULES = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'Uppercase letter (A–Z)', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter (a–z)', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Number (0–9)', test: (p: string) => /[0-9]/.test(p) },
  { label: 'Special character (!@#$…)', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

function getStrength(password: string) {
  if (!password) return null
  const passed = RULES.filter((r) => r.test(password)).length
  const allMet = passed === RULES.length
  if (!allMet) return { level: 1, label: 'Weak', color: 'bg-red-500', text: 'text-red-600' }
  if (password.length < 10) return { level: 2, label: 'Okay', color: 'bg-amber-400', text: 'text-amber-600' }
  if (password.length < 14) return { level: 3, label: 'Strong', color: 'bg-green-500', text: 'text-green-600' }
  return { level: 4, label: 'Very Strong', color: 'bg-emerald-500', text: 'text-emerald-600' }
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const strength = useMemo(() => getStrength(password), [password])
  const rulesPassed = useMemo(() => RULES.map((r) => r.test(password)), [password])
  const confirmMatch = confirm.length > 0 && confirm === password
  const confirmMismatch = confirm.length > 0 && confirm !== password

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match.'); return }
    const allPassed = rulesPassed.every(Boolean)
    if (!allPassed) { setError('Please meet all password requirements.'); return }
    setLoading(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const result = await registerAction(fd)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  const inputCls = (valid?: boolean, invalid?: boolean) =>
    `w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors ${
      invalid
        ? 'border-red-400 focus:border-red-500'
        : valid
        ? 'border-green-400 focus:border-green-500'
        : 'border-gray-200 focus:border-black'
    }`

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(135deg, #A8D5E2 0%, #e8f4f8 50%, #f5f5f5 100%)' }}
    >
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="text-3xl font-bold text-black">
              Realest
            </Link>
            <p className="text-gray-500 mt-2 text-sm">Create your account — it&apos;s free</p>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-start gap-2">
              <X className="h-4 w-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  placeholder="John"
                  className={inputCls()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  required
                  placeholder="Doe"
                  className={inputCls()}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="your@email.com"
                className={inputCls()}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputCls()} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>

              {/* Strength bar */}
              {password.length > 0 && strength && (
                <div className="mt-2.5">
                  <div className="flex gap-1 mb-1.5">
                    {[1, 2, 3, 4].map((seg) => (
                      <div
                        key={seg}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          seg <= strength.level ? strength.color : 'bg-gray-100'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${strength.text}`}>{strength.label}</p>
                </div>
              )}

              {/* Requirements checklist */}
              {password.length > 0 && (
                <ul className="mt-2.5 space-y-1">
                  {RULES.map((rule, i) => (
                    <li key={i} className={`flex items-center gap-2 text-xs transition-colors ${rulesPassed[i] ? 'text-green-600' : 'text-gray-400'}`}>
                      {rulesPassed[i]
                        ? <Check className="h-3.5 w-3.5 shrink-0" />
                        : <X className="h-3.5 w-3.5 shrink-0" />
                      }
                      {rule.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="passwordConfirmation"
                  required
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={`${inputCls(confirmMatch, confirmMismatch)} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirm ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
              {confirmMismatch && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <X className="h-3.5 w-3.5" /> Passwords don&apos;t match
                </p>
              )}
              {confirmMatch && (
                <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> Passwords match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-black text-white text-sm font-semibold hover:bg-black/85 active:scale-[0.98] transition-all disabled:opacity-60 mt-1"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-black hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
