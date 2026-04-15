'use server'

import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'
import { Resend } from 'resend'

export async function createInvite(email: string, name:string, companyName: string, companyId: string) {
  const supabase = createClient(    
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! )

  const resend = new Resend(process.env.RESEND_API_KEY)
  const token = randomUUID()

  // ✅ Base URL logic
const baseUrl =
  process.env.NODE_ENV === 'development'
    ? process.env.NEXT_PUBLIC_APP_URL
    : process.env.NEXT_PUBLIC_LIVE_URL || `https://${process.env.VERCEL_URL}`

if (!baseUrl) {
  throw new Error('Base URL is not configured')
}

  // 1. Save invite in DB
  const { error: dbError } = await supabase.from('employee_invites').insert({
    email,
    company_id: companyId,
    token,
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // Use toISOString() for Supabase
  })

  if (dbError) {
    console.error("Database Error:", dbError)
    throw new Error("Failed to save invite to database")
  }

  // 2. Create link
  const inviteLink = `${baseUrl}/set-password?token=${token}`

  // 3. Send email
  const { data, error: resendError } = await resend.emails.send({
    from: 'HR <hr@petodesk.com>',
    to: email,
    subject: 'You are invited to join Petodesk',
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
       <p>Hello <strong>${name}</strong>,</p> 
        <h3>You are invited To the <strong>${companyName}</strong> Company</h3>
        <p>Click the button below to set your password and join the team:</p>
        <a href="${inviteLink}" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Set Password</a>
        <p style="margin-top: 20px; font-size: 12px; color: #666;">This link expires in 24 hours.</p>
      </div>
    `,
  })

  if (resendError) {
    console.error("RESEND ERROR:", resendError)
    return { success: false, error: resendError.message }
  }

  console.log("RESEND SUCCESS:", data)
  return { success: true }
}