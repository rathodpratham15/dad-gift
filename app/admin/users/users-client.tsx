'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Shield, Mail } from 'lucide-react'
import { updateUserRoleAction } from '@/app/actions/admin'

interface AdminUser {
  id: number
  email: string
  firstName: string
  lastName: string
  role: string
  isActive: boolean
  createdAt: string
  googleId: string | null
}

interface UsersClientProps {
  users: AdminUser[]
  currentEmail: string
  search: string
}

export default function UsersClient({ users, currentEmail, search }: UsersClientProps) {
  const router = useRouter()
  const [searchInput, setSearchInput] = useState(search)
  const [result, setResult] = useState<{ error?: string; success?: string } | null>(null)
  const [pending, startTransition] = useTransition()
  const [pendingId, setPendingId] = useState<number | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setSearchInput(search)
  }, [search])

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams()
      if (value.trim()) params.set('search', value.trim())
      params.set('page', '1')
      router.push(`/admin/users?${params.toString()}`)
    }, 350)
  }

  const handleRoleChange = (userId: number, role: 'admin' | 'user') => {
    setResult(null)
    setPendingId(userId)
    startTransition(async () => {
      const res = await updateUserRoleAction(userId, role)
      if (res) setResult(res)
      setPendingId(null)
    })
  }

  return (
    <div className="space-y-4">
      {result?.error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">{result.error}</div>
      )}
      {result?.success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-sm">{result.success}</div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black"
          />
        </div>

        <div className="divide-y divide-gray-100">
          {users.length === 0 && (
            <div className="p-8 text-center text-gray-500 text-sm">No users found.</div>
          )}
          {users.map((u) => {
            const isSelf = u.email === currentEmail
            const isAdmin = u.role === 'admin'
            const isThisRowPending = pending && pendingId === u.id
            return (
              <div key={u.id} className="p-4 flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      isAdmin ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {isAdmin ? <ShieldCheck className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-black truncate">
                      {u.firstName} {u.lastName}
                      {isSelf && <span className="ml-2 text-xs font-normal text-gray-500">(you)</span>}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1.5 min-w-0">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{u.email}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isAdmin ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {u.role}
                  </span>
                  {!isSelf && (
                    <button
                      onClick={() => handleRoleChange(u.id, isAdmin ? 'user' : 'admin')}
                      disabled={!!pending}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 ${
                        isAdmin
                          ? 'bg-red-50 text-red-700 hover:bg-red-100'
                          : 'bg-black text-white hover:bg-gray-900'
                      }`}
                    >
                      {isThisRowPending ? '...' : isAdmin ? 'Demote' : 'Make admin'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
