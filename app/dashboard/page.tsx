'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import BothDashPlanDash from '../components/dashboards/bothDashPlanDash'
import InventoryPlanDash from '../components/dashboards/inventoryPlanDash'
import HrPlanDash from '../components/dashboards/HrPlanDash'
import { Loading } from '../components/Loading'

// 2. This MUST be 'export default function'
export default function DashboardPage() {
  const supabase = createClient()
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
const[plan, setPlan] = useState<string | null>(null)

  useEffect(() => {

    const fetchUserData = async () => {

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      /* get user profile */
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, company_id')
        .eq('id', user.id)
        .single()

      if (!profile) {
        setLoading(false)
        return
      }

      setRole(profile.role)

      /* get company plan */

      const { data: company } = await supabase
        .from('companies')
        .select('service_type')
        .eq('id', profile.company_id)
        .single()

      setPlan(company?.service_type || null)

      setLoading(false)
    }

    fetchUserData()

  }, [])


  if (loading) {
    return <Loading/>
  }

  // 3. Ensure we return a valid piece of JSX
  return (
    <main className="">      
      <div className="">
        {/* {role === 'owner' && <OwnerDash/>} */}
        {plan === 'both' && <BothDashPlanDash/>}
        {plan === 'inventory' && <InventoryPlanDash/>}
        {plan === 'hr' && <HrPlanDash/>}
        
        {/* Fallback in case role is missing */}
        {!role && <p className="text-red-500">No role assigned. Please contact support.</p>}
      </div>
    </main>
  )
}