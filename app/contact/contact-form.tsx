'use client'

import { useState } from 'react'
import { submitContactAction } from '@/app/actions/contact'
import { Button } from '@/components/ui/button'
import type { Agent } from '@/lib/types'

interface ContactFormProps {
  agents: Agent[]
  selectedAgentId?: string | null
}

export default function ContactForm({ agents, selectedAgentId }: ContactFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ success?: string; error?: string } | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    agentId: selectedAgentId || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setResult(null)
    const fd = new FormData()
    Object.entries(formData).forEach(([k, v]) => fd.append(k, v))
    const res = await submitContactAction(fd)
    setResult(res || null)
    if (res?.success) {
      setFormData({ name: '', email: '', phone: '', subject: '', message: '', agentId: selectedAgentId || '' })
    }
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            placeholder="Your full name"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
            placeholder="your@email.com"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
            placeholder="+91 9820145764"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Agent (Optional)</label>
          <select
            value={formData.agentId}
            onChange={(e) => setFormData((p) => ({ ...p, agentId: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black bg-white"
          >
            <option value="">Any Agent</option>
            {agents.map((agent) => (
              <option key={agent.id} value={String(agent.id)}>
                {agent.firstName} {agent.lastName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
        <input
          type="text"
          value={formData.subject}
          onChange={(e) => setFormData((p) => ({ ...p, subject: e.target.value }))}
          placeholder="How can we help you?"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
        <textarea
          required
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
          placeholder="Tell us more about what you're looking for..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black resize-none"
        />
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className="w-full py-4 rounded-xl text-base font-medium"
        style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}
      >
        {submitting ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  )
}
