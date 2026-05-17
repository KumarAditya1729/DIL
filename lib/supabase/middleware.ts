import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder',
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Skip auth enforcement when Supabase is not yet configured (local dev)
  const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

  if (!isSupabaseConfigured) {
    return response;
  }

  // Refresh session — required for Server Components to get fresh auth state
  const { data: { user } } = await supabase.auth.getUser()

  const isParent = user?.user_metadata?.role === 'parent'

  // Protect Admin Portal (/dashboard) - redirect to parent portal if user is a parent
  if (user && isParent && request.nextUrl.pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/parent/dashboard'
    return NextResponse.redirect(url)
  }

  // Protect Parent Portal (/parent/dashboard) - redirect to admin portal if user is staff/admin
  if (user && !isParent && request.nextUrl.pathname.startsWith('/parent/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Protect /dashboard routes — redirect to /login if not authenticated
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Protect /parent/dashboard routes — redirect to /parent/login if not authenticated
  if (!user && request.nextUrl.pathname.startsWith('/parent/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/parent/login'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from login pages
  if (user) {
    if (request.nextUrl.pathname === '/login') {
      const url = request.nextUrl.clone()
      url.pathname = isParent ? '/parent/dashboard' : '/dashboard'
      return NextResponse.redirect(url)
    }
    if (request.nextUrl.pathname === '/parent/login') {
      const url = request.nextUrl.clone()
      url.pathname = isParent ? '/parent/dashboard' : '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return response
}

