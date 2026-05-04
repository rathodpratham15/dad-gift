'use client'

import { motion } from 'framer-motion'
import type { Testimonial } from '@/lib/types'

interface TestimonialCardProps {
  testimonial: Testimonial
}

export default function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={{ y: -5 }}
      className="bg-white p-8 rounded-2xl"
    >
      <p className="text-slate-700 mb-8 text-base leading-relaxed">
        <span className="text-slate-400 mr-1">*</span>
        {testimonial.content}
      </p>
      
      <div className="flex items-center gap-4">
        {testimonial.clientPhoto ? (
          <motion.img
            src={testimonial.clientPhoto}
            alt={testimonial.clientName}
            className="w-14 h-14 rounded-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-base font-semibold">
              {testimonial.clientName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <p className="font-semibold text-slate-900 text-base">{testimonial.clientName}</p>
        </div>
      </div>
    </motion.div>
  )
}
