import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

// 1. MUST BE NAMED "middleware"
export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Initialize Supabase
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    response = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Get the user
    const { data: { user } } = await supabase.auth.getUser()

    // Logic for Redirects
    // const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard')
    const isAuthPage = request.nextUrl.pathname === '/' ||
        request.nextUrl.pathname === '/signup' ||
        request.nextUrl.pathname.startsWith('/auth')

    // Rule: Logged in users cannot go back to login/signup
    if (user && isAuthPage) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // Rule: Logged out users cannot access dashboard
    // if (!user && isDashboardPage) {
    //     return NextResponse.redirect(new URL('/', request.url))
    // }

    return response
}

// Ensure the matcher covers all routes except static files
export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
}