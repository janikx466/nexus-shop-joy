// Image compression and optimization utilities

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  type?: 'image/webp' | 'image/jpeg' | 'image/png';
}

/**
 * Compress an image file in the browser
 * Target: max 600px width, WebP format, 200-300KB
 */
export const compressImage = async (
  file: File,
  options: CompressionOptions = {}
): Promise<Blob> => {
  const {
    maxWidth = 600,
    maxHeight = 600,
    quality = 0.7,
    type = 'image/webp',
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      URL.revokeObjectURL(img.src);

      let { width, height } = img;

      // Calculate new dimensions maintaining aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Draw image with high quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob with compression
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        type,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * Create a local blob URL for instant preview
 */
export const createLocalPreview = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * Revoke a blob URL to free memory
 */
export const revokeLocalPreview = (url: string): void => {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};

/**
 * Get optimized Cloudinary URL with transformations
 */
export const getCloudinaryUrl = (
  url: string,
  options: { width?: number; quality?: string } = {}
): string => {
  const { width = 300, quality = 'auto' } = options;

  // Check if it's a Cloudinary URL
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  // Check if it's already transformed
  if (url.includes('/f_auto,') || url.includes('/q_auto,') || url.includes('/w_')) {
    return url;
  }

  // Insert transformations after /upload/
  const parts = url.split('/upload/');
  if (parts.length === 2) {
    return `${parts[0]}/upload/f_auto,q_${quality},w_${width}/${parts[1]}`;
  }

  return url;
};

/**
 * Get thumbnail URL (300px for product cards)
 */
export const getProductCardImage = (url: string): string => {
  return getCloudinaryUrl(url, { width: 300, quality: 'auto' });
};

/**
 * Get detail image URL (600px for product detail)
 */
export const getProductDetailImage = (url: string): string => {
  return getCloudinaryUrl(url, { width: 600, quality: 'auto' });
};

/**
 * Check if URL is a local blob URL (preview)
 */
export const isLocalPreview = (url: string): boolean => {
  return url.startsWith('blob:');
};
