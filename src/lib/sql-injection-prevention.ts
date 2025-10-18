import { InputSanitizer } from './sanitization'

export class SQLInjectionPrevention {
  private static readonly DANGEROUS_PATTERNS = [
    /(\s|^)(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|UNION|EXEC|EXECUTE|DECLARE|CAST|CONVERT)(\s|$)/gi,
    /(\s|^)(OR|AND)\s+\d+\s*=\s*\d+/gi,
    /(\s|^)(OR|AND)\s+['"][^'"]*['"]\s*=\s*['"][^'"]*['"]/gi,
    /(\s|^)(WAITFOR\s+DELAY|SLEEP\(|BENCHMARK\(|PG_SLEEP\()/gi,
    /(\s|^)(LOAD_FILE|INTO\s+(OUTFILE|DUMPFILE))(?=\s|$)/gi,
    /(\s|^)(XPATH|EXTRACTVALUE|UPDATEXML)(\s|\()/gi,
    /(\s|^)(--|\/\*|\*\/|#)(?=\s|$)/gi,
    /(\s|^)(0x[0-9a-fA-F]+)(?=\s|$)/gi,
    /(\s|^)(CHAR\(|ASCII\(|SUBSTRING\(|MID\(|LENGTH\(|LOCATE\(|POSITION\(|INSTR\()/gi,
    /(\s|^)(IF\(|CASE\s+WHEN|COALESCE\(|NULLIF\()/gi,
    /(\s|^)(CONCAT\(|GROUP_CONCAT\(|CONCAT_WS\()/gi,
    /(\s|^)(HAVING|GROUP\s+BY|ORDER\s+BY)(\s|$)/gi,
    /(\s|^)(WHERE|SET|VALUES|INTO)(\s|$)/gi,
    /(\s|^)(FROM|JOIN|INNER|LEFT|RIGHT|FULL|OUTER|CROSS)(\s|$)/gi,
  ]

  private static readonly DANGEROUS_CHARACTERS = [
    "'", '"', ';', '--', '/*', '*/', 'xp_', '@@', '\\', '\x00', '\n', '\r'
  ]

  /**
   * Sanitize input to prevent SQL injection
   */
  static sanitize(input: string): string {
    if (typeof input !== 'string') {
      return input
    }

    // First apply basic sanitization
    let sanitized = InputSanitizer.sanitizeString(input)

    // Remove dangerous patterns
    for (const pattern of this.DANGEROUS_PATTERNS) {
      sanitized = sanitized.replace(pattern, '')
    }

    // Escape dangerous characters
    for (const char of this.DANGEROUS_CHARACTERS) {
      sanitized = sanitized.replace(new RegExp(this.escapeRegExp(char), 'g'), '')
    }

    return sanitized.trim()
  }

  /**
   * Sanitize all string values in an object
   */
  static sanitizeObject(obj: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {}

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitize(value)
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        sanitized[key] = this.sanitizeObject(value)
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => {
          if (typeof item === 'string') {
            return this.sanitize(item)
          } else if (typeof item === 'object' && item !== null) {
            return this.sanitizeObject(item)
          }
          return item
        })
      } else {
        sanitized[key] = value
      }
    }

    return sanitized
  }

  /**
   * Validate if input contains SQL injection patterns
   */
  static containsSQLInjection(input: string): boolean {
    if (typeof input !== 'string') {
      return false
    }

    for (const pattern of this.DANGEROUS_PATTERNS) {
      if (pattern.test(input)) {
        return true
      }
    }

    for (const char of this.DANGEROUS_CHARACTERS) {
      if (input.includes(char)) {
        return true
      }
    }

    return false
  }

  /**
   * Validate an object for SQL injection patterns
   */
  static validateObject(obj: Record<string, any>): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    const validate = (value: any, path: string = '') => {
      if (typeof value === 'string') {
        if (this.containsSQLInjection(value)) {
          errors.push(`SQL injection detected in ${path || 'input'}: ${value}`)
        }
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        for (const [key, val] of Object.entries(value)) {
          validate(val, path ? `${path}.${key}` : key)
        }
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          validate(item, path ? `${path}[${index}]` : `[${index}]`)
        })
      }
    }

    validate(obj)
    return { valid: errors.length === 0, errors }
  }

  /**
   * Create parameterized query helpers
   */
  static createParameterizedQuery(query: string, params: Record<string, any>): {
    query: string
    values: any[]
  } {
    const values: any[] = []
    let paramIndex = 0

    // Replace named parameters with positional parameters
    const parameterizedQuery = query.replace(/:(\w+)/g, (match, paramName) => {
      if (params.hasOwnProperty(paramName)) {
        values.push(params[paramName])
        paramIndex++
        return `$${paramIndex}`
      }
      return match
    })

    return { query: parameterizedQuery, values }
  }

  /**
   * Escape special characters for SQL
   */
  static escapeSQL(value: any): string {
    if (typeof value !== 'string') {
      return value
    }

    return value
      .replace(/'/g, "''")
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
      .replace(/\x00/g, '\\0')
  }

  /**
   * Validate table and column names
   */
  static validateIdentifier(identifier: string): boolean {
    // Only allow alphanumeric characters and underscores
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier)
  }

  /**
   * Validate SQL query structure (basic validation)
   */
  static validateQueryStructure(query: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    const normalizedQuery = query.toUpperCase()

    // Check for dangerous operations
    const dangerousOperations = [
      'DROP TABLE', 'DROP DATABASE', 'TRUNCATE TABLE', 'DELETE FROM',
      'UPDATE SET', 'INSERT INTO', 'CREATE TABLE', 'ALTER TABLE'
    ]

    for (const operation of dangerousOperations) {
      if (normalizedQuery.includes(operation)) {
        errors.push(`Dangerous operation detected: ${operation}`)
      }
    }

    // Check for UNION attacks
    if (normalizedQuery.includes('UNION SELECT')) {
      errors.push('UNION SELECT detected - potential SQL injection')
    }

    // Check for comment-based attacks
    if (normalizedQuery.includes('--') || normalizedQuery.includes('/*')) {
      errors.push('SQL comments detected - potential SQL injection')
    }

    return { valid: errors.length === 0, errors }
  }

  /**
   * Create a safe WHERE clause
   */
  static createSafeWhereClause(conditions: Record<string, any>): {
    clause: string
    values: any[]
  } {
    const clauses: string[] = []
    const values: any[] = []

    for (const [column, value] of Object.entries(conditions)) {
      if (!this.validateIdentifier(column)) {
        throw new Error(`Invalid column name: ${column}`)
      }

      if (value === null || value === undefined) {
        clauses.push(`${column} IS NULL`)
      } else if (typeof value === 'object' && value.operator) {
        // Handle operators like { operator: '>', value: 100 }
        const operators = ['=', '!=', '>', '<', '>=', '<=', 'LIKE', 'ILIKE', 'IN', 'NOT IN']
        if (operators.includes(value.operator.toUpperCase())) {
          if (value.operator.toUpperCase() === 'IN' || value.operator.toUpperCase() === 'NOT IN') {
            if (Array.isArray(value.value)) {
              const placeholders = value.value.map((_, i) => `$${values.length + i + 1}`).join(', ')
              clauses.push(`${column} ${value.operator} (${placeholders})`)
              values.push(...value.value)
            }
          } else {
            clauses.push(`${column} ${value.operator} $${values.length + 1}`)
            values.push(value.value)
          }
        } else {
          throw new Error(`Invalid operator: ${value.operator}`)
        }
      } else {
        clauses.push(`${column} = $${values.length + 1}`)
        values.push(value)
      }
    }

    return {
      clause: clauses.join(' AND '),
      values
    }
  }

  /**
   * Helper function to escape regex special characters
   */
  private static escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  /**
   * Log SQL injection attempt
   */
  static logInjectionAttempt(input: string, context: string = 'unknown'): void {
    console.error(`SQL Injection Attempt Detected - Context: ${context}`)
    console.error(`Input: ${input}`)
    console.error(`Timestamp: ${new Date().toISOString()}`)
    
    // In production, this should be sent to a security monitoring system
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to security monitoring service
    }
  }
}

// Default instance
export const sqlInjectionPrevention = new SQLInjectionPrevention()