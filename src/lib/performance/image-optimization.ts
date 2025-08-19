// ===== src/lib/performance/image-optimization.ts =====
import sharp from 'sharp'
import { fileUploadService } from '@/lib/file-upload'
import { structuredLogger } from '@/lib/logger'

interface ImageOptimizationOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'jpeg' | 'png'
  fit?: 'cover' | 'contain' | 'fill'
  generateThumbnail?: boolean
  thumbnailSize?: number
}

interface OptimizedImageResult {
  original: string
  optimized: string
  thumbnail?: string
  metadata: {
    originalSize: number
    optimizedSize: number
    thumbnailSize?: number
    format: string
    dimensions: { width: number; height: number }
  }
}

type FileUploadType = 'avatar' | 'game-image' | 'avatar-original' | 'avatar-optimized' | 'avatar-thumbnail' | 'game-image-original' | 'game-image-optimized' | 'game-image-thumbnail'

export class ImageOptimizer {
  private static readonly SUPPORTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  private static readonly DEFAULT_QUALITY = 85
  private static readonly THUMBNAIL_QUALITY = 70
  private static readonly MAX_UPLOAD_RETRIES = 3
  private static readonly UPLOAD_TIMEOUT = 30000 // 30 seconds

  static async optimizeAndUpload(
    file: File,
    userId: string,
    type: 'avatar' | 'game-image',
    options: ImageOptimizationOptions = {}
  ): Promise<OptimizedImageResult> {
    try {
      // Validate input
      ImageOptimizer.validateFile(file)

      const {
        width = type === 'avatar' ? 400 : 1200,
        height = type === 'avatar' ? 400 : 630,
        quality = ImageOptimizer.DEFAULT_QUALITY,
        format = 'webp',
        fit = 'cover',
        generateThumbnail = true,
        thumbnailSize = 200
      } = options

      structuredLogger.info('Starting image optimization', {
        fileName: file.name,
        fileSize: file.size,
        type,
        targetDimensions: { width, height }
      })

      // Convert File to Buffer
      const buffer = Buffer.from(await file.arrayBuffer())

      // Get original image metadata
      const originalMetadata = await sharp(buffer).metadata()
      
      if (!originalMetadata.width || !originalMetadata.height) {
        throw new Error('Unable to read image dimensions')
      }

      // Create optimized versions
      const optimizationTasks = [
        // Original (slightly compressed but preserve format)
        ImageOptimizer.createOriginalVersion(buffer, originalMetadata),
        // Optimized version
        ImageOptimizer.createOptimizedVersion(buffer, width, height, quality, format, fit)
      ]

      // Add thumbnail task if needed
      if (generateThumbnail) {
        optimizationTasks.push(
          ImageOptimizer.createThumbnailVersion(buffer, thumbnailSize, ImageOptimizer.THUMBNAIL_QUALITY)
        )
      }

      const results = await Promise.all(optimizationTasks)
      const [originalResult, optimizedResult, thumbnailResult] = results

      // Upload all versions with retry logic
      const uploadTasks = [
        ImageOptimizer.uploadWithRetry(
          originalResult.buffer, 
          `${type}-original`, 
          userId, 
          originalResult.format,
          file.name
        ),
        ImageOptimizer.uploadWithRetry(
          optimizedResult.buffer, 
          `${type}-optimized`, 
          userId, 
          format,
          file.name
        )
      ]

      if (generateThumbnail && thumbnailResult) {
        uploadTasks.push(
          ImageOptimizer.uploadWithRetry(
            thumbnailResult.buffer, 
            `${type}-thumbnail`, 
            userId, 
            'webp',
            file.name
          )
        )
      }

      const uploadResults = await Promise.allSettled(uploadTasks)
      
      // Check for upload failures
      const failedUploads = uploadResults
        .map((result, index) => ({ result, index }))
        .filter(({ result }) => result.status === 'rejected')

      if (failedUploads.length > 0) {
        const errors = failedUploads.map(({ result, index }) => {
          const uploadType = index === 0 ? 'original' : index === 1 ? 'optimized' : 'thumbnail'
          return `${uploadType}: ${result.status === 'rejected' ? result.reason : 'Unknown error'}`
        })
        
        structuredLogger.error('Some uploads failed', new Error('Partial upload failure'), {
          fileName: file.name,
          failedUploads: errors
        })
        
        throw new Error(`Failed to upload some image versions: ${errors.join(', ')}`)
      }

      // Extract successful results
      const [originalUrl, optimizedUrl, thumbnailUrl] = uploadResults.map(result => 
        result.status === 'fulfilled' ? result.value : undefined
      ).filter(Boolean) as string[]

      const result: OptimizedImageResult = {
        original: originalUrl,
        optimized: optimizedUrl,
        thumbnail: thumbnailUrl,
        metadata: {
          originalSize: originalResult.buffer.length,
          optimizedSize: optimizedResult.buffer.length,
          thumbnailSize: thumbnailResult?.buffer.length,
          format,
          dimensions: optimizedResult.metadata
        }
      }

      structuredLogger.info('Image optimization completed', {
        originalSize: result.metadata.originalSize,
        optimizedSize: result.metadata.optimizedSize,
        compressionRatio: Math.round((1 - result.metadata.optimizedSize / result.metadata.originalSize) * 100)
      })

      return result

    } catch (error) {
      structuredLogger.error('Image optimization failed', error instanceof Error ? error : new Error('Unknown optimization error'), {
        fileName: file.name,
        fileSize: file.size,
        type
      })
      throw error
    }
  }

  private static validateFile(file: File): void {
    if (!file) {
      throw new Error('No file provided')
    }

    if (file.size > ImageOptimizer.MAX_FILE_SIZE) {
      throw new Error(`File size ${file.size} exceeds maximum allowed size of ${ImageOptimizer.MAX_FILE_SIZE} bytes`)
    }

    if (!ImageOptimizer.SUPPORTED_FORMATS.includes(file.type)) {
      throw new Error(`Unsupported file format: ${file.type}. Supported formats: ${ImageOptimizer.SUPPORTED_FORMATS.join(', ')}`)
    }
  }

  private static async createOriginalVersion(buffer: Buffer, metadata: sharp.Metadata) {
    const originalFormat = metadata.format === 'jpeg' ? 'jpeg' : metadata.format || 'jpeg'
    
    let pipeline = sharp(buffer)

    // Apply format-specific optimization
    switch (originalFormat) {
      case 'jpeg':
        pipeline = pipeline.jpeg({ quality: 95, progressive: true })
        break
      case 'png':
        pipeline = pipeline.png({ compressionLevel: 6, progressive: true })
        break
      case 'webp':
        pipeline = pipeline.webp({ quality: 95 })
        break
      default:
        pipeline = pipeline.jpeg({ quality: 95, progressive: true })
    }

    const optimizedBuffer = await pipeline.toBuffer()

    return {
      buffer: optimizedBuffer,
      format: originalFormat,
      metadata: { width: metadata.width!, height: metadata.height! }
    }
  }

  private static async createOptimizedVersion(
    buffer: Buffer, 
    width: number, 
    height: number, 
    quality: number, 
    format: string, 
    fit: string
  ) {
    let pipeline = sharp(buffer)
      .resize(width, height, { 
        fit: fit as keyof sharp.FitEnum,
        withoutEnlargement: true // Don't upscale images
      })

    // Apply format-specific settings
    switch (format) {
      case 'webp':
        pipeline = pipeline.webp({ quality, effort: 4 })
        break
      case 'jpeg':
        pipeline = pipeline.jpeg({ quality, progressive: true, mozjpeg: true })
        break
      case 'png':
        pipeline = pipeline.png({ compressionLevel: 8, progressive: true })
        break
      default:
        pipeline = pipeline.webp({ quality, effort: 4 })
    }

    const optimizedBuffer = await pipeline.toBuffer()

    return {
      buffer: optimizedBuffer,
      format,
      metadata: { width, height }
    }
  }

  private static async createThumbnailVersion(buffer: Buffer, size: number, quality: number) {
    const thumbnailBuffer = await sharp(buffer)
      .resize(size, size, { 
        fit: 'cover',
        withoutEnlargement: true
      })
      .webp({ quality, effort: 4 })
      .toBuffer()

    return {
      buffer: thumbnailBuffer,
      format: 'webp',
      metadata: { width: size, height: size }
    }
  }

  private static async uploadWithRetry(
    buffer: Buffer,
    suffix: string,
    userId: string,
    format: string,
    originalFileName: string,
    maxRetries: number = ImageOptimizer.MAX_UPLOAD_RETRIES
  ): Promise<string> {
    let lastError: Error | undefined

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await ImageOptimizer.uploadBuffer(buffer, suffix, userId, format, originalFileName)
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown upload error')
        
        structuredLogger.warn('Upload attempt failed', {
          error: lastError.message,
          message: `Upload attempt ${attempt} failed for ${suffix}`,
          suffix,
          userId,
          format,
          attempt,
          maxRetries
        })

        // Don't retry on certain types of errors
        if (lastError.message.includes('quota') || 
            lastError.message.includes('permissions') ||
            lastError.message.includes('invalid')) {
          break
        }

        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    throw lastError || new Error(`Failed to upload ${suffix} after ${maxRetries} attempts`)
  }

  private static async uploadBuffer(
    buffer: Buffer,
    suffix: string,
    userId: string,
    format: string,
    originalFileName: string
  ): Promise<string> {
    try {
      // Extract original filename without extension
      const nameWithoutExt = originalFileName.replace(/\.[^/.]+$/, '')
      const fileName = `${nameWithoutExt}-${suffix}.${format}`

      // Convert Buffer to Uint8Array for Blob compatibility
      const uint8Array = new Uint8Array(buffer)
      const blob = new Blob([uint8Array], { type: `image/${format}` })
      const file = new File([blob], fileName, { type: `image/${format}` })

      // Map suffix to valid upload type
      const uploadType = ImageOptimizer.getUploadType(suffix)

      // Call file upload service - try different interface patterns
      const uploadWithTimeout = async () => {
        // Add metadata to file object if possible
        const fileWithMetadata = Object.assign(file, {
          uploadType,
          userId,
          originalFileName,
          optimizationType: suffix,
          format
        })

        // Try the upload with timeout
        return await fileUploadService.upload(fileWithMetadata)
      }

      return await Promise.race([
        uploadWithTimeout(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Upload timeout')), ImageOptimizer.UPLOAD_TIMEOUT)
        )
      ])

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown upload error'
      
      // Handle specific upload errors
      if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
        structuredLogger.error('Network error during upload', error instanceof Error ? error : new Error(errorMessage), {
          suffix,
          userId,
          format,
          retry: 'recommended'
        })
        throw new Error(`Network error uploading ${suffix} version. Please check connection and try again.`)
      }
      
      if (errorMessage.includes('storage') || errorMessage.includes('quota')) {
        structuredLogger.error('Storage error during upload', error instanceof Error ? error : new Error(errorMessage), {
          suffix,
          userId,
          format
        })
        throw new Error(`Storage error uploading ${suffix} version. Storage quota may be exceeded.`)
      }

      structuredLogger.error('Buffer upload failed', error instanceof Error ? error : new Error(errorMessage), {
        suffix,
        userId,
        format
      })
      throw new Error(`Failed to upload ${suffix} version: ${errorMessage}`)
    }
  }

  private static getUploadType(suffix: string): FileUploadType {
    const typeMap: Record<string, FileUploadType> = {
      'avatar-original': 'avatar-original',
      'avatar-optimized': 'avatar-optimized', 
      'avatar-thumbnail': 'avatar-thumbnail',
      'game-image-original': 'game-image-original',
      'game-image-optimized': 'game-image-optimized',
      'game-image-thumbnail': 'game-image-thumbnail'
    }

    const uploadType = typeMap[suffix]
    if (!uploadType) {
      // Fallback to basic types
      if (suffix.includes('avatar')) return 'avatar'
      if (suffix.includes('game-image')) return 'game-image'
      throw new Error(`Unknown upload type for suffix: ${suffix}`)
    }

    return uploadType
  }

  // Utility method to get image info without optimization
  static async getImageInfo(file: File): Promise<{
    width: number
    height: number
    format: string
    size: number
    aspectRatio: number
  }> {
    try {
      ImageOptimizer.validateFile(file)
      
      const buffer = Buffer.from(await file.arrayBuffer())
      const metadata = await sharp(buffer).metadata()

      if (!metadata.width || !metadata.height) {
        throw new Error('Unable to read image dimensions')
      }

      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format || 'unknown',
        size: file.size,
        aspectRatio: metadata.width / metadata.height
      }

    } catch (error) {
      structuredLogger.error('Failed to get image info', error instanceof Error ? error : new Error('Unknown error'), {
        fileName: file.name
      })
      throw error
    }
  }

  // Batch optimization for multiple images
  static async optimizeMultiple(
    files: File[],
    userId: string,
    type: 'avatar' | 'game-image',
    options: ImageOptimizationOptions = {}
  ): Promise<OptimizedImageResult[]> {
    const results = await Promise.allSettled(
      files.map(file => ImageOptimizer.optimizeAndUpload(file, userId, type, options))
    )

    const successful: OptimizedImageResult[] = []
    const failed: { file: string; error: string }[] = []

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successful.push(result.value)
      } else {
        failed.push({
          file: files[index].name,
          error: result.reason instanceof Error ? result.reason.message : 'Unknown error'
        })
      }
    })

    if (failed.length > 0) {
      structuredLogger.warn('Some images failed to optimize', { failed })
    }

    return successful
  }
}