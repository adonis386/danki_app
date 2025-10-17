'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { Notification as NotificationType } from '@/contexts/NotificationContext'

interface NotificationProps {
  notification: NotificationType
  onRemove: (id: string) => void
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const colors = {
  success: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: 'text-emerald-600',
    title: 'text-emerald-900',
    message: 'text-emerald-700',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-600',
    title: 'text-red-900',
    message: 'text-red-700',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: 'text-yellow-600',
    title: 'text-yellow-900',
    message: 'text-yellow-700',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    title: 'text-blue-900',
    message: 'text-blue-700',
  },
}

export default function Notification({ notification, onRemove }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  
  const Icon = icons[notification.type]
  const colorScheme = colors[notification.type]

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleRemove = () => {
    setIsLeaving(true)
    setTimeout(() => {
      onRemove(notification.id)
    }, 300)
  }

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isLeaving 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
        }
        ${isLeaving ? 'translate-x-full opacity-0 scale-95' : ''}
      `}
    >
      <div className={`
        ${colorScheme.bg} ${colorScheme.border}
        border-2 rounded-xl p-4 shadow-lg backdrop-blur-sm
        max-w-sm w-full
      `}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Icon className={`w-6 h-6 ${colorScheme.icon}`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-bold ${colorScheme.title}`}>
              {notification.title}
            </h4>
            {notification.message && (
              <p className={`text-sm mt-1 ${colorScheme.message}`}>
                {notification.message}
              </p>
            )}
          </div>
          
          <button
            onClick={handleRemove}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  )
}
