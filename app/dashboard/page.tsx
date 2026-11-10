// 'use client'

// import { useEffect, useRef, useState } from 'react'
// import { createClient } from '@/app/utils/supabase/client'
// import BothDashPlanDash from '../components/dashboards/bothDashPlanDash'
// import InventoryPlanDash from '../components/dashboards/inventoryPlanDash'
// import HrPlanDash from '../components/dashboards/HrPlanDash'
// import { Loading } from '../components/Loading'
// import { useRouter } from 'next/navigation'
// import { useCompany } from '../context/CompanyContext'
// import OfficeLocationPage from '../components/dashboards/HrPlanDash'
// import { toast } from 'react-toastify'
// type SubscriptionWithPlan = {
//   status: string
//   trial_end: string | null
//   plans: {
//     name: string
//   }
// }

// export default function DashboardPage() {
//   const supabase = createClient()
//   const router = useRouter()

//   const [loading, setLoading] = useState(true)
//   const [plan, setPlan] = useState<string | null>(null)
//   const [status, setStatus] = useState<string | null>(null)
//   const [trialEnd, setTrialEnd] = useState<string | null>(null)
//   const { profile, company, refresh, companyStatus } = useCompany()
// useEffect(() => {
//   if (!profile && !loading) {
//     refresh()
//   }
// }, [profile, loading])

//   const hasShownToast = useRef(false)

//   useEffect(() => {

//     const fetchSubscription = async () => {

//       const { data: subscription } = await supabase
//         .from('subscriptions')
//         .select(`
//           status,
//           trial_end,
//           plans (
//             name
//           )
//         `)
//         .eq('company_id', company?.id)
//         .single()

//       // ✅ FIX: correct access
//       const subscriptionData = subscription as unknown as SubscriptionWithPlan
//       const planName = subscriptionData?.plans?.name || null

//       console.log('plan', planName)
//       setPlan(planName)
//       setStatus(subscription?.status || null)
//       setTrialEnd(subscription?.trial_end || null)

//       // HANDLE EXPIRATION
//       // const now = new Date()

//       // if (
//       //   subscription?.status === 'trialing' &&
//       //   subscription?.trial_end &&
//       //   new Date(subscription.trial_end) < now
//       // ) {
//       //   await supabase
//       //     .from('subscriptions')
//       //     .update({ status: 'past_due' })
//       //     .eq('company_id', company?.id)

//       //   router.push('/dashboard/billing')
//       //   return
//       // }

//       // if (subscription?.status === 'past_due') {
//       //   router.push('/dashboard/billing')
//       //   return
//       // }

//       setLoading(false)
//     }

//     fetchSubscription()

//   }, [supabase, router, company?.id])


//   //  useEffect(() => {
//   //     // ✅ wait until status is known
//   //     if (!companyStatus) return
  
//   //     if (companyStatus === "suspended") {
//   //       if (!hasShownToast.current) {
//   //         toast.error("Your company account is suspended. Contact admin.")
//   //         hasShownToast.current = true
//   //       }
  
//   //       router.replace('/suspended')
//   //     }
//   //   }, [companyStatus, router])
  
//   if (loading) {
//     return <Loading />
//   }

  

//   return (
//     <main className="">
//       <div className="">

//         {/* ✅ Trial Banner */}
//         {status === 'trialing' && trialEnd && (
//           <div className="bg-yellow-100 text-yellow-800 p-3 rounded-lg mb-3 text-sm">
//             Your free trial ends in{" "}
//             {Math.max(
//               Math.ceil(
//                 (new Date(trialEnd).getTime() - new Date().getTime()) /
//                 (1000 * 60 * 60 * 24)
//               ),
//               0
//             )} days
//           </div>
//         )}

//         {/* DASHBOARDS */}
//         {plan === 'inventory' && <InventoryPlanDash />}
//         {plan === 'hr' && <OfficeLocationPage />}
//         {plan === 'business_plus' && <BothDashPlanDash />}

//         {/* FALLBACK */}
//         {!profile?.role && (
//           <p className="text-red-500">
//             No role assigned. Please contact support.
//           </p>
//         )}

//       </div>
//     </main>
//   )
// }


'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import BothDashPlanDash from '../components/dashboards/bothDashPlanDash'
import InventoryPlanDash from '../components/dashboards/inventoryPlanDash'
import HrPlanDash from '../components/dashboards/HrPlanDash'
import { Loading } from '../components/Loading'
import { useRouter } from 'next/navigation'
import { useCompany } from '../context/CompanyContext'
import OfficeLocationPage from '../components/dashboards/HrPlanDash'
import { toast } from 'react-toastify'

type SubscriptionWithPlan = {
  status: string
  trial_end: string | null
  plans: {
    name: string
  }
}

// Only these roles may see the dashboard (allowlist, so any new role is blocked by default)
const DASHBOARD_ROLES = ['owner', 'admin']

// Where an employee lands instead of the dashboard = their first sidebar item after "Dashboard".
// Keep in sync with the `links` array in the Sidebar.
const EMPLOYEE_HOME: Record<string, string> = {
  inventory: '/dashboard/sell',
  business_plus: '/dashboard/sell',
  hr: '/dashboard/expenses',
}
// Expenses is available to employees on every plan, so it is the safe fallback
const EMPLOYEE_FALLBACK = '/dashboard/expenses'

export default function DashboardPage() {
  const supabase = createClient()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState<string | null>(null)
  const [planChecked, setPlanChecked] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [trialEnd, setTrialEnd] = useState<string | null>(null)
  const { profile, company, refresh, companyStatus } = useCompany()

  const role = profile?.role ?? null
  const isEmployee = role === 'employee'
  const canSeeDashboard = !!role && DASHBOARD_ROLES.includes(role)

  useEffect(() => {
    if (!profile && !loading) {
      refresh()
    }
  }, [profile, loading])

  const hasShownToast = useRef(false)

  useEffect(() => {

    const fetchSubscription = async () => {

      const { data: subscription } = await supabase
        .from('subscriptions')
        .select(`
          status,
          trial_end,
          plans (
            name
          )
        `)
        .eq('company_id', company?.id)
        .single()

      // ✅ FIX: correct access
      const subscriptionData = subscription as unknown as SubscriptionWithPlan
      const planName = subscriptionData?.plans?.name || null

      console.log('plan', planName)
      setPlan(planName)
      setStatus(subscription?.status || null)
      setTrialEnd(subscription?.trial_end || null)

      // HANDLE EXPIRATION
      // const now = new Date()

      // if (
      //   subscription?.status === 'trialing' &&
      //   subscription?.trial_end &&
      //   new Date(subscription.trial_end) < now
      // ) {
      //   await supabase
      //     .from('subscriptions')
      //     .update({ status: 'past_due' })
      //     .eq('company_id', company?.id)

      //   router.push('/dashboard/billing')
      //   return
      // }

      // if (subscription?.status === 'past_due') {
      //   router.push('/dashboard/billing')
      //   return
      // }

      setLoading(false)
      // Only count the check as done once we actually had a company to look up
      if (company?.id) setPlanChecked(true)
    }

    fetchSubscription()

  }, [supabase, router, company?.id])

  // 🔒 Employees never see the dashboard: send them to their first allowed page
  useEffect(() => {
    if (!isEmployee) return

    if (plan) {
      router.replace(EMPLOYEE_HOME[plan] ?? EMPLOYEE_FALLBACK)
    } else if (planChecked) {
      // Subscription lookup finished but no plan found
      router.replace(EMPLOYEE_FALLBACK)
    }
  }, [isEmployee, plan, planChecked, router])


  //  useEffect(() => {
  //     // ✅ wait until status is known
  //     if (!companyStatus) return

  //     if (companyStatus === "suspended") {
  //       if (!hasShownToast.current) {
  //         toast.error("Your company account is suspended. Contact admin.")
  //         hasShownToast.current = true
  //       }

  //       router.replace('/suspended')
  //     }
  //   }, [companyStatus, router])

  // Employees only ever see the loader here while the redirect happens.
  // The dashboard components below are never mounted for them, so they fetch nothing.
  if (isEmployee || loading) {
    return <Loading />
  }

  return (
    <main className="">
      <div className="">

        {/* ✅ Trial Banner (owner/admin only) */}
        {canSeeDashboard && status === 'trialing' && trialEnd && (
          <div className="bg-yellow-100 text-yellow-800 p-3 rounded-lg mb-3 text-sm">
            Your free trial ends in{" "}
            {Math.max(
              Math.ceil(
                (new Date(trialEnd).getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24)
              ),
              0
            )} days
          </div>
        )}

        {/* DASHBOARDS: owner/admin only */}
        {canSeeDashboard && plan === 'inventory' && <InventoryPlanDash />}
        {canSeeDashboard && plan === 'hr' && <OfficeLocationPage />}
        {canSeeDashboard && plan === 'business_plus' && <BothDashPlanDash />}

        {/* FALLBACK */}
        {!profile?.role && (
          <p className="text-red-500">
            No role assigned. Please contact support.
          </p>
        )}

      </div>
    </main>
  )
}
