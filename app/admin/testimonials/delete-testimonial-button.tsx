'use client'

import { deleteTestimonialAction } from '@/app/actions/testimonial'
import { Trash2 } from 'lucide-react'

export default function DeleteTestimonialButton({
  id,
  clientName,
}: {
  id: number
  clientName: string
}) {
  const handleDelete = async () => {
    if (!confirm(`Delete testimonial from ${clientName}?`)) return
    await deleteTestimonialAction(id)
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
