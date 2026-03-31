'use server'

import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'
import { Resend } from 'resend'

export async function createInvite(email: string, companyId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const resend = new Resend(process.env.RESEND_API_KEY)

  const token = randomUUID()
 // -------------------------------------------------
    // ✅ Base URL check
    // -------------------------------------------------
    const baseUrl =
      process.env.NODE_ENV === 'development'
        ? process.env.NEXT_PUBLIC_APP_URL
        : process.env.NEXT_PUBLIC_LIVE_URL

    if (!baseUrl) {
      throw new Error('Base URL is not configured')
    }
  // 1. Save invite in DB
  const { error } = await supabase.from('employee_invites').insert({
    email,
    company_id: companyId,
    token,
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
  })

  if (error) throw error

  // 2. Create link
  const inviteLink = `${baseUrl}/set-password?token=${token}`

//   // 3. Send email
//   await resend.emails.send({
//    from: 'onboarding@resend.dev',
//     to: email,
//     subject: 'You are invited to join',
//     html: `
//       <h2>You are invited 🎉</h2>
//       <p>Click below to set your password:</p>
//       <a href="${inviteLink}">Set Password</a>
//       <p>This link expires in 24 hours.</p>
//     `,
//   })

const { data } = await resend.emails.send({
  from: 'onboarding@resend.dev', // ✅ test sender
  to: email,
  subject: 'You are invited',
  html: `<a href="${inviteLink}">Set Password</a>`
})

console.log("RESEND DATA:", data)
// console.log("RESEND ERROR:", error)

  return { success: true }
}