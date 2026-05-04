'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateContactStatusAction, deleteContactAction } from '@/app/actions/admin'
import type { Contact } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface ContactActionsProps {
  contact: Contact
}

export default function ContactActions({ contact }: ContactActionsProps) {
  const router = useRouter()
  const [result, setResult] = useState<{ error?: string; success?: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setResult(null)
    const fd = new FormData(e.currentTarget)
    const res = await updateContactStatusAction(contact.id, fd)
    setResult(res || null)
    setSubmitting(false)
    router.refresh()
  }

  const handleDelete = async () => {
    if (!confirm('Delete this contact? This cannot be undone.')) return
    setDeleting(true)
    await deleteContactAction(contact.id)
  }

  return (
    <div>
      {result?.success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-sm">
          {result.success}
        </div>
      )}
      {result?.error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
          {result.error}
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            name="status"
            defaultValue={contact.status}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black bg-white"
          >
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Admin Response (Internal Note)
          </label>
          <textarea
            name="adminResponse"
            rows={4}
            defaultValue={contact.adminResponse || ''}
            placeholder="Add a response or internal note..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black resize-none"
          />
        </div>

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={submitting}
            className="flex-1 py-3 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-900"
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </Button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </form>
    </div>
  )
}
