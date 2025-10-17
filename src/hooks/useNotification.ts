'use client'

import { useNotifications } from '@/contexts/NotificationContext'
import { useCallback } from 'react'

export function useNotification() {
  const { addNotification } = useNotifications()

  const showSuccess = useCallback((title: string, message?: string, duration?: number) => {
    addNotification({
      type: 'success',
      title,
      message,
      duration,
    })
  }, [addNotification])

  const showError = useCallback((title: string, message?: string, duration?: number) => {
    addNotification({
      type: 'error',
      title,
      message,
      duration,
    })
  }, [addNotification])

  const showWarning = useCallback((title: string, message?: string, duration?: number) => {
    addNotification({
      type: 'warning',
      title,
      message,
      duration,
    })
  }, [addNotification])

  const showInfo = useCallback((title: string, message?: string, duration?: number) => {
    addNotification({
      type: 'info',
      title,
      message,
      duration,
    })
  }, [addNotification])

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  }
}
