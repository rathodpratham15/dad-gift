'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import type { Property } from '@/lib/types'
import { Upload, X, MapPin, Loader2 } from 'lucide-react'

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
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null)
  const [urlInput, setUrlInput] = useState('')
  const [geocoding, setGeocoding] = useState(false)
  const [mainImage, setMainImage] = useState(property?.mainImage || '')
  const [images, setImages] = useState<string[]>(property?.images || [])
  const [videos, setVideos] = useState<string[]>(property?.videos || [])
  const [videoInput, setVideoInput] = useState('')
  const [propertyType, setPropertyType] = useState<string>(property?.propertyType || 'house')
  const initPrice = (() => {
    const p = property?.price
    if (!p) return { unit: 'lacs' as const, display: '' }
    if (p >= 10000000) return { unit: 'crores' as const, display: String(+(p / 10000000).toFixed(4)) }
    return { unit: 'lacs' as const, display: String(+(p / 100000).toFixed(4)) }
  })()
  const [priceUnit, setPriceUnit] = useState<'lacs' | 'crores'>(initPrice.unit)
  const [priceDisplay, setPriceDisplay] = useState(initPrice.display)
  const [lat, setLat] = useState<string>(property?.latitude?.toString() ?? '')
  const [lng, setLng] = useState<string>(property?.longitude?.toString() ?? '')
  const [amenities, setAmenities] = useState<Record<string, boolean>>(() => {
    const saved = (property?.features ?? {}) as Record<string, boolean>
    return saved
  })
  const mainImageInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleUpload = async (file: File, isMain: boolean) => {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail ?? data.error ?? 'Upload failed')
    if (!data.url) throw new Error('No URL returned')
    if (isMain) setMainImage(data.url)
    else setImages((prev) => [...prev, data.url])
  }

  const handleGalleryFiles = async (files: FileList) => {
    const fileArr = Array.from(files)
    setUploading(true)
    setUploadProgress({ done: 0, total: fileArr.length })
    const errors: string[] = []
    for (let i = 0; i < fileArr.length; i++) {
      try {
        await handleUpload(fileArr[i], false)
        setUploadProgress({ done: i + 1, total: fileArr.length })
      } catch {
        errors.push(fileArr[i].name)
      }
    }
    if (errors.length) setResult({ error: `Failed to upload: ${errors.join(', ')}` })
    setUploading(false)
    setUploadProgress(null)
  }

  const handleAddUrls = () => {
    const urls = urlInput
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.startsWith('http'))
    if (urls.length === 0) return
    setImages((prev) => [...prev, ...urls])
    setUrlInput('')
  }

  const handleGeocode = async () => {
    const form = formRef.current
    if (!form) return
    const address = (form.elements.namedItem('address') as HTMLInputElement)?.value?.trim()
    const city = (form.elements.namedItem('city') as HTMLInputElement)?.value?.trim()
    const state = (form.elements.namedItem('state') as HTMLInputElement)?.value?.trim()
    const zip = (form.elements.namedItem('zipCode') as HTMLInputElement)?.value?.trim()
    const country = (form.elements.namedItem('country') as HTMLInputElement)?.value?.trim()
    const fullAddress = [address, city, state, zip, country].filter(Boolean).join(', ')
    if (!fullAddress) {
      setResult({ error: 'Fill in at least one address field before auto-detecting coordinates.' })
      return
    }
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!key) {
      setResult({ error: 'Google Maps API key not configured (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY).' })
      return
    }
    setGeocoding(true)
    setResult(null)
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${key}`
      )
      const data = await res.json()
      if (data.status === 'OK' && data.results[0]) {
        const { lat: gLat, lng: gLng } = data.results[0].geometry.location
        setLat(gLat.toString())
        setLng(gLng.toString())
      } else {
        setResult({ error: 'Could not find coordinates for this address. Please enter them manually.' })
      }
    } catch {
      setResult({ error: 'Geocoding failed. Please try again.' })
    } finally {
      setGeocoding(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setResult(null)
    const fd = new FormData(e.currentTarget)
    fd.set('mainImage', mainImage)
    fd.set('images', JSON.stringify(images))
    fd.set('videos', JSON.stringify(videos))
    fd.set('features', JSON.stringify(amenities))
    const multiplier = priceUnit === 'crores' ? 10000000 : 100000
    fd.set('price', priceDisplay ? String(parseFloat(priceDisplay) * multiplier) : '')
    const res = await action(fd)
    if (res) setResult(res)
    setSubmitting(false)
  }

  const inputCls =
    'w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors'
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
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
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="villa">Villa</option>
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
            <label className={labelCls}>Price *</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={priceDisplay}
                onChange={(e) => setPriceDisplay(e.target.value)}
                required
                step="0.01"
                min="0"
                placeholder={priceUnit === 'crores' ? 'e.g. 1.25' : 'e.g. 75'}
                className={`${inputCls} flex-1`}
              />
              <select
                value={priceUnit}
                onChange={(e) => setPriceUnit(e.target.value as 'lacs' | 'crores')}
                className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-black transition-colors"
              >
                <option value="lacs">Lacs (₹)</option>
                <option value="crores">Crores (₹)</option>
              </select>
            </div>
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
        </div>

        {/* Coordinates */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <label className={`${labelCls} mb-0`}>Coordinates</label>
            <button
              type="button"
              onClick={handleGeocode}
              disabled={geocoding}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-60"
            >
              {geocoding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
              {geocoding ? 'Detecting…' : 'Auto-detect from address'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Latitude</label>
              <input
                type="number"
                name="latitude"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className={inputCls}
                placeholder="e.g. 28.6139"
              />
            </div>
            <div>
              <label className={labelCls}>Longitude</label>
              <input
                type="number"
                name="longitude"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className={inputCls}
                placeholder="e.g. 77.2090"
              />
            </div>
          </div>
          {lat && lng && (
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              Pinned at {parseFloat(lat).toFixed(5)}, {parseFloat(lng).toFixed(5)}
            </p>
          )}
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
          <div>
            <label className={labelCls}>Floor No.</label>
            <input type="number" name="floorNumber" min="0" defaultValue={property?.floorNumber ?? ''} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Total Floors</label>
            <input type="number" name="totalFloors" min="1" defaultValue={property?.totalFloors ?? ''} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Parking Spots</label>
            <input type="number" name="parkingSpots" min="0" defaultValue={property?.parkingSpots ?? ''} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Furnishing</label>
            <select name="furnishing" defaultValue={property?.furnishing ?? ''} className={`${inputCls} bg-white`}>
              <option value="">Not specified</option>
              <option value="unfurnished">Unfurnished</option>
              <option value="semi_furnished">Semi-furnished</option>
              <option value="fully_furnished">Fully Furnished</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Facing</label>
            <select name="facing" defaultValue={property?.facing ?? ''} className={`${inputCls} bg-white`}>
              <option value="">Not specified</option>
              <option value="north">North</option>
              <option value="south">South</option>
              <option value="east">East</option>
              <option value="west">West</option>
              <option value="north_east">North-East</option>
              <option value="north_west">North-West</option>
              <option value="south_east">South-East</option>
              <option value="south_west">South-West</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Available From</label>
            <input
              type="date"
              name="availableFrom"
              defaultValue={property?.availableFrom ? new Date(property.availableFrom).toISOString().split('T')[0] : ''}
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* Videos */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="font-semibold text-black mb-5">Videos</h2>
        <div className="space-y-3 mb-3">
          {videos.map((url, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="flex-1 text-sm text-gray-700 truncate bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">{url}</span>
              <button
                type="button"
                onClick={() => setVideos((prev) => prev.filter((_, idx) => idx !== i))}
                className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="url"
            value={videoInput}
            onChange={(e) => setVideoInput(e.target.value)}
            placeholder="YouTube or Vimeo URL"
            className={`${inputCls} flex-1`}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                if (videoInput.trim().startsWith('http')) {
                  setVideos((prev) => [...prev, videoInput.trim()])
                  setVideoInput('')
                }
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              if (videoInput.trim().startsWith('http')) {
                setVideos((prev) => [...prev, videoInput.trim()])
                setVideoInput('')
              }
            }}
            disabled={!videoInput.trim()}
            className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-black transition-colors disabled:opacity-40"
          >
            Add
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">Supports YouTube, Vimeo, or direct video URLs.</p>
      </div>

      {/* Amenities */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="font-semibold text-black mb-5">Amenities</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {[
            { key: 'parking', label: 'Parking' },
            { key: 'swimming_pool', label: 'Swimming Pool' },
            { key: 'gym', label: 'Gym' },
            { key: 'garden', label: 'Garden' },
            { key: 'security', label: '24/7 Security' },
            { key: 'lift', label: 'Lift / Elevator' },
            { key: 'power_backup', label: 'Power Backup' },
            { key: 'club_house', label: 'Club House' },
            { key: 'intercom', label: 'Intercom' },
            { key: 'cctv', label: 'CCTV' },
            { key: 'air_conditioning', label: 'Air Conditioning' },
            { key: 'modular_kitchen', label: 'Modular Kitchen' },
            { key: 'play_area', label: 'Play Area' },
            { key: 'jogging_track', label: 'Jogging Track' },
            { key: 'rainwater_harvesting', label: 'Rainwater Harvesting' },
            { key: 'solar_panels', label: 'Solar Panels' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={!!amenities[key]}
                onChange={(e) => setAmenities((prev) => ({ ...prev, [key]: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
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

          {/* Thumbnails */}
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
              multiple
              ref={galleryInputRef}
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) handleGalleryFiles(e.target.files)
                e.target.value = ''
              }}
            />
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              disabled={uploading}
              className="w-24 h-20 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors disabled:opacity-50"
            >
              {uploadProgress ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-xs">{uploadProgress.done}/{uploadProgress.total}</span>
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  <span className="text-xs">Upload</span>
                </>
              )}
            </button>
          </div>

          {/* Paste URLs */}
          <div className="mt-3">
            <label className="block text-xs font-medium text-gray-500 mb-1">Paste image URLs (one per line)</label>
            <div className="flex gap-2">
              <textarea
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder={"https://example.com/image1.jpg\nhttps://example.com/image2.jpg"}
                className={`${inputCls} resize-none text-xs flex-1`}
                rows={3}
              />
              <button
                type="button"
                onClick={handleAddUrls}
                disabled={!urlInput.trim()}
                className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-black transition-colors disabled:opacity-40 self-end"
              >
                Add
              </button>
            </div>
          </div>
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
