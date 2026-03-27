'use client'

import { useEffect, useState } from "react"

export default function LiveClock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      <p className="text-sm text-gray-500 font-medium">
        Date: <span className="text-gray-900">{now.toDateString()}</span>
      </p>
      <p className="text-sm text-gray-500 font-medium">
        Time: <span className="text-gray-900">{now.toLocaleTimeString()}</span>
      </p>
    </div>
  )
}