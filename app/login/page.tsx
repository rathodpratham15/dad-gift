'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { loginAction } from '@/app/actions/auth'
import { signIn } from 'next-auth/react'
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

          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <button
            type="button"
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            className="mt-4 w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="mt-5 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-black hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
