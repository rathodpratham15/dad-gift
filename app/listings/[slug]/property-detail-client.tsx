'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Property, Testimonial } from '@/lib/types'
import { Bed, Bath, Maximize, MapPin, ArrowLeft, Calendar, Heart, Star, MessageCircle, Navigation, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { createWhatsAppLink } from '@/lib/whatsapp'
import { formatPrice } from '@/lib/utils'
import { submitContactAction } from '@/app/actions/contact'

interface PropertyDetailClientProps {
  property: Property
  similarProperties?: Property[]
  nearbyProperties?: Property[]
  propertyTestimonials?: Testimonial[]
  whatsappNumber?: string
  user?: { firstName: string; role: string } | null
}

export default function PropertyDetailClient({
  property,
  similarProperties = [],
  nearbyProperties = [],
  propertyTestimonials = [],
  whatsappNumber = '+919876543210',
  user,
}: PropertyDetailClientProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const allImages = [
    ...(property.mainImage ? [property.mainImage] : []),
    ...(property.images || []),
  ]
  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)
  const prevImage = () => setLightboxIndex((i) => (i !== null ? (i - 1 + allImages.length) % allImages.length : 0))
  const nextImage = () => setLightboxIndex((i) => (i !== null ? (i + 1) % allImages.length : 0))
  const { toast } = useToast()
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: `Inquiry about ${property.title}`,
    message: `I'm interested in learning more about ${property.title} located at ${property.address}.`,
    agentId: property.agentId?.toString() || '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  useEffect(() => {
    if (lightboxIndex === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevImage()
      if (e.key === 'ArrowRight') nextImage()
      if (e.key === 'Escape') closeLightbox()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxIndex])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0)
    }
    setTimeout(() => setIsVisible(true), 100)
    if (user) {
      fetch(`/api/favorites/${property.id}`)
        .then((r) => r.json())
        .then((data) => setIsFavorited(data.favorited))
        .catch(() => {})
    }
  }, [property.id, user])

  const toggleFavorite = async () => {
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please sign in to save properties.' })
      router.push('/login')
      return
    }
    setFavoriteLoading(true)
    try {
      const res = await fetch(`/api/favorites/${property.id}`, { method: 'POST' })
      const data = await res.json()
      setIsFavorited(data.favorited)
      toast({
        title: data.favorited ? 'Saved!' : 'Removed',
        description: data.favorited ? 'Property saved to favorites.' : 'Property removed from favorites.',
      })
    } catch {
      toast({ title: 'Error', description: 'Could not update favorites.' })
    } finally {
      setFavoriteLoading(false)
    }
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const fd = new FormData()
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v))
      const res = await submitContactAction(fd)
      if (res?.success) {
        setSubmitMessage(res.success)
        setFormData((prev) => ({
          ...prev,
          name: '',
          email: '',
          phone: '',
          message: `I'm interested in learning more about ${property.title} located at ${property.address}.`,
        }))
      } else if (res?.error) {
        setSubmitMessage(res.error)
      } else {
        setSubmitMessage("Thank you! We'll get back to you soon.")
      }
    } catch {
      setSubmitMessage('Failed to send. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const whatsappMessage = `Hi, I'm interested in the property: ${property.title} at ${property.address}. Price: ${formatPrice(property.price)}. Please contact me.`

  return (
    <div className="min-h-screen bg-white">
      {/* Back nav */}
      <div className="pt-24 pb-8 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/listings"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Listings
          </Link>
          <div
            className={`transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-black mb-3">{property.title}</h1>
                <div className="flex items-center gap-2 text-gray-600 mb-3">
                  <MapPin className="h-5 w-5" />
                  <span className="text-lg">
                    {property.address}, {property.city}, {property.state}
                  </span>
                </div>
                {property.overallRating && (
                  <p className="text-amber-600 font-semibold inline-flex items-center gap-1">
                    <Star className="h-5 w-5 fill-current" />
                    {property.overallRating.toFixed(1)} / 5
                    {property.ratingCount ? ` (${property.ratingCount} reviews)` : ''}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 flex-wrap justify-end">
                <p className="text-4xl font-bold text-black">{formatPrice(property.price)}</p>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  property.status === 'for_sale'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {property.status === 'for_sale' ? 'For Sale' : 'Rental'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image gallery */}
      <section className="px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          {allImages.length === 0 ? (
            <div className="aspect-[16/7] rounded-3xl bg-gray-100 flex items-center justify-center text-gray-400">No Images</div>
          ) : (
            <div className={`grid gap-3 ${allImages.length === 1 ? 'grid-cols-1' : 'grid-cols-3'}`} style={{ gridTemplateRows: allImages.length > 1 ? 'repeat(2, 1fr)' : undefined }}>
              {/* Main image — spans full height on left */}
              <div
                className={`relative cursor-pointer overflow-hidden rounded-3xl bg-gray-200 ${allImages.length > 1 ? 'col-span-2 row-span-2' : ''} aspect-[4/3]`}
                onClick={() => openLightbox(0)}
              >
                <img src={allImages[0]} alt={property.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>

              {/* Right side — exactly 2 thumbnails */}
              {allImages.length > 1 && allImages.slice(1, 3).map((img, i) => {
                const isLast = i === 1 && allImages.length > 3
                return (
                  <div
                    key={i}
                    className="relative cursor-pointer overflow-hidden rounded-2xl bg-gray-200"
                    onClick={() => openLightbox(i + 1)}
                  >
                    <img src={img} alt={`${property.title} ${i + 2}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    {isLast && (
                      <div className="absolute inset-0 bg-black/55 flex items-center justify-center rounded-2xl">
                        <span className="text-white text-2xl font-bold">+{allImages.length - 3}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Lightbox */}
        {lightboxIndex !== null && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={closeLightbox}>
            <button onClick={(e) => { e.stopPropagation(); prevImage() }} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center text-xl transition-colors">‹</button>
            <button onClick={(e) => { e.stopPropagation(); nextImage() }} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center text-xl transition-colors">›</button>
            <button onClick={closeLightbox} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors">✕</button>
            <img
              src={allImages[lightboxIndex]}
              alt={`${property.title} ${lightboxIndex + 1}`}
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">{lightboxIndex + 1} / {allImages.length}</div>
          </div>
        )}
      </section>

      {/* Details */}
      <section className="py-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {property.bedrooms && (
                <div className="bg-gray-50 rounded-2xl p-4 text-center">
                  <Bed className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                  <p className="text-2xl font-bold">{property.bedrooms}</p>
                  <p className="text-sm text-gray-600">Bedrooms</p>
                </div>
              )}
              {property.bathrooms && (
                <div className="bg-gray-50 rounded-2xl p-4 text-center">
                  <Bath className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                  <p className="text-2xl font-bold">{property.bathrooms}</p>
                  <p className="text-sm text-gray-600">Bathrooms</p>
                </div>
              )}
              {property.squareFeet && (
                <div className="bg-gray-50 rounded-2xl p-4 text-center">
                  <Maximize className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                  <p className="text-2xl font-bold">{property.squareFeet.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">sq.ft</p>
                </div>
              )}
              {property.yearBuilt && (
                <div className="bg-gray-50 rounded-2xl p-4 text-center">
                  <Calendar className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                  <p className="text-2xl font-bold">{property.yearBuilt}</p>
                  <p className="text-sm text-gray-600">Year Built</p>
                </div>
              )}
              {property.floorNumber != null && (
                <div className="bg-gray-50 rounded-2xl p-4 text-center">
                  <Maximize className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                  <p className="text-2xl font-bold">
                    {property.floorNumber}{property.totalFloors ? `/${property.totalFloors}` : ''}
                  </p>
                  <p className="text-sm text-gray-600">Floor</p>
                </div>
              )}
              {property.parkingSpots != null && (
                <div className="bg-gray-50 rounded-2xl p-4 text-center">
                  <MapPin className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                  <p className="text-2xl font-bold">{property.parkingSpots}</p>
                  <p className="text-sm text-gray-600">Parking</p>
                </div>
              )}
            </div>

            {/* Property Info */}
            {(property.furnishing || property.facing || property.availableFrom) && (
              <div className="flex flex-wrap gap-3 mb-8">
                {property.furnishing && (
                  <span className="px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium capitalize">
                    {property.furnishing.replace(/_/g, ' ')}
                  </span>
                )}
                {property.facing && (
                  <span className="px-4 py-2 rounded-full bg-amber-50 text-amber-700 text-sm font-medium capitalize">
                    {property.facing.replace(/_/g, '-')} facing
                  </span>
                )}
                {property.availableFrom && (
                  <span className="px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-medium">
                    Available from {new Date(property.availableFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
            )}

            {property.description && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed">{property.description}</p>
              </div>
            )}

            {/* Amenities */}
            {(() => {
              const AMENITY_LABELS: Record<string, string> = {
                parking: 'Parking', swimming_pool: 'Swimming Pool', gym: 'Gym',
                garden: 'Garden', security: '24/7 Security', lift: 'Lift / Elevator',
                power_backup: 'Power Backup', club_house: 'Club House', intercom: 'Intercom',
                cctv: 'CCTV', air_conditioning: 'Air Conditioning', modular_kitchen: 'Modular Kitchen',
                play_area: 'Play Area', jogging_track: 'Jogging Track',
                rainwater_harvesting: 'Rainwater Harvesting', solar_panels: 'Solar Panels',
              }
              const active = Object.entries(property.features ?? {}).filter(([, v]) => v)
              if (active.length === 0) return null
              return (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-4">Amenities</h2>
                  <div className="flex flex-wrap gap-2">
                    {active.map(([key]) => (
                      <span key={key} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                        {AMENITY_LABELS[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })()}

            {/* Videos */}
            {property.videos && property.videos.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Videos</h2>
                <div className="space-y-4">
                  {property.videos.map((url, i) => {
                    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
                    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
                    if (ytMatch) {
                      return (
                        <div key={i} className="rounded-2xl overflow-hidden aspect-video">
                          <iframe
                            src={`https://www.youtube.com/embed/${ytMatch[1]}`}
                            className="w-full h-full"
                            title={`Video ${i + 1}`}
                            allowFullScreen
                          />
                        </div>
                      )
                    }
                    if (vimeoMatch) {
                      return (
                        <div key={i} className="rounded-2xl overflow-hidden aspect-video">
                          <iframe
                            src={`https://player.vimeo.com/video/${vimeoMatch[1]}`}
                            className="w-full h-full"
                            title={`Video ${i + 1}`}
                            allowFullScreen
                          />
                        </div>
                      )
                    }
                    return (
                      <video key={i} src={url} controls className="w-full rounded-2xl" />
                    )
                  })}
                </div>
              </div>
            )}

            {/* Map */}
            {property.latitude && property.longitude && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Location</h2>
                <div className="rounded-2xl overflow-hidden border border-gray-200 aspect-[16/9]">
                  <iframe
                    src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${property.latitude},${property.longitude}&zoom=15`}
                    className="w-full h-full"
                    title="Property location"
                    loading="lazy"
                    allowFullScreen
                  />
                </div>
                <div className="mt-3 flex gap-3">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${property.latitude},${property.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-900 transition-colors"
                  >
                    <Navigation className="h-4 w-4" />
                    Get Directions
                  </a>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View on Google Maps
                  </a>
                </div>
              </div>
            )}

            {/* Testimonials */}
            {propertyTestimonials.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Reviews</h2>
                <div className="space-y-4">
                  {propertyTestimonials.slice(0, 3).map((t) => (
                    <div key={t.id} className="bg-gray-50 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-3">
                        {t.clientPhoto && (
                          <img
                            src={t.clientPhoto}
                            alt={t.clientName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <p className="font-semibold">{t.clientName}</p>
                          {t.rating && (
                            <p className="text-amber-500 text-sm">
                              {'★'.repeat(Math.round(t.rating))}
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-700">{t.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contact sidebar */}
          <div>
            <div className="sticky top-24">
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Interested?</h3>
                  <button
                    onClick={toggleFavorite}
                    disabled={favoriteLoading}
                    className={`p-2 rounded-full transition-colors ${
                      isFavorited ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400'
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
                  </button>
                </div>
                {submitMessage ? (
                  <p className="text-green-600 text-sm mb-4 p-3 bg-green-50 rounded-xl">
                    {submitMessage}
                  </p>
                ) : null}
                <form onSubmit={handleContactSubmit} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Your Name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black"
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black"
                  />
                  <input
                    type="tel"
                    placeholder="Your Phone"
                    value={formData.phone}
                    onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black"
                  />
                  <textarea
                    rows={3}
                    placeholder="Message"
                    value={formData.message}
                    onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black resize-none"
                  />
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 rounded-xl"
                    style={{ backgroundColor: '#A8D5E2', color: '#1a1a1a' }}
                  >
                    {submitting ? 'Sending...' : 'Send Inquiry'}
                  </Button>
                </form>
                <a
                  href={createWhatsAppLink(whatsappNumber, whatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-green-500 text-white font-medium text-sm hover:bg-green-600 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nearby properties */}
      {nearbyProperties.length > 0 && (
        <section className="py-12 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-2">Nearby Properties</h2>
            <p className="text-gray-500 text-sm mb-8">Other properties within 15 km</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {nearbyProperties.map((p) => (
                <Link
                  key={p.id}
                  href={`/listings/${p.slug}`}
                  className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
                >
                  {p.mainImage ? (
                    <img src={p.mainImage} alt={p.title} className="w-full h-40 object-cover" />
                  ) : (
                    <div className="w-full h-40 bg-gray-200" />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-sm line-clamp-1">{p.title}</h3>
                    <p className="text-gray-500 text-xs capitalize mb-1">{p.city}, {p.state}</p>
                    <p className="text-black font-bold">{formatPrice(p.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Similar properties */}
      {similarProperties.length > 0 && (
        <section className="py-12 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Similar Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProperties.map((p) => (
                <Link
                  key={p.id}
                  href={`/listings/${p.slug}`}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {p.mainImage && (
                    <img src={p.mainImage} alt={p.title} className="w-full h-40 object-cover" />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-sm">{p.title}</h3>
                    <p className="text-black font-bold">{formatPrice(p.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
