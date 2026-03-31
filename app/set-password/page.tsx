'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import { useSearchParams, useRouter } from 'next/navigation'

export default function SetPasswordPage() {
  const supabase = createClient()
  const params = useSearchParams()
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [invite, setInvite] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const token = params.get('token')

  // 1. Verify invite
  useEffect(() => {
    const loadInvite = async () => {
      const { data } = await supabase
        .from('employee_invites')
        .select('*')
        .eq('token', token)
        .eq('used', false)
        .single()

      if (!data) {
        alert("Invalid or expired link")
        return
      }

      if (new Date(data.expires_at) < new Date()) {
        alert("Invite expired")
        return
      }

      setInvite(data)
    }

    if (token) loadInvite()
  }, [token])

  // 2. Create account
  const handleCreate = async () => {
    if (!invite) return

    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email: invite.email,
      password,
    })

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    const userId = data.user?.id

    // 3. Save profile
    await supabase.from('profiles').insert({
      id: userId,
      email: invite.email,
      role: invite.role,
      company_id: invite.company_id,
    })

    // 4. Mark invite used
    await supabase
      .from('employee_invites')
      .update({ used: true })
      .eq('id', invite.id)

    alert("Account created!")

    router.push('/dashboard')
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto mt-20 space-y-4">
      <h2>Create your account</h2>

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border p-2"
      />

      <button onClick={handleCreate}>
        {loading ? "Creating..." : "Create Account"}
      </button>
    </div>
  )
}