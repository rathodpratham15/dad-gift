import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer-new'
import ContactForm from './contact-form'
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react'
import { createWhatsAppLink } from '@/lib/whatsapp'

export const metadata: Metadata = { title: 'Contact Us' }

interface PageProps {
  searchParams: Promise<Record<string, string>>
}

export default async function ContactPage({ searchParams }: PageProps) {
  const params = await searchParams
  const session = await auth()
  const user = session?.user
    ? { firstName: (session.user as any).firstName, role: (session.user as any).role }
    : null

  const agentsRaw = await prisma.agent.findMany({
    where: { isActive: true },
    orderBy: { firstName: 'asc' },
  })

  const agents = agentsRaw.map((a) => ({
    ...a,
    specialties: (a.specialties as string[]) || [],
    socialLinks: a.socialLinks as Record<string, string> | null,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  }))

  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+919820145764'
  const whatsappLink = createWhatsAppLink(whatsappNumber, "Hi, I'd like to inquire about a property.")

  return (
    <div className="min-h-screen bg-white">
      <Navbar user={user} />

      {/* Hero */}
      <section
        className="pt-32 pb-16 px-6"
        style={{ background: 'linear-gradient(135deg, #A8D5E2 0%, #e8f4f8 50%, #ffffff 100%)' }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <span
            className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-6"
            style={{ backgroundColor: 'rgba(255,255,255,0.8)', color: '#1a1a1a' }}
          >
            Get in Touch
          </span>
          <h1 className="text-5xl md:text-6xl font-bold text-black mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have a question or ready to start your property journey? We&apos;re here to help.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div>
            <h2 className="text-3xl font-bold text-black mb-8">Our Office</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#A8D5E2' }}
                >
                  <MapPin className="h-6 w-6 text-gray-700" />
                </div>
                <div>
                  <p className="font-semibold text-black mb-1">Address</p>
                  <p className="text-gray-600 leading-relaxed">
                    Shop No.3, Shree Ganesh Real Estate Consultants,
                    <br />
                    Below Casa Pieadade Building,
                    <br />
                    Opposite Shiv Sena Shaka,
                    <br />
                    Charai, Thane West, 400601
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#A8D5E2' }}
                >
                  <Phone className="h-6 w-6 text-gray-700" />
                </div>
                <div>
                  <p className="font-semibold text-black mb-1">Phone</p>
                  <a
                    href="tel:+919820145764"
                    className="text-gray-600 hover:text-black transition-colors"
                  >
                    +91 9820145764
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#A8D5E2' }}
                >
                  <Mail className="h-6 w-6 text-gray-700" />
                </div>
                <div>
                  <p className="font-semibold text-black mb-1">Email</p>
                  <a
                    href="mailto:shreeganes909@gmail.com"
                    className="text-gray-600 hover:text-black transition-colors block"
                  >
                    shreeganes909@gmail.com
                  </a>
                  <a
                    href="mailto:shreeganes009@rediffmail.com"
                    className="text-gray-600 hover:text-black transition-colors block"
                  >
                    shreeganes009@rediffmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#A8D5E2' }}
                >
                  <Clock className="h-6 w-6 text-gray-700" />
                </div>
                <div>
                  <p className="font-semibold text-black mb-1">Office Hours</p>
                  <p className="text-gray-600">Monday - Sunday: 11AM - 8PM</p>
                </div>
              </div>
            </div>

            {/* WhatsApp */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-green-500 text-white font-medium hover:bg-green-600 transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              Chat on WhatsApp
            </a>

            {/* Map embed placeholder */}
            <div className="mt-8 rounded-3xl overflow-hidden aspect-video bg-gray-100">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3767.383!2d72.9634!3d19.1959!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDExJzQ1LjIiTiA3MsKwNTgnNDguMiJF!5e0!3m2!1sen!2sin!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Form */}
          <div>
            <h2 className="text-3xl font-bold text-black mb-8">Send a Message</h2>
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
              <ContactForm agents={agents as any} selectedAgentId={params.agentId || null} />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
