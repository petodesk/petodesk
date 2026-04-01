'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Loading } from '@/app/components/Loading'
import PayButton from '@/app/components/payButton'

type Plan = {
  id: string
  name: string
  price: number
}

export default function BillingPage() {

  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

useEffect(() => {
  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUser(user)
    
  }
  fetchData()
}, [])

  const [plans, setPlans] = useState<Plan[]>([])
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [trialEnd, setTrialEnd] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {

    const fetchData = async () => {

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      // profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single()

      if (!profile) return

      setCompanyId(profile.company_id)

      // subscription
      const { data: sub } = await supabase
        .from('subscriptions')
        .select(`
          id,
          status,
          trial_end,
          plans (
            id,
            name,
            price
          )
        `)
        .eq('company_id', profile.company_id)
        .single()

      setSubscriptionId(sub?.id || null)
      setCurrentPlan(sub?.plans?.name || null)
      setStatus(sub?.status || null)
      setTrialEnd(sub?.trial_end || null)

      // all plans
      const { data: allPlans } = await supabase
        .from('plans')
        .select('*')
        .order('price', { ascending: true })

      setPlans(allPlans || [])

      setLoading(false)
    }

    fetchData()

  }, [])

  // 🚀 Upgrade Logic
  const handleChangePlan = async (planId: string, planName: string) => {

    if (!subscriptionId || !companyId) return

    if (planName === currentPlan) return

    setUpdating(planId)

    const updates: any = {
      plan_id: planId,
      status: 'active'
    }

    // remove trial if upgrading
    if (status === 'trialing') {
      updates.trial_end = null
    }

    const { error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', subscriptionId)

    if (error) {
      console.error(error)
      alert('Failed to update plan')
      setUpdating(null)
      return
    }

    // refresh UI
    router.refresh()
    setUpdating(null)
  }

  const getDaysLeft = () => {
    if (!trialEnd) return 0
    return Math.max(
      Math.ceil(
        (new Date(trialEnd).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
      ),
      0
    )
  }

  if (loading) return <Loading />

  return (
    <main className="p-6 max-w-5xl mx-auto">

      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-2">Billing</h1>

      {/* CURRENT PLAN */}
      <div className="bg-white shadow rounded-xl p-4 mb-6">
        <p className="text-sm text-gray-500">Current Plan</p>
        <h2 className="text-xl font-semibold">{currentPlan}</h2>
        <p className="text-sm mt-1">Status: {status}</p>

        {status === 'trialing' && (
          <p className="text-yellow-600 text-sm mt-2">
            Trial ends in {getDaysLeft()} days
          </p>
        )}
      </div>

      {/* PLANS */}
      <div className="grid md:grid-cols-2 gap-4">

        {plans.map((plan) => {
  const isCurrent = plan.name === currentPlan

  return (
    <div
      key={plan.id}
      className={`border rounded-xl p-5 shadow-sm ${
        isCurrent ? 'border-blue-500' : ''
      }`}
    >
      <h3 className="text-lg font-semibold">{plan.name}</h3>
      <p className="text-2xl font-bold mt-2">
        ${plan.price}
      </p>

      {isCurrent && (
        <span className="text-xs text-blue-600 font-medium">
          Current Plan
        </span>
      )}

      {user && !isCurrent && (
        <PayButton user={user} plan={plan} />
      )}

      {isCurrent && (
        <button
          disabled
          className="mt-4 w-full py-2 rounded-lg bg-gray-200 text-gray-500 text-sm font-medium"
        >
          Current Plan
        </button>
      )}

    </div>
  )
})}

      </div>

    </main>
  )
}