export function formatWhatsAppNumber(phone: string): string {
  return phone.replace(/[^\d+]/g, '')
}

export function createWhatsAppLink(phoneNumber: string, message: string): string {
  const formattedNumber = formatWhatsAppNumber(phoneNumber)
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${formattedNumber}?text=${encodedMessage}`
}
