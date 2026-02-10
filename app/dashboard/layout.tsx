'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import OwnerSidebar from '../components/sidebars/OwnerSidebar'
import DashHeader from '../components/DashHeader'
import { AdminSidebar } from '../components/sidebars/AdminSidebar'
import { Loading } from '../components/Loading'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()

  const [role, setRole] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<{ full_name: string } | null>(null)
  const [loading, setLoading] = useState(true)

  // ✅ SIDEBAR STATE
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    async function getRole() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', user.id)
          .single()

        setRole(profile?.role || 'employee')
        setUserProfile(profile)
      }
      setLoading(false)
    }
    getRole()
  }, [])

  if (loading) {
    return (
      <Loading />
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* HEADER */}
      <DashHeader
        userName={userProfile?.full_name || 'Owner'}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* MOBILE SIDEBAR OVERLAY */}
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
  {role === 'owner' &&(
    <OwnerSidebar
      userName={userProfile?.full_name}
      onClose={() => setIsSidebarOpen(false)}
    />
  
  )}
   {role === 'admin' &&(
    <AdminSidebar
      userName={userProfile?.full_name}
      onClose={() => setIsSidebarOpen(false)}
    />
  
  )}
</aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 h-full overflow-y-auto no-scrollbar px-4 md:px-10">
          <div className="max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
