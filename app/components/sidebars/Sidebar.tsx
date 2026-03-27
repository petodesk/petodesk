'use client'

import { createClient } from '@/app/utils/supabase/client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { HiOutlineCurrencyDollar } from 'react-icons/hi'

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

/* -------------------------------- */
/* Sidebar Links Configuration      */
/* -------------------------------- */

const links = [
  { label: 'Dashboard', href: '/dashboard', icon: HiSquares2X2, roles: ['admin','owner','employee'], plans: ['both','inventory','hr'] },

  { label: 'Sell', href: '/dashboard/sell', icon: HiOutlineShoppingCart, roles: ['admin','owner','employee'], plans: ['both','inventory'] },

  { label: 'Expenses', href: '/dashboard/expenses', icon: HiOutlineWallet, roles: ['admin','owner','employee'], plans: ['both','inventory', 'hr'] },

  { label: 'Inventory', href: '/dashboard/inventory', icon: HiOutlineCube, roles: ['admin','owner','employee'], plans: ['both','inventory'] },

  { label: 'Tasks', href: '/dashboard/tasks', icon: HiOutlineClipboardDocumentList, roles: ['admin','owner','employee'], plans: ['both','hr'] },

  { label: 'Payroll', href: '/dashboard/payroll', icon: HiOutlineCurrencyDollar, roles: ['admin','owner'], plans: ['both','hr'] },

  { label: 'Invoicing', href: '/dashboard/invoicing', icon: HiOutlineDocumentText, roles: ['admin','owner','employee'], plans: ['both','hr', 'inventory'] },

  { label: 'Reports', href: '/dashboard/reports', icon: HiOutlineChartBar, roles: ['admin','owner'], plans: ['both','hr'] },

  { label: 'Recruitment', href: '/dashboard/recruitment', icon: HiOutlineUserPlus, roles: ['admin','owner'], plans: ['both','hr'] },

  { label: 'Employee', href: '/dashboard/employee', icon: HiOutlineUsers, roles: ['admin','owner'], plans: ['both','hr', 'inventory'] },

  { label: 'Clock In/Out', href: '/dashboard/clock_in_out', icon: HiOutlineClock, roles: ['admin','owner','employee'], plans: ['both','hr', 'inventory'] },

  { label: 'Leave Management', href: '/dashboard/leave-management', icon: HiOutlineCalendarDays, roles: ['admin','owner'], plans: ['both','hr'] },

  { label: 'Leave', href: '/dashboard/leave', icon: HiOutlineCalendarDays, roles: ['employee'], plans: ['both','hr'] },

  { label: 'issues & Compliants', href: '/dashboard/issue-complaints', icon: HiOutlineExclamationTriangle, roles: ['admin','owner','employee'], plans: ['both','hr'] },

  { label: 'Company Feed', href: '/dashboard/companyfeed', icon: HiOutlineSpeakerWave, roles: ['admin','owner','employee'], plans: ['both','hr'] },
]


export default function Sidebar({ onClose }: { onClose?: () => void }) {

  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const [role, setRole] = useState<string | null>(null)
  const [plan, setPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  /* -------------------------------- */
  /* Fetch Role + Plan                */
  /* -------------------------------- */

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
console.log('Fetched Role:', profile.role)
console.log('Fetched Plan:', company?.service_type)
      setLoading(false)
    }

    fetchUserData()

  }, [])


  /* -------------------------------- */
  /* Logout                           */
  /* -------------------------------- */

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }


  /* -------------------------------- */
  /* Filter Links                     */
  /* -------------------------------- */

  const filteredLinks = links.filter(link =>
    link.roles.includes(role || '') &&
    link.plans.includes(plan || '')
  )


  /* -------------------------------- */
  /* Render                           */
  /* -------------------------------- */

  return (
    <aside className="flex flex-col h-screen w-64 bg-white shadow-sm max-h-[90vh]">

      {/* HEADER */}

      <div className="bg-blue-600 text-white p-4 font-bold text-center rounded-t-lg my-2 ">
        My Petodesk Account
      </div>


      {/* NAVIGATION */}

      <nav className="flex-1 overflow-y-auto px-3 py-4 no-scrollbar">

        <ul className="space-y-1">

          {!loading && filteredLinks.map((link) => {

            const isActive = pathname === link.href

            return (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                >
                  <link.icon
                    className={`w-5 h-5 ${
                      isActive ? 'text-blue-600' : 'text-gray-400'
                    }`}
                  />
                  {link.label}
                </Link>
              </li>
            )
          })}
        {/* ACCOUNT SECTION */}

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