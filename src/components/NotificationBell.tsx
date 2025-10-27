// =============================================
// COMPONENTE DE NOTIFICACIONES EN APP
// =============================================

'use client'

import React, { useState, useEffect } from 'react'
import { Bell, X, Check, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react'
import { useNotifications } from '@/lib/services/notificationService'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

interface NotificationBellProps {
  userId: string | null
  className?: string
}

export function NotificationBell({ userId, className = '' }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead } = useNotifications(userId)

  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Info className="h-4 w-4 text-blue-600" />
    }
  }

  const getNotificationColor = (tipo: string) => {
    switch (tipo) {
      case 'success':
        return 'border-l-green-500 bg-green-50'
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50'
      case 'error':
        return 'border-l-red-500 bg-red-50'
      default:
        return 'border-l-blue-500 bg-blue-50'
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return 'Ahora'
    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    return `${days}d`
  }

  return (
    <div className={`relative ${className}`}>
      {/* Botón de notificaciones */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg p-2 hover:bg-gray-100 transition-colors"
        title="Notificaciones"
      >
        <Bell className="h-6 w-6 text-gray-600" />
        
        {/* Badge de notificaciones no leídas */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="absolute right-0 top-12 z-50 w-80 rounded-lg border border-gray-200 bg-white shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900">Notificaciones</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Marcar todas como leídas
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1 hover:bg-gray-100"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Lista de notificaciones */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">No hay notificaciones</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        !notification.leida ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icono */}
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.tipo)}
                        </div>

                        {/* Contenido */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className={`text-sm font-medium ${
                                !notification.leida ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.titulo}
                              </h4>
                              <p className="mt-1 text-sm text-gray-600">
                                {notification.mensaje}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                {formatTime(notification.created_at)}
                              </p>
                            </div>

                            {/* Botón de marcar como leída */}
                            {!notification.leida && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="ml-2 rounded-lg p-1 hover:bg-gray-200 transition-colors"
                                title="Marcar como leída"
                              >
                                <Check className="h-3 w-3 text-gray-500" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-gray-200 p-3">
                <button
                  onClick={() => {
                    // TODO: Navegar a página de todas las notificaciones
                    setIsOpen(false)
                  }}
                  className="w-full text-center text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  Ver todas las notificaciones
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// =============================================
// COMPONENTE DE NOTIFICACIÓN TOAST
// =============================================

interface ToastNotificationProps {
  notification: {
    title: string
    body: string
    type: 'info' | 'success' | 'warning' | 'error'
    icon?: string
  }
  onClose: () => void
  duration?: number
}

export function ToastNotification({ 
  notification, 
  onClose, 
  duration = 5000 
}: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Esperar animación de salida
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-green-50 border-green-200',
          icon: 'text-green-600',
          title: 'text-green-900',
          body: 'text-green-700',
        }
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200',
          icon: 'text-yellow-600',
          title: 'text-yellow-900',
          body: 'text-yellow-700',
        }
      case 'error':
        return {
          container: 'bg-red-50 border-red-200',
          icon: 'text-red-600',
          title: 'text-red-900',
          body: 'text-red-700',
        }
      default:
        return {
          container: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-600',
          title: 'text-blue-900',
          body: 'text-blue-700',
        }
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />
      case 'error':
        return <AlertCircle className="h-5 w-5" />
      default:
        return <Info className="h-5 w-5" />
    }
  }

  const styles = getNotificationStyles(notification.type)

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm rounded-lg border p-4 shadow-lg transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      } ${styles.container}`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${styles.icon}`}>
          {getIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-medium ${styles.title}`}>
            {notification.title}
          </h4>
          <p className={`mt-1 text-sm ${styles.body}`}>
            {notification.body}
          </p>
        </div>

        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(onClose, 300)
          }}
          className="flex-shrink-0 rounded-lg p-1 hover:bg-black hover:bg-opacity-10"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>
    </div>
  )
}

// =============================================
// PROVIDER DE NOTIFICACIONES TOAST
// =============================================

interface ToastNotification {
  id: string
  title: string
  body: string
  type: 'info' | 'success' | 'warning' | 'error'
  icon?: string
}

interface NotificationContextType {
  showNotification: (notification: Omit<ToastNotification, 'id'>) => void
}

const NotificationContext = React.createContext<NotificationContextType | null>(null)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<ToastNotification[]>([])

  const showNotification = (notification: Omit<ToastNotification, 'id'>) => {
    const id = Date.now().toString()
    setNotifications(prev => [...prev, { ...notification, id }])
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      
      {/* Renderizar toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <ToastNotification
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

export function useNotificationToast() {
  const context = React.useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotificationToast must be used within NotificationProvider')
  }
  return context
}
