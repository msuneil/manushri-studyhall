/**
 * Lightweight frontend validation helpers for operational forms
 */

export const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  // Basic email structure validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  if (!phone) return false;
  // Basic phone validation (allows +, spaces, and minimum length)
  const cleaned = phone.replace(/[\s-]/g, '');
  return /^(\+?\d{10,15})$/.test(cleaned);
};

export const isRequired = (value: string | number | undefined | null): boolean => {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
};
