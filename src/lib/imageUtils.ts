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
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.82,
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
  const { width = 400, quality = 'auto' } = options;

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
    // Handle quality formats like 'auto:good' or 'auto:best'
    const qualityParam = quality.includes(':') ? quality.replace(':', '_') : quality;
    return `${parts[0]}/upload/f_auto,q_${qualityParam},w_${width}/${parts[1]}`;
  }

  return url;
};

/**
 * Get thumbnail URL (400px for product cards)
 */
export const getProductCardImage = (url: string): string => {
  return getCloudinaryUrl(url, { width: 400, quality: 'auto' });
};

/**
 * Get detail image URL (1200px for product detail with best quality)
 */
export const getProductDetailImage = (url: string): string => {
  return getCloudinaryUrl(url, { width: 1200, quality: 'auto:best' });
};

/**
 * Get full preview image URL (1600px for zoom/fullscreen with best quality)
 */
export const getProductFullImage = (url: string): string => {
  return getCloudinaryUrl(url, { width: 1600, quality: 'auto:best' });
};

/**
 * Get order page image URL (300px for order summary)
 */
export const getOrderPageImage = (url: string): string => {
  return getCloudinaryUrl(url, { width: 300, quality: 'auto' });
};

/**
 * Get product page URL
 */
export const getProductUrl = (productId: string): string => {
  return `https://luxre.vercel.app/product/${productId}`;
};

/**
 * Check if URL is a local blob URL (preview)
 */
export const isLocalPreview = (url: string): boolean => {
  return url.startsWith('blob:');
};
