import { useState } from 'react';
import { addMedicalDocument } from '../services/medical-documents';
import type { MedicalDocument } from '../services/medical-documents';

// Cloudinary config
const CLOUDINARY_UPLOAD_PRESET = 'medicare-docs'; // or your actual preset name
const CLOUDINARY_CLOUD_NAME = 'dfgio2k0h'; // Your Cloudinary cloud name
const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/dicom',
];

export function useCloudinaryUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Accept either a browser File or a RN-style file object { uri, name, type, size }
  const uploadDocument = async (
    file: any,
    metadata: Omit<MedicalDocument, 'url' | 'contentType'>
  ) => {
    setError(null);
    const fileType = file.type || file.mime || '';
    if (ALLOWED_TYPES.length && fileType && !ALLOWED_TYPES.includes(fileType)) {
      setError('File type not allowed');
      throw new Error('File type not allowed');
    }
    if (file.size && file.size > MAX_FILE_SIZE) {
      setError('File size exceeds 20MB');
      throw new Error('File size exceeds 20MB');
    }
    setIsUploading(true);
    setProgress(10);
    try {
      const formData = new FormData();
      // React Native: append { uri, name, type }
      if (file.uri) {
        // ensure we provide a filename
        const name = file.name || `upload-${Date.now()}`;
        formData.append('file', { uri: file.uri, name, type: fileType } as any);
      } else {
        // browser File
        formData.append('file', file);
      }
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(CLOUDINARY_API_URL, {
        method: 'POST',
        body: formData,
      });
      setProgress(50);
      const result = await response.json();
      if (!result.secure_url) {
        setError('Upload failed');
        throw new Error('Upload failed');
      }
      setProgress(75);
      // Save metadata to Firestore
      const document = await addMedicalDocument({
        ...metadata,
        url: result.secure_url,
        contentType: fileType,
        metadata: {
          size: file.size || result.bytes,
          originalName: file.name || result.original_filename || '',
          publicId: result.public_id,
          resourceType: result.resource_type,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
        },
      });
      setProgress(100);
      setIsUploading(false);
      return document;
    } catch (err) {
      setIsUploading(false);
      setProgress(0);
      setError('Upload error');
      throw err;
    }
  };

  return {
    uploadDocument,
    isUploading,
    progress,
    error,
  };
}