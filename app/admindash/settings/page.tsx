'use client'

import { addTeamMember } from '@/app/actions/petoteams'
import { createClient } from '@/app/utils/supabase/client'
import { useEffect, useState } from 'react'
import { FaEllipsisV } from 'react-icons/fa'
import { randomUUID } from 'crypto'
import { profile } from 'console'

export default function Setting() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('peto_admin')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [members, setMembers] = useState<any[]>([])
  const [loadingMembers, setLoadingMembers] = useState(true)

  const [openRoleModal, setOpenRoleModal] = useState(false)
  const handleInvite = async () => {
    if (loading) return

    const isValidEmail = /\S+@\S+\.\S+/.test(email)

    if (!isValidEmail) {
      setMessage('Please enter a valid email')
      return
    }

    try {
      setLoading(true)
      setMessage(null)

      await addTeamMember(email, role)

      setMessage('✅ Invite sent successfully')
      setEmail('')
      setRole('peto_admin')

    } catch (err: any) {
      setMessage(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    setLoadingMembers(true)

    const { data, error } = await supabase
      .from('peto_teams')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch members:', error)
    } else {
      setMembers(data || [])
    }

    setLoadingMembers(false)
  }


  async function removeTeamMember(id: string) {
    const supabase = createClient()

    const { error } = await supabase
      .from('peto_teams')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
  }

 async function updateTeamRole(id: string, role: string) {
  const supabase = createClient()

  // 1️⃣ Get user_id from peto_teams
  const { data: team, error: fetchError } = await supabase
    .from('peto_teams')
    .select('user_id')
    .eq('id', id)
    .single()

  if (fetchError || !team?.user_id) {
    throw new Error('User not linked to team')
  }

  const userId = team.user_id

  // 2️⃣ Update both tables
  const [teamRes, profileRes] = await Promise.all([
    supabase
      .from('peto_teams')
      .update({ role })
      .eq('id', id),

    supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId),
  ])

  if (teamRes.error) throw new Error(teamRes.error.message)
  if (profileRes.error) throw new Error(profileRes.error.message)
}

  async function resendInvite(id: string, email: string) {
    const supabase = createClient()

    const token = randomUUID()

    const { error } = await supabase
      .from('peto_teams')
      .update({
        invite_token: token,
        token_expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24h
      })
      .eq('id', id)

    if (error) throw new Error(error.message)

    // 👉 here you send email again (Resend)
  }
  function ActionMenu({ member, refresh }: any) {
    const [open, setOpen] = useState(false)
    const [updating, setUpdating] = useState(false)

    const handleRoleChange = async (newRole: string) => {
      setUpdating(true)
      try {
        await updateTeamRole(member.id, newRole)
        await refresh()
      } catch (err) {
        alert('Failed to update role')
      } finally {
        setUpdating(false)
      }
    }


    const handleRemove = async () => {
      const confirmDelete = confirm('Remove this member?')
      if (!confirmDelete) return

      try {
        await removeTeamMember(member.id)
        await refresh()
      } catch {
        alert('Failed to remove member')
      }
    }

    const handleResend = async () => {
      try {
        await resendInvite(member.id, member.email)
        alert('Invite resent')
      } catch {
        alert('Failed to resend invite')
      }
    }

    return (
      <div className="relative">
        <button onClick={() => {setOpen(!open)
          setOpenRoleModal(false)
        }} className="text-sm text-gray-600 cursor-pointer p-1 rounded hover:bg-gray-100">
          <FaEllipsisV />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-md p-2 z-10 space-y-2">

            <div className='flex flex-col gap-2'>


              <button
                className="w-full text-left text-sm text-blue-600 hover:bg-gray-100 p-1 rounded"

                onClick={() => setOpenRoleModal(true)}
              >
                Change Role
              </button>

              {/* Resend Invite */}
              {!member.is_active && (
                <button
                  onClick={handleResend}
                  className="w-full text-left text-sm text-blue-600 hover:bg-gray-100 p-1 rounded cursor-pointer"
                >
                  Resend Invite
                </button>
              )}

              {/* Remove */}
              <button
                onClick={handleRemove}
                className="w-full text-left text-sm text-red-600 hover:bg-gray-100 p-1 rounded cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>
        )}
        {
          openRoleModal && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-md p-2 z-10 space-y-2">
              <div className='flex flex-col gap-2'>
                <select
                  value={member.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  disabled={updating}
                >
                  {
                    member.role === 'peto_owner' && (
                  <option value="peto_owner">Owner</option>
                    )

                  }
                  <option value="peto_admin">Admin</option>
                  <option value="peto_verifier">Verifier</option>
                  <option value="peto_analyst">Analyst</option>
                </select>
                <button
                  onClick={() => setOpenRoleModal(false)}
                  className="w-full text-left text-sm text-gray-600 hover:bg-gray-100 p-1 rounded cursor-pointer"
                >
                  Cancel
                </button>
              </div>


            </div>
          )}


      </div>
    )
  }

  return (
    <div>
      <h1 className="text-lg font-semibold mb-4">Member</h1>

      <div className="flex gap-10 rounded-lg bg-gray-50 p-4">

        <div className="flex flex-1 gap-4">

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            className="p-2 bg-gray-100 border border-gray-300 rounded-md flex-1"
            type="email"
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="p-2 bg-gray-100 border border-gray-300 rounded-md"
          >
            <option value="peto_owner">Owner</option>
            <option value="peto_admin">Admin</option>
            <option value="peto_verifier">Verifier</option>
            <option value="peto_analyst">Analyst</option>
          </select>

        </div>

        <button
          onClick={handleInvite}
          disabled={loading}
          className="p-2 rounded-lg bg-blue-600 text-white disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          {loading ? 'Sending...' : 'Add Member'}
        </button>

      </div>

      <div>
        <h2 className="text-md font-semibold mt-8 mb-4">Current Members</h2>
        <div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loadingMembers ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">
                    Loading members...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">
                    No members found
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.email.split('@')[0] || '—'}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.email}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.role === 'peto_owner' ? 'Owner' :
                        member.role === 'peto_admin' ? 'Admin' :
                          member.role === 'peto_verifier' ? 'Verifier' :
                            member.role === 'peto_analyst' ? 'Analyst' : member.role}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {
                        member.role === 'peto_owner' ? (
                          <span className="text-gray-400"></span>
                        ) : (
                          <ActionMenu member={member} refresh={fetchMembers} />
                        )
                      }
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {message && (
        <p className="mt-3 text-sm text-gray-700">{message}</p>
      )}
    </div>
  )
}