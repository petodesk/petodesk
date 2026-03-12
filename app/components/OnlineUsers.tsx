'use client'

import useOnlineUsers from "@/app/hooks/useOnlineUsers"

export default function OnlineUsers() {
  const users = useOnlineUsers()

  return (
    <div className="bg-white rounded-xl p-4 shadow">
      <h2 className="text-lg font-semibold mb-3">
        🟢 Online Users ({users.length})
      </h2>

      {users.length === 0 && (
        <p className="text-sm text-gray-600">No users online</p>
      )}

      {users.map((u: any) => (
        <div
          key={u.user_id}
          className="flex justify-between border-b py-2 text-sm"
        >
          <span>{u.email}</span>
          <span className="text-green-600">Online</span>
        </div>
      ))}
    </div>
  )
}