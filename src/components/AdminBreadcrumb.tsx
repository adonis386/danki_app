'use client'

import Link from 'next/link'
import { ArrowLeft, Home } from 'lucide-react'

interface AdminBreadcrumbProps {
  currentPage: string
  showBackButton?: boolean
}

export default function AdminBreadcrumb({ currentPage, showBackButton = true }: AdminBreadcrumbProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        {showBackButton && (
          <Link
            href="/admin"
            className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Link>
        )}
        
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Link 
            href="/admin" 
            className="flex items-center hover:text-gray-700 transition-colors"
          >
            <Home className="w-4 h-4 mr-1" />
            Admin
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{currentPage}</span>
        </div>
      </div>
    </div>
  )
}
