// Default Cloudinary cloud name
const DEFAULT_CLOUD_NAME = 'demo';

export const getCloudinaryConfig = () => {
  const customCloudName = localStorage.getItem('cloudinaryCloudName');
  return {
    cloudName: customCloudName || DEFAULT_CLOUD_NAME,
  };
};

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const { cloudName } = getCloudinaryConfig();
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'ml_default');

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

export const setCloudinaryCloudName = (cloudName: string) => {
  localStorage.setItem('cloudinaryCloudName', cloudName);
};
