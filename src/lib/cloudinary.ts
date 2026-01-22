import { compressImage } from './imageUtils';

// Default Cloudinary configuration
const DEFAULT_CLOUD_NAME = 'dxvxtluyo';
const UPLOAD_PRESET = 'foxo_unsigned';

export const getCloudinaryConfig = () => {
  const customCloudName = localStorage.getItem('cloudinaryCloudName');
  return {
    cloudName: customCloudName || DEFAULT_CLOUD_NAME,
  };
};

export interface UploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

export interface UploadResult {
  url: string;
  publicId: string;
}

/**
 * Upload image to Cloudinary with compression
 * - Compresses to max 600px, WebP, ~200-300KB before upload
 * - Uses unsigned upload preset
 */
export const uploadToCloudinary = async (
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
  const { cloudName } = getCloudinaryConfig();

  // Compress image before upload - high quality settings
  const compressedBlob = await compressImage(file, {
    maxWidth: 1600,
    maxHeight: 1600,
    quality: 0.82,
    type: 'image/webp',
  });

  const formData = new FormData();
  formData.append('file', compressedBlob, file.name.replace(/\.[^/.]+$/, '.webp'));
  formData.append('upload_preset', UPLOAD_PRESET);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress({
          loaded: event.loaded,
          total: event.total,
          percent: Math.round((event.loaded / event.total) * 100),
        });
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve(data.secure_url);
        } catch {
          reject(new Error('Failed to parse response'));
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
    xhr.send(formData);
  });
};

/**
 * Upload multiple images with progress tracking
 * Returns array of Cloudinary secure URLs
 */
export const uploadMultipleToCloudinary = async (
  files: File[],
  onFileProgress?: (fileIndex: number, progress: UploadProgress) => void,
  onFileComplete?: (fileIndex: number, url: string) => void
): Promise<string[]> => {
  const urls: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const url = await uploadToCloudinary(files[i], (progress) => {
      onFileProgress?.(i, progress);
    });
    urls.push(url);
    onFileComplete?.(i, url);
  }

  return urls;
};

export const setCloudinaryCloudName = (cloudName: string) => {
  localStorage.setItem('cloudinaryCloudName', cloudName);
};
