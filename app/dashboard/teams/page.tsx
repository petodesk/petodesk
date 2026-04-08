'use client'

import { createClient } from '@/app/utils/supabase/client'
import { useEffect, useState } from 'react'
import { FaEllipsisV } from 'react-icons/fa'
import { useCompany } from '@/app/context/CompanyContext'
import { toast } from 'react-toastify'
import { inviteTeams } from '@/app/actions/inviteTeams'
import { formatDate } from '@/app/utils/dateFormatter'

export default function Setting() {
    const supabase = createClient()
    const [email, setEmail] = useState('')
    const [role, setRole] = useState('admin')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const [members, setMembers] = useState<any[]>([])
    const [loadingMembers, setLoadingMembers] = useState(true)
    const { profile, company } = useCompany()
    const[name, setName] = useState(profile?.full_name || '')
    const [openRoleModal, setOpenRoleModal] = useState(false)
    console.log('company in setting', company)
    console.log('role in setting', role)
    console.log('email in setting', email)
    const handleInvite = async () => {
        if (loading) return

        const isValidEmail = /\S+@\S+\.\S+/.test(email)

        if (!isValidEmail) {
            toast.error('Please enter a valid email address')
            return
        }

        try {
            setLoading(true)
            setMessage(null)

            await inviteTeams(email, role, name, company)

            toast.success('Invite sent successfully')

        } catch (err: any) {
            toast.error(err.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        if (company?.id) {
            fetchMembers()
        }
    }, [company?.id])
    const isOwner = profile?.role === "owner"


    const fetchMembers = async () => {
        setLoadingMembers(true)

        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, email, role, created_at')
            .eq('company_id', company?.id)
            .in('role', ['admin', 'owner'])
            .order('created_at', { ascending: true })

        if (error) {
            console.error('Failed to fetch members:', error)
        } else {
            setMembers(data || [])
        }

        setLoadingMembers(false)
    }
    console.log('members', members)








    function ActionMenu({ member }: any) {
        const [open, setOpen] = useState(false)
        const [updating, setUpdating] = useState(false)

        const handleRoleChange = async (newRole: string, email: string) => {
            setUpdating(true)
            try {
                await inviteTeams(email, newRole, name, company)
                toast.success('Role updated successfully')
                fetchMembers()
            } catch (err) {
                alert('Failed to update role')
            } finally {
                setUpdating(false)
            }
        }





        return (
            <div className="relative">
                <button onClick={() => {
                    setOpen(!open)
                    setOpenRoleModal(false)
                }} className="text-sm text-gray-600 cursor-pointer p-1 rounded hover:bg-gray-100">
                    <FaEllipsisV />
                </button>

                {open && isOwner && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-md p-2 z-10 space-y-2">

                        <div className='flex flex-col gap-2'>


                            <button
                                className="w-full text-left text-sm text-blue-600 hover:bg-gray-100 p-1 rounded"

                                onClick={() => setOpenRoleModal(true)}
                            >
                                Change Role
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
                                    onChange={(e) => handleRoleChange(e.target.value, member.email)}
                                    disabled={updating}
                                >

                                    <option value="admin">Admin</option>
                                    <option value="employee">Employee</option>

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
        <div className='my-6'>
            <h1 className="text-lg font-semibold mb-4">Member</h1>

            <div className="flex flex-col md:flex-row gap-10 rounded-lg bg-gray-50 p-4">

                <div className="flex flex-col md:flex-row gap-4 flex-1">

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
                        <option value="admin">Admin</option>
                        <option value="employee">Employee</option>

                    </select>


                </div>

                <button
                    onClick={handleInvite}
                    disabled={loading}
                    className="p-2 rounded-lg bg-blue-600 text-white disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                    {loading ? 'Inviting...' : 'Invite Member'}
                </button>

            </div>

            <div>
                <h2 className="text-md font-semibold mt-8 mb-4">{members.length} Members</h2>
                <div>

                    {/* MOBILE CARD */}
                    <div className="space-y-4 md:hidden">
                        {members.slice(0, 4).map((member) => (
                            <div key={member.id} className="rounded-xl bg-white p-4 shadow-sm border space-y-3">

                                <div className="flex items-center justify-between">
                                    <p className="text-md font-semibold text-gray-700 mb-1">
                                        {formatDate(member.created_at)}
                                    </p>
                                    {
                                        member.role == 'owner' ? (
                                            <span className="text-gray-400"></span>
                                        ) : (
                                            <ActionMenu member={member} refresh={fetchMembers} />
                                        )
                                    }
                                </div>

                                <hr />

                                <InfoRow label="Name" value={member.full_name || '—'} />
                                <InfoRow label="Email" value={member.email} />
                                <InfoRow label="Role" value={member.role} />

                            </div>
                        ))}
                    </div>

                    <div className="hidden md:block overflow-x-auto">

                        <table className="hidden md:table w-full text-sm">
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
                                                {member.full_name || '—'}
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {member.email}
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {member.role === 'owner' ? 'Owner' : member.role === 'admin' ? 'Admin' : member.role === 'employee' ? 'Employee' : member.role}
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {
                                                    member.role === 'owner' ? (
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

            </div>


        </div>
    )
}/* INFO ROW */
function InfoRow({ label, value }: { label: string, value: any }) {
    return (
        <div className="flex justify-between items-center border-b pb-2">
            <span className="text-gray-600 text-sm">{label}</span>
            <span className="text-gray-900 text-sm font-medium capitalize">
                {value || "-"}
            </span>
        </div>
    )
}