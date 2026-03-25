
'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/app/utils/supabase/client' // Adjust path to your client
import { HiSearch } from 'react-icons/hi'
import { FaEllipsisV } from 'react-icons/fa'

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
    full_name: string
  }
}

type FilterRange = 'today' | 'this_week' | 'this_month' | 'all'

export default function AdminAttendanceDashboard() {
  const supabase = createClient()

  // State
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterRange>('today')
  const [stats, setStats] = useState({ today: '0 hrs', week: '0 hrs', month: '0 hrs' })

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
      .select(`*, profiles(full_name)`)
      .order('clock_in', { ascending: false })

    // Apply Filter Logic
    if (filter === 'today') {
      const startOfDay = new Date(now.setHours(0,0,0,0)).toISOString()
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
      
      // Update Summary Cards (Example logic: Summing all employee hours)
      setStats({
        today: calculateDurationSum(data, 'today'),
        week: calculateDurationSum(data, 'week'),
        month: calculateDurationSum(data, 'month'),
      })
    }
    setLoading(false)
  }, [filter, supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Simple sum helper for stats cards
  const calculateDurationSum = (data: any[], type: string) => {
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

  return (
    <div className="w-full bg-gray-50 min-h-screen p-8">
      {/* Header Info */}
      <div className="flex justify-end items-start mb-8 text-right">
        <div>
          <p className="text-sm text-gray-500 font-medium">Today's Date: <span className="text-gray-900">{new Date().toDateString()}</span></p>
          <p className="text-sm text-gray-500 font-medium">Current Time: <span className="text-gray-900">{new Date().toLocaleTimeString()}</span></p>
        </div>
      </div>

      {/* --- 1. SUMMARY CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: 'Employee Work Hours (Today)', value: stats.today },
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
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className="text-gray-700 font-bold mr-2">Filter by:</span>
        {(['today', 'this_week', 'this_month', 'all'] as FilterRange[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              filter === f ? 'bg-white shadow-md text-blue-600 border-blue-100 border' : 'bg-transparent text-gray-500'
            }`}
          >
            {f.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {/* --- 3. ATTENDANCE TABLE --- */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
                  <td className="p-4 text-sm font-medium text-gray-600">{new Date(row.date).toLocaleDateString()}</td>
                  <td className="p-4 text-sm font-bold text-gray-900">{row.profiles?.full_name || 'User'}</td>
                  <td className="p-4 text-sm text-gray-600">{formatTime(row.clock_in)}</td>
                  <td className="p-4 text-sm text-gray-600">{formatTime(row.clock_out)}</td>
                  <td className="p-4 text-sm text-gray-600">{calculateDuration(row.clock_in, row.clock_out)}</td>
                  <td className="p-4 text-sm text-gray-600">{row.clock_out ? 'Verified' : 'Nil'}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      !row.clock_out ? 'text-blue-500 bg-blue-50' : 'text-green-500 bg-green-50'
                    }`}>
                      {!row.clock_out ? 'Nil (Active)' : 'Completed'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400"><FaEllipsisV className="cursor-pointer" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Placeholder */}
        <div className="p-4 border-t border-gray-50 flex justify-end gap-2">
          <button className="px-3 py-1 border rounded text-sm disabled:opacity-50">Prev</button>
          <span className="text-sm self-center">1 of 1</span>
          <button className="px-3 py-1 border rounded text-sm disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  )
}