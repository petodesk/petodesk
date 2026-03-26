'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import { FaEllipsisV } from 'react-icons/fa'
import AttendanceButton from '@/app/components/AttendanceButton'
import { formatDate } from '@/app/utils/dateFormatter'

// --- Types ---
interface AttendanceRecord {
  id: string
  user_id: string
  clock_in: string
  clock_out: string | null
  date: string
  location_in: string | null
  location_out: string | null
  status: string
  profiles: {
    id:string
    full_name: string
    role:string
    email:string
  }
}

type FilterRange = 'today' | 'this_week' | 'this_month' | 'all'

export default function AdminAttendanceDashboard() {
  const supabase = createClient()

  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterRange>('today')
  const [stats, setStats] = useState({ today: '0 hrs', week: '0 hrs', month: '0 hrs' })
  const [selectedAttendance, setSelectedAttendance] = useState<AttendanceRecord>()
  const [viewMore, setViewMore] = useState(false)
  // modal state
  const [viewAllOpen, setViewAllOpen] = useState(false)

  /* ---------------- HELPERS ---------------- */
  const formatTime = (iso: string | null) => {
    if (!iso) return 'Nil'
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
  }

  const calculateDuration = (inTime: string, outTime: string | null) => {
    if (!outTime) return 'Nil'
    const diff = new Date(outTime).getTime() - new Date(inTime).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours} hrs ${minutes} mins`
  }

  /* ---------------- DATA FETCHING ---------------- */
  const fetchData = useCallback(async () => {
    setLoading(true)
    const now = new Date()
    let query = supabase
      .from('attendance')
      .select(`*, profiles(id, full_name, email,role)`)
      .order('clock_in', { ascending: false })

    if (filter === 'today') {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString()
      query = query.gte('clock_in', startOfDay)
    } else if (filter === 'this_week') {
      const startOfWeek = new Date(now.setDate(now.getDate() - 7)).toISOString()
      query = query.gte('clock_in', startOfWeek)
    } else if (filter === 'this_month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      query = query.gte('clock_in', startOfMonth)
    }

    const { data, error } = await query
    if (!error && data) {
      setAttendance(data as any)

      setStats({
        today: calculateDurationSum(data),
        week: calculateDurationSum(data),
        month: calculateDurationSum(data),
      })
    }
    setLoading(false)
  }, [filter, supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const calculateDurationSum = (data: any[]) => {
    let totalMs = 0
    data.forEach(item => {
      if (item.clock_in && item.clock_out) {
        totalMs += new Date(item.clock_out).getTime() - new Date(item.clock_in).getTime()
      }
    })
    const totalHrs = Math.floor(totalMs / (1000 * 60 * 60))
    const totalMins = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${totalHrs} hrs ${totalMins} mins`
  }
 
 

  function ActionMenu({ attendance }: { attendance: any }) {
    const [open, setOpen] = useState(false)

    const viewMore = () => {
      setSelectedAttendance(attendance)
      setViewMore(true)
    }
    return (
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="px-2 py-1 text-gray-600 hover:text-gray-900 cursor-pointer"
        >
          <p className="p-4 text-gray-400">
            <FaEllipsisV />
          </p>
        </button>

        {open && (
          <div className="absolute right-0 z-20 w-40 rounded-lg border bg-white shadow-lg">
            <ul className="py-2 flex flex-col text-sm">
              <li
                onClick={viewMore}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              >
                View
              </li>
            </ul>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen md:p-8">

      {/* Header */}
      <div className="flex justify-between items-start mb-6 text-right">
        <div>
          <AttendanceButton />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Date: <span className="text-gray-900">{new Date().toDateString()}</span></p>
          <p className="text-sm text-gray-500 font-medium"> Time: <span className="text-gray-900">{new Date().toLocaleTimeString()}</span></p>
        </div>
      </div>

      {/* --- 1. SUMMARY CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[{ label: 'Employee Work Hours (Today)', value: stats.today },
        { label: 'This Week', value: stats.week },
        { label: 'This Month', value: stats.month },
        ].map((card, i) => (
          <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center">
            <p className="text-gray-500 text-sm font-semibold mb-2">{card.label}</p>
            <h2 className="text-3xl font-black text-gray-900">{card.value}</h2>
          </div>
        ))}
      </div>

      {/* --- 2. FILTERS --- */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-gray-700 font-bold mr-2">Filter by:</span>
        {(['today', 'this_week', 'this_month', 'all'] as FilterRange[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2 py-2 rounded-xl text-sm font-bold transition-all ${filter === f ? 'bg-white shadow-md text-blue-600 border-blue-100 border' : 'bg-transparent text-gray-500'
              }`}
          >
            {f.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {/* -------- MOBILE CARDS -------- */}
      <div className="space-y-4 md:hidden">
        {attendance.slice(0, 4).map((row) => (
          <div key={row.id} className="rounded-xl bg-white p-3 shadow-sm border space-y-3">

            <div className="flex items-center justify-between">
              <p className="text-md font-semibold text-gray-700 mb-1">
                {new Date(row.date).toLocaleDateString()}
              </p>
              <ActionMenu attendance={row} />
            </div>

            <hr />

            <InfoRow label="Employee" value={row.profiles?.full_name} />
            <InfoRow label="Clock In" value={formatTime(row.clock_in)} />
            <InfoRow label="Clock Out" value={formatTime(row.clock_out)} />
            <InfoRow label="Hours" value={calculateDuration(row.clock_in, row.clock_out)} />
            <InfoRow label="Location" value={!row.clock_out ? 'Active' : 'Completed'} />
            <InfoRow label="Status" value={!row.clock_out ? 'Active' : 'Completed'} />

          </div>
        ))}


      </div>


      {/* --- 3. ATTENDANCE TABLE --- */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="p-4"><input type="checkbox" className="rounded" /></th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Date</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Names</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Clock-in</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Clock Out</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Total Hours</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Location</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={9} className="p-10 text-center text-gray-400">Loading data...</td></tr>
              ) : attendance.slice(0, 3).map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4"><input type="checkbox" className="rounded" /></td>
                  <td className="p-4 text-sm font-medium text-gray-600">{formatDate(row.date)}</td>
                  <td className="p-4 text-sm font-bold text-gray-900">{row.profiles?.full_name || 'User'}</td>
                  <td className="p-4 text-sm text-gray-600">{formatTime(row.clock_in)}</td>
                  <td className="p-4 text-sm text-gray-600">{formatTime(row.clock_out)}</td>
                  <td className="p-4 text-sm text-gray-600">{calculateDuration(row.clock_in, row.clock_out)}</td>
                  <td className="p-4 text-sm text-gray-600">{row.clock_out ? 'Verified' : 'Nil'}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${!row.clock_out ? 'text-blue-500 bg-blue-50' : 'text-green-500 bg-green-50'
                      }`}>
                      {!row.clock_out ? 'Nil (Active)' : 'Completed'}
                    </span>
                  </td>
                  <ActionMenu attendance={row} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
      <div className='my-3'>
        {attendance.length > 1 && (
          <button
            onClick={() => {
              setViewAllOpen(true)
              setFilter('all')
            }}
            className="w-full py-3 bg-white border rounded-xl font-semibold"
          >
            View All
          </button>
        )}
      </div>

      {/* -------- VIEW ALL MODAL -------- */}
      {viewAllOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white w-full max-w-7xl rounded-2xl p-6 max-h-[80vh] overflow-y-auto">

            <div className="flex justify-between mb-4">
              <h2 className="font-bold text-lg">All Attendance</h2>
              <button onClick={() => {
                setViewAllOpen(false)
                setFilter('all')
              }}>Close</button>
            </div>

            {/* -------- MOBILE CARDS -------- */}
            <div className="space-y-4 md:hidden">
              {attendance.map((row) => (
                <div key={row.id} className="rounded-xl bg-white p-3 shadow-sm border space-y-3">

                  <div className="flex items-center justify-between">
                    <p className="text-md font-semibold text-gray-700 mb-1">
                      {new Date(row.date).toLocaleDateString()}
                    </p>
                    <ActionMenu attendance={row} />
                  </div>

                  <hr />

                  <InfoRow label="Employee" value={row.profiles?.full_name} />
                  <InfoRow label="Clock In" value={formatTime(row.clock_in)} />
                  <InfoRow label="Clock Out" value={formatTime(row.clock_out)} />
                  <InfoRow label="Hours" value={calculateDuration(row.clock_in, row.clock_out)} />
                  <InfoRow label="Location" value={!row.clock_out ? 'Active' : 'Completed'} />
                  <InfoRow label="Status" value={!row.clock_out ? 'Active' : 'Completed'} />

                </div>
              ))}


            </div>

            {/* --- 3. ATTENDANCE TABLE --- */}
            <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="p-4"><input type="checkbox" className="rounded" /></th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">Date</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">Names</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">Clock-in</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">Clock Out</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">Total Hours</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">Location</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loading ? (
                      <tr><td colSpan={9} className="p-10 text-center text-gray-400">Loading data...</td></tr>
                    ) : attendance.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4"><input type="checkbox" className="rounded" /></td>
                        <td className="p-4 text-sm font-medium text-gray-600">{formatDate(row.date)}</td>
                        <td className="p-4 text-sm font-bold text-gray-900">{row.profiles?.full_name || 'User'}</td>
                        <td className="p-4 text-sm text-gray-600">{formatTime(row.clock_in)}</td>
                        <td className="p-4 text-sm text-gray-600">{formatTime(row.clock_out)}</td>
                        <td className="p-4 text-sm text-gray-600">{calculateDuration(row.clock_in, row.clock_out)}</td>
                        <td className="p-4 text-sm text-gray-600">{row.clock_out ? 'Verified' : 'Nil'}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold ${!row.clock_out ? 'text-blue-500 bg-blue-50' : 'text-green-500 bg-green-50'
                            }`}>
                            {!row.clock_out ? 'Nil (Active)' : 'Completed'}
                          </span>
                        </td>
                        <ActionMenu attendance={row} />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        </div>
      )}

      {
        selectedAttendance && viewMore && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">

          <div className="bg-white w-full max-w-2xl rounded-2xl p-6 max-h-[80vh] overflow-y-auto">

            <div className="flex justify-between mb-4 border-b-2 py-2">
              <h2 className="font-bold text-lg">Attendance Detail</h2>
              <button onClick={() => {
                setViewMore(false)
                setFilter('all')
              }}>Close</button>
            </div>
            <div className='grid grid-cols-2 gap-6'>
                
            <Attendance label='Employee Name' value={selectedAttendance.profiles?.full_name}/>
            <Attendance label='Employee Role' value={selectedAttendance.profiles?.role}/>
            <Attendance label='Date' value={selectedAttendance.date}/>
            <Attendance label='Clock in time' value={formatTime(selectedAttendance.clock_in)}/>
            <Attendance label='Clock out time' value= {formatTime(selectedAttendance.clock_out)}/>
            <Attendance label='Total Time' value={calculateDuration(selectedAttendance.clock_in, selectedAttendance.clock_out)}/>
            <Attendance label='Location In' value={selectedAttendance.location_in}/>
            <Attendance label='Location Out' value={selectedAttendance.location_out}/>
            <Attendance label='Location Out' value={selectedAttendance.location_out}/>
            <Attendance label='Location' value={'verified'}/>
            <Attendance label='Status' value={selectedAttendance.status}/>
            </div>

            </div>





          </div>
        )
      }


    </div>
  )
}

function InfoRow({ label, value }: { label: string, value: any }) {
  return (
    <div className="flex justify-between items-center border-b pb-2">
      <span className="text-gray-600 text-sm">{label}</span>
      <span className="text-gray-900 text-sm font-medium">{value || "-"}</span>
    </div>
  )
}

function Attendance({ label, value }: { label: string, value: any }) {
  return (
    <div className="flex flex-col gap-2 ">
      <span className="text-gray-600 text-md">{label}</span>
      <span className="text-gray-900 text-sm font-medium text-left">{value || "-"}</span>
    </div>
  )
}