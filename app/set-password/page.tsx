"use client"

import { createClient } from "@/app/utils/supabase/client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import PasswordInput from "../components/PasswordInpup"

export default function SetPassword() {
  const supabase = createClient()
  const router = useRouter()

  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

useEffect(() => {
  const initSession = async () => {
    const hash = window.location.hash

    if (hash) {
      const params = new URLSearchParams(hash.substring(1))

      const access_token = params.get("access_token")
      const refresh_token = params.get("refresh_token")

      if (access_token && refresh_token) {
        await supabase.auth.setSession({
          access_token,
          refresh_token,
        })
      }
    }

    setLoading(false)
  }

  initSession()
}, [])

  const handleSetPassword = async () => {
    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      alert(error.message)
      return
    }

    router.push("/dashboard")
  }

  if (loading) return <p>Loading...</p>

  return (
    <div className="max-w-md mx-auto mt-20 space-y-4">
      <h2 className="text-xl font-bold">Set Your Password</h2>
      <PasswordInput
        label="Confirm Password"
        value={password}
        disabled={loading}
        show={showPassword}
        toggle={() => setShowPassword(!showPassword)}
        onChange={(e: any) => setPassword(e.target.vaue)}
      />

      <button
        onClick={handleSetPassword}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Save Password
      </button>
    </div>
  )
}