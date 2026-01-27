'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import OwnerDash from '../components/dashboards/OwnerDash'

// 2. This MUST be 'export default function'
export default function DashboardPage() {
  const supabase = createClient()
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getUserRole() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        setRole(profile?.role || 'employee')
      }
      setLoading(false)
    }
    getUserRole()
  }, [supabase])

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Loading Dashboard...</div>
  }

  // 3. Ensure we return a valid piece of JSX
  return (
    <main className="">      
      <div className="">
        {role === 'owner' && <OwnerDash/>}
        
        
        {/* Fallback in case role is missing */}
        {!role && <p className="text-red-500">No role assigned. Please contact support.</p>}
      </div>
    </main>
  )
}