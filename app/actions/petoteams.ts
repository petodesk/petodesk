'use server'

import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { randomUUID } from 'crypto'

export async function addTeamMember(email: string, role: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const resend = new Resend(process.env.RESEND_API_KEY!)

  const token = randomUUID()

  const baseUrl =
    process.env.NODE_ENV === 'development'
      ? process.env.NEXT_PUBLIC_APP_URL
      : `https://${process.env.VERCEL_URL}`

  // ✅ Check duplicate
  const { data: existing } = await supabase
    .from('peto_teams')
    .select('email')
    .eq('email', email)
    .maybeSingle()

  if (existing) {
    throw new Error('User already invited')
  }

  // ✅ Create auth user
  const { data: authUser, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password: randomUUID(),
      email_confirm: true,
      user_metadata: {
        full_name: email.split('@')[0],
      },
    })

  if (authError || !authUser?.user) {
    throw new Error(authError?.message || 'Failed to create user')
  }

  // ✅ Insert team
  const { error: teamError } = await supabase
    .from('peto_teams')
    .insert({
      user_id: authUser.user.id,
      email,
      role,
      invite_token: token,
      token_expires_at: new Date(
        Date.now() + 1000 * 60 * 60 * 24
      ).toISOString(),
    })

  if (teamError) {
    await supabase.auth.admin.deleteUser(authUser.user.id)
    throw new Error(teamError.message)
  }

  // ✅ Insert profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authUser.user.id,
      email,
      full_name: email.split('@')[0],
      role,
      company_id:"2b366b1d-9c10-41e7-afec-3c1404ff74c6"
    })

  if (profileError) {
    await supabase.auth.admin.deleteUser(authUser.user.id)
    throw new Error(profileError.message)
  }

  // ✅ Send email via :contentReference[oaicite:1]{index=1}
  const link = `${baseUrl}/set-password?token=${token}`

  await resend.emails.send({
    from: 'PetoDesk <onboarding@petodesk.com>',
    to: email,
    subject: 'You are invited to PetoDesk',
    html: `
      <h2>Welcome to PetoDesk 🚀</h2>
      <p>You have been added as <b>${role}</b></p>
      <p>Click below to set your password:</p>
      <a href="${link}">Set Password</a>
    `,
  })

  return { success: true }
}