'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import type { Property } from '@/lib/types'
import { Upload, X, Plus } from 'lucide-react'

interface PropertyFormProps {
  property?: Partial<Property>
  action: (formData: FormData) => Promise<{ error?: string; success?: string } | void>
  isEdit?: boolean
}

export default function PropertyForm({ property, action, isEdit = false }: PropertyFormProps) {
  const router = useRouter()
  const [result, setResult] = useState<{ error?: string; success?: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [mainImage, setMainImage] = useState(property?.mainImage || '')
  const [images, setImages] = useState<string[]>(property?.images || [])
  const [propertyType, setPropertyType] = useState<string>(property?.propertyType || 'house')
  const mainImageInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File, isMain: boolean) => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) {
        if (isMain) {
          setMainImage(data.url)
        } else {
          setImages((prev) => [...prev, data.url])
        }
      }
    } catch {
      setResult({ error: 'Upload failed. Please try again.' })
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setResult(null)
    const fd = new FormData(e.currentTarget)
    fd.set('mainImage', mainImage)
    fd.set('images', JSON.stringify(images))
    const res = await action(fd)
    if (res) setResult(res)
    setSubmitting(false)
  }

  const inputCls =
    'w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors'
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
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

      {/* Basic Info */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="font-semibold text-black mb-5">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className={labelCls}>Title *</label>
            <input
              type="text"
              name="title"
              required
              defaultValue={property?.title || ''}
              className={inputCls}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Description</label>
            <textarea
              name="description"
              rows={4}
              defaultValue={property?.description || ''}
              className={`${inputCls} resize-none`}
            />
          </div>
          <div>
            <label className={labelCls}>Property Type *</label>
            <select
              name="propertyType"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className={`${inputCls} bg-white`}
            >
              <option value="house">House</option>
              <option value="shop">Shop</option>
              <option value="godown">Godown</option>
              <option value="land">Land</option>
              <option value="commercial">Commercial</option>
              <option value="other">Other</option>
            </select>
          </div>
          {propertyType === 'other' && (
            <div>
              <label className={labelCls}>Property Type (Custom)</label>
              <input
                type="text"
                name="propertyTypeOther"
                defaultValue={property?.propertyTypeOther || ''}
                className={inputCls}
                placeholder="Specify type"
              />
            </div>
          )}
          <div>
            <label className={labelCls}>Status *</label>
            <select
              name="status"
              defaultValue={property?.status || 'for_sale'}
              className={`${inputCls} bg-white`}
            >
              <option value="for_sale">For Sale</option>
              <option value="rental">Rental</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Price (₹) *</label>
            <input
              type="number"
              name="price"
              required
              step="0.01"
              defaultValue={property?.price || ''}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Rating (0-5)</label>
            <input
              type="number"
              name="rating"
              min="0"
              max="5"
              step="0.1"
              defaultValue={property?.rating || ''}
              className={inputCls}
            />
          </div>
        </div>
        <div className="flex gap-6 mt-5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="featured"
              value="true"
              defaultChecked={property?.featured}
              className="rounded"
            />
            <span className="text-sm font-medium text-gray-700">Featured</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="isPopular"
              value="true"
              defaultChecked={property?.isPopular}
              className="rounded"
            />
            <span className="text-sm font-medium text-gray-700">Popular</span>
          </label>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="font-semibold text-black mb-5">Location</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className={labelCls}>Address *</label>
            <input
              type="text"
              name="address"
              required
              defaultValue={property?.address || ''}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>City *</label>
            <input
              type="text"
              name="city"
              required
              defaultValue={property?.city || ''}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>State *</label>
            <input
              type="text"
              name="state"
              required
              defaultValue={property?.state || ''}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Zip Code *</label>
            <input
              type="text"
              name="zipCode"
              required
              defaultValue={property?.zipCode || ''}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Country</label>
            <input
              type="text"
              name="country"
              defaultValue={property?.country || 'India'}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Latitude</label>
            <input
              type="number"
              name="latitude"
              step="any"
              defaultValue={property?.latitude ?? ''}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Longitude</label>
            <input
              type="number"
              name="longitude"
              step="any"
              defaultValue={property?.longitude ?? ''}
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* Property Details */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="font-semibold text-black mb-5">Property Details</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <div>
            <label className={labelCls}>Bedrooms</label>
            <input
              type="number"
              name="bedrooms"
              min="0"
              defaultValue={property?.bedrooms ?? ''}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Bathrooms</label>
            <input
              type="number"
              name="bathrooms"
              min="0"
              step="0.5"
              defaultValue={property?.bathrooms ?? ''}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Square Feet</label>
            <input
              type="number"
              name="squareFeet"
              min="0"
              defaultValue={property?.squareFeet ?? ''}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Year Built</label>
            <input
              type="number"
              name="yearBuilt"
              min="1900"
              max="2100"
              defaultValue={property?.yearBuilt ?? ''}
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="font-semibold text-black mb-5">Images</h2>

        {/* Main Image */}
        <div className="mb-6">
          <label className={labelCls}>Main Image URL</label>
          <div className="flex gap-2">
            <input
              type="url"
              value={mainImage}
              onChange={(e) => setMainImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className={`${inputCls} flex-1`}
            />
            <input
              type="file"
              accept="image/*"
              ref={mainImageInputRef}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleUpload(file, true)
              }}
            />
            <button
              type="button"
              onClick={() => mainImageInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <Upload className="h-4 w-4" />
              Upload
            </button>
          </div>
          {mainImage && (
            <img
              src={mainImage}
              alt="Main"
              className="mt-3 w-32 h-24 object-cover rounded-xl border border-gray-200"
            />
          )}
        </div>

        {/* Gallery */}
        <div>
          <label className={labelCls}>Gallery Images</label>
          <div className="flex flex-wrap gap-3 mb-3">
            {images.map((img, i) => (
              <div key={i} className="relative">
                <img
                  src={img}
                  alt={`Gallery ${i + 1}`}
                  className="w-24 h-20 object-cover rounded-xl border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <input
              type="file"
              accept="image/*"
              ref={galleryInputRef}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleUpload(file, false)
              }}
            />
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              disabled={uploading}
              className="w-24 h-20 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span className="text-xs">Add</span>
            </button>
          </div>
          <textarea
            value={JSON.stringify(images)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value)
                if (Array.isArray(parsed)) setImages(parsed)
              } catch {}
            }}
            placeholder='["https://url1.jpg", "https://url2.jpg"]'
            className={`${inputCls} resize-none text-xs font-mono`}
            rows={2}
          />
          <p className="text-xs text-gray-400 mt-1">
            JSON array of image URLs, or use the upload button above.
          </p>
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <Button
          type="submit"
          disabled={submitting || uploading}
          className="px-8 py-2.5 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-900"
        >
          {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Property'}
        </Button>
      </div>
    </form>
  )
}
