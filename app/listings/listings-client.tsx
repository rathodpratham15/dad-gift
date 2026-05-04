'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Property } from '@/lib/types'
import { Bed, Bath, Maximize, MapPin, Filter, Star, Search, Navigation, MessageCircle, X } from 'lucide-react'
import { motion } from 'framer-motion'

interface Filters {
  search: string | null
  sort: string
  popularOnly: boolean
  propertyType: string | null
  status: string
  city: string | null
  minPrice: string | null
  maxPrice: string | null
  bedrooms: string | null
  latitude?: number | null
  longitude?: number | null
  radiusKm?: number | null
}

interface Props {
  properties: { data: Property[]; meta: { currentPage: number; lastPage: number; perPage: number; total: number } }
  filters: Filters
  cities: string[]
  googleMapsApiKey?: string | null
  defaultMapCenter: { lat: number; lng: number }
}

interface CopilotResponse {
  answer: string
  intent: string
  properties: Array<{ id: number; title: string; slug: string; city: string; why: string[] }>
  trace: { guardrails: string[]; queryTerms: string[]; steps: string[] }
}

declare global { interface Window { google?: any } }

function formatPrice(price: number) {
  const s = Math.floor(price).toString()
  if (s.length <= 3) return `₹${s}`
  return `₹${s.replace(/\B(?=(\d{2})+(?!\d))/g, ',')}`
}

function buildUrl(filters: Filters, page = 1) {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.sort) params.set('sort', filters.sort)
  if (filters.popularOnly) params.set('popularOnly', 'true')
  if (filters.propertyType) params.set('propertyType', filters.propertyType)
  if (filters.status) params.set('status', filters.status)
  if (filters.city) params.set('city', filters.city)
  if (filters.minPrice) params.set('minPrice', filters.minPrice)
  if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
  if (filters.bedrooms) params.set('bedrooms', filters.bedrooms)
  if (filters.latitude != null) params.set('latitude', String(filters.latitude))
  if (filters.longitude != null) params.set('longitude', String(filters.longitude))
  if (filters.radiusKm != null) params.set('radiusKm', String(filters.radiusKm))
  if (page > 1) params.set('page', String(page))
  const qs = params.toString()
  return `/listings${qs ? `?${qs}` : ''}`
}

export default function ListingsClient({ properties, filters, cities, googleMapsApiKey, defaultMapCenter }: Props) {
  const router = useRouter()
  const [showFilters, setShowFilters] = useState(false)
  const [localFilters, setLocalFilters] = useState<Filters>(filters)
  const [searchInput, setSearchInput] = useState(filters.search || '')
  const [isLocating, setIsLocating] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  const [copilotPrompt, setCopilotPrompt] = useState('')
  const [copilotLoading, setCopilotLoading] = useState(false)
  const [copilotResult, setCopilotResult] = useState<CopilotResponse | null>(null)
  const [isCopilotOpen, setIsCopilotOpen] = useState(false)
  const [visibleCards, setVisibleCards] = useState<number[]>([])
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const filtersRef = useRef(localFilters)

  useEffect(() => { filtersRef.current = localFilters }, [localFilters])
  useEffect(() => { setLocalFilters(filters); setSearchInput(filters.search || '') }, [filters])
  useEffect(() => { window.scrollTo(0, 0) }, [])

  useEffect(() => {
    const observers = cardRefs.current.map((ref, index) => {
      if (!ref) return null
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setVisibleCards((p) => Array.from(new Set([...p, index]))) })
      }, { threshold: 0.1 })
      observer.observe(ref)
      return observer
    })
    return () => { observers.forEach((o) => o?.disconnect()) }
  }, [properties.data])

  useEffect(() => {
    if (!googleMapsApiKey) return
    if (window.google?.maps) { setMapReady(true); return }
    const existing = document.getElementById('google-maps-js') as HTMLScriptElement | null
    if (existing) { existing.addEventListener('load', () => setMapReady(true), { once: true }); return }
    const script = document.createElement('script')
    script.id = 'google-maps-js'
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}`
    script.async = true; script.defer = true
    script.onload = () => setMapReady(true)
    document.head.appendChild(script)
  }, [googleMapsApiKey])

  const mapProperties = useMemo(() => properties.data.filter((p) => p.latitude != null && p.longitude != null), [properties.data])
  const mapCenter = useMemo(() => {
    const { latitude: lat, longitude: lng } = localFilters
    return (typeof lat === 'number' && typeof lng === 'number') ? { lat, lng } : defaultMapCenter
  }, [localFilters, defaultMapCenter])

  useEffect(() => {
    if (!mapReady || !window.google?.maps || !mapContainerRef.current) return
    if (!mapRef.current) {
      mapRef.current = new window.google.maps.Map(mapContainerRef.current, { center: mapCenter, zoom: 11, mapTypeControl: false, streetViewControl: false, fullscreenControl: false })
    }
    const map = mapRef.current
    map.setCenter(mapCenter)
    markersRef.current.forEach((m) => m.setMap(null))
    markersRef.current = []
    const bounds = new window.google.maps.LatLngBounds()
    mapProperties.forEach((p) => {
      const position = { lat: Number(p.latitude), lng: Number(p.longitude) }
      const marker = new window.google.maps.Marker({ map, position, title: p.title })
      marker.addListener('click', () => router.push(`/listings/${p.slug}`))
      markersRef.current.push(marker)
      bounds.extend(position)
    })
    if (mapProperties.length > 1) map.fitBounds(bounds, 60)
    else if (mapProperties.length === 1) { map.setCenter({ lat: Number(mapProperties[0].latitude), lng: Number(mapProperties[0].longitude) }); map.setZoom(13) }
  }, [mapReady, mapCenter, mapProperties, router])

  useEffect(() => {
    const normalized = searchInput.trim() || null
    if (normalized === (filters.search || null)) return
    const timer = setTimeout(() => {
      router.push(buildUrl({ ...filtersRef.current, search: normalized }, 1))
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput, filters.search, router])

  const handleFilterChange = (key: keyof Filters, value: string | boolean | number | null) => {
    setLocalFilters((p) => ({ ...p, [key]: value }))
  }

  const applyFilters = () => router.push(buildUrl({ ...localFilters, search: searchInput.trim() || null }, 1))

  const clearFilters = () => {
    const cleared: Filters = { search: null, sort: 'popular', popularOnly: false, propertyType: null, status: 'for_sale', city: null, minPrice: null, maxPrice: null, bedrooms: null, latitude: null, longitude: null, radiusKm: null }
    setLocalFilters(cleared); setSearchInput('')
    router.push('/listings')
  }

  const useMyLocation = () => {
    if (!navigator.geolocation) { alert('Geolocation not supported.'); return }
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6)), lng = Number(pos.coords.longitude.toFixed(6))
        const next: Filters = { ...filtersRef.current, latitude: lat, longitude: lng, radiusKm: filtersRef.current.radiusKm || 25, sort: 'distance' }
        setLocalFilters(next); router.push(buildUrl({ ...next }, 1)); setIsLocating(false)
      },
      () => { alert('Unable to fetch location.'); setIsLocating(false) },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const clearLocation = () => {
    const next: Filters = { ...filtersRef.current, latitude: null, longitude: null, radiusKm: null, sort: filtersRef.current.sort === 'distance' ? 'popular' : filtersRef.current.sort }
    setLocalFilters(next); router.push(buildUrl({ ...next }, 1))
  }

  const askCopilot = async () => {
    const prompt = copilotPrompt.trim()
    if (!prompt) return
    setCopilotLoading(true)
    try {
      const p = new URLSearchParams({ question: prompt, status: localFilters.status || 'for_sale' })
      if (localFilters.city) p.set('city', localFilters.city)
      if (localFilters.minPrice) p.set('minPrice', localFilters.minPrice)
      if (localFilters.maxPrice) p.set('maxPrice', localFilters.maxPrice)
      if (localFilters.bedrooms) p.set('bedrooms', localFilters.bedrooms)
      if (localFilters.latitude != null) p.set('latitude', String(localFilters.latitude))
      if (localFilters.longitude != null) p.set('longitude', String(localFilters.longitude))
      const res = await fetch(`/api/ai/property-copilot?${p}`)
      setCopilotResult(await res.json())
    } catch { alert('Unable to fetch AI recommendations. Please try again.') }
    finally { setCopilotLoading(false) }
  }

  return (
    <div>
      <div className="pt-24 pb-16 px-6" style={{ background: 'linear-gradient(180deg, #A8D5E2 0%, #ffffff 100%)' }}>
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-4 bg-white text-black">All Listings</span>
            <h1 className="text-5xl md:text-6xl font-bold text-black mb-4">Explore Our Properties</h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">Discover your dream home from our curated collection of luxury properties</p>
          </motion.div>

          <div className="max-w-7xl mx-auto">
            <div className="p-4 md:p-5 bg-white/80 backdrop-blur-sm border border-white/60 rounded-2xl shadow-sm mb-4">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="text" value={searchInput} onChange={(e) => { setSearchInput(e.target.value); handleFilterChange('search', e.target.value || null) }} placeholder="Search by title, city, or address" className="w-72 max-w-full pl-9 pr-4 py-2 bg-white rounded-full border border-gray-200 text-sm text-black" />
                  </div>
                  <button onClick={applyFilters} className="px-4 py-2 bg-black text-white rounded-full text-sm hover:bg-black/90 transition-colors">Search</button>
                  <button onClick={useMyLocation} disabled={isLocating} className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-black inline-flex items-center gap-2 hover:bg-gray-50 disabled:opacity-60">
                    <Navigation className="h-4 w-4" />{isLocating ? 'Locating...' : 'Near Me'}
                  </button>
                  {localFilters.latitude && localFilters.longitude && (
                    <button onClick={clearLocation} className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-800 hover:bg-gray-200">Clear Location</button>
                  )}
                </div>
                <p className="text-sm text-gray-700">Showing <span className="font-semibold text-black">{properties.meta.total}</span> properties</p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-300">
                  <Filter className="h-4 w-4" /><span>{showFilters ? 'Hide Filters' : 'Filters'}</span>
                </button>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="text-sm text-gray-700">Radius</label>
                  <select value={localFilters.radiusKm || 25} onChange={(e) => { const v = Number(e.target.value); handleFilterChange('radiusKm', v); if (localFilters.latitude && localFilters.longitude) router.push(buildUrl({ ...localFilters, radiusKm: v }, 1)) }} className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-black">
                    <option value={10}>10 km</option><option value={25}>25 km</option><option value={50}>50 km</option><option value={100}>100 km</option>
                  </select>
                  <label className="text-sm text-gray-700">Sort by</label>
                  <select value={localFilters.sort || 'popular'} onChange={(e) => { const sort = e.target.value; handleFilterChange('sort', sort); router.push(buildUrl({ ...localFilters, sort }, 1)) }} className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-black">
                    <option value="popular">Popular First</option><option value="distance">Nearest to Me</option><option value="latest">Latest</option><option value="price_low">Price: Low to High</option><option value="price_high">Price: High to Low</option><option value="rating_high">Highest Rated</option>
                  </select>
                </div>
              </div>
            </div>

            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="mt-4 p-6 bg-white rounded-2xl shadow-lg grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium mb-2 text-black">Property Type</label>
                  <select value={localFilters.propertyType || ''} onChange={(e) => handleFilterChange('propertyType', e.target.value || null)} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-black">
                    <option value="">All Types</option><option value="house">House</option><option value="shop">Shop</option><option value="godown">Godown</option><option value="land">Land</option><option value="commercial">Commercial</option><option value="other">Other</option>
                  </select></div>
                <div><label className="block text-sm font-medium mb-2 text-black">Status</label>
                  <select value={localFilters.status || 'for_sale'} onChange={(e) => handleFilterChange('status', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-black">
                    <option value="for_sale">For Sale</option><option value="rental">Rental</option>
                  </select></div>
                <div><label className="block text-sm font-medium mb-2 text-black">City</label>
                  <select value={localFilters.city || ''} onChange={(e) => handleFilterChange('city', e.target.value || null)} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-black">
                    <option value="">All Cities</option>{cities.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select></div>
                <div><label className="block text-sm font-medium mb-2 text-black">Bedrooms</label>
                  <select value={localFilters.bedrooms || ''} onChange={(e) => handleFilterChange('bedrooms', e.target.value || null)} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-black">
                    <option value="">Any</option><option value="1">1+</option><option value="2">2+</option><option value="3">3+</option><option value="4">4+</option><option value="5">5+</option>
                  </select></div>
                <div><label className="block text-sm font-medium mb-2 text-black">Min Price</label>
                  <input type="number" value={localFilters.minPrice || ''} onChange={(e) => handleFilterChange('minPrice', e.target.value || null)} placeholder="Min" className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-black" /></div>
                <div><label className="block text-sm font-medium mb-2 text-black">Max Price</label>
                  <input type="number" value={localFilters.maxPrice || ''} onChange={(e) => handleFilterChange('maxPrice', e.target.value || null)} placeholder="Max" className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-black" /></div>
                <div className="flex items-end"><label className="inline-flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={Boolean(localFilters.popularOnly)} onChange={(e) => handleFilterChange('popularOnly', e.target.checked)} className="h-4 w-4" />Popular only</label></div>
                <div className="flex items-end gap-2">
                  <button onClick={applyFilters} className="flex-1 px-4 py-2 bg-black text-white rounded-full hover:bg-black/90 transition-colors">Apply Filters</button>
                  <button onClick={clearFilters} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors">Clear</button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {googleMapsApiKey && (
        <section className="px-6 pb-10 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-black">Map View</h2>
                <p className="text-sm text-gray-600">Location-aware discovery using Google Maps API</p>
              </div>
              <div ref={mapContainerRef} className="w-full h-[340px] bg-gray-100" />
            </div>
          </div>
        </section>
      )}

      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          {properties.data.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {properties.data.map((property, index) => (
                  <Link href={`/listings/${property.slug}`} key={property.id}
                    ref={(el) => { cardRefs.current[index] = el }}
                    className={`group cursor-pointer transition-all duration-700 ${visibleCards.includes(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                    style={{ transitionDelay: `${index * 100}ms` }}>
                    <motion.div className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500" whileHover={{ y: -5 }}>
                      <div className="relative overflow-hidden aspect-[4/3]">
                        {property.mainImage ? (
                          <motion.img src={property.mainImage} alt={property.title} className="w-full h-full object-cover" whileHover={{ scale: 1.1 }} transition={{ duration: 0.7 }} />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center"><span className="text-slate-400">No Image</span></div>
                        )}
                        <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-full shadow-lg"><p className="text-lg font-bold text-black">{formatPrice(property.price)}</p></div>
                        {property.isPopular && <div className="absolute top-4 left-4 bg-rose-500/90 text-white px-3 py-1 rounded-full text-xs font-semibold">Popular</div>}
                      </div>
                      <div className="p-6">
                        <h3 className="text-2xl font-bold text-black mb-2 capitalize group-hover:text-gray-700 transition-colors">{property.title}</h3>
                        {property.overallRating && <p className="text-sm font-medium text-amber-600 mb-2 inline-flex items-center gap-1"><Star className="h-4 w-4 fill-current" />{property.overallRating.toFixed(1)} / 5{property.ratingCount ? ` (${property.ratingCount})` : ''}</p>}
                        <div className="flex items-center gap-2 text-gray-600 mb-2"><MapPin className="h-4 w-4" /><span className="text-sm">{property.address || 'Premium Location'}</span></div>
                        {typeof property.distanceKm === 'number' && <p className="text-xs text-sky-700 mb-4">{property.distanceKm.toFixed(1)} km from your location</p>}
                        <div className="flex items-center gap-6 text-sm text-gray-700">
                          {property.bedrooms && <div className="flex items-center gap-2"><Bed className="h-5 w-5" /><span className="font-medium">{property.bedrooms} Beds</span></div>}
                          {property.bathrooms && <div className="flex items-center gap-2"><Bath className="h-5 w-5" /><span className="font-medium">{property.bathrooms} Baths</span></div>}
                          {property.squareFeet && <div className="flex items-center gap-2"><Maximize className="h-5 w-5" /><span className="font-medium">{property.squareFeet.toLocaleString('en-US')} sq.ft</span></div>}
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>

              {properties.meta.lastPage > 1 && (
                <div className="flex justify-center gap-2 mt-12">
                  {Array.from({ length: properties.meta.lastPage }, (_, i) => i + 1).map((p) => (
                    <Link key={p} href={buildUrl(filters, p)} className={`px-4 py-2 rounded-full transition-colors ${p === properties.meta.currentPage ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{p}</Link>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">No properties found matching your criteria.</p>
              <button onClick={clearFilters} className="px-6 py-3 bg-black text-white rounded-full hover:bg-black/90 transition-colors">Clear filters</button>
            </div>
          )}
        </div>
      </section>

      <button onClick={() => setIsCopilotOpen(true)} className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-black text-white shadow-xl hover:bg-black/90 flex items-center justify-center" aria-label="Open Property Copilot">
        <MessageCircle className="h-6 w-6" />
      </button>

      {isCopilotOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 flex items-end md:items-center md:justify-center" onClick={() => setIsCopilotOpen(false)}>
          <div className="w-full md:max-w-2xl bg-white rounded-t-3xl md:rounded-3xl shadow-2xl p-5 md:p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg md:text-xl font-semibold text-black">Ask Property Copilot</h3>
              <button onClick={() => setIsCopilotOpen(false)} className="h-9 w-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"><X className="h-5 w-5 text-black" /></button>
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <input type="text" value={copilotPrompt} onChange={(e) => setCopilotPrompt(e.target.value)} placeholder="Show me popular family homes under 1 crore in Thane" className="flex-1 rounded-xl border border-sky-200 bg-white px-4 py-3 text-sm text-black" onKeyDown={(e) => e.key === 'Enter' && askCopilot()} />
              <button onClick={askCopilot} disabled={copilotLoading} className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white hover:bg-black/90 disabled:opacity-60">{copilotLoading ? 'Thinking...' : 'Ask'}</button>
            </div>
            {copilotResult && (
              <div className="mt-4 rounded-2xl bg-sky-50/40 p-4 border border-sky-100 max-h-[45vh] overflow-y-auto">
                <p className="text-sm text-black font-medium">{copilotResult.answer}</p>
                {copilotResult.properties?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {copilotResult.properties.map((item) => (
                      <Link key={item.id} href={`/listings/${item.slug}`} className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-900 hover:bg-sky-200" onClick={() => setIsCopilotOpen(false)}>{item.title} · {item.city}</Link>
                    ))}
                  </div>
                )}
                <p className="mt-3 text-xs text-gray-500">Pipeline: {copilotResult.trace?.steps?.join(' -> ') || 'n/a'}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
