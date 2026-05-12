'use client'

import OwnerSidebar from '../components/sidebars/Sidebar'
import DashHeader from '../components/DashHeader'
import { Loading } from '../components/Loading'
import { useCompany } from '../context/CompanyContext'
import { useEffect, useState, useRef } from 'react'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {

  const [loading, setLoading] = useState(false)
  const { profile, refresh, companyStatus } = useCompany()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const router = useRouter()

  // ✅ prevent multiple toasts
  const hasShownToast = useRef(false)

  useEffect(() => {
    if (!profile && !loading) {
      refresh()
    }
  }, [profile, loading])

  // useEffect(() => {
  //   // ✅ wait until status is known
  //   if (!companyStatus) return

  //   if (companyStatus === "suspended") {
  //     if (!hasShownToast.current) {
  //       toast.error("Your company account is suspended. Contact admin.")
  //       hasShownToast.current = true
  //     }

  //     router.replace('/suspended') // ✅ better than window.location
  //   }
  // }, [companyStatus, router])

  if (!profile) {
    return <Loading />
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      
      {/* HEADER */}
      <DashHeader
        userName={profile?.full_name || '-'}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
      />

      <div className="flex flex-1 overflow-hidden relative">

        {/* MOBILE OVERLAY */}
        <div
          className={`fixed inset-0 bg-black/40 z-40 transition-opacity md:hidden ${
            isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsSidebarOpen(false)}
        />

        {/* SIDEBAR */}
        <aside
          className={`
            fixed md:static z-50 h-full w-64 bg-white
            transform transition-transform duration-300
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0
          `}
        >
          <OwnerSidebar onClose={() => setIsSidebarOpen(false)} />
        </aside>

        {/* MAIN */}
        <main className="flex-1 h-full overflow-y-auto no-scrollbar px-4 md:px-10">
          <div className="max-w-7xl">{children}</div>
        </main>

      </div>
    </div>
  )
}