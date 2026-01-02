/**
 * Utility functions for image compression and conversion
 */

/**
 * Compress image and convert to base64
 * Keeps result under 300KB to ensure Firestore docs stay well below 1MB (safe for upvotes)
 */
export const compressAndConvertToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        
        // Scale down to smaller dimensions to reduce file size
        const maxWidth = 640;
        const maxHeight = 640;
        
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress aggressively to stay under 300KB (safe for Firestore with upvotes)
        let quality = 0.6; // Start lower
        let base64: string;
        
        do {
          base64 = canvas.toDataURL('image/jpeg', quality);
          quality -= 0.1;
        } while (base64.length > 280000 && quality > 0.1); // Keep under ~280KB for safety
        
        resolve(base64);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = event.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Format base64 size to human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};
