'use client'

import { useEffect, useState, Suspense } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import { useSearchParams, useRouter } from 'next/navigation'
import { adminSetUserPassword } from '@/app/actions/auth'

function SetPasswordContent() {
  const supabase = createClient()
  const params = useSearchParams()
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [invite, setInvite] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const token = params.get('token')

  useEffect(() => {
    const loadInvite = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('employee_invites')
        .select('*')
        .eq('token', token)
        .eq('used', false)
        .single()

      if (error || !data) {
        alert("Invalid or already used link.")
        router.push('/login')
        return
      }

      if (new Date(data.expires_at) < new Date()) {
        alert("Invite has expired.")
        router.push('/login')
        return
      }

      setInvite(data)
      setLoading(false)
    }

    loadInvite()
  }, [token, router, supabase])

  const handleCreate = async () => {
    if (!invite || password.length < 6) {
      alert("Password must be at least 6 characters.")
      return
    }

    setIsSubmitting(true)

    // 1. Update the existing user's password & confirm them via Admin API
    const result = await adminSetUserPassword(invite.email, password)

    if (result.error || !result.user) {
      alert(result.error || "Failed to set password")
      setIsSubmitting(false)
      return
    }

    const userId = result.user.id

    // 2. Upsert Profile & Mark Invite Used
    // We use .upsert() so it works whether the profile exists or not
    const [profileRes, inviteRes] = await Promise.all([
      supabase.from('profiles').upsert({
        id: userId,
        email: invite.email,
        role: invite.role || 'employee',
        company_id: invite.company_id,
      }),
      supabase.from('employee_invites')
        .update({ used: true })
        .eq('id', invite.id)
    ])

    if (profileRes.error) {
       console.error("Profile sync error:", profileRes.error)
    }

    alert("Account ready! You can now log in.")
    router.push('/login')
    setIsSubmitting(false)
  }

  if (loading) return <div className="text-center mt-20">Verifying your invite...</div>
  if (!invite) return <div className="text-center mt-20">Link is no longer valid.</div>

  return (
    <div className="max-w-md mx-auto mt-20 p-8 border rounded-xl shadow-lg bg-white space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Finalize Account</h2>
        <p className="text-sm text-gray-500 mt-1">Set a password for {invite.email}</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">New Password</label>
        <input
          type="password"
          placeholder="Min. 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-black outline-none transition"
        />
      </div>

      <button 
        onClick={handleCreate}
        disabled={isSubmitting}
        className="w-full bg-black text-white font-medium p-3 rounded-md hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
      >
        {isSubmitting ? "Processing..." : "Set Password & Join"}
      </button>
    </div>
  )
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center mt-20">Loading...</div>}>
      <SetPasswordContent />
    </Suspense>
  )
}