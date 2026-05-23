import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "./firebase";

export const storage = getStorage(app);

/**
 * Uploads a file (Blob or File) or a base64 encoded string to Firebase Storage under a clean, structured directory.
 * @param path The storage destination path (e.g., 'halls/UID/logo.png')
 * @param file The File, Blob, or Uint8Array to upload
 */
export const uploadFile = async (path: string, file: Blob | Uint8Array | File): Promise<string> => {
  const fileRef = ref(storage, path);
  const result = await uploadBytes(fileRef, file);
  return getDownloadURL(result.ref);
};

/**
 * Uploads a base64 encoded image string (e.g. from canvas compression) directly to Firebase Storage.
 * @param path The storage destination path
 * @param base64Str The raw base64 data string (can include data URL prefix)
 */
export const uploadBase64Image = async (path: string, base64Str: string): Promise<string> => {
  // Remove potential data URL prefix (e.g. "data:image/png;base64,")
  const base64Data = base64Str.includes(',') ? base64Str.split(',')[1] : base64Str;
  
  // Convert base64 to binary Blob
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'image/png' });
  
  return uploadFile(path, blob);
};

export default storage;
