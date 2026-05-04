'use client'

import { useState } from 'react'
import { submitTestimonialAction } from '@/app/actions/contact'
import { Button } from '@/components/ui/button'

interface Property {
  id: number
  title: string
  slug: string
}

interface TestimonialFormProps {
  properties: Property[]
  selectedPropertyId?: string | null
}

export default function TestimonialForm({ properties, selectedPropertyId }: TestimonialFormProps) {
  const [result, setResult] = useState<{ success?: string; error?: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    clientName: '',
    content: '',
    rating: '5',
    propertyId: selectedPropertyId || '',
    clientPhotoUrl: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setResult(null)
    const fd = new FormData()
    Object.entries(formData).forEach(([k, v]) => fd.append(k, v))
    const res = await submitTestimonialAction(fd)
    setResult(res || null)
    if (res?.success) {
      setFormData({ clientName: '', content: '', rating: '5', propertyId: selectedPropertyId || '', clientPhotoUrl: '' })
    }
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {result?.success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-sm">
          {result.success}
        </div>
      )}
      {result?.error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
          {result.error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
        <input
          type="text"
          required
          value={formData.clientName}
          onChange={(e) => setFormData((p) => ({ ...p, clientName: e.target.value }))}
          placeholder="Your full name"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Photo URL (Optional)
        </label>
        <input
          type="url"
          value={formData.clientPhotoUrl}
          onChange={(e) => setFormData((p) => ({ ...p, clientPhotoUrl: e.target.value }))}
          placeholder="https://example.com/your-photo.jpg"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
        <select
          value={formData.rating}
          onChange={(e) => setFormData((p) => ({ ...p, rating: e.target.value }))}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black bg-white"
        >
          <option value="5">5 - Excellent</option>
          <option value="4">4 - Very Good</option>
          <option value="3">3 - Good</option>
          <option value="2">2 - Fair</option>
          <option value="1">1 - Poor</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Property (Optional)
        </label>
        <select
          value={formData.propertyId}
          onChange={(e) => setFormData((p) => ({ ...p, propertyId: e.target.value }))}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black bg-white"
        >
          <option value="">General Review</option>
          {properties.map((prop) => (
            <option key={prop.id} value={String(prop.id)}>
              {prop.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Your Testimonial *</label>
        <textarea
          required
          rows={5}
          value={formData.content}
          onChange={(e) => setFormData((p) => ({ ...p, content: e.target.value }))}
          placeholder="Share your experience with us..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black resize-none"
        />
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className="w-full py-4 rounded-xl text-base font-medium"
        style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}
      >
        {submitting ? 'Submitting...' : 'Submit Testimonial'}
      </Button>
    </form>
  )
}
