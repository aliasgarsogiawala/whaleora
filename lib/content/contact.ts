/** WhatsApp number published on whaleora.vercel.app (`wa.me/8169219734`). */
export const WHATSAPP_LOCAL = '8169219734';
export const WHATSAPP_E164 = `91${WHATSAPP_LOCAL}`;

export const whatsappHref = (text: string) =>
  `https://wa.me/${WHATSAPP_E164}?text=${encodeURIComponent(text)}`;
