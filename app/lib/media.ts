import sharp from 'sharp';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import crypto from 'crypto';

export interface OptimizedImage {
  filename: string;
  path: string;
  url: string;
  width: number;
  height: number;
  size: number;
}

export async function optimizeImage(
  buffer: Buffer,
  originalFilename: string
): Promise<OptimizedImage> {
  const filename = `${crypto.randomBytes(16).toString('hex')}.webp`;
  const filepath = join(process.cwd(), 'public', 'uploads', filename);

  // Process image with sharp
  const image = sharp(buffer);
  const metadata = await image.metadata();

  // Resize if too large (max 2048px on longest side)
  let processedImage = image;
  const maxDimension = 2048;
  
  if (metadata.width && metadata.height) {
    if (metadata.width > maxDimension || metadata.height > maxDimension) {
      processedImage = image.resize(maxDimension, maxDimension, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }
  }

  // Convert to WebP for optimal compression
  const optimizedBuffer = await processedImage
    .webp({
      quality: 85,
      effort: 4,
    })
    .toBuffer();

  // Save to disk
  await writeFile(filepath, optimizedBuffer);

  // Get final dimensions
  const finalMetadata = await sharp(optimizedBuffer).metadata();

  return {
    filename,
    path: filepath,
    url: `/uploads/${filename}`,
    width: finalMetadata.width || 0,
    height: finalMetadata.height || 0,
    size: optimizedBuffer.length,
  };
}

export async function optimizeVideo(
  buffer: Buffer,
  originalFilename: string
): Promise<{ filename: string; path: string; url: string }> {
  // For now, just save the video as-is
  // In production, you'd use ffmpeg to compress/transcode
  const ext = originalFilename.split('.').pop()?.toLowerCase() || 'mp4';
  const filename = `${crypto.randomBytes(16).toString('hex')}.${ext}`;
  const filepath = join(process.cwd(), 'public', 'uploads', filename);

  await writeFile(filepath, buffer);

  return {
    filename,
    path: filepath,
    url: `/uploads/${filename}`,
  };
}
