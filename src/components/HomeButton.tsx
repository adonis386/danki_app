'use client'

import Link from 'next/link'
import { Home } from 'lucide-react'

interface HomeButtonProps {
  className?: string
  variant?: 'default' | 'floating'
}

export default function HomeButton({ className = '', variant = 'default' }: HomeButtonProps) {
  if (variant === 'floating') {
    return (
      <Link
        href="/"
        className={`fixed bottom-6 right-6 z-40 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 ${className}`}
        title="Ir al inicio"
      >
        <Home className="w-6 h-6" />
      </Link>
    )
  }

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105 ${className}`}
    >
      <Home className="w-5 h-5" />
      Inicio
    </Link>
  )
}
