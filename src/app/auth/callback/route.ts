import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Redirigir a la página solicitada o al home
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // Si hay error o no hay code, redirigir al home
  return NextResponse.redirect(new URL('/', request.url))
}

