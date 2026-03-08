import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { routePermissions } from "./app/utils/permissions"

export async function proxy(req: NextRequest) {
  const res = NextResponse.next()

  // 1. Initialize Supabase Client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          res.cookies.set({ name, value: "", ...options })
        },
      },
    }
  )

  // 2. Check Authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // 3. Find the most specific matching route
  const pathname = req.nextUrl.pathname
  const publicRoutes = ["/login", "/signup"] 

  // if(user && publicRoutes.includes(pathname)) {
  //   return NextResponse.redirect(new URL("/dashboard", req.url))
  // }
  // Sorting by length ensures /dashboard/inventory matches before /dashboard
  const sortedRoutes = Object.keys(routePermissions).sort((a, b) => b.length - a.length)
  const matchedRoute = sortedRoutes.find((route) => pathname.startsWith(route))

  // If the route isn't in your permission list, allow it or redirect as a fallback
  if (!matchedRoute) return res

  // 4. Fetch Profile and Company Data
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, company_id")
    .eq("id", user.id)
    .single()

  if (!profile) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  const { data: company } = await supabase
    .from("companies")
    .select("service_type")
    .eq("id", profile.company_id)
    .single()

  const role = profile.role
  const plan = company?.service_type
  const permission = routePermissions[matchedRoute]

  // 5. Permission Check
  const roleAllowed = permission.roles.includes(role)
  const planAllowed = permission.plans.includes(plan)

  if (!roleAllowed || !planAllowed) {
    console.log(`Access Denied: Role(${role}) or Plan(${plan}) invalid for ${pathname}`)
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return res
}

// Ensure the matcher covers the base dashboard and all sub-paths
export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
}