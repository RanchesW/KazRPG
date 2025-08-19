// ===== src/lib/performance/image-optimization.ts =====
import sharp from 'sharp'
import { fileUploadService } from '@/lib/file-upload'

interface ImageOptimizationOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'jpeg' | 'png'
  fit?: 'cover' | 'contain' | 'fill'
}

export class ImageOptimizer {
  static async optimizeAndUpload(
    file: File,
    userId: string,
    type: 'avatar' | 'game-image',
    options: ImageOptimizationOptions = {}
  ): Promise<{ original: string; optimized: string; thumbnail: string }> {
    const {
      width = type === 'avatar' ? 400 : 1200,
      height = type === 'avatar' ? 400 : 630,
      quality = 85,
      format = 'webp',
      fit = 'cover'
    } = options

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Create optimized versions
    const [originalBuffer, optimizedBuffer, thumbnailBuffer] = await Promise.all([
      // Original (slightly compressed)
      sharp(buffer)
        .jpeg({ quality: 95 })
        .toBuffer(),
      
      // Optimized
      sharp(buffer)
        .resize(width, height, { fit })
        .toFormat(format, { quality })
        .toBuffer(),
      
      // Thumbnail
      sharp(buffer)
        .resize(200, 200, { fit: 'cover' })
        .toFormat('webp', { quality: 70 })
        .toBuffer()
    ])

    // Upload all versions
    const [originalUrl, optimizedUrl, thumbnailUrl] = await Promise.all([
      this.uploadBuffer(originalBuffer, `${type}-original`, userId, 'jpeg'),
      this.uploadBuffer(optimizedBuffer, `${type}-optimized`, userId, format),
      this.uploadBuffer(thumbnailBuffer, `${type}-thumbnail`, userId, 'webp')
    ])

    return {
      original: originalUrl,
      optimized: optimizedUrl,
      thumbnail: thumbnailUrl
    }
  }

  private static async uploadBuffer(
    buffer: Buffer,
    suffix: string,
    userId: string,
    format: string
  ): Promise<string> {
    // Create a File-like object from buffer
    const file = new File([buffer], `${suffix}.${format}`, {
      type: `image/${format}`
    })

    return fileUploadService.uploadFile({
      file,
      userId,
      type: suffix as any
    })
  }
}