/**
 * WhatsApp Integration Utilities
 * Helper functions to dynamically generate wa.me communication triggers.
 */

interface TemplateData {
  name: string;
  seatNumber: string;
  month: string;
  amount: number;
  dueDate: string;
}

/**
 * Format local 10-digit Indian phone numbers to international standard without spaces or symbols.
 */
export const formatPhoneNumber = (phone: string): string => {
  // Strip non-numeric characters
  const cleanNum = phone.replace(/\D/g, '');
  
  if (cleanNum.length === 10) {
    return `91${cleanNum}`;
  }
  
  // If already prefixed with 91, return it
  if (cleanNum.length === 12 && cleanNum.startsWith('91')) {
    return cleanNum;
  }
  
  return cleanNum;
};

/**
 * Replace placeholder tags in fee reminder templates with actual occupant transaction metrics.
 */
export const parseTemplate = (template: string, data: TemplateData): string => {
  let parsed = template;
  
  parsed = parsed.replace(/{name}/g, data.name);
  parsed = parsed.replace(/{seatNumber}/g, data.seatNumber);
  parsed = parsed.replace(/{month}/g, data.month);
  parsed = parsed.replace(/{amount}/g, data.amount.toLocaleString('en-IN'));
  parsed = parsed.replace(/{dueDate}/g, data.dueDate);
  
  return parsed;
};

/**
 * Create a direct touch-friendly wa.me trigger URL.
 */
export const generateWhatsAppLink = (phone: string, text: string): string => {
  const formattedPhone = formatPhoneNumber(phone);
  const encodedText = encodeURIComponent(text);
  
  return `https://wa.me/${formattedPhone}?text=${encodedText}`;
};
