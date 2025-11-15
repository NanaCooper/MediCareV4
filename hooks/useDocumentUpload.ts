import { useState } from 'react';
import { addMedicalDocument } from '../services/medical-documents';
import type { MedicalDocument } from '../services/medical-documents';

// Example using ImgBB as a free image hosting service
// You should get an API key from https://api.imgbb.com/
const IMGBB_API_KEY = 'YOUR_IMGBB_API_KEY';

export function useDocumentUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadDocument = async (
    file: File,
    metadata: Omit<MedicalDocument, 'url' | 'contentType'>
  ) => {
    try {
      setIsUploading(true);
      setProgress(10);

      // Create form data for ImgBB
      const formData = new FormData();
      formData.append('image', file);
      
      // Upload to ImgBB
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData,
      });

      setProgress(50);

      const result = await response.json();
      if (!result.success) {
        throw new Error('Upload failed');
      }

      setProgress(75);

      // Add document metadata to Firestore
      const document = await addMedicalDocument({
        ...metadata,
        url: result.data.url,
        contentType: file.type,
        metadata: {
          size: file.size,
          originalName: file.name,
          displayUrl: result.data.display_url,
          thumbnailUrl: result.data.thumb?.url,
        },
      });

      setProgress(100);
      setIsUploading(false);
      return document;
    } catch (error) {
      setIsUploading(false);
      setProgress(0);
      console.error('Upload error:', error);
      throw error;
    }
  };

  return {
    uploadDocument,
    isUploading,
    progress,
  };
}