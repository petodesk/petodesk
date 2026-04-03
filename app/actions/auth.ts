'use server'

import { createClient } from '@supabase/supabase-js'

export async function adminSetUserPassword(email: string, password: string) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Get the user by email to find their ID
  const { data: userData, error: getError } = await supabaseAdmin.auth.admin.listUsers()
  const user = userData.users.find(u => u.email === email)

  if (getError || !user) {
    return { error: "User not found. Please contact your admin." }
  }

  // 2. Update that specific user
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
    user.id,
    { 
      password: password,
      email_confirm: true // Ensure they are confirmed now
    }
  )

  return { user: data?.user, error: error ? error.message : null }
}