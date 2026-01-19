import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadToCloudinary } from '@/lib/cloudinary';

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  disabled?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onImagesChange,
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (disabled) return;
      
      setUploading(true);
      try {
        const uploadPromises = acceptedFiles.map((file) => uploadToCloudinary(file));
        const uploadedUrls = await Promise.all(uploadPromises);
        onImagesChange([...images, ...uploadedUrls]);
      } catch (error) {
        console.error('Upload error:', error);
      } finally {
        setUploading(false);
      }
    },
    [images, onImagesChange, disabled]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    disabled: disabled || uploading,
  });

  const removeImage = (index: number) => {
    if (disabled) return;
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
          ${isDragActive ? 'border-accent bg-accent/5' : 'border-muted-foreground/30 hover:border-accent'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 text-accent animate-spin mb-2" />
            <p className="text-muted-foreground">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-foreground font-medium">
              {isDragActive ? 'Drop images here' : 'Drag & drop images here'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              or click to select files
            </p>
          </div>
        )}
      </div>

      {/* Image Preview */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          <AnimatePresence>
            {images.map((url, index) => (
              <motion.div
                key={url}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative aspect-square rounded-lg overflow-hidden bg-secondary group"
              >
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {!disabled && (
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                {index === 0 && (
                  <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-accent text-white text-xs rounded-full">
                    Main
                  </span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
