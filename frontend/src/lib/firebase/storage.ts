import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "./firebase";

export const storage = getStorage(app);

/**
 * Path Sanitizer.
 * Safely strips dangerous characters and replaces spaces with dashes.
 */
export const sanitizePathSegment = (segment: string): string => {
  if (!segment) return 'unnamed';
  return segment
    .trim()
    .replace(/[\s\/\\]+/g, '-') // Replace spaces/slashes with a clean dash
    .replace(/[^a-zA-Z0-9\._-]/g, '') // Strip dangerous symbols
    .toLowerCase();
};

/**
 * Formats a fully sanitized storage destination path.
 */
export const getSanitizedStoragePath = (hallId: string, folder: string, filename: string): string => {
  const cleanHall = sanitizePathSegment(hallId);
  const cleanFolder = sanitizePathSegment(folder);
  const cleanFilename = sanitizePathSegment(filename);
  return `halls/${cleanHall}/${cleanFolder}/${cleanFilename}`;
};

/**
 * Image Upload Validation (Size & MIME type guards).
 */
export const validateImageUpload = (
  file: Blob | File | string,
  maxSizeInBytes: number,
  allowedTypes: string[] = ['image/png', 'image/jpeg', 'image/webp']
): { valid: boolean; error?: string } => {
  if (typeof file === 'string') {
    // Estimating base64 payload size
    const base64Data = file.includes(',') ? file.split(',')[1] : file;
    const paddingCount = (base64Data.match(/=/g) || []).length;
    const estimatedSize = (base64Data.length * 0.75) - paddingCount;

    if (estimatedSize > maxSizeInBytes) {
      const maxMb = (maxSizeInBytes / (1024 * 1024)).toFixed(1);
      return { valid: false, error: `Image size exceeds the ${maxMb}MB limit.` };
    }

    if (file.startsWith('data:')) {
      const mimeMatch = file.match(/^data:([^;]+);/);
      if (mimeMatch) {
        const mimeType = mimeMatch[1];
        if (!allowedTypes.includes(mimeType)) {
          return { valid: false, error: `Unsupported image format. Allowed: PNG, JPG, WEBP` };
        }
      }
    }
    return { valid: true };
  } else {
    // Blob or File validation
    if (file.size > maxSizeInBytes) {
      const maxMb = (maxSizeInBytes / (1024 * 1024)).toFixed(1);
      return { valid: false, error: `Image size exceeds the ${maxMb}MB limit.` };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: `Unsupported image format. Allowed: PNG, JPG, WEBP` };
    }
    return { valid: true };
  }
};

/**
 * Uploads a file (Blob or File) to Firebase Storage under a clean, sanitized path with network offline guards.
 */
export const uploadFile = async (path: string, file: Blob | Uint8Array | File): Promise<string> => {
  if (!navigator.onLine) {
    throw new Error('Connection offline. Please check your network and try again.');
  }

  try {
    const fileRef = ref(storage, path);
    const result = await uploadBytes(fileRef, file);
    return await getDownloadURL(result.ref);
  } catch (err: any) {
    console.error('Firebase Storage upload failed:', err);
    if (err?.code === 'storage/unauthorized') {
      throw new Error('Access Denied. You do not have permissions to write to Storage.');
    }
    if (err?.code === 'storage/retry-limit-exceeded') {
      throw new Error('Upload interrupted due to network instability. Please retry.');
    }
    throw new Error(err?.message || 'Storage upload failed due to a network error.');
  }
};

/**
 * Uploads a base64 encoded image string safely by converting to Blob first, preserving size and type guards.
 */
export const uploadBase64Image = async (path: string, base64Str: string): Promise<string> => {
  // Remove data URL prefix
  const base64Data = base64Str.includes(',') ? base64Str.split(',')[1] : base64Str;
  
  // Extract correct type or fallback to image/png
  let mimeType = 'image/png';
  if (base64Str.startsWith('data:')) {
    const mimeMatch = base64Str.match(/^data:([^;]+);/);
    if (mimeMatch) {
      mimeType = mimeMatch[1];
    }
  }

  // Convert base64 to binary Blob
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });

  return uploadFile(path, blob);
};

export default storage;
