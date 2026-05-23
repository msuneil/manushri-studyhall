import { useRef } from "react";
import { FormLabel } from "./FormAtoms";

interface UploadPlaceholderProps {
  label: string;
  imageUrl?: string;
  onUpload?: (base64: string) => void;
}

export function UploadPlaceholder({
  label,
  imageUrl,
  onUpload,
}: UploadPlaceholderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleContainerClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpload) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Optimize & Square Crop to 256x256 using Canvas
        const canvas = document.createElement("canvas");
        const size = 256;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          // Center crop
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

          // Highly compressed JPEG or WebP representation (~15kb)
          const optimizedBase64 = canvas.toDataURL("image/jpeg", 0.7);
          onUpload(optimizedBase64);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full">
      <FormLabel>{label}</FormLabel>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <div
        onClick={handleContainerClick}
        className={`border-2 border-dashed border-slate-200 bg-slate-50 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all cursor-pointer group relative overflow-hidden ${imageUrl ? "p-0 h-48" : ""}`}
      >
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={label}
              className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
            />
            <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex flex-col items-center gap-2 text-white">
                <svg
                  className="w-6 h-6 animate-pulse"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
                <span className="text-xs font-bold tracking-wider uppercase">
                  Change Logo
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <svg
                className="w-5 h-5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Tap to Upload
              </p>
              <p className="text-[10px] font-medium">
                Auto-Optimized Square Image
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
