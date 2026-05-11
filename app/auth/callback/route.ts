import { createClient } from '@/app/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/auth-error`)
  }

  const supabase = await createClient()

  // 1️⃣ Exchange code for session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data?.user) {
    return NextResponse.redirect(`${origin}/auth/auth-error`)
  }

  const user = data.user

  // 2️⃣ Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, company_id, email')
    .eq('id', user.id)
    .single()

  // 3️⃣ LOG ACTIVITY (IMPORTANT)
  if (profile) {
    await supabase.from('activity_logs').insert({
      user_id: profile.id,
      company_id: profile.company_id,
      action_type: 'login',
      module: 'auth',
      metadata: {
        email: profile.email,
        role: profile.role,
        method: 'google',
        timestamp: new Date().toISOString(),
      },
    })
  }

  // 4️⃣ Redirect based on role
  const role = profile?.role || ''

  if (role.startsWith('peto_')) {
    return NextResponse.redirect(`${origin}/admindash`)
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}