
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




  return (

    <div className="space-y-6  overflow-hidden max-h-[85vh] overflow-y-auto mt-6">
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