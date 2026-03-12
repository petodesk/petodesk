'use client'

import { useEffect, useState } from "react"
import { createClient } from "@/app/utils/supabase/client"

export default function useOnlineUsers() {
  const supabase = createClient()
  const [onlineUsers, setOnlineUsers] = useState<any[]>([])

  useEffect(() => {
    let channel: any

    const setupPresence = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      channel = supabase.channel("online-users", {
        config: {
          presence: { key: user.id }
        }
      })

      channel.on("presence", { event: "sync" }, () => {
        const state = channel.presenceState()

        const users = Object.values(state).flat()

        setOnlineUsers(users)
      })

      await channel.subscribe(async (status: string) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: user.id,
            email: user.email,
            online_at: new Date().toISOString()
          })
        }
      })
    }

    setupPresence()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  return onlineUsers
}