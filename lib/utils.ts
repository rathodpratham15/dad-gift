import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function formatPrice(price: number): string {
  const priceStr = Math.floor(price).toString()
  if (priceStr.length <= 3) return `₹${priceStr}`
  const formatted = priceStr.replace(/\B(?=(\d{2})+(?!\d))/g, ',')
  return `₹${formatted}`
}
