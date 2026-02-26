import React, { useRef, useState } from "react";
import { Control, Controller } from "react-hook-form";

export interface FileUploadResult {
  file: File;          
  uri: string;         
  name: string;
  type: string;
  width?: number;
  height?: number;
  size: number;
}

interface FileUploadComponentProps {
  control: Control<any>;
  name: string;
  label: string;
  title?: string;
  note?: string;
  error?: string;
  maxSizeMB?: number;
  accept?: string;      
  onFileSelected?: (file: FileUploadResult) => void;
  onError?: (error: string) => void;
}

export default function FileUploadComponent({
  control,
  name,
  label,
  title = "Upload Document",
  note = "PNG, JPG, PDF (max. 5MB)",
  error: externalError,
  maxSizeMB = 5,
  accept = "image/*",
  onFileSelected,
  onError,
}: FileUploadComponentProps) {
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> =>
    new Promise((resolve) => {
      if (!file.type.startsWith("image/")) return resolve({ width: 0, height: 0 });
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
        URL.revokeObjectURL(url);
      };
      img.onerror = () => resolve({ width: 0, height: 0 });
      img.src = url;
    });

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: any) => void
  ) => {
    setLocalError(null);
    if (onError) onError("");

    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      const msg = `File is too big (max ${maxSizeMB}MB)`;
      setLocalError(msg);
      if (onError) onError(msg);
      return;
    }

    const dimensions = await getImageDimensions(file);
    const uri = URL.createObjectURL(file); // for preview

    const result: FileUploadResult = {
      file,
      uri,
      name: file.name,
      type: file.type || "image/jpeg",
      size: file.size,
      ...dimensions,
    };

    onChange(result);
    if (onFileSelected) onFileSelected(result);

    // Reset input so the same file can be re-selected if needed
    e.target.value = "";
  };

  const handleReUpload = (onChange: (value: any) => void) => {
    onChange(null);
    setLocalError(null);
    if (onError) onError("");
  };

  const displayError = externalError || localError;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => {
        const isUploaded = !!value;

        return (
          <div className="mb-4">
            <label className="block text-base font-medium mb-2">{label}</label>

            {/* Hidden file input */}
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              className="hidden"
              onChange={(e) => handleFileChange(e, onChange)}
            />

            {/* Idle state */}
            {!isUploaded && !displayError && (
              <div
                onClick={() => inputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-2xl py-8 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
              >
                <p className="text-gray-800 font-medium mb-1">{title}</p>
                <p className="text-gray-500 text-sm mb-4">{note}</p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                  className="border border-gray-300 px-8 py-2 rounded-xl text-gray-700 hover:bg-gray-50"
                >
                  Upload
                </button>
              </div>
            )}

            {/* Uploaded state */}
            {isUploaded && !displayError && (
              <div className="border-2 border-blue-400 rounded-2xl py-8 flex flex-col items-center bg-blue-50">
                {/* Preview thumbnail */}
                {value?.uri && value.type?.startsWith("image/") && (
                  <img
                    src={value.uri}
                    alt="preview"
                    className="w-16 h-16 object-cover rounded-lg mb-3"
                  />
                )}
                <span className="text-green-600 text-2xl mb-2">✓</span>
                <p className="font-semibold text-blue-600 mb-1">Upload successful</p>
                <p className="text-gray-500 text-sm mb-4">{note}</p>
                <button
                  type="button"
                  onClick={() => handleReUpload(onChange)}
                  className="border border-gray-300 px-8 py-2 rounded-full text-gray-700 hover:bg-gray-100"
                >
                  Re-upload
                </button>
              </div>
            )}

            {/* Error state */}
            {displayError && (
              <div className="border-2 border-red-400 rounded-2xl py-8 flex flex-col items-center bg-red-50">
                <span className="text-red-600 text-2xl mb-2">!</span>
                <p className="font-semibold text-red-600 mb-1">{displayError}</p>
                <p className="text-gray-500 text-sm mb-4">{note}</p>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="border border-red-300 px-8 py-2 rounded-full text-red-700 hover:bg-red-100"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        );
      }}
    />
  );
}