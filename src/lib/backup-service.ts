import { exec } from 'child_process'
import { promisify } from 'util'
import { logger } from './logger'
import { config } from './config'
import { CloudStorageService } from './cloud-storage'
import fs from 'fs/promises'
import path from 'path'
import cron from 'node-cron'

const execAsync = promisify(exec)

export interface BackupConfig {
  database: {
    enabled: boolean
    schedule: string
    retentionDays: number
  }
  files: {
    enabled: boolean
    schedule: string
    retentionDays: number
    paths: string[]
  }
  logs: {
    enabled: boolean
    schedule: string
    retentionDays: number
  }
}

export interface BackupResult {
  id: string
  type: 'database' | 'files' | 'logs'
  timestamp: Date
  size: number
  location: string
  status: 'success' | 'failed'
  error?: string
}

export class BackupService {
  private storageService: CloudStorageService
  private backupConfig: BackupConfig
  private backupHistory: BackupResult[] = []

  constructor() {
    this.storageService = new CloudStorageService()
    this.backupConfig = this.getDefaultConfig()
    this.initializeBackupDirectory()
  }

  private getDefaultConfig(): BackupConfig {
    return {
      database: {
        enabled: true,
        schedule: '0 2 * * *', // Daily at 2 AM
        retentionDays: 30,
      },
      files: {
        enabled: true,
        schedule: '0 3 * * 0', // Weekly on Sunday at 3 AM
        retentionDays: 90,
        paths: [
          './public/uploads',
          './logs',
          './certificates',
        ],
      },
      logs: {
        enabled: true,
        schedule: '0 4 * * *', // Daily at 4 AM
        retentionDays: 7,
      },
    }
  }

  private async initializeBackupDirectory() {
    try {
      await fs.mkdir('./backups', { recursive: true })
      await fs.mkdir('./backups/database', { recursive: true })
      await fs.mkdir('./backups/files', { recursive: true })
      await fs.mkdir('./backups/logs', { recursive: true })
      logger.info('Backup directories initialized')
    } catch (error) {
      logger.error('Failed to initialize backup directories:', error)
    }
  }

  // Start scheduled backups
  startScheduledBackups() {
    if (this.backupConfig.database.enabled) {
      cron.schedule(this.backupConfig.database.schedule, () => {
        this.backupDatabase().catch(error => {
          logger.error('Scheduled database backup failed:', error)
        })
      })
      logger.info(`Database backup scheduled: ${this.backupConfig.database.schedule}`)
    }

    if (this.backupConfig.files.enabled) {
      cron.schedule(this.backupConfig.files.schedule, () => {
        this.backupFiles().catch(error => {
          logger.error('Scheduled files backup failed:', error)
        })
      })
      logger.info(`Files backup scheduled: ${this.backupConfig.files.schedule}`)
    }

    if (this.backupConfig.logs.enabled) {
      cron.schedule(this.backupConfig.logs.schedule, () => {
        this.backupLogs().catch(error => {
          logger.error('Scheduled logs backup failed:', error)
        })
      })
      logger.info(`Logs backup scheduled: ${this.backupConfig.logs.schedule}`)
    }
  }

  // Backup database
  async backupDatabase(): Promise<BackupResult> {
    const backupId = `db_${Date.now()}`
    const timestamp = new Date()
    const fileName = `database_${timestamp.toISOString().split('T')[0]}.sql`
    const localPath = `./backups/database/${fileName}`
    const remotePath = `backups/database/${fileName}`

    try {
      logger.info('Starting database backup...')

      // Parse database URL
      const dbUrl = new URL(config.database.url)
      const host = dbUrl.hostname
      const port = dbUrl.port || '5432'
      const database = dbUrl.pathname.slice(1)
      const username = dbUrl.username
      const password = dbUrl.password

      // Create database dump
      const dumpCommand = `PGPASSWORD="${password}" pg_dump -h ${host} -p ${port} -U ${username} -d ${database} -F c -f ${localPath}`
      
      await execAsync(dumpCommand)

      // Get file size
      const stats = await fs.stat(localPath)
      const size = stats.size

      // Upload to cloud storage
      await this.storageService.uploadFile(localPath, remotePath)

      const result: BackupResult = {
        id: backupId,
        type: 'database',
        timestamp,
        size,
        location: remotePath,
        status: 'success',
      }

      this.backupHistory.push(result)
      logger.info('Database backup completed successfully', { backupId, size })

      // Clean up local file
      await fs.unlink(localPath)

      return result
    } catch (error) {
      const result: BackupResult = {
        id: backupId,
        type: 'database',
        timestamp,
        size: 0,
        location: '',
        status: 'failed',
        error: error.message,
      }

      this.backupHistory.push(result)
      logger.error('Database backup failed:', error)

      return result
    }
  }

  // Backup files
  async backupFiles(): Promise<BackupResult> {
    const backupId = `files_${Date.now()}`
    const timestamp = new Date()
    const fileName = `files_${timestamp.toISOString().split('T')[0]}.tar.gz`
    const localPath = `./backups/files/${fileName}`
    const remotePath = `backups/files/${fileName}`

    try {
      logger.info('Starting files backup...')

      // Create tar archive of specified paths
      const paths = this.backupConfig.files.paths.join(' ')
      const tarCommand = `tar -czf ${localPath} ${paths}`
      
      await execAsync(tarCommand)

      // Get file size
      const stats = await fs.stat(localPath)
      const size = stats.size

      // Upload to cloud storage
      await this.storageService.uploadFile(localPath, remotePath)

      const result: BackupResult = {
        id: backupId,
        type: 'files',
        timestamp,
        size,
        location: remotePath,
        status: 'success',
      }

      this.backupHistory.push(result)
      logger.info('Files backup completed successfully', { backupId, size })

      // Clean up local file
      await fs.unlink(localPath)

      return result
    } catch (error) {
      const result: BackupResult = {
        id: backupId,
        type: 'files',
        timestamp,
        size: 0,
        location: '',
        status: 'failed',
        error: error.message,
      }

      this.backupHistory.push(result)
      logger.error('Files backup failed:', error)

      return result
    }
  }

  // Backup logs
  async backupLogs(): Promise<BackupResult> {
    const backupId = `logs_${Date.now()}`
    const timestamp = new Date()
    const fileName = `logs_${timestamp.toISOString().split('T')[0]}.tar.gz`
    const localPath = `./backups/logs/${fileName}`
    const remotePath = `backups/logs/${fileName}`

    try {
      logger.info('Starting logs backup...')

      // Create tar archive of logs
      const tarCommand = `tar -czf ${localPath} ./logs`
      
      await execAsync(tarCommand)

      // Get file size
      const stats = await fs.stat(localPath)
      const size = stats.size

      // Upload to cloud storage
      await this.storageService.uploadFile(localPath, remotePath)

      const result: BackupResult = {
        id: backupId,
        type: 'logs',
        timestamp,
        size,
        location: remotePath,
        status: 'success',
      }

      this.backupHistory.push(result)
      logger.info('Logs backup completed successfully', { backupId, size })

      // Clean up local file
      await fs.unlink(localPath)

      return result
    } catch (error) {
      const result: BackupResult = {
        id: backupId,
        type: 'logs',
        timestamp,
        size: 0,
        location: '',
        status: 'failed',
        error: error.message,
      }

      this.backupHistory.push(result)
      logger.error('Logs backup failed:', error)

      return result
    }
  }

  // Restore database from backup
  async restoreDatabase(backupId: string): Promise<boolean> {
    try {
      const backup = this.backupHistory.find(b => b.id === backupId && b.type === 'database')
      if (!backup) {
        throw new Error('Backup not found')
      }

      logger.info('Starting database restore...', { backupId })

      // Download backup from cloud storage
      const localPath = `./backups/restore_${backupId}.sql`
      await this.storageService.downloadFile(backup.location, localPath)

      // Parse database URL
      const dbUrl = new URL(config.database.url)
      const host = dbUrl.hostname
      const port = dbUrl.port || '5432'
      const database = dbUrl.pathname.slice(1)
      const username = dbUrl.username
      const password = dbUrl.password

      // Restore database
      const restoreCommand = `PGPASSWORD="${password}" pg_restore -h ${host} -p ${port} -U ${username} -d ${database} -c ${localPath}`
      
      await execAsync(restoreCommand)

      // Clean up local file
      await fs.unlink(localPath)

      logger.info('Database restore completed successfully', { backupId })
      return true
    } catch (error) {
      logger.error('Database restore failed:', error)
      return false
    }
  }

  // Restore files from backup
  async restoreFiles(backupId: string): Promise<boolean> {
    try {
      const backup = this.backupHistory.find(b => b.id === backupId && b.type === 'files')
      if (!backup) {
        throw new Error('Backup not found')
      }

      logger.info('Starting files restore...', { backupId })

      // Download backup from cloud storage
      const localPath = `./backups/restore_${backupId}.tar.gz`
      await this.storageService.downloadFile(backup.location, localPath)

      // Extract files
      const extractCommand = `tar -xzf ${localPath} -C ./`
      await execAsync(extractCommand)

      // Clean up local file
      await fs.unlink(localPath)

      logger.info('Files restore completed successfully', { backupId })
      return true
    } catch (error) {
      logger.error('Files restore failed:', error)
      return false
    }
  }

  // Get backup history
  getBackupHistory(type?: 'database' | 'files' | 'logs'): BackupResult[] {
    if (type) {
      return this.backupHistory.filter(b => b.type === type)
    }
    return [...this.backupHistory]
  }

  // Clean up old backups
  async cleanupOldBackups(): Promise<void> {
    try {
      const now = new Date()
      
      for (const config of [this.backupConfig.database, this.backupConfig.files, this.backupConfig.logs]) {
        if (!config.enabled) continue

        const cutoffDate = new Date(now.getTime() - config.retentionDays * 24 * 60 * 60 * 1000)
        const oldBackups = this.backupHistory.filter(b => 
          b.timestamp < cutoffDate && 
          this.getRetentionDaysForType(b.type) === config.retentionDays
        )

        for (const backup of oldBackups) {
          try {
            // Delete from cloud storage
            await this.storageService.deleteFile(backup.location)
            
            // Remove from history
            this.backupHistory = this.backupHistory.filter(b => b.id !== backup.id)
            
            logger.info('Old backup cleaned up', { backupId: backup.id })
          } catch (error) {
            logger.error('Failed to cleanup old backup:', { backupId: backup.id, error: error.message })
          }
        }
      }
    } catch (error) {
      logger.error('Backup cleanup failed:', error)
    }
  }

  private getRetentionDaysForType(type: 'database' | 'files' | 'logs'): number {
    switch (type) {
      case 'database':
        return this.backupConfig.database.retentionDays
      case 'files':
        return this.backupConfig.files.retentionDays
      case 'logs':
        return this.backupConfig.logs.retentionDays
    }
  }

  // Get backup statistics
  getBackupStats() {
    const stats = {
      total: this.backupHistory.length,
      successful: this.backupHistory.filter(b => b.status === 'success').length,
      failed: this.backupHistory.filter(b => b.status === 'failed').length,
      byType: {
        database: this.backupHistory.filter(b => b.type === 'database').length,
        files: this.backupHistory.filter(b => b.type === 'files').length,
        logs: this.backupHistory.filter(b => b.type === 'logs').length,
      },
      totalSize: this.backupHistory
        .filter(b => b.status === 'success')
        .reduce((sum, b) => sum + b.size, 0),
      latestBackup: this.backupHistory.length > 0 ? 
        this.backupHistory[this.backupHistory.length - 1].timestamp : null,
    }

    return stats
  }

  // Start cleanup scheduler
  startCleanupScheduler() {
    // Run cleanup daily at midnight
    cron.schedule('0 0 * * *', () => {
      this.cleanupOldBackups().catch(error => {
        logger.error('Scheduled backup cleanup failed:', error)
      })
    })
    logger.info('Backup cleanup scheduler started')
  }
}

// Create singleton instance
export const backupService = new BackupService()

// Export convenience functions
export const startBackupService = () => {
  backupService.startScheduledBackups()
  backupService.startCleanupScheduler()
}

export const backupDatabase = () => backupService.backupDatabase()
export const backupFiles = () => backupService.backupFiles()
export const backupLogs = () => backupService.backupLogs()
export const restoreDatabase = (backupId: string) => backupService.restoreDatabase(backupId)
export const restoreFiles = (backupId: string) => backupService.restoreFiles(backupId)
export const getBackupHistory = (type?: 'database' | 'files' | 'logs') => 
  backupService.getBackupHistory(type)
export const getBackupStats = () => backupService.getBackupStats()