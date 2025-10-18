import crypto from 'crypto'
import { securityConfig } from './config'

export class EncryptionService {
  private static readonly ALGORITHM = securityConfig.encryption.algorithm
  private static readonly KEY_LENGTH = securityConfig.encryption.keyLength
  private static readonly IV_LENGTH = securityConfig.encryption.ivLength
  private static readonly TAG_LENGTH = securityConfig.encryption.tagLength

  /**
   * Generate a secure encryption key from a password or secret
   */
  static generateKey(secret: string, salt?: string): Buffer {
    const saltBuffer = salt ? Buffer.from(salt, 'hex') : crypto.randomBytes(16)
    return crypto.pbkdf2Sync(secret, saltBuffer, 100000, this.KEY_LENGTH, 'sha512')
  }

  /**
   * Encrypt data using AES-256-GCM
   */
  static encrypt(data: string, key: string): { encrypted: string; iv: string; tag: string } {
    try {
      const keyBuffer = this.generateKey(key)
      const iv = crypto.randomBytes(this.IV_LENGTH)
      
      const cipher = crypto.createCipher(this.ALGORITHM, keyBuffer)
      cipher.setAAD(Buffer.from('additional-data'))
      
      let encrypted = cipher.update(data, 'utf8', 'hex')
      encrypted += cipher.final('hex')
      
      const tag = cipher.getAuthTag()
      
      return {
        encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex')
      }
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`)
    }
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  static decrypt(encryptedData: string, key: string, iv: string, tag: string): string {
    try {
      const keyBuffer = this.generateKey(key)
      const ivBuffer = Buffer.from(iv, 'hex')
      const tagBuffer = Buffer.from(tag, 'hex')
      
      const decipher = crypto.createDecipher(this.ALGORITHM, keyBuffer)
      decipher.setAAD(Buffer.from('additional-data'))
      decipher.setAuthTag(tagBuffer)
      
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      
      return decrypted
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`)
    }
  }

  /**
   * Hash a password using bcrypt (this should be used for passwords)
   */
  static async hashPassword(password: string): Promise<string> {
    const bcrypt = await import('bcryptjs')
    return bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || '12'))
  }

  /**
   * Verify a password against a hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    const bcrypt = await import('bcryptjs')
    return bcrypt.compare(password, hash)
  }

  /**
   * Generate a secure random token
   */
  static generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
  }

  /**
   * Generate a secure random string for various purposes
   */
  static generateSecureString(length: number = 16): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, chars.length)
      result += chars[randomIndex]
    }
    
    return result
  }

  /**
   * Create a secure hash for data integrity verification
   */
  static createHash(data: string, algorithm: string = 'sha256'): string {
    return crypto.createHash(algorithm).update(data).digest('hex')
  }

  /**
   * Verify data integrity using hash
   */
  static verifyHash(data: string, hash: string, algorithm: string = 'sha256'): boolean {
    const computedHash = this.createHash(data, algorithm)
    return computedHash === hash
  }

  /**
   * Encrypt sensitive fields in an object
   */
  static encryptObject(obj: Record<string, any>, sensitiveFields: string[], key: string): Record<string, any> {
    const encryptedObj = { ...obj }
    
    for (const field of sensitiveFields) {
      if (encryptedObj[field] && typeof encryptedObj[field] === 'string') {
        const encrypted = this.encrypt(encryptedObj[field], key)
        encryptedObj[field] = JSON.stringify(encrypted)
      }
    }
    
    return encryptedObj
  }

  /**
   * Decrypt sensitive fields in an object
   */
  static decryptObject(obj: Record<string, any>, sensitiveFields: string[], key: string): Record<string, any> {
    const decryptedObj = { ...obj }
    
    for (const field of sensitiveFields) {
      if (decryptedObj[field] && typeof decryptedObj[field] === 'string') {
        try {
          const encryptedData = JSON.parse(decryptedObj[field])
          decryptedObj[field] = this.decrypt(
            encryptedData.encrypted,
            key,
            encryptedData.iv,
            encryptedData.tag
          )
        } catch (error) {
          // Field might not be encrypted, leave as is
          console.warn(`Failed to decrypt field ${field}:`, error.message)
        }
      }
    }
    
    return decryptedObj
  }

  /**
   * Generate a secure API key
   */
  static generateApiKey(): string {
    const prefix = 'gpe_' // GirlsPreneur API key prefix
    const randomPart = this.generateToken(24)
    return `${prefix}${randomPart}`
  }

  /**
   * Validate API key format
   */
  static validateApiKey(apiKey: string): boolean {
    return /^gpe_[a-f0-9]{48}$/.test(apiKey)
  }

  /**
   * Create a digital signature for data
   */
  static sign(data: string, privateKey: string): string {
    const sign = crypto.createSign('RSA-SHA256')
    sign.update(data)
    return sign.sign(privateKey, 'hex')
  }

  /**
   * Verify a digital signature
   */
  static verify(data: string, signature: string, publicKey: string): boolean {
    const verify = crypto.createVerify('RSA-SHA256')
    verify.update(data)
    return verify.verify(publicKey, signature, 'hex')
  }

  /**
   * Generate a secure session ID
   */
  static generateSessionId(): string {
    const timestamp = Date.now().toString()
    const random = this.generateToken(16)
    return this.createHash(`${timestamp}-${random}`)
  }

  /**
   * Securely compare two strings to prevent timing attacks
   */
  static secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false
    }
    
    const aBuffer = Buffer.from(a)
    const bBuffer = Buffer.from(b)
    
    let result = 0
    for (let i = 0; i < aBuffer.length; i++) {
      result |= aBuffer[i] ^ bBuffer[i]
    }
    
    return result === 0
  }
}

// Default encryption service instance
export const encryptionService = new EncryptionService()