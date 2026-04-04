import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { routePermissions } from "./app/utils/permissions"

export async function proxy(req: NextRequest) {
  const res = NextResponse.next()

  const pathname = req.nextUrl.pathname

  /* -------------------------------- */
  /* Public Routes                    */
  /* -------------------------------- */
  const publicRoutes = ["/login", "/signup"]

  // 1. Initialize Supabase
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

  // 2. Get user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  /* -------------------------------- */
  /* Not logged in                    */
  /* -------------------------------- */
  if (!user && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  /* -------------------------------- */
  /* Already logged in → block auth pages */
  // /* -------------------------------- */
  // if (user && publicRoutes.includes(pathname)) {
  //   return NextResponse.redirect(new URL("/dashboard", req.url))
  // }

  // If still no user (public route), allow
  if (!user) return res

  /* -------------------------------- */
  /* Get Profile                      */
  /* -------------------------------- */
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, company_id")
    .eq("id", user.id)
    .single()

  if (!profile) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  const role = profile.role

  /* -------------------------------- */
  /* Get Company Plan (only for users)*/
  /* -------------------------------- */
  let plan: string | null = null

  if (!role.startsWith("peto_")) {
    const { data: company } = await supabase
      .from("companies")
      .select("service_type")
      .eq("id", profile.company_id)
      .single()

    plan = company?.service_type || null
  }

  /* -------------------------------- */
  /* Block wrong dashboard access     */
  /* -------------------------------- */
  if (pathname.startsWith("/admindash") && !role.startsWith("peto_")) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  if (pathname.startsWith("/dashboard") && role.startsWith("peto_")) {
    return NextResponse.redirect(new URL("/admindash", req.url))
  }

  /* -------------------------------- */
  /* Match Route                      */
  /* -------------------------------- */
  const sortedRoutes = Object.keys(routePermissions).sort(
    (a, b) => b.length - a.length
  )

  const matchedRoute = sortedRoutes.find((route) =>
    pathname.startsWith(route)
  )

  // If route not protected → allow
  if (!matchedRoute) return res

  const permission = routePermissions[matchedRoute]

  /* -------------------------------- */
  /* Permission Check                 */
  /* -------------------------------- */
  const roleAllowed = permission.roles.includes(role)

  const planAllowed =
    permission.plans.includes("*") ||
    (plan ? permission.plans.includes(plan) : false)

  if (!roleAllowed || !planAllowed) {
    console.log(
      `❌ Access Denied: Role(${role}) Plan(${plan}) → ${pathname}`
    )

    const redirectPath = pathname.startsWith("/admindash")
      ? "/admindash"
      : "/dashboard"

    return NextResponse.redirect(new URL(redirectPath, req.url))
  }

  /* -------------------------------- */
  /* ✅ Access Allowed                 */
  /* -------------------------------- */
  return res
}

/* -------------------------------- */
/* Apply to routes                  */
/* -------------------------------- */
export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/admindash",
    "/admindash/:path*",
  ],
}
