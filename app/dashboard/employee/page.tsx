'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import { HiSearch } from 'react-icons/hi'
import { AddEmployModal } from '@/app/components/AddEmployModal'
import Link from 'next/link'
import { FadeLoader } from 'react-spinners'
import { AllEmployeeModal } from '@/app/components/AllEmployeeModal'
import { formatDate } from '@/app/utils/dateFormatter'
import EmployeeDetailsModal from '@/app/components/EmployeeDetailsModal'
import { useCompany } from '@/app/context/CompanyContext'

type Range = 'today' | 'this_week' | 'this_month' | 'this_year' | 'all'

type LeaveRequest = {
  status: 'pending' | 'approved' | 'rejected'
}

type Employee = {
  id: string;
  employee_id_slug?: string;
  company_id: string;
  name: string;
  role: string;
  created_at: string;
  department: string;
  birthday: string;
  email: string;
  home_address1: string;
  home_address2: string;
  phone: string;
  image?: string;
   salary?: {
        salary_type: string
        base_salary: number
        allowances: {
            type: string
            amount: number
        }[]
        pension_amount: number
        tax_amount: number
        deductions: number
        net_salary: number
    } | null
     assessment?: {
        test: string;
        stage: string;
        interview_score: number;
        interviewer_name: string;
        hiring_note: string;
    } | null;
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

export default function EmployeesPage() {
  const supabase = createClient()

  const [range, setRange] = useState<Range>('this_year')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const [openAllEmployeesModal, setOpenAllEmployeesModal] = useState(false)
  const [search, setSearch] = useState('')
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [inActiveEmployee, setInActiveEmployee] = useState<Employee[]>([])
  const [activeEmployee, setActiveEmployee] = useState<Employee[]>([])
  const [openActiveEmployees, setOpenActiveEmployees] = useState(false)
  const [openInactiveEmployees, setOpenInactiveEmployees] = useState(false)
  const [recentHires, setRecentHires] = useState<Employee[]>([])
  const [openRecentHires, setOpenRecentHires] = useState(false)
  const [openProbationEmployees, setOpenProbationEmployees] = useState(false)
  const [probationEmployee, setProbationEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<any>()
  const [opendDetails, setOpenDetails] = useState(false)
  const{currency, company}  = useCompany()
  // Helper to get nested status safely
  const getStatus = (emp: Employee) => {
    if (Array.isArray(emp.employee_info)) {
      return emp.employee_info[0]?.employee_status || 'N/A';
    }
    return emp.employee_info?.employee_status || 'N/A';
  }
  console.log('selectedEmployee', selectedEmployee)
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
        to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
        break
      case 'this_year':
        from = new Date(now.getFullYear(), 0, 1)
        to = new Date(now.getFullYear(), 11, 31, 23, 59, 59)
        break
      case 'all':
        from = new Date(2000, 0, 1)
        to = new Date(now.getFullYear() + 1, 11, 31)
        break
      default:
        from = new Date(now.getFullYear(), now.getMonth(), 1)
    }
    return { from, to }
  }

  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    const { from, to } = getRangeDates(range)

    const { data, error } = await supabase
      .from('employees')
      .select(`
                    *,
                    employee_info (*),
                    salary (*),
                    assessment (*),
                    tasks(*),
                    attendance(*),
                    employee_reference (*),
                    performance(status, warning, score, created_at),
                    leaves(id, leave_type, start_date, end_date, status)
                `)
      .gte('created_at', from.toISOString())
      .lte('created_at', to.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      console.error("Fetch Error:", error)
      setLoading(false)
      return
    }
    const activeEmps = data.filter((e) => e.employee_info?.employee_status === 'active')
    const inactiveEmps = data.filter((e) => e.employee_info?.employee_status === 'inactive')
    const recentHires = data.filter(e => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      return new Date(e.created_at) > thirtyDaysAgo;
    })
    const probationEmployee = data.filter(e => {
      const info = Array.isArray(e.employee_info) ? e.employee_info[0] : e.employee_info;
      return info?.probation_end_date && new Date(info.probation_end_date) > today;
    })


    setActiveEmployee(activeEmps)
    setInActiveEmployee(inactiveEmps)
    setRecentHires(recentHires)
    setProbationEmployees(probationEmployee)
    console.log(activeEmployee, inActiveEmployee, recentHires, probationEmployee)
    setEmployees(data || [])
    setLoading(false)
  }, [range, supabase])
console.log('employee', employees)
  const fetchLeaves = useCallback(async () => {
    const { data } = await supabase.from('leaves').select('status')
    if (data) setLeaves(data as LeaveRequest[])
  }, [supabase])

  useEffect(() => {
    fetchEmployees()
    fetchLeaves()
  }, [fetchEmployees, fetchLeaves])

  const handleModalClose = () => {
    setOpenModal(false)
    fetchEmployees()
  }

  // --- STATS CALCULATION ---
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const stats = {
    active: employees.filter(e => getStatus(e) === 'active').length,
    inactive: employees.filter(e => ['terminated', 'on_leave', 'inactive', 'Inactive'].includes(getStatus(e))).length,
    recent: employees.filter(e => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      return new Date(e.created_at) > thirtyDaysAgo;
    }).length,
    probation: employees.filter(e => {
      const info = Array.isArray(e.employee_info) ? e.employee_info[0] : e.employee_info;
      return info?.probation_end_date && new Date(info.probation_end_date) > today;
    }).length,
    promotionEligible: employees.filter(e => {
      const info = Array.isArray(e.employee_info) ? e.employee_info[0] : e.employee_info;
      if (!info?.next_promotion_date) return false;
      return new Date(info.next_promotion_date) <= new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    }).length
  }

  const leaveStats = {
    approved: leaves.filter(l => l.status === 'approved').length,
    pending: leaves.filter(l => l.status === 'pending').length,
    rejected: leaves.filter(l => l.status === 'rejected').length,
  }

  const filteredEmployees = employees.filter((emp) => {
    const query = search.toLowerCase()
    return emp.name.toLowerCase().includes(query) || emp.role?.toLowerCase().includes(query)
  })

  return opendDetails ? (
    <EmployeeDetailsModal open={opendDetails} employee={selectedEmployee} currency={currency} onClose={() => {setOpenDetails(false)
      fetchEmployees()
    }} />
  ) : (
    <section className="w-full px-6 py-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => setOpenModal(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Add Employee
        </button>

        <div className='flex gap-2 items-center'>
          <h1 className="text-sm text-gray-600">Joined Date:</h1>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as Range)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="today">Today</option>
            <option value="this_month">This Month</option>
            <option value="this_year">This Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          title="Employee Overview"
          label1="Active Employees" onclick1={() => setOpenActiveEmployees(true)} value1={stats.active.toString()}
          label2="Inactive Employees" onclick2={() => setOpenInactiveEmployees(true)} value2={stats.inactive.toString()}
          label3="Recent Hires" onclick3={() => setOpenRecentHires(true)} value3={stats.recent.toString()}
          label4="Probation Employees" onclick4={() => setOpenProbationEmployees(true)} value4={stats.probation.toString()}
        />
        <SummaryCard
          title="HR Action - Growth"
          label1="Salary increase due" value1="0"
          label2="Promotion eligibility" value2={stats.promotionEligible.toString()}
          label3="Probation ending soon" value3={stats.probation.toString()}
          label4="Performance review" value4="0"
        />
        <SummaryCard
          title="Leave Requests"
          label1="Approved" value1={leaveStats.approved.toString()}
          label2="Pending" value2={leaveStats.pending.toString()}
          label3="Rejected" value3={leaveStats.rejected.toString()}
        />
      </div>

      <div className="flex w-full items-center rounded-xl bg-gray-100 px-3 py-2 mb-4">
        <HiSearch className="text-gray-500" size={22} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or role"
          className="w-full bg-transparent px-2 outline-none text-sm"
        />
      </div>

      <div className="rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="border-b px-4 py-3 text-sm font-medium flex justify-between items-center">
          <span>Employee Directory</span>
          <span className="text-xs text-gray-500">{filteredEmployees.length} records</span>
        </div>

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
                    style={{ width: 4 }}
                    color={"#3B82F6"}
                    loading={loading}
                  />

                </td></tr>
              ) : filteredEmployees.slice(0, 4).map((emp) => (
                <tr key={emp.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{formatDate(emp.created_at)}</td>
                  <td className="px-4 py-3 font-medium">{emp.name}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{emp.role}</span>
                  </td>
                  <td className="px-4 py-3">{emp.employee_id_slug || 'N/A'}</td>
                  <td className="px-4 py-3 capitalize">
                    <StatusBadge status={getStatus(emp)} />
                  </td>
                  <td onClick={() => {
                    setOpenDetails(true)
                    setSelectedEmployee(emp)
                  }} className="px-4 py-3 text-md text-blue-600 cursor-pointer">
                    View
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* mobile card */}

        <div className="space-y-4 md:hidden">

          {filteredEmployees.slice(0, 4).map((emp) => (

            <div

              key={emp.id}

              className="rounded-xl bg-white p-4 shadow-sm border space-y-3"

            >



              <div className="flex items-center justify-between">

                <p className="text-md font-semibold text-gray-700 mb-1">

                  {formatDate(emp.created_at)}

                </p>

                <p onClick={() => {
                    setOpenDetails(true)
                    setSelectedEmployee(emp)
                  }} className="px-4 py-3 text-md text-blue-600 cursor-pointer">
                    View
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

          {!loading && filteredEmployees.length === 0 && (

            <>

              <p className="px-4 py-10 text-center text-gray-400">

                No employee found for this filter.



              </p>

            </>

          )}

        </div>
        <div className="px-6 py-4 flex  justify-end">
          {!loading && filteredEmployees.length > 1 && (
            <button
              onClick={() => setOpenAllEmployeesModal(true)}
              className="text-blue-600 hover:underline text-sm mt-2 md:mt-0 cursor-pointer"
            >
              View All Employees
            </button>
          )}
        </div>

      </div>

      {openModal && <AddEmployModal onClose={handleModalClose} />}
      {openAllEmployeesModal && <AllEmployeeModal title="All Employees" loading={loading} onClose={() => setOpenAllEmployeesModal(false)} employees={employees} />}
      {openActiveEmployees && <AllEmployeeModal title="Active Employees" loading={loading} onClose={() => setOpenActiveEmployees(false)} employees={activeEmployee} />}
      {openInactiveEmployees && <AllEmployeeModal title="Inactive Employees" loading={loading} onClose={() => setOpenInactiveEmployees(false)} employees={inActiveEmployee} />}
      {openRecentHires && <AllEmployeeModal title="Recent Hires" loading={loading} onClose={() => setOpenRecentHires(false)} employees={recentHires} />}
      {openProbationEmployees && <AllEmployeeModal title="Probation Employees" loading={loading} onClose={() => setOpenProbationEmployees(false)} employees={probationEmployee} />}

    </section>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
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

function SummaryCard({ label1, label2, label3, label4, value1, value2, value3, value4, title, onclick1, onclick2, onclick3, onclick4 }: any) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
      <p className="text-lg font-medium text-gray-900 pb-2 border-b mb-3">{title}</p>
      {[
        { l: label1, v: value1, onclick: onclick1 },
        { l: label2, v: value2, onclick: onclick2 },
        { l: label3, v: value3, onclick: onclick3 },
        { l: label4, v: value4, onclick: onclick4 }
      ].map((item, i) => item.l && (

        <div key={i} className='flex items-center justify-between p-2 shadow-sm cursor-pointer rounded-md hover:bg-gray-50' onClick={item.onclick}>
          <p className="text-sm text-gray-600">{item.l}</p>
          <p className="text-sm font-semibold">{item.v}</p>
        </div>
      ))}
    </div>
  )
}