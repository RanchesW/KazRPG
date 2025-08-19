// ===== src/lib/file-upload.ts =====
interface FileUploadOptions {
  maxSize?: number
  allowedTypes?: string[]
  destination?: string
}

class FileUploadService {
  private defaultOptions: FileUploadOptions = {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    destination: '/uploads'
  }

  async upload(file: File, options?: FileUploadOptions): Promise<string> {
    const opts = { ...this.defaultOptions, ...options }
    
    // Validate file size
    if (file.size > opts.maxSize!) {
      throw new Error(`File size exceeds limit of ${opts.maxSize! / 1024 / 1024}MB`)
    }
    
    // Validate file type
    if (opts.allowedTypes && !opts.allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} not allowed`)
    }
    
    // In a real implementation, this would upload to cloud storage
    // For now, return a mock URL
    const fileName = `${Date.now()}-${file.name}`
    return `${opts.destination}/${fileName}`
  }

  async uploadMultiple(files: File[], options?: FileUploadOptions): Promise<string[]> {
    const uploadPromises = files.map(file => this.upload(file, options))
    return Promise.all(uploadPromises)
  }

  async delete(url: string): Promise<void> {
    // In a real implementation, this would delete from cloud storage
    console.log(`Would delete file: ${url}`)
  }
}

export const fileUploadService = new FileUploadService()