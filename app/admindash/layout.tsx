"use client"

import { useEffect, useState } from "react"
import AdminSidebar from "../components/sidebars/AdminSidebar"
import { createClient } from "../utils/supabase/client"
import DashHeader from "../components/DashHeader"

export default function AdminDashboardLayout({ children}:{ children: React.ReactNode}) {
 const supabase = createClient()

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
    
            setUserProfile(profile)
          }
          setLoading(false)
        }
        getRole()
      }, [])
    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
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
                    <AdminSidebar
                     onClose={() => setIsSidebarOpen(false)}
                    />
                </aside>
                <main className="flex-1 p-4">
                    {children}
                </main>
            </div>
        </div>
    )
}
