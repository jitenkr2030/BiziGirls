import { NextRequest, NextResponse } from 'next/server'
import { getErrorMessage, getErrorStatus, isAppError, ValidationError } from './errors'
import { InputSanitizer } from './sanitization'

export function handleApiError(error: unknown) {
  console.error('API Error:', error)
  
  const message = getErrorMessage(error)
  const status = getErrorStatus(error)
  
  return NextResponse.json(
    {
      success: false,
      error: message,
      statusCode: status,
    },
    { status }
  )
}

export function withErrorHandling(
  handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  return async (req: NextRequest, ...args: any[]) => {
    try {
      return await handler(req, ...args)
    } catch (error) {
      return handleApiError(error)
    }
  }
}

export async function validateRequestBody<T>(
  req: NextRequest,
  schema: {
    parse: (data: any) => T
  }
): Promise<T> {
  try {
    const body = await req.json()
    
    // Sanitize input
    const sanitizedBody = InputSanitizer.sanitizeObject(body)
    
    return schema.parse(sanitizedBody)
  } catch (error) {
    if (error instanceof Error) {
      throw new ValidationError(`Invalid request body: ${error.message}`)
    }
    throw new ValidationError('Invalid request body')
  }
}

export function validateQueryParams(params: URLSearchParams, rules: Record<string, any>) {
  const result: Record<string, any> = {}
  
  for (const [key, rule] of Object.entries(rules)) {
    const value = params.get(key)
    
    if (value === null) {
      if (rule.required) {
        throw new ValidationError(`Missing required query parameter: ${key}`)
      }
      continue
    }
    
    // Apply validation based on rule type
    switch (rule.type) {
      case 'string':
        result[key] = InputSanitizer.sanitizeString(value)
        if (rule.min && result[key].length < rule.min) {
          throw new ValidationError(`${key} must be at least ${rule.min} characters`)
        }
        if (rule.max && result[key].length > rule.max) {
          throw new ValidationError(`${key} must be less than ${rule.max} characters`)
        }
        break
        
      case 'number':
        const numValue = parseInt(value)
        if (isNaN(numValue)) {
          throw new ValidationError(`${key} must be a number`)
        }
        result[key] = numValue
        if (rule.min !== undefined && numValue < rule.min) {
          throw new ValidationError(`${key} must be at least ${rule.min}`)
        }
        if (rule.max !== undefined && numValue > rule.max) {
          throw new ValidationError(`${key} must be less than ${rule.max}`)
        }
        break
        
      case 'boolean':
        result[key] = value.toLowerCase() === 'true'
        break
        
      case 'enum':
        if (!rule.values.includes(value)) {
          throw new ValidationError(`${key} must be one of: ${rule.values.join(', ')}`)
        }
        result[key] = value
        break
        
      default:
        result[key] = value
    }
  }
  
  return result
}