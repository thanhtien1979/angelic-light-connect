/**
 * Image compression utility for optimizing uploads
 */

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  outputFormat?: 'image/webp' | 'image/jpeg' | 'image/png';
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.8,
  outputFormat: 'image/webp',
};

/**
 * Compress and resize an image file
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns A new compressed File object
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  // Only process image files
  if (!file.type.startsWith('image/')) {
    return file;
  }

  // Skip if already small enough (< 100KB)
  if (file.size < 100 * 1024) {
    return file;
  }

  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      const maxW = opts.maxWidth!;
      const maxH = opts.maxHeight!;

      if (width > maxW || height > maxH) {
        const ratio = Math.min(maxW / width, maxH / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      // Draw image with white background (for transparency handling)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Could not compress image'));
            return;
          }

          // Determine file extension
          const ext = opts.outputFormat === 'image/webp' ? 'webp' : 
                      opts.outputFormat === 'image/jpeg' ? 'jpg' : 'png';
          
          const newFileName = file.name.replace(/\.[^/.]+$/, `.${ext}`);

          const compressedFile = new File([blob], newFileName, {
            type: opts.outputFormat!,
            lastModified: Date.now(),
          });

          // Log compression results
          const savedPercent = Math.round((1 - compressedFile.size / file.size) * 100);
          console.log(
            `Image compressed: ${file.name} (${formatBytes(file.size)}) → ${newFileName} (${formatBytes(compressedFile.size)}) - Saved ${savedPercent}%`
          );

          resolve(compressedFile);
        },
        opts.outputFormat,
        opts.quality
      );
    };

    img.onerror = () => {
      reject(new Error('Could not load image'));
    };

    // Load image from file
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error('Could not read file'));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Check if a file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}
