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
  formats?: {
    avif?: string;
    webp?: string;
    original?: string;
  };
  thumbnail?: string;
}

export async function optimizeImage(
  buffer: Buffer,
  originalFilename: string
): Promise<OptimizedImage> {
  const baseFilename = crypto.randomBytes(16).toString('hex');
  
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

  // Generate multiple formats for optimal delivery
  const formats: { avif?: string; webp?: string; original?: string } = {};

  // 1. AVIF - Best compression (50% smaller than WebP)
  const avifFilename = `${baseFilename}.avif`;
  const avifPath = join(process.cwd(), 'public', 'uploads', avifFilename);
  const avifBuffer = await processedImage
    .clone()
    .avif({
      quality: 75, // Lower quality still looks good due to better compression
      effort: 6,   // Higher effort = better compression
    })
    .toBuffer();
  await writeFile(avifPath, avifBuffer);
  formats.avif = `/uploads/${avifFilename}`;

  // 2. WebP - Fallback for browsers without AVIF support
  const webpFilename = `${baseFilename}.webp`;
  const webpPath = join(process.cwd(), 'public', 'uploads', webpFilename);
  const webpBuffer = await processedImage
    .clone()
    .webp({
      quality: 85,
      effort: 4,
    })
    .toBuffer();
  await writeFile(webpPath, webpBuffer);
  formats.webp = `/uploads/${webpFilename}`;

  // 3. Generate thumbnail (400px max) for faster feed loading
  const thumbnailFilename = `${baseFilename}_thumb.webp`;
  const thumbnailPath = join(process.cwd(), 'public', 'uploads', thumbnailFilename);
  const thumbnailBuffer = await image
    .clone()
    .resize(400, 400, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 80 })
    .toBuffer();
  await writeFile(thumbnailPath, thumbnailBuffer);

  // Get final dimensions (use WebP as reference)
  const finalMetadata = await sharp(webpBuffer).metadata();

  return {
    filename: webpFilename,
    path: webpPath,
    url: formats.webp,
    width: finalMetadata.width || 0,
    height: finalMetadata.height || 0,
    size: webpBuffer.length,
    formats,
    thumbnail: `/uploads/${thumbnailFilename}`,
  };
}

export async function optimizeVideo(
  buffer: Buffer,
  originalFilename: string
): Promise<{ filename: string; path: string; url: string; thumbnail?: string }> {
  const baseFilename = crypto.randomBytes(16).toString('hex');
  
  // Save original temporarily
  const tempPath = join(process.cwd(), 'public', 'uploads', `${baseFilename}_temp`);
  await writeFile(tempPath, buffer);

  // For production: Use ffmpeg for video compression
  // Install: npm install fluent-ffmpeg @ffmpeg-installer/ffmpeg
  // 
  // Example implementation:
  // import ffmpeg from 'fluent-ffmpeg';
  // import ffmpegPath from '@ffmpeg-installer/ffmpeg';
  // ffmpeg.setFfmpegPath(ffmpegPath.path);
  //
  // const outputFilename = `${baseFilename}.mp4`;
  // const outputPath = join(process.cwd(), 'public', 'uploads', outputFilename);
  // const thumbnailFilename = `${baseFilename}_thumb.jpg`;
  // const thumbnailPath = join(process.cwd(), 'public', 'uploads', thumbnailFilename);
  //
  // await new Promise((resolve, reject) => {
  //   ffmpeg(tempPath)
  //     .videoCodec('libx264')           // H.264 codec
  //     .audioCodec('aac')               // AAC audio
  //     .videoBitrate('1000k')           // 1 Mbps video
  //     .audioBitrate('128k')            // 128 kbps audio
  //     .size('1280x?')                  // Max 1280px width, auto height
  //     .format('mp4')
  //     .outputOptions([
  //       '-preset fast',                // Encoding speed vs compression
  //       '-crf 23',                     // Quality (18-28, lower = better)
  //       '-pix_fmt yuv420p',            // Compatibility
  //       '-movflags +faststart'         // Progressive streaming
  //     ])
  //     .on('end', () => {
  //       // Generate thumbnail
  //       ffmpeg(outputPath)
  //         .screenshots({
  //           timestamps: ['00:00:01'],
  //           filename: thumbnailFilename,
  //           folder: join(process.cwd(), 'public', 'uploads'),
  //           size: '400x?'
  //         })
  //         .on('end', resolve)
  //         .on('error', reject);
  //     })
  //     .on('error', reject)
  //     .save(outputPath);
  // });
  //
  // // Clean up temp file
  // await unlink(tempPath);
  //
  // return {
  //   filename: outputFilename,
  //   path: outputPath,
  //   url: `/uploads/${outputFilename}`,
  //   thumbnail: `/uploads/${thumbnailFilename}`
  // };

  // Temporary implementation: Save as-is
  const ext = originalFilename.split('.').pop()?.toLowerCase() || 'mp4';
  const filename = `${baseFilename}.${ext}`;
  const filepath = join(process.cwd(), 'public', 'uploads', filename);

  await writeFile(filepath, buffer);

  return {
    filename,
    path: filepath,
    url: `/uploads/${filename}`,
  };
}
