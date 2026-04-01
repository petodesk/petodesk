'use client'

import { createClient } from '@/app/utils/supabase/client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { HiOutlineCurrencyDollar } from 'react-icons/hi'
type SubscriptionWithPlan = {
  status: string
  trial_end: string | null
  plans: {
    name: string
  }
}
import {
  HiSquares2X2,
  HiOutlineShoppingCart,
  HiOutlineWallet,
  HiOutlineCube,
  HiOutlineUsers,
  HiOutlineDocumentText,
  HiOutlineChartBar,
  HiOutlineUserPlus,
  HiOutlineUserCircle,
  HiOutlineArrowRightOnRectangle,
  HiOutlineClipboardDocumentList,
  HiOutlineClock,
  HiOutlineCalendarDays,
  HiOutlineSpeakerWave,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2'
import { useCompany } from '../../context/CompanyContext'

const links = [
  { label: 'Dashboard', href: '/dashboard', icon: HiSquares2X2, roles: ['admin', 'owner', 'employee'], plans: ['business_plus', 'inventory', 'hr'] },
  { label: 'Sell', href: '/dashboard/sell', icon: HiOutlineShoppingCart, roles: ['admin', 'owner', 'employee'], plans: ['business_plus', 'inventory'] },
  { label: 'Expenses', href: '/dashboard/expenses', icon: HiOutlineWallet, roles: ['admin', 'owner', 'employee'], plans: ['business_plus', 'inventory', 'hr'] },
  { label: 'Inventory', href: '/dashboard/inventory', icon: HiOutlineCube, roles: ['admin', 'owner', 'employee'], plans: ['business_plus', 'inventory'] },
  { label: 'Tasks', href: '/dashboard/tasks', icon: HiOutlineClipboardDocumentList, roles: ['admin', 'owner', 'employee'], plans: ['business_plus', 'hr'] },
  { label: 'Payroll', href: '/dashboard/payroll', icon: HiOutlineCurrencyDollar, roles: ['admin', 'owner'], plans: ['business_plus', 'hr'] },
  { label: 'Invoicing', href: '/dashboard/invoicing', icon: HiOutlineDocumentText, roles: ['admin', 'owner', 'employee'], plans: ['business_plus', 'hr', 'inventory'] },
  { label: 'Reports', href: '/dashboard/reports', icon: HiOutlineChartBar, roles: ['admin', 'owner'], plans: ['business_plus', 'hr'] },
  { label: 'Recruitment', href: '/dashboard/recruitment', icon: HiOutlineUserPlus, roles: ['admin', 'owner'], plans: ['business_plus', 'hr'] },
  { label: 'Employee', href: '/dashboard/employee', icon: HiOutlineUsers, roles: ['admin', 'owner'], plans: ['business_plus', 'hr', 'inventory'] },
  { label: 'Clock In/Out', href: '/dashboard/clock_in_out', icon: HiOutlineClock, roles: ['admin', 'owner', 'employee'], plans: ['business_plus', 'hr'] },
  { label: 'Leave Management', href: '/dashboard/leave-management', icon: HiOutlineCalendarDays, roles: ['admin', 'owner'], plans: ['business_plus', 'hr'] },
  { label: 'Leave', href: '/dashboard/leave', icon: HiOutlineCalendarDays, roles: ['employee'], plans: ['business_plus', 'hr'] },
  { label: 'issues & Compliants', href: '/dashboard/issue-complaints', icon: HiOutlineExclamationTriangle, roles: ['admin', 'owner', 'employee'], plans: ['business_plus', 'hr'] },
  { label: 'Company Feed', href: '/dashboard/companyfeed', icon: HiOutlineSpeakerWave, roles: ['admin', 'owner', 'employee'], plans: ['business_plus', 'hr'] },
  { label: 'Billing', href: '/dashboard/billing', icon: HiOutlineCurrencyDollar, roles: ['admin', 'owner'], plans: ['business_plus', 'hr', 'inventory'] },

]

export default function Sidebar({ onClose }: { onClose?: () => void }) {

  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [trialEnd, setTrialEnd] = useState<string | null>(null)
  const { profile, company } = useCompany()

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

      setPlan(planName)
      setStatus(subscriptionData?.status || null)
      setTrialEnd(subscriptionData?.trial_end || null)

      console.log('Fetched Role:', profile?.role)
      console.log('Fetched Plan:', planName)
      console.log('Fetched Status:', subscriptionData?.status)
      console.log('Fetched Trial End:', subscriptionData?.trial_end)

      // 🚨 HANDLE EXPIRATION
      const now = new Date()

      if (
        subscription?.status === 'trialing' &&
        subscription?.trial_end &&
        new Date(subscription.trial_end) < now
      ) {
        await supabase
          .from('subscriptions')
          .update({ status: 'past_due' })
          .eq('company_id', company?.id)

        router.push('/dashboard/billing')
        return
      }

      if (subscription?.status === 'past_due') {
        router.push('/dashboard/billing')
        return
      }

      setLoading(false)
    }

    fetchSubscription()

  }, [supabase, router, company?.id, profile?.role, plan])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }
  const role = profile?.role || null
  const filteredLinks = links.filter(link =>
    role &&
    plan &&
    link.roles.includes(role) &&
    link.plans.includes(plan)
  )

  return (
    <aside className="flex flex-col h-screen w-64 bg-white shadow-sm max-h-[90vh]">

      <div className="bg-blue-600 text-white p-4 font-bold text-center rounded-t-lg my-2 ">
        My Petodesk Account
      </div>

      {/* ✅ Trial Banner */}
      {status === 'trialing' && trialEnd && (
        <div className="bg-yellow-100 text-yellow-800 text-xs p-2 mx-3 mt-2 rounded-lg text-center">
          Trial ends in {Math.max(
            Math.ceil(
              (new Date(trialEnd).getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24)
            ), 0
          )} days
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-3 py-4 no-scrollbar">

        <ul className="space-y-1">

          {!loading && filteredLinks.map((link) => {

            const isActive = pathname === link.href

            return (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-blue-600'
                    }`}
                >
                  <link.icon
                    className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'
                      }`}
                  />
                  {link.label}
                </Link>
              </li>
            )
          })}

          <div className="border-t mt-1">

            <div className="px-3 py-3 space-y-1">

              <Link
                href="/dashboard/profile"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                <HiOutlineUserCircle size={18} />
                Profile
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50"
              >
                <HiOutlineArrowRightOnRectangle size={18} />
                Logout
              </button>

            </div>

          </div>

        </ul>

      </nav>

    </aside>
  )
}