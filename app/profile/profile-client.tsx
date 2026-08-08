'use client'

import { useState, useTransition } from 'react'
import { User, Lock, ShieldCheck, ShieldQuestion, Clock, Mail, Users } from 'lucide-react'
import { updateProfileAction } from '@/app/actions/auth'
import { requestAdminAccessAction, approveAdminAccessRequestAction } from '@/app/actions/admin'

interface AdminUserSummary {
  id: number
  email: string
  firstName: string
  lastName: string
}

interface PendingRequest {
  id: number
  createdAt: string
  user: AdminUserSummary
}

interface ProfileClientProps {
  user: { firstName: string; lastName: string; email: string; role: string }
  hasPendingRequest: boolean
  isSuperAdmin: boolean
  admins: AdminUserSummary[]
  pendingRequests: PendingRequest[]
}

const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors'
const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

export default function ProfileClient({ user, hasPendingRequest, isSuperAdmin, admins, pendingRequests }: ProfileClientProps) {
  const [profileResult, setProfileResult] = useState<{ error?: string; success?: string } | null>(null)
  const [profileSaving, setProfileSaving] = useState(false)

  const [requestResult, setRequestResult] = useState<{ error?: string; success?: string } | null>(null)
  const [requestPending, startRequestTransition] = useTransition()
  const [requestSent, setRequestSent] = useState(hasPendingRequest)

  const [grantResult, setGrantResult] = useState<{ error?: string; success?: string } | null>(null)
  const [grantPending, startGrantTransition] = useTransition()
  const [grantingId, setGrantingId] = useState<number | null>(null)

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setProfileSaving(true)
    setProfileResult(null)
    const fd = new FormData(e.currentTarget)
    const res = await updateProfileAction(fd)
    if (res) setProfileResult(res)
    setProfileSaving(false)
  }

  const handleRequestAdminAccess = () => {
    setRequestResult(null)
    startRequestTransition(async () => {
      const res = await requestAdminAccessAction()
      if (res) setRequestResult(res)
      if (res?.success) setRequestSent(true)
    })
  }

  const handleGrant = (requestId: number) => {
    setGrantResult(null)
    setGrantingId(requestId)
    startGrantTransition(async () => {
      const res = await approveAdminAccessRequestAction(requestId)
      if (res) setGrantResult(res)
      setGrantingId(null)
    })
  }

  return (
    <div className="px-6 py-24">
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-black">My Profile</h1>
          <p className="text-gray-600 text-sm mt-1">Manage your personal details and admin access.</p>
        </div>

        {profileResult?.error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">{profileResult.error}</div>
        )}
        {profileResult?.success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-sm">{profileResult.success}</div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-6">
          {/* Name */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <User className="h-5 w-5 text-gray-500" />
              <h2 className="font-semibold text-black">Personal Info</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>First Name</label>
                <input type="text" name="firstName" defaultValue={user.firstName} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Last Name</label>
                <input type="text" name="lastName" defaultValue={user.lastName} className={inputCls} />
              </div>
            </div>
            <div className="mt-4">
              <label className={labelCls}>Email</label>
              <input type="email" value={user.email} disabled className={`${inputCls} bg-gray-50 text-gray-500`} />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
            </div>
          </div>

          {/* Password */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Lock className="h-5 w-5 text-gray-500" />
              <h2 className="font-semibold text-black">Change Password</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">Leave blank if you don&apos;t want to change your password.</p>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Current Password</label>
                <input type="password" name="currentPassword" autoComplete="current-password" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>New Password</label>
                <input type="password" name="newPassword" autoComplete="new-password" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Confirm New Password</label>
                <input type="password" name="confirmPassword" autoComplete="new-password" className={inputCls} />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={profileSaving}
            className="w-full py-3 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-900 transition-colors disabled:opacity-60"
          >
            {profileSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        {/* Admin Access */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <ShieldQuestion className="h-5 w-5 text-gray-500" />
            <h2 className="font-semibold text-black">Admin Access</h2>
          </div>

          {requestResult?.error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">{requestResult.error}</div>
          )}
          {requestResult?.success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-sm">{requestResult.success}</div>
          )}

          {user.role === 'admin' ? (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 text-amber-700 text-sm font-medium">
              <ShieldCheck className="h-4 w-4" />
              You have admin access.
            </div>
          ) : requestSent ? (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium">
              <Clock className="h-4 w-4" />
              Your request is pending review by the super admin.
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-500 mb-4">
                Requesting admin access sends a notification to the super admin for review.
              </p>
              <button
                onClick={handleRequestAdminAccess}
                disabled={requestPending}
                className="px-4 py-2.5 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-900 transition-colors disabled:opacity-60"
              >
                {requestPending ? 'Sending...' : 'Request Admin Access'}
              </button>
            </div>
          )}
        </div>

        {/* Superadmin: admin management */}
        {isSuperAdmin && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Users className="h-5 w-5 text-gray-500" />
              <h2 className="font-semibold text-black">Admin Management</h2>
            </div>

            {grantResult?.error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">{grantResult.error}</div>
            )}
            {grantResult?.success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-sm">{grantResult.success}</div>
            )}

            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Current Admins ({admins.length})</h3>
              {admins.length === 0 ? (
                <p className="text-sm text-gray-400">No admins yet.</p>
              ) : (
                <div className="space-y-2">
                  {admins.map((a) => (
                    <div key={a.id} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-amber-50">
                      <ShieldCheck className="h-4 w-4 text-amber-700 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-black truncate">
                          {a.firstName} {a.lastName}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                          <Mail className="h-3 w-3 shrink-0" />
                          {a.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Pending Requests ({pendingRequests.length})</h3>
              {pendingRequests.length === 0 ? (
                <p className="text-sm text-gray-400">No pending admin access requests.</p>
              ) : (
                <div className="space-y-2">
                  {pendingRequests.map((r) => {
                    const isThisRowPending = grantPending && grantingId === r.id
                    return (
                      <div key={r.id} className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-gray-50">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-black truncate">
                            {r.user.firstName} {r.user.lastName}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                            <Mail className="h-3 w-3 shrink-0" />
                            {r.user.email}
                          </p>
                        </div>
                        <button
                          onClick={() => handleGrant(r.id)}
                          disabled={grantPending}
                          className="shrink-0 px-4 py-2 rounded-xl text-sm font-medium bg-black text-white hover:bg-gray-900 transition-colors disabled:opacity-50"
                        >
                          {isThisRowPending ? '...' : 'Grant Access'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
