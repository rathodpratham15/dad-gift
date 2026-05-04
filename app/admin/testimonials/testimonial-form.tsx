'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import type { Testimonial } from '@/lib/types'

interface PropertyOption {
  id: number
  title: string
}

interface TestimonialAdminFormProps {
  testimonial?: Partial<Testimonial>
  properties: PropertyOption[]
  action: (formData: FormData) => Promise<{ error?: string; success?: string } | void>
  isEdit?: boolean
}

export default function TestimonialAdminForm({
  testimonial,
  properties,
  action,
  isEdit = false,
}: TestimonialAdminFormProps) {
  const router = useRouter()
  const [result, setResult] = useState<{ error?: string; success?: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [featured, setFeatured] = useState(testimonial?.featured ?? false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setResult(null)
    const fd = new FormData(e.currentTarget)
    fd.set('featured', String(featured))
    const res = await action(fd)
    if (res) setResult(res)
    setSubmitting(false)
  }

  const inputCls =
    'w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors'
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {result?.error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
          {result.error}
        </div>
      )}
      {result?.success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-sm">
          {result.success}
        </div>
      )}

      <div>
        <label className={labelCls}>Client Name *</label>
        <input
          type="text"
          name="clientName"
          required
          defaultValue={testimonial?.clientName || ''}
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls}>Client Photo URL</label>
        <input
          type="url"
          name="clientPhoto"
          defaultValue={testimonial?.clientPhoto || ''}
          placeholder="https://example.com/photo.jpg"
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls}>Testimonial Content *</label>
        <textarea
          name="content"
          required
          rows={4}
          defaultValue={testimonial?.content || ''}
          className={`${inputCls} resize-none`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelCls}>Rating (0-5)</label>
          <input
            type="number"
            name="rating"
            min="0"
            max="5"
            step="0.1"
            defaultValue={testimonial?.rating ?? ''}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Display Order</label>
          <input
            type="number"
            name="order"
            min="0"
            defaultValue={testimonial?.order ?? 0}
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Property (Optional)</label>
        <select
          name="propertyId"
          defaultValue={testimonial?.propertyId ? String(testimonial.propertyId) : ''}
          className={`${inputCls} bg-white`}
        >
          <option value="">General Review</option>
          {properties.map((p) => (
            <option key={p.id} value={String(p.id)}>
              {p.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm font-medium text-gray-700">Featured (show on homepage)</span>
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <Button
          type="submit"
          disabled={submitting}
          className="px-8 py-2.5 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-900"
        >
          {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Testimonial'}
        </Button>
      </div>
    </form>
  )
}
