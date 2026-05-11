
'use client'

import { useEffect, useState } from "react"
import { createClient } from "@/app/utils/supabase/client"
import { formatDistanceToNow } from "date-fns"

export default function ActivityPage() {
  const supabase = createClient()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from("activity_logs")
      .select(`
        id,
        action_type,
        module,
        description,
        metadata,
        created_at,
        profiles(email)
      `)
      .order("created_at", { ascending: false })
      .limit(100)

    if (!error) setLogs(data || [])

    setLoading(false)
  }
  console.log(logs)
  const getSafeTime = (dateString: string) => {
    if (!dateString) return "just now"

    const date = new Date(dateString)

    if (isNaN(date.getTime())) return "just now"

    return formatDistanceToNow(date, { addSuffix: true })
  }

  const formatActivity = (log: any) => {
    const time = getSafeTime(log.created_at)

    switch (log.action_type) {
      case "user_registered":
        return { text: `New user registered`, sub: log.profiles?.email, time }

      case "login":
        return { text: `User logged in`, sub: log.profiles?.email, time }

      case "plan_upgrade":
        return { text: `Plan upgraded`, sub: log.metadata?.plan, time }

      case "user_suspended":
        return { text: `User suspended`, sub: log.profiles?.email, time }

      case "payment_received":
        return { text: `Payment received`, sub: `$${log.metadata?.amount}`, time }

      case "sale_recorded":
        return { text: `Sale recorded`, sub: `$${log.metadata?.amount}`, time }

      case "invoice_generated":
        return { text: `Invoice generated`, sub: log.metadata?.customer, time }

      case "inventory_updated":
        return { text: `Inventory updated`, sub: log.metadata?.item, time }

      default:
        return { text: log.description || log.action_type, sub: "", time }
    }
  }


  const getUserMetrics = async () => {
    const now = new Date()

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const weekAgo = new Date()
    weekAgo.setDate(now.getDate() - 7)

    const monthAgo = new Date()
    monthAgo.setDate(now.getDate() - 30)

    const { data } = await supabase
      .from('activity_logs')
      .select('user_id, created_at')
      .eq('action_type', 'login')

    const dau = new Set(
      data?.filter(d => new Date(d.created_at) >= today).map(d => d.user_id)
    ).size

    const wau = new Set(
      data?.filter(d => new Date(d.created_at) >= weekAgo).map(d => d.user_id)
    ).size

    const mau = new Set(
      data?.filter(d => new Date(d.created_at) >= monthAgo).map(d => d.user_id)
    ).size

    return { dau, wau, mau }
  }
  const [metrics, setMetrics] = useState({ dau: 0, wau: 0, mau: 0 })

  useEffect(() => {
    const loadMetrics = async () => {
      const m = await getUserMetrics()
      setMetrics(m)
    }
    loadMetrics()
  }, [])
  return (

    <div className="space-y-6  overflow-hidden max-h-[85vh] overflow-y-auto mt-10">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard label="Daily Active Users" value={metrics.dau} />
        <MetricCard label="Weekly Active Users" value={metrics.wau} />
        <MetricCard label="Monthly Active Users" value={metrics.mau} />
      </div>


      <div className="p-4 md:p-6">
        <h1 className="text-xl font-semibold mb-6">Activity Logs</h1>

        <div className="bg-white rounded-xl border shadow-sm divide-y">

          {loading ? (
            <div className="p-4 text-sm text-gray-500">Loading activity...</div>
          ) : logs.length === 0 ? (
            <div className="p-4 text-sm text-gray-400">No activity found</div>
          ) : (
            logs.map((log) => {
              const activity = formatActivity(log)

              return (
                <div
                  key={log.id}
                  className="flex items-start justify-between p-4 hover:bg-gray-50 transition"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {activity.text}
                    </p>
                    {activity.sub && (
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.sub}
                      </p>
                    )}
                  </div>

                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {activity.time}
                  </span>
                </div>
              )
            })
          )}

        </div>
      </div>
    </div>
  )
}


function MetricCard({ label, value }: any) {
  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <h2 className="text-2xl font-semibold mt-1">{value}</h2>
    </div>
  )
}