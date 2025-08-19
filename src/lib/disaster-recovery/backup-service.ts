// ===== src/lib/disaster-recovery/backup-service.ts =====
import { S3 } from 'aws-sdk'
import { spawn } from 'child_process'
import { createReadStream, createWriteStream } from 'fs'
import { pipeline } from 'stream/promises'
import { createGzip } from 'zlib'
import { env } from '@/lib/env'
import { structuredLogger } from '@/lib/logger'

export class BackupService {
  private s3: S3
  private readonly bucketName = env.BACKUP_BUCKET_NAME!

  constructor() {
    this.s3 = new S3({
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      region: env.AWS_REGION,
    })
  }

  async createDatabaseBackup(): Promise<{ success: boolean; filename?: string; error?: string }> {
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0]
    const filename = `kazrpg-db-backup-${timestamp}.sql.gz`
    const localPath = `/tmp/${filename}`

    try {
      // Create database dump
      const dumpProcess = spawn('pg_dump', [
        env.DATABASE_URL,
        '--no-password',
        '--format=custom',
        '--compress=9',
        '--file', localPath.replace('.gz', '')
      ])

      await new Promise((resolve, reject) => {
        dumpProcess.on('close', (code) => {
          if (code === 0) resolve(code)
          else reject(new Error(`pg_dump exited with code ${code}`))
        })
        dumpProcess.on('error', reject)
      })

      // Compress the dump
      await pipeline(
        createReadStream(localPath.replace('.gz', '')),
        createGzip(),
        createWriteStream(localPath)
      )

      // Upload to S3
      const uploadResult = await this.s3.upload({
        Bucket: this.bucketName,
        Key: `database/${filename}`,
        Body: createReadStream(localPath),
        StorageClass: 'STANDARD_IA', // Cheaper for backups
        Metadata: {
          type: 'database-backup',
          timestamp: timestamp,
          size: (await import('fs')).statSync(localPath).size.toString(),
        }
      }).promise()

      // Clean up local file
      await import('fs').then(fs => fs.unlinkSync(localPath))
      await import('fs').then(fs => fs.unlinkSync(localPath.replace('.gz', '')))

      structuredLogger.info('Database backup created successfully', {
        filename,
        s3Location: uploadResult.Location,
        size: uploadResult.Key
      })

      return { success: true, filename }
    } catch (error) {
      structuredLogger.error('Database backup failed', error as Error, { filename })
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async createFileBackup(sourcePath: string, backupName: string): Promise<{ success: boolean; filename?: string; error?: string }> {
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0]
    const filename = `${backupName}-${timestamp}.tar.gz`

    try {
      // Create compressed archive
      const tarProcess = spawn('tar', [
        '-czf',
        `/tmp/${filename}`,
        '-C', sourcePath,
        '.'
      ])

      await new Promise((resolve, reject) => {
        tarProcess.on('close', (code) => {
          if (code === 0) resolve(code)
          else reject(new Error(`tar exited with code ${code}`))
        })
        tarProcess.on('error', reject)
      })

      // Upload to S3
      const uploadResult = await this.s3.upload({
        Bucket: this.bucketName,
        Key: `files/${filename}`,
        Body: createReadStream(`/tmp/${filename}`),
        StorageClass: 'STANDARD_IA',
        Metadata: {
          type: 'file-backup',
          timestamp: timestamp,
          sourcePath: sourcePath,
        }
      }).promise()

      // Clean up local file
      await import('fs').then(fs => fs.unlinkSync(`/tmp/${filename}`))

      structuredLogger.info('File backup created successfully', {
        filename,
        sourcePath,
        s3Location: uploadResult.Location
      })

      return { success: true, filename }
    } catch (error) {
      structuredLogger.error('File backup failed', error as Error, { filename, sourcePath })
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async listBackups(type?: 'database' | 'files') {
    try {
      const prefix = type ? `${type}/` : ''
      const result = await this.s3.listObjectsV2({
        Bucket: this.bucketName,
        Prefix: prefix,
      }).promise()

      return result.Contents?.map(obj => ({
        key: obj.Key!,
        size: obj.Size!,
        lastModified: obj.LastModified!,
        type: obj.Key!.startsWith('database/') ? 'database' : 'files'
      })) || []
    } catch (error) {
      structuredLogger.error('Failed to list backups', error as Error)
      return []
    }
  }

  async restoreDatabase(backupKey: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Download backup from S3
      const obj = await this.s3.getObject({
        Bucket: this.bucketName,
        Key: backupKey
      }).promise()

      if (!obj.Body) {
        throw new Error('Backup file not found')
      }

      const localPath = `/tmp/restore-${Date.now()}.sql.gz`
      
      // Write to local file
      await import('fs').then(fs => 
        fs.writeFileSync(localPath, obj.Body as Buffer)
      )

      // Decompress
      await pipeline(
        createReadStream(localPath),
        createGzip(),
        createWriteStream(localPath.replace('.gz', ''))
      )

      // Restore database
      const restoreProcess = spawn('pg_restore', [
        env.DATABASE_URL,
        '--clean',
        '--if-exists',
        '--no-owner',
        '--no-privileges',
        localPath.replace('.gz', '')
      ])

      await new Promise((resolve, reject) => {
        restoreProcess.on('close', (code) => {
          if (code === 0) resolve(code)
          else reject(new Error(`pg_restore exited with code ${code}`))
        })
        restoreProcess.on('error', reject)
      })

      // Clean up
      await import('fs').then(fs => {
        fs.unlinkSync(localPath)
        fs.unlinkSync(localPath.replace('.gz', ''))
      })

      structuredLogger.info('Database restored successfully', { backupKey })
      return { success: true }
    } catch (error) {
      structuredLogger.error('Database restore failed', error as Error, { backupKey })
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async scheduleAutomaticBackups() {
    // This would typically be set up as a cron job or scheduled task
    const backupInterval = 24 * 60 * 60 * 1000 // 24 hours

    setInterval(async () => {
      await this.createDatabaseBackup()
      await this.createFileBackup('/app/uploads', 'uploads')
      
      // Clean up old backups (keep last 30 days)
      await this.cleanupOldBackups(30)
    }, backupInterval)

    structuredLogger.info('Automatic backup schedule configured')
  }

  private async cleanupOldBackups(retentionDays: number) {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

      const backups = await this.listBackups()
      const oldBackups = backups.filter(backup => backup.lastModified < cutoffDate)

      for (const backup of oldBackups) {
        await this.s3.deleteObject({
          Bucket: this.bucketName,
          Key: backup.key
        }).promise()

        structuredLogger.info('Old backup deleted', { 
          key: backup.key,
          age: Math.round((Date.now() - backup.lastModified.getTime()) / (1000 * 60 * 60 * 24))
        })
      }
    } catch (error) {
      structuredLogger.error('Backup cleanup failed', error as Error)
    }
  }
}

export const backupService = new BackupService()