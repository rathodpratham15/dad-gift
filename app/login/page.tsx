'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { loginAction } from '@/app/actions/auth'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const result = await loginAction(fd)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* Illustration panel — top strip on mobile, left half on desktop */}
      <div
        className="relative w-full lg:w-1/2 lg:min-h-screen flex flex-col items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #A8D5E2 0%, #c8e8f0 60%, #e8f4f8 100%)',
          minHeight: '220px',
        }}
      >
        {/* Logo */}
        <div className="absolute top-4 left-5 lg:top-8 lg:left-8 z-10">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo-white.png" alt="Realest" width={40} height={40} className="h-10 w-10 object-contain" />
            <span className="text-xl lg:text-2xl font-bold text-black/75">Realest</span>
          </Link>
        </div>

        {/* SVG */}
        <Image
          src="/Tablet-login.svg"
          alt="Login illustration"
          width={380}
          height={380}
          className="w-36 h-36 sm:w-44 sm:h-44 lg:w-[340px] lg:h-[340px] object-contain mt-8 lg:mt-0 lg:mb-8 drop-shadow-md"
          priority
        />

        {/* Desktop-only tagline */}
        <div className="hidden lg:flex flex-col items-center text-center max-w-xs px-4 mb-4">
          <h2 className="text-2xl font-bold text-black/75 mb-2">Welcome back</h2>
          <p className="text-black/50 text-sm leading-relaxed">
            Sign in to explore listings, save favourites, and connect with agents — all in one place.
          </p>
        </div>

        {/* Decorative circles (desktop only) */}
        <div className="hidden lg:block absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-white/20" />
        <div className="hidden lg:block absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/15" />

        {/* Force this panel to fill full height on desktop */}
        <div className="hidden lg:block lg:absolute lg:inset-0 -z-10" style={{ background: 'inherit' }} />
      </div>

      {/* Form panel — rounded white card overlapping on mobile, right half on desktop */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-start
                      bg-white rounded-t-3xl -mt-5 px-6 pt-8 pb-12
                      lg:w-1/2 lg:rounded-none lg:mt-0 lg:justify-center lg:py-12 lg:min-h-screen">

        <div className="w-full max-w-sm">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-black">Sign in</h1>
            <p className="text-gray-500 text-sm mt-1">Enter your credentials to continue</p>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email" name="email" required autoComplete="email"
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <Link href="/forgot-password" className="text-xs text-gray-500 hover:text-black transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password" required autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-black text-white text-sm font-semibold hover:bg-black/85 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-black hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
