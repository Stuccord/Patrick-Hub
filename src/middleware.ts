import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from './lib/supabaseServer'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  try {
    const supabase = createMiddlewareClient(request, response)
    const { data: { user } } = await supabase.auth.getUser()
    const url = request.nextUrl.clone()

    // If no user is logged in, redirect to login
    if (!user) {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // Retrieve the user record from public.users
    const { data: dbUser, error } = await supabase
      .from('users')
      .select('role, status')
      .eq('id', user.id)
      .single()

    if (error || !dbUser) {
      console.error("Middleware DB user fetch error or user not found:", error)
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    const { role, status } = dbUser

    // Admin path protection
    if (request.nextUrl.pathname.startsWith('/admin')) {
      if (role !== 'admin') {
        url.pathname = '/login'
        return NextResponse.redirect(url)
      }
    }

    // Agent dashboard path protection
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      if (role !== 'agent' || status !== 'active') {
        url.pathname = '/login'
        url.searchParams.set('error', status === 'pending' ? 'pending_approval' : 'suspended')
        return NextResponse.redirect(url)
      }
    }

    return response
  } catch (e) {
    console.error("Middleware exception:", e)
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
  ],
}
