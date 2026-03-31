'use client'

import Link from "next/link"
import { FadeLoader } from "react-spinners"
import { formatDate } from "../utils/dateFormatter"

type Employee = {
  id: string
  employee_id_slug?: string
  name: string
  role: string
  created_at: string
  email: string
  phone: string
  image?: string
  // Changed to handle both object or array returns from Supabase
  employee_info?: {
    employee_status: string
    probation_end_date: string | null
    next_promotion_date: string | null
  } | {
    employee_status: string
    probation_end_date: string | null
    next_promotion_date: string | null
  }[]
}
export function AllEmployeeModal({
  onClose,
  employees,
  title,
  loading
}: {
  onClose: () => void
  loading: boolean
  title:string
  employees: Employee[]
}) {




      // Helper to get nested status safely
  const getStatus = (emp: Employee) => {
    if (Array.isArray(emp.employee_info)) {
      return emp.employee_info[0]?.employee_status || 'N/A';
    }
    return emp.employee_info?.employee_status || 'N/A';
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-50 mx-4 mt-20 mb-10 w-full max-w-6xl max-h-[85vh] bg-white rounded-xl shadow-lg flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">

          {/* Desktop Table */}
                 <div className="hidden md:block overflow-x-auto">
                   <table className="w-full text-sm">
                     <thead className="bg-gray-50 text-gray-500">
                       <tr>
                         <th className="px-4 py-3 text-left">Joined Date</th>
                         <th className="px-4 py-3 text-left">Employee Name</th>
                         <th className="px-4 py-3 text-left">Role</th>
                         <th className="px-4 py-3 text-left">Employee ID</th>
                         <th className="px-4 py-3 text-left">Status</th>
                         <th className="px-4 py-3 text-left">Actions</th>
                       </tr>
                     </thead>
                     <tbody>
                       {loading ? (
                         <tr><td colSpan={7} className="px-4 py-10 text-center justify-center">
                         <FadeLoader
                         style={{width:4}}
                         color={"#3B82F6"}
                         loading={loading}
                       />  
                         
                         </td></tr>
                       ) : employees.map((emp) => (
                         <tr key={emp.id} className="border-t hover:bg-gray-50">
                           <td className="px-4 py-3">{formatDate(emp.created_at)}</td>
                           <td className="px-4 py-3 font-medium">{emp.name}</td>
                           <td className="px-4 py-3">
                             <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{emp.role}</span>
                           </td>
                           <td className="px-4 py-3">{emp.employee_id_slug || 'N/A'}</td>
                           <td className="px-4 py-3">
                             <StatusBadge status={getStatus(emp)} />
                           </td>
                           <td className="px-4 py-3">
                             <Link href={`/dashboard/employee/${emp.id}`} className="text-blue-600 hover:underline">View</Link>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
         
                 {/* mobile card */}
         
                 <div className="space-y-4 md:hidden">
         
                   {employees.map((emp) => (
         
                     <div
         
                       key={emp.id}
         
                       className="rounded-xl bg-white p-4 shadow-sm border space-y-3"
         
                     >
         
         
         
                       <div className="flex items-center justify-between">
         
                         <p className="text-md font-semibold text-gray-700 mb-1">
         
                           {formatDate(emp.created_at)}
         
                         </p>
         
                         <p className="px-4 py-2 bg-blue-100 text-blue-800 text-xs rounded-full">
                             <Link href={`/dashboard/employee/${emp.id}`} className="text-blue-600 hover:underline">View</Link>
                           </p>
         
         
                       </div>
         
         
         
                       <hr />
         
         
         
                       {/* Name */}
         
                       <div className="flex items-center justify-between">
         
                         <p className="text-md font-semibold text-gray-700 mb-1">Employee Name</p>
         
                         <p className="text-base font-semibold text-gray-900">
         
                           {emp.name}
         
                         </p>
         
                       </div>
         
         
         
                       {/* Category */}
         
                       <div className="flex items-center justify-between">
         
                         <p className="text-md font-semibold text-gray-700 mb-1">Employee Role</p>
         
                         <p className="font-medium text-gray-800">
         
                           {emp.role || '—'}
         
                         </p>
         
                       </div>
         
         
         
                       {/* Quantity */}
         
                       <div className="flex items-center justify-between">
         
                         <p className="text-md font-semibold text-gray-700 mb-1">Employee ID</p>
         
                         <p className="font-medium text-gray-800">
         
                           {emp.employee_id_slug || '—'}{' '}
         
                         </p>
         
                       </div>
         
         
         
                       {/* Price */}
         
                       <div className="flex items-center justify-between">
         
                         <p className="text-md font-semibold text-gray-700 mb-1"> Status</p>
         
                         <p className="font-semibold text-gray-900">
                           <StatusBadge status={getStatus(emp)} />
         
                         </p>
         
                       </div>
         
         
         
         
         
                     </div>
         
                   ))}
         
                
                 </div>
         
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-5 py-2 text-sm hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}



function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    Active: 'bg-green-100 text-green-800',
    on_leave: 'bg-yellow-100 text-yellow-800',
    terminated: 'bg-red-100 text-red-800',
    inactive: 'bg-gray-100 text-gray-800',
  }
  return (
    <span className={`px-2 py-1 text-xs rounded-full ${colorMap[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}