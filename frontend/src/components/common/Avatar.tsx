
import { useState, useEffect } from 'react';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  name: string;
  imageUrl?: string; // Architecture future-ready prop
  size?: AvatarSize;
  className?: string;
}

// Curated flat operational color palette with strong white contrast
const AVATAR_COLORS = [
  'bg-indigo-600 text-white',
  'bg-blue-600 text-white',
  'bg-emerald-600 text-white',
  'bg-teal-600 text-white',
  'bg-amber-700 text-white', // Darker amber for robust contrast accessibility
  'bg-violet-600 text-white',
  'bg-slate-600 text-white',
];

// Deterministic flat color selection based on occupant name
export function getDeterministicColor(name: string): string {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

// Parse initials according to:
// - first-name initial + last-name initial
// - ignore middle names
// - single-word names use single initial
export function getInitials(name: string): string {
  if (!name) return '?';
  const cleaned = name.trim().replace(/\s+/g, ' ');
  const parts = cleaned.split(' ');
  
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  
  const firstInitial = parts[0][0];
  const lastInitial = parts[parts.length - 1][0];
  return (firstInitial + lastInitial).toUpperCase();
}

const SIZE_MAP: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-[10px] font-black',
  sm: 'w-8 h-8 text-xs font-black',
  md: 'w-12 h-12 text-sm font-black',
  lg: 'w-16 h-16 text-xl font-black',
  xl: 'w-24 h-24 text-3xl font-black',
};

export function Avatar({ name, imageUrl, size = 'md', className = '' }: AvatarProps) {
  const [hasError, setHasError] = useState(false);
  const initials = getInitials(name);
  const colorClass = getDeterministicColor(name);
  const sizeClass = SIZE_MAP[size];

  // Reset error state if the imageUrl prop changes
  useEffect(() => {
    setHasError(false);
  }, [imageUrl]);

  if (imageUrl && !hasError) {
    return (
      <img
        src={imageUrl}
        alt={name}
        onError={() => setHasError(true)}
        className={`object-cover rounded-full shrink-0 select-none shadow-xs ${sizeClass} ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full shrink-0 select-none shadow-xs uppercase tracking-wider ${sizeClass} ${colorClass} ${className}`}
      title={name}
    >
      {initials}
    </div>
  );
}
