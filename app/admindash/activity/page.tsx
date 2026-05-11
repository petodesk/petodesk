'use client'

import { useEffect, useState } from "react"
import { createClient } from "@/app/utils/supabase/client"
import { HiSearch } from "react-icons/hi"

export default function ActivityLogsPage() {
  const supabase = createClient()

  const [logs, setLogs] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        id,
        created_at,
        user_id,
        action_type,
        module,
        metadata,
        profiles(email, full_name, role)
      `)
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) {
      console.error(error)
    } else {
      setLogs(data || [])
    }

    setLoading(false)
  }
  console.log(logs)

  const filteredLogs = logs.filter(log =>
    log.action?.toLowerCase().includes(search.toLowerCase()) ||
    log.table_name?.toLowerCase().includes(search.toLowerCase()) ||
    log.profiles?.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="w-full min-h-screen p-2 md:p-6 rounded-lg border-2 border-green-200">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Activity Logs</h1>
        <button
          onClick={fetchLogs}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
        >
          Refresh
        </button>
      </div>

      {/* SEARCH */}
      <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-3 mb-6">
        <HiSearch size={20} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search actions, users, tables..."
          className="w-full outline-none bg-transparent"
        />
      </div>

      {/* LOADING */}
      {loading && (
        <p className="text-gray-500 text-sm">Loading activity logs...</p>
      )}

      {/* EMPTY */}
      {!loading && filteredLogs.length === 0 && (
        <p className="text-gray-400 text-center py-10">
          No activity logs found.
        </p>
      )}

      {/* TABLE */}
      {!loading && filteredLogs.length > 0 && (
        <>
          {/* MOBILE */}
          <div className="md:hidden space-y-3">
            {filteredLogs.map((log) => (
              <div key={log.id} className="bg-white border rounded-lg p-4 space-y-2">

                <p className="text-sm text-gray-500">
                  {new Date(log.created_at).toLocaleString()}
                </p>

                <p className="font-semibold text-gray-800">
                  {log.action_type} 
                </p>

                <p className="text-sm text-gray-600">
                  Table: {log.module}
                </p>

                <p className="text-sm text-gray-600">
                  User: {log.profiles?.email || 'System'}
                </p>

              </div>
            ))}
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden md:block overflow-x-auto bg-white rounded-lg border">

            <table className="w-full text-sm">

              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left p-3">Time</th>
                  <th className="text-left p-3">User</th>
                  <th className="text-left p-3">Action</th>
                  <th className="text-left p-3">Table</th>
                  <th className="text-left p-3">Role</th>
                </tr>
              </thead>

              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-t hover:bg-gray-50">

                    <td className="p-3 text-gray-600">
                      {new Date(log.created_at).toLocaleString()}
                    </td>

                    <td className="p-3">
                      {log.profiles?.email || 'System'}
                    </td>

                    <td className="p-3 font-medium text-gray-800">
                      {log.action_type} 
                    </td>

                    <td className="p-3 text-gray-600">
                      {log.module}
                    </td>

                    <td className="p-3">
                      <span className="px-2 py-1 text-xs rounded bg-gray-100">
                        {log.profiles?.role || 'system'}
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>

          </div>
        </>
      )}
    </div>
  )
}