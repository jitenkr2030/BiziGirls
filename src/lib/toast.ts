import { toast } from 'sonner'
import { getErrorMessage } from './errors'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastOptions {
  duration?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  action?: {
    label: string
    onClick: () => void
  }
}

export function showToast(
  message: string,
  type: ToastType = 'info',
  options: ToastOptions = {}
) {
  const { duration = 4000, position = 'top-right', action } = options

  switch (type) {
    case 'success':
      toast.success(message, {
        duration,
        position,
        action,
      })
      break
    case 'error':
      toast.error(message, {
        duration,
        position,
        action,
      })
      break
    case 'warning':
      toast.warning(message, {
        duration,
        position,
        action,
      })
      break
    case 'info':
      toast.info(message, {
        duration,
        position,
        action,
      })
      break
  }
}

export function showSuccess(message: string, options?: ToastOptions) {
  showToast(message, 'success', options)
}

export function showError(message: string, options?: ToastOptions) {
  showToast(message, 'error', options)
}

export function showWarning(message: string, options?: ToastOptions) {
  showToast(message, 'warning', options)
}

export function showInfo(message: string, options?: ToastOptions) {
  showToast(message, 'info', options)
}

export function handleApiError(error: unknown) {
  const message = getErrorMessage(error)
  showError(message)
}