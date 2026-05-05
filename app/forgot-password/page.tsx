'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { forgotPasswordAction } from '@/app/actions/password-reset'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const result = await forgotPasswordAction(fd)
    if (result?.error) { setError(result.error); setLoading(false) }
    else setSent(true)
  }

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
            <Image src="/logo-white.png" alt="Realest" width={32} height={32} className="h-8 w-8 object-contain" />
            <span className="text-xl lg:text-2xl font-bold text-black/75">Realest</span>
          </Link>
        </div>

        <Image
          src="/Sent-Message.svg"
          alt="Forgot password illustration"
          width={360}
          height={360}
          className="w-32 h-32 sm:w-40 sm:h-40 lg:w-[320px] lg:h-[320px] object-contain mt-8 lg:mt-0 lg:mb-8 drop-shadow-md"
          priority
        />

        <div className="hidden lg:flex flex-col items-center text-center max-w-xs px-4 mb-4">
          <h2 className="text-2xl font-bold text-black/75 mb-2">No worries, it happens</h2>
          <p className="text-black/50 text-sm leading-relaxed">
            Enter your email and we&apos;ll send you a secure link to reset your password right away.
          </p>
        </div>

        <div className="hidden lg:block absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-white/20" />
        <div className="hidden lg:block absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/15" />
      </div>

      {/* Form panel */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-start
                      bg-white rounded-t-3xl -mt-5 px-6 pt-8 pb-12
                      lg:w-1/2 lg:rounded-none lg:mt-0 lg:justify-center lg:py-12 lg:min-h-screen">

        <div className="w-full max-w-sm">
          {sent ? (
            <div className="text-center">
              <span className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </span>
              <h2 className="text-2xl font-bold text-black mb-2">Check your inbox</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                If an account exists for that email, we&apos;ve sent a reset link. It expires in <strong>1 hour</strong>.
              </p>
              <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back to login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-7">
                <h1 className="text-2xl font-bold text-black">Forgot password?</h1>
                <p className="text-gray-500 text-sm mt-1">We&apos;ll send a reset link to your email.</p>
              </div>

              {error && (
                <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <input
                      type="email" name="email" required autoComplete="email"
                      placeholder="your@email.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors"
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <button
                  type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl bg-black text-white text-sm font-semibold hover:bg-black/85 active:scale-[0.98] transition-all disabled:opacity-60"
                >
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors">
                  <ArrowLeft className="h-4 w-4" /> Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
