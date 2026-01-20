import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Check, Image as ImageIcon } from 'lucide-react';
import { uploadToCloudinary, UploadProgress } from '@/lib/cloudinary';
import { createLocalPreview, revokeLocalPreview, isLocalPreview } from '@/lib/imageUtils';

interface ImageItem {
  id: string;
  url: string;
  isUploading: boolean;
  progress: number;
  isLocal: boolean;
}

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
  const [imageItems, setImageItems] = useState<ImageItem[]>(() =>
    images.map((url, i) => ({
      id: `existing-${i}`,
      url,
      isUploading: false,
      progress: 100,
      isLocal: false,
    }))
  );
  const nextIdRef = useRef(0);

  // Sync external images prop with internal state (for edit mode)
  React.useEffect(() => {
    const currentUrls = imageItems.filter(item => !item.isLocal).map(item => item.url);
    const hasChanged = images.length !== currentUrls.length || 
      images.some((url, i) => currentUrls[i] !== url);
    
    if (hasChanged && images.length > 0 && imageItems.length === 0) {
      setImageItems(
        images.map((url, i) => ({
          id: `existing-${i}`,
          url,
          isUploading: false,
          progress: 100,
          isLocal: false,
        }))
      );
    }
  }, [images]);

  const uploadFile = async (file: File, itemId: string) => {
    try {
      const cloudinaryUrl = await uploadToCloudinary(file, (progress: UploadProgress) => {
        setImageItems((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? { ...item, progress: progress.percent }
              : item
          )
        );
      });

      // Replace local preview with Cloudinary URL
      setImageItems((prev) => {
        const updated = prev.map((item) => {
          if (item.id === itemId) {
            // Revoke old blob URL
            if (item.isLocal) {
              revokeLocalPreview(item.url);
            }
            return {
              ...item,
              url: cloudinaryUrl,
              isUploading: false,
              progress: 100,
              isLocal: false,
            };
          }
          return item;
        });

        // Update parent with final URLs
        const finalUrls = updated.filter((item) => !item.isLocal).map((item) => item.url);
        onImagesChange(finalUrls);

        return updated;
      });
    } catch (error) {
      console.error('Upload error:', error);
      // Remove failed upload
      setImageItems((prev) => {
        const item = prev.find((i) => i.id === itemId);
        if (item?.isLocal) {
          revokeLocalPreview(item.url);
        }
        return prev.filter((i) => i.id !== itemId);
      });
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (disabled) return;

      // Create instant local previews
      const newItems: ImageItem[] = acceptedFiles.map((file) => {
        const id = `upload-${nextIdRef.current++}`;
        const localUrl = createLocalPreview(file);
        return {
          id,
          url: localUrl,
          isUploading: true,
          progress: 0,
          isLocal: true,
        };
      });

      setImageItems((prev) => [...prev, ...newItems]);

      // Start background uploads
      acceptedFiles.forEach((file, index) => {
        uploadFile(file, newItems[index].id);
      });
    },
    [disabled, onImagesChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    disabled,
  });

  const removeImage = (itemId: string) => {
    if (disabled) return;

    setImageItems((prev) => {
      const item = prev.find((i) => i.id === itemId);
      if (item?.isLocal) {
        revokeLocalPreview(item.url);
      }

      const updated = prev.filter((i) => i.id !== itemId);
      const finalUrls = updated.filter((i) => !i.isLocal).map((i) => i.url);
      onImagesChange(finalUrls);

      return updated;
    });
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

        <div className="flex flex-col items-center">
          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-foreground font-medium">
            {isDragActive ? 'Drop images here' : 'Drag & drop images here'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            or click to select files
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Images are compressed to WebP (~300KB) before upload
          </p>
        </div>
      </div>

      {/* Image Preview Grid */}
      {imageItems.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          <AnimatePresence mode="popLayout">
            {imageItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                layout
                className="relative aspect-square rounded-lg overflow-hidden bg-secondary group"
              >
                <img
                  src={item.url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />

                {/* Upload Progress Overlay */}
                {item.isUploading && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                    <div className="w-3/4 h-1.5 bg-white/30 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-accent rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${item.progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <span className="text-white text-xs mt-1.5 font-medium">
                      {item.progress}%
                    </span>
                  </div>
                )}

                {/* Upload Complete Indicator */}
                {!item.isUploading && !item.isLocal && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 left-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <Check className="h-3 w-3 text-white" />
                  </motion.div>
                )}

                {/* Remove Button */}
                {!disabled && !item.isUploading && (
                  <button
                    onClick={() => removeImage(item.id)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

                {/* Main Badge */}
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
