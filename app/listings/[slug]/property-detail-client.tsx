'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Property, Testimonial } from '@/lib/types'
import { Bed, Bath, Maximize, MapPin, ArrowLeft, Calendar, Heart, Star, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { createWhatsAppLink } from '@/lib/whatsapp'
import { formatPrice } from '@/lib/utils'
import { submitContactAction } from '@/app/actions/contact'

interface PropertyDetailClientProps {
  property: Property
  similarProperties?: Property[]
  propertyTestimonials?: Testimonial[]
  whatsappNumber?: string
  user?: { firstName: string; role: string } | null
}

export default function PropertyDetailClient({
  property,
  similarProperties = [],
  propertyTestimonials = [],
  whatsappNumber = '+919876543210',
  user,
}: PropertyDetailClientProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
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
              <div className="text-right">
                <p className="text-4xl font-bold text-black">{formatPrice(property.price)}</p>
                <p className="text-gray-600 capitalize mt-1">{property.status.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image gallery */}
      <section className="px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-gray-200">
              {property.mainImage ? (
                <img
                  src={property.mainImage}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>
            {property.images?.slice(0, 1).map((img, i) => (
              <div key={i} className="aspect-[4/3] rounded-3xl overflow-hidden bg-gray-200">
                <img
                  src={img}
                  alt={`${property.title} ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
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
            </div>

            {property.description && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed">{property.description}</p>
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
