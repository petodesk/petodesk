import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { routePermissions } from "./app/utils/permissions"

/* -------------------------------- */
/* Employee landing page            */
/* -------------------------------- */
// Employees never see /dashboard. They land on their first sidebar item instead.
// Keep in sync with the Sidebar `links` and the dashboard page.
const EMPLOYEE_HOME: Record<string, string> = {
  inventory: "/dashboard/sell",
  business_plus: "/dashboard/sell",
  hr: "/dashboard/expenses",
}
// Expenses is open to employees on every plan, so it is the safe fallback
const EMPLOYEE_FALLBACK = "/dashboard/expenses"

const employeeHome = (plan: string | null) =>
  (plan && EMPLOYEE_HOME[plan]) || EMPLOYEE_FALLBACK

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
  .select("service_type, status")
  .eq("id", profile.company_id)
  .single()

if (!role.startsWith("peto_") && company?.status === "suspended") {
  if (!pathname.startsWith("/suspended")) {
    return NextResponse.redirect(new URL("/suspended", req.url))
  }

  return res
}

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
  /* 🔒 Employees: no dashboard        */
  /* -------------------------------- */
  if (
    role === "employee" &&
    (pathname === "/dashboard" || pathname === "/dashboard/")
  ) {
    return NextResponse.redirect(new URL(employeeHome(plan), req.url))
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

    // Where to send the denied user
    let redirectPath = "/dashboard"
    if (pathname.startsWith("/admindash")) redirectPath = "/admindash"
    else if (role === "employee") redirectPath = employeeHome(plan)

    // Loop guard: if the landing page itself is denied, stop instead of redirecting forever
    if (pathname === redirectPath) {
      return new NextResponse("Forbidden", { status: 403 })
    }

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
    "/suspended",
    "/admindash/:path*",
  ],
}