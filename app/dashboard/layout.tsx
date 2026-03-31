'use client'
import OwnerSidebar from '../components/sidebars/Sidebar'
import DashHeader from '../components/DashHeader'
import { Loading } from '../components/Loading'
import { useCompany } from '../components/CompanyContext'
import { useState } from 'react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {

  const [loading, setLoading] = useState(false)
  const { profile } = useCompany()
  // ✅ SIDEBAR STATE
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)



  if (loading) {
    return (
      <Loading />
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* HEADER */}
      <DashHeader
        userName={profile?.full_name || 'Owner'}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* MOBILE SIDEBAR OVERLAY */}
        <div
          className={`fixed inset-0 bg-black/40 z-40 transition-opacity md:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
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

          <OwnerSidebar
            onClose={() => setIsSidebarOpen(false)}
          />


        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 h-full overflow-y-auto no-scrollbar px-4 md:px-10">
          <div className="max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
