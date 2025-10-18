import { NextRequest } from 'next/server'
import { ZodError } from 'zod'
import { schemas } from './validations'

export class ValidationError extends Error {
  constructor(message: string, public errors: any[]) {
    super(message)
    this.name = 'ValidationError'
  }
}

export function validateRequest<T>(schema: any, data: any): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError('Validation failed', error.errors)
    }
    throw error
  }
}

export function validateBody<T>(schemaName: keyof typeof schemas, operation: string) {
  return (request: NextRequest): Promise<T> => {
    return new Promise(async (resolve, reject) => {
      try {
        const body = await request.json()
        const schema = (schemas[schemaName] as any)[operation]
        if (!schema) {
          reject(new Error(`Schema ${schemaName}.${operation} not found`))
          return
        }
        const validated = validateRequest(schema, body)
        resolve(validated)
      } catch (error) {
        if (error instanceof ValidationError) {
          reject({
            success: false,
            error: 'Validation failed',
            details: error.errors
          })
        } else {
          reject(error)
        }
      }
    })
  }
}

export function validateQuery<T>(schema: any) {
  return (request: NextRequest): T => {
    try {
      const { searchParams } = new URL(request.url)
      const query: any = {}
      
      // Convert search params to appropriate types
      searchParams.forEach((value, key) => {
        if (key === 'page' || key === 'limit' || key.includes('Count')) {
          query[key] = parseInt(value)
        } else if (key === 'price' || key === 'amount' || key.includes('Amount') || key.includes('Revenue')) {
          query[key] = parseFloat(value)
        } else if (value === 'true' || value === 'false') {
          query[key] = value === 'true'
        } else {
          query[key] = value
        }
      })
      
      return validateRequest(schema, query)
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new ValidationError('Query validation failed', error.errors)
      }
      throw error
    }
  }
}

export function handleValidationError(error: any) {
  if (error instanceof ValidationError) {
    return {
      success: false,
      error: 'Validation failed',
      details: error.errors.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message
      }))
    }
  }
  return {
    success: false,
    error: 'Internal server error'
  }
}