'use client'
import { createClient } from '@/app/utils/supabase/client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { HiOutlineClock } from 'react-icons/hi'
import {
  HiSquares2X2,
  HiOutlineShoppingCart,
  HiOutlineWallet,
  HiOutlineCube,
  HiOutlineCheckBadge,
  HiOutlineUsers,
  HiOutlineDocumentText,
  HiOutlineChartBar,
  HiOutlineUserPlus,
  HiOutlineUserCircle,
  HiOutlineMegaphone,
  HiOutlineArrowRightOnRectangle,
} from 'react-icons/hi2'

const ownerLinks = [
  { label: 'Dashboard', href: '/dashboard', icon: HiSquares2X2 },
  { label: 'Sell', href: '/dashboard/sell', icon: HiOutlineShoppingCart },
  { label: 'Expenses', href: '/dashboard/expenses', icon: HiOutlineWallet },
  { label: 'Inventory', href: '/dashboard/inventory', icon: HiOutlineCube },
  { label: 'Tasks', href: '/dashboard/tasks', icon: HiOutlineCheckBadge },
  { label: 'Payroll', href: '/dashboard/payroll', icon: HiOutlineUsers },
  { label: 'Invoicing', href: '/dashboard/invoicing', icon: HiOutlineDocumentText },
  { label: 'Reports', href: '/dashboard/reports', icon: HiOutlineChartBar },
  { label: 'Recruitment', href: '/dashboard/recruitment', icon: HiOutlineUserPlus },
  { label: 'Employee', href: '/dashboard/employee', icon: HiOutlineUserCircle },
  { label: 'Company Feed', href: '/dashboard/company-feed', icon: HiOutlineMegaphone },
]

export default function OwnerSidebar({
  onClose,
}: {
  userName?: string
  onClose?: () => void
}) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <aside className="flex flex-col h-screen w-64 bg-white shadow-sm">
      {/* TOP HEADER (FIXED) */}
      <div className="bg-blue-600 text-white p-4 font-bold text-center rounded-t-lg my-2">
        My Petodesk Account
      </div>

      {/* NAVIGATION (SCROLLABLE) */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 no-scrollbar">
        <ul className="space-y-1">
          {ownerLinks.map((link) => {
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
        </ul>
        {/* BOTTOM ACCOUNT (FIXED) */}
        <div className="border-t">

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
      </nav>


    </aside>
  )
}
