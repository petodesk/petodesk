'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import { HiSearch } from 'react-icons/hi'
import { AddEmployModal } from '@/app/components/AddEmployModal'
import { Router } from 'next/router'
import Link from 'next/dist/client/link'

type Range =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'last_year'

type LeaveRequest = {
  status: 'pending' | 'approved' | 'rejected'
}

type Employee = {
  id: string
  employee_id_slug?: string
  name: string
  role: string
  created_at: string
  email: string
  phone: string
  image?: string
  employee_info?: {
    employee_status: string
    probation_end_date: string | null
    next_promotion_date: string | null
  }[]
}

export default function EmployeesPage() {
  const supabase = createClient()

  const [range, setRange] = useState<Range>('this_month')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [totalEmployees, setTotalEmployees] = useState(0)
  const [search, setSearch] = useState('')
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])

  /* ---------------- DATE RANGE LOGIC ---------------- */
  const getRangeDates = (range: Range) => {
    const now = new Date()
    let from = new Date()
    let to = new Date()

    switch (range) {
      case 'today':
        from.setHours(0, 0, 0, 0); to.setHours(23, 59, 59, 999)
        break
      case 'this_month':
        from = new Date(now.getFullYear(), now.getMonth(), 1)
        to = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        to.setHours(23, 59, 59, 999)
        break
      case 'this_year':
        from = new Date(now.getFullYear(), 0, 1)
        to = new Date(now.getFullYear(), 11, 31)
        to.setHours(23, 59, 59, 999)
        break
      default:
        from.setHours(0, 0, 0, 0) // Default fallback
    }
    return { from, to }
  }



  /* ---------------- FETCH EMPLOYEES ---------------- */
  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    const { from, to } = getRangeDates(range)

    const { data, error } = await supabase
      .from('employees')
      .select(`
        id,
        name,
        employee_id_slug,
        role,
        phone,
        created_at,
        email,
        phone,
        employee_info (employee_status, probation_end_date, next_promotion_date)
      `)
      .gte('created_at', from.toISOString())
      .lte('created_at', to.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    setEmployees(data as Employee[])
    console.log('Fetched employees:', data)
    setTotalEmployees(data?.length || 0)
    setLoading(false)
  }, [range, supabase])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  const handleModalClose = () => {
    setOpenModal(false)
    fetchEmployees()
  }

  const fetchLeaves = useCallback(async () => {
    const { data } = await supabase
      .from('leaves')
      .select('status')

    if (data) setLeaves(data as LeaveRequest[])
  }, [supabase])

  useEffect(() => {
    fetchEmployees()
    fetchLeaves() // Fetch leaves when page loads
  }, [fetchEmployees, fetchLeaves])

  // Calculate the stats for the card
  const leaveStats = {
    approved: leaves.filter(l => l.status === 'approved').length,
    pending: leaves.filter(l => l.status === 'pending').length,
    rejected: leaves.filter(l => l.status === 'rejected').length,
  }
  /* ---------------- STATS CALCULATION ---------------- */
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const stats = {
    active: employees.filter(e => e.employee_info?.[0]?.employee_status === 'Active').length,
    inactive: employees.filter(e => ['terminated', 'on_leave', 'inactive'].includes(e.employee_info?.[0]?.employee_status || '')).length,
    recent: employees.filter(e => {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(today.getDate() - 30)
      return new Date(e.created_at) > thirtyDaysAgo
    }).length,
    probation: employees.filter(e => {
      const pEnd = e.employee_info?.[0]?.probation_end_date
      return pEnd && new Date(pEnd) > today
    }).length,
    promotionEligible: employees.filter(e => {
      const nPromo = e.employee_info?.[0]?.next_promotion_date
      if (!nPromo) return false
      return new Date(nPromo) <= new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    }).length
  }



  /* ---------------- ACTION MENU ---------------- */
  function ActionMenu({ employee }: { employee: Employee }) {
    const [open, setOpen] = useState(false)

    const handleUpdateStatus = async (newStatus: string) => {
      await supabase
        .from('employees')
        .update({ status: newStatus })
        .eq('id', employee.id)
      fetchEmployees()
      setOpen(false)
    }

    return (
      <div className="relative">
        <button onClick={() => setOpen(!open)} className="px-2 py-1 text-gray-600 hover:text-gray-900 cursor-pointer">
          ⋮
        </button>
        {open && (
          <div className="absolute right-0 z-20 w-40 rounded-lg border bg-white shadow-lg">
            <ul className="text-md">
              <Link href={`/dashboard/employee/${employee.id}`}>
                <li
                  className="px-4 py-2 cursor-pointer text-blue-600 hover:bg-gray-100">View</li>
              </Link>
              </ul>
          </div>
        )}
      </div>
    )
  }

  const filteredEmployees = employees.filter((emp) => {
    const query = search.toLowerCase()
    const searchMatch = emp.name.toLowerCase().includes(query) || emp.role?.toLowerCase().includes(query)
    return searchMatch
  })

  return (
    <section className="w-full px-6 py-6 bg-gray-50 min-h-screen">
      {/* TOP ACTION BAR */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => setOpenModal(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          + Add Employee
        </button>

        <div className='flex gap-2 items-center'>
          <h1 className="text-sm text-gray-600">Joined Date:</h1>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as Range)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="this_year">This Year</option>
          </select>
        </div>
      </div>

      {/* Summary card */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          title="Employee Overview"
          label1="Active Employees"
          value1={stats.active.toString()}
          label2="Inactive Employees"
          value2={stats.inactive.toString()}
          label3="Recent Hires"
          value3={stats.recent.toString()}
          label4="Probation Employees"
          value4={stats.probation.toString()}
        />

        <SummaryCard
          title="HR Action - Growth"
          label1="Salary increase due"
          value1={'0'} // You would need a 'salary_date' column for this
          label2="Promotion eligibility"
          value2={stats.promotionEligible.toString()}
          label3="Probation ending soon"
          value3={stats.probation.toString()}
          label4="Performance review"
          value4={'0'}
        />

        <SummaryCard
          title="Leave Requests"
          label1="Approved Leaves"
          value1={leaveStats.approved.toString()}
          label2="Pending Approvals"
          value2={leaveStats.pending.toString()}
          label3="Rejected Leaves"
          value3={leaveStats.rejected.toString()}
        />
      </div>
      <div className="flex flex-col-reverse w-full md:flex-row gap-3 mb-4 items-center justify-between">
        <div className="flex w-full items-center flex-1 rounded-xl bg-gray-100 px-3 py-2">
          <HiSearch className="text-gray-500" size={22} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or role"
            className="w-full bg-transparent px-2 outline-none text-sm"
          />
        </div>


      </div>

      {/* EMPLOYEES TABLE */}
      <div className="rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="border-b px-4 py-3 text-sm font-medium mb-4 flex justify-between items-center">
          <span>Employee Directory</span>
          <span className="text-xs text-gray-500">{filteredEmployees.length} records</span>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Joined Date</th>
                <th className="px-4 py-3 text-left font-medium">Employee Name</th>
                <th className="px-4 py-3 text-left font-medium">Role</th>
                <th className="px-4 py-3 text-left font-medium"> Employee ID</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : filteredEmployees.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No employees found</td></tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{new Date(emp.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-medium">{emp.name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{emp.role}</span>
                    </td>
                    <td className="px-4 py-3">{emp.employee_id_slug || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full 
                    ${emp.employee_info?.[0]?.employee_status === 'Active' ? 'bg-green-100 text-green-800' : emp.employee_info?.[0]?.employee_status === 'on_leave' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {emp.employee_info?.[0]?.employee_status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3"><ActionMenu employee={emp} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {openModal && (
        <AddEmployModal
          onClose={handleModalClose}
        />
      )}

    </section>
  )
}

function SummaryCard({ label1, label2, label3, label4, value1, value2, value3, value4, title }: { label1: string, label2: string, label3: string, label4?: string, value1: string, value2: string, value3: string, value4?: string, title: string }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="text-lg font-medium text-gray-900 pb-2">{title}</p>
      <div className='flex items-center justify-between gap-2 border-b border-gray-200 pb-2 mb-2'>
        <p className="text-sm text-gray-700">{label1}</p>
        <p>{value1}</p>

      </div>
      <div className='flex items-center justify-between gap-2 border-b border-gray-200 pb-2 mb-2'>
        <p className="text-sm text-gray-700">{label2}</p>
        <p>{value2}</p>

      </div>
      <div className='flex items-center justify-between gap-2 border-b border-gray-200 pb-2 mb-2'>
        <p className="text-sm text-gray-700">{label3}</p>
        <p>{value3}</p>

      </div>
      <div className='flex items-center justify-between gap-2 border-b border-gray-200 pb-2 mb-2'>
        <p className="text-sm text-gray-700">{label4}</p>
        <p>{value4}</p>

      </div>


    </div>
  )
}