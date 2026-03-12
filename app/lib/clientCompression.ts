/**
 * Client-side compression utilities
 * Compress images before upload to save bandwidth
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeMB?: number;
}

/**
 * Compress an image file on the client side before upload
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const {
    maxWidth = 2048,
    maxHeight = 2048,
    quality = 0.85,
    maxSizeMB = 5,
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob with compression
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'));
            return;
          }

          // Check if compressed size is acceptable
          if (blob.size > maxSizeMB * 1024 * 1024) {
            // Try with lower quality
            canvas.toBlob(
              (retryBlob) => {
                if (!retryBlob) {
                  reject(new Error('Failed to compress image'));
                  return;
                }
                const compressedFile = new File(
                  [retryBlob],
                  file.name.replace(/\.\w+$/, '.webp'),
                  { type: 'image/webp' }
                );
                resolve(compressedFile);
              },
              'image/webp',
              quality * 0.7 // Lower quality
            );
          } else {
            const compressedFile = new File(
              [blob],
              file.name.replace(/\.\w+$/, '.webp'),
              { type: 'image/webp' }
            );
            resolve(compressedFile);
          }
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Get file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Validate file size and type
 */
export function validateFile(
  file: File,
  options: {
    maxSizeMB?: number;
    allowedTypes?: string[];
  } = {}
): { valid: boolean; error?: string } {
  const { maxSizeMB = 10, allowedTypes = ['image/*', 'video/*'] } = options;

  // Check size
  if (file.size > maxSizeMB * 1024 * 1024) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  // Check type
  const fileType = file.type;
  const isAllowed = allowedTypes.some((type) => {
    if (type.endsWith('/*')) {
      return fileType.startsWith(type.replace('/*', '/'));
    }
    return fileType === type;
  });

  if (!isAllowed) {
    return {
      valid: false,
      error: 'File type not allowed',
    };
  }

  return { valid: true };
}

/**
 * Compress multiple images in parallel
 */
export async function compressImages(
  files: File[],
  options?: CompressionOptions
): Promise<File[]> {
  return Promise.all(
    files.map((file) => {
      if (file.type.startsWith('image/')) {
        return compressImage(file, options);
      }
      return Promise.resolve(file);
    })
  );
}
