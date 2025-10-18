import { NextResponse } from 'next/server'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface FilterParams {
  search?: string
  [key: string]: any
}

export class ApiUtils {
  static success<T>(
    data: T,
    message?: string,
    pagination?: ApiResponse<T>['pagination']
  ): NextResponse<ApiResponse<T>> {
    return NextResponse.json({
      success: true,
      data,
      message,
      pagination
    })
  }

  static error(
    error: string,
    status: number = 500
  ): NextResponse<ApiResponse> {
    return NextResponse.json(
      {
        success: false,
        error
      },
      { status }
    )
  }

  static created<T>(
    data: T,
    message: string = 'Resource created successfully'
  ): NextResponse<ApiResponse<T>> {
    return NextResponse.json({
      success: true,
      data,
      message
    }, { status: 201 })
  }

  static noContent(message: string = 'Resource deleted successfully'): NextResponse<ApiResponse> {
    return NextResponse.json({
      success: true,
      message
    }, { status: 204 })
  }

  static badRequest(message: string = 'Bad request'): NextResponse<ApiResponse> {
    return this.error(message, 400)
  }

  static unauthorized(message: string = 'Unauthorized'): NextResponse<ApiResponse> {
    return this.error(message, 401)
  }

  static forbidden(message: string = 'Forbidden'): NextResponse<ApiResponse> {
    return this.error(message, 403)
  }

  static notFound(message: string = 'Resource not found'): NextResponse<ApiResponse> {
    return this.error(message, 404)
  }

  static validationError(message: string = 'Validation failed'): NextResponse<ApiResponse> {
    return this.error(message, 422)
  }

  static getPaginationParams(request: Request): PaginationParams {
    const { searchParams } = new URL(request.url)
    return {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'
    }
  }

  static getFilterParams(request: Request): FilterParams {
    const { searchParams } = new URL(request.url)
    const filters: FilterParams = {}
    
    // Add search parameter if present
    const search = searchParams.get('search')
    if (search) {
      filters.search = search
    }

    // Add all other filter parameters
    searchParams.forEach((value, key) => {
      if (!['page', 'limit', 'sortBy', 'sortOrder', 'search'].includes(key)) {
        filters[key] = value
      }
    })

    return filters
  }

  static buildWhereClause(filters: FilterParams, modelFields: string[] = []): any {
    const where: any = {}

    // Handle search across multiple fields
    if (filters.search && modelFields.length > 0) {
      where.OR = modelFields.map(field => ({
        [field]: { contains: filters.search, mode: 'insensitive' }
      }))
    }

    // Handle other filters
    Object.keys(filters).forEach(key => {
      if (key !== 'search') {
        const value = filters[key]
        
        // Handle array values (comma-separated)
        if (typeof value === 'string' && value.includes(',')) {
          where[key] = { in: value.split(',').map(v => v.trim()) }
        }
        // Handle boolean values
        else if (value === 'true' || value === 'false') {
          where[key] = value === 'true'
        }
        // Handle numeric values
        else if (!isNaN(Number(value))) {
          where[key] = Number(value)
        }
        // Handle date ranges
        else if (key.endsWith('_gte')) {
          const field = key.replace('_gte', '')
          where[field] = { gte: new Date(value) }
        } else if (key.endsWith('_lte')) {
          const field = key.replace('_lte', '')
          where[field] = { lte: new Date(value) }
        }
        // Handle string values
        else {
          where[key] = { contains: value, mode: 'insensitive' }
        }
      }
    })

    return where
  }

  static buildOrderBy(sortBy: string, sortOrder: 'asc' | 'desc'): any {
    return { [sortBy]: sortOrder }
  }

  static async getPaginatedResults<T>(
    model: any,
    where: any,
    pagination: PaginationParams,
    include?: any
  ): Promise<{
    data: T[]
    pagination: ApiResponse<T>['pagination']
  }> {
    const { page, limit, sortBy, sortOrder } = pagination
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      model.findMany({
        where,
        include,
        skip,
        take: limit,
        orderBy: this.buildOrderBy(sortBy, sortOrder)
      }),
      model.count({ where })
    ])

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }
}