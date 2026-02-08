import { createClient } from "@/app/utils/supabase/client"

export function AdminSidebar({
  userName,
  onClose,  

}: {
  userName?: string
  onClose: () => void
}) {


    const supabase = createClient()
    const handlelogout = async () => {
      await supabase.auth.signOut()
      onClose() 
    }
        



  return (
    <aside
      className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50 transform transition-transform md:relative md:translate-x-0`}
    >
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800">Admin Dashboard</h2>
        <p className="text-sm text-gray-600">Welcome, {userName || 'Admin'}!</p>
        <button
        onClick={handlelogout}
         className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded">Logout</button>
      </div>

    </aside>
  )
}


