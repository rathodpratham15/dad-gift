import type { Metadata } from 'next'
import Link from 'next/link'
import { WifiOff } from 'lucide-react'

export const metadata: Metadata = { title: "You're offline" }

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-6">
          <WifiOff className="h-8 w-8 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-black mb-2">You&apos;re offline</h1>
        <p className="text-gray-600 mb-6">
          This page hasn&apos;t been saved for offline use. Reconnect to the internet and try again.
        </p>
        <Link
          href="/"
          className="inline-flex px-6 py-3 rounded-xl font-medium text-white text-sm bg-black hover:bg-gray-900 transition-colors"
        >
          Go to Home
        </Link>
      </div>
    </div>
  )
}
