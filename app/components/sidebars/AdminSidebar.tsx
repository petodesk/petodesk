'use client'

import { createClient } from '@/app/utils/supabase/client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { HiOutlineArrowRightOnRectangle } from 'react-icons/hi2'

/* -------------------------------- */
/* Sidebar Links Configuration      */
/* -------------------------------- */

const sidebarLinks: Record<string, { label: string; href: string }[]> = {
  peto_owner: [
    { label: 'Dashboard', href: '/admindash' },
    { label: 'Users', href: '/admindash/users' },
    { label: 'Verification Center', href: '/admindash/verification-center' },
    { label: 'Transactions', href: '/admindash/transactions' },
    { label: 'Notifications', href: '/admindash/notifications' },
    { label: 'Activity Logs', href: '/admindash/activity' }, // ✅ ADD HERE
    { label: 'Settings', href: '/admindash/settings' },
  ],

  peto_admin: [
    { label: 'Dashboard', href: '/admindash' },
    { label: 'Users', href: '/admindash/users' },
    { label: 'Verification Center', href: '/admindash/verification-center' },
    { label: 'Transactions', href: '/admindash/transactions' },
    { label: 'Notifications', href: '/admindash/notifications' },
    { label: 'Activity Logs', href: '/admindash/activity' }, // ✅ ADD HERE
    { label: 'Settings', href: '/admindash/settings' },
  ],

  peto_verifier: [
    { label: 'Users', href: '/admindash/users' },
    { label: 'Verification Center', href: '/admindash/verification-center' },
  ],

  peto_analyst: [
    { label: 'Dashboard', href: '/admindash' },
    { label: 'Users', href: '/admindash/users' },
    { label: 'Verification Center', href: '/admindash/verification-center' },
    { label: 'Transactions', href: '/admindash/transactions' },
    { label: 'Notifications', href: '/admindash/notifications' },
    { label: 'Activity Logs', href: '/admindash/activity' }, // ✅ ADD HERE
    { label: 'Settings', href: '/admindash/settings' },
  ],
}

export default function AdminSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const [role, setRole] = useState<string | null>(null)

  /* -------------------------------- */
  /* Fetch User Role                  */
  /* -------------------------------- */

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Failed to load profile:', error)
        return
      }

      if (data?.role) {
        setRole(data.role)
      }
    }

    loadProfile()
  }, [supabase])

  /* -------------------------------- */
  /* Logout                           */
  /* -------------------------------- */

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  /* -------------------------------- */
  /* Loading State                    */
  /* -------------------------------- */

  if (!role) {
    return (
      <aside className="flex flex-col h-screen w-64 bg-white shadow-sm">
        <div className="p-4 text-center">Loading...</div>
      </aside>
    )
  }

  const currentLinks = sidebarLinks[role] || []

  /* -------------------------------- */
  /* Render                           */
  /* -------------------------------- */

  return (
    <aside className="flex flex-col h-screen w-64 bg-white shadow-sm">

      {/* HEADER */}
      <div className="bg-blue-600 text-white p-4 font-bold text-center rounded-t-lg my-2">
        My Petodesk Account
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 no-scrollbar">
        <ul className="space-y-1">
          {currentLinks.map((link) => {
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
                  {link.label}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* ACCOUNT SECTION */}
        <div className="border-t mt-4">
          <div className="px-3 py-3 space-y-1">
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