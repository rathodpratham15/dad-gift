'use client'

import { useState } from 'react'
import type { Property, Contact } from '@/lib/types'
import PropertyCard from '@/components/property-card'
import { Heart, MessageSquare, Calendar, Mail, Phone } from 'lucide-react'

interface DashboardClientProps {
  user: { firstName: string; lastName: string; email: string }
  favorites: Property[]
  inquiries: Contact[]
}

export default function DashboardClient({ user, favorites, inquiries }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'favorites' | 'inquiries'>('favorites')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="pt-24 pb-8 px-6 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-black">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-gray-600 mt-1">{user.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: '#A8D5E2' }}
              >
                <Heart className="h-5 w-5 text-gray-700" />
              </div>
              <p className="text-sm text-gray-600">Saved Properties</p>
            </div>
            <p className="text-3xl font-bold text-black">{favorites.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: '#A8D5E2' }}
              >
                <MessageSquare className="h-5 w-5 text-gray-700" />
              </div>
              <p className="text-sm text-gray-600">Inquiries Sent</p>
            </div>
            <p className="text-3xl font-bold text-black">{inquiries.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-1 bg-white rounded-2xl p-1 shadow-sm mb-8 w-fit">
            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'favorites'
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Saved Properties
            </button>
            <button
              onClick={() => setActiveTab('inquiries')}
              className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'inquiries'
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              My Inquiries
            </button>
          </div>

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div>
              {favorites.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl">
                  <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No saved properties yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Browse listings and click the heart icon to save properties you love.
                  </p>
                  <a
                    href="/listings"
                    className="inline-flex px-6 py-3 rounded-xl font-medium text-white text-sm"
                    style={{ backgroundColor: '#1a1a1a' }}
                  >
                    Browse Listings
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favorites.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Inquiries Tab */}
          {activeTab === 'inquiries' && (
            <div>
              {inquiries.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No inquiries yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Contact us about a property to see your inquiries here.
                  </p>
                  <a
                    href="/contact"
                    className="inline-flex px-6 py-3 rounded-xl font-medium text-white text-sm"
                    style={{ backgroundColor: '#1a1a1a' }}
                  >
                    Contact Us
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  {inquiries.map((inquiry) => (
                    <div key={inquiry.id} className="bg-white rounded-2xl p-6 shadow-sm">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="font-semibold text-black">
                            {inquiry.subject || 'Property Inquiry'}
                          </h3>
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(inquiry.createdAt).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            inquiry.status === 'new'
                              ? 'bg-blue-50 text-blue-600'
                              : inquiry.status === 'replied'
                              ? 'bg-green-50 text-green-600'
                              : inquiry.status === 'archived'
                              ? 'bg-gray-100 text-gray-500'
                              : 'bg-amber-50 text-amber-600'
                          }`}
                        >
                          {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{inquiry.message}</p>
                      {inquiry.adminResponse && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-xl border-l-4 border-[#A8D5E2]">
                          <p className="text-xs font-semibold text-gray-500 mb-1">
                            Response from our team:
                          </p>
                          <p className="text-sm text-gray-700">{inquiry.adminResponse}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
