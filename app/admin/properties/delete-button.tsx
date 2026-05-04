'use client'

import { deletePropertyAction } from '@/app/actions/property'
import { Trash2 } from 'lucide-react'

export default function DeletePropertyButton({
  id,
  title,
}: {
  id: number
  title: string
}) {
  const handleDelete = async () => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    const fd = new FormData()
    await deletePropertyAction(id)
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
      title="Delete"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )
}
