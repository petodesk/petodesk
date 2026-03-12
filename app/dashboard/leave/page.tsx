'use client'

import { createClient } from "@/app/utils/supabase/client"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

export default function LeavePage() {

    const supabase = createClient()

    const [userProfile, setUserProfile] = useState<any>(null)
    const [companyId, setCompanyId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [leaves, setLeaves] = useState<any[]>([])
    const [form, setForm] = useState({
        leave_type: '',
        start_date: '',
        end_date: '',
        reason: ''
    })

    useEffect(() => {
        async function getRole() {

            const { data: { user } } = await supabase.auth.getUser()

            if (!user) return

            const { data: profile, error } = await supabase
                .from('employees')
                .select('id, company_id, employee_id_slug, department, email, role, name')
                .eq('auth_user_id', user.id)
                .single()

            if (error) {
                console.error(error)
            }

            setUserProfile(profile)
            setCompanyId(profile?.company_id)
            setLoading(false)
        }

        getRole()
    }, [supabase])

    useEffect(() => {

        async function getLeaves() {

            if (!userProfile) return

            const { data, error } = await supabase
                .from('leaves')
                .select('id, leave_type, start_date, end_date, status')
                .eq('employee_id', userProfile.id)
                .order('start_date', { ascending: false })

            if (error) {
                console.error(error)
                return
            }

            setLeaves(data || [])
        }

        getLeaves()

    }, [userProfile, supabase])

    const handleSave = async () => {

        if (!form.leave_type || !form.start_date || !form.end_date || !form.reason) {
            alert("Please fill all fields")
            return
        }

        if (!userProfile) return

        setLoading(true)

        try {

            const { error } = await supabase
                .from('leaves')
                .insert({
                    employee_id: userProfile.id,
                    company_id: companyId,
                    employee_name: userProfile.name,
                    employee_department: userProfile.department,
                    employee_role: userProfile.role,
                    employee_email: userProfile.email,
                    leave_type: form.leave_type,
                    start_date: form.start_date,
                    end_date: form.end_date,
                    reason: form.reason
                })

            if (error) throw error

            toast.success("Leave request submitted")

            setForm({
                leave_type: '',
                start_date: '',
                end_date: '',
                reason: ''
            })

        } catch (error) {
            console.error(error)
            toast.error("Something went wrong")
        } finally {
            setLoading(false)
        }
    }


    const handleCancel = () => {
        setForm({
            leave_type: '',
            start_date: '',
            end_date: '',
            reason: ''
        })
    }





    return (

        <div className="justify-center rounded-lg mt-1 bg-white p-3 md:p-10 font-poppins">
          <div className="mb-8">

    <h2 className="text-lg font-semibold mb-3">My Leave Requests</h2>

    {leaves.length === 0 ? (
        <p className="text-gray-500">No leave requests yet</p>
    ) : (
        <>

            {/* Desktop Table */}
            <div className="hidden md:block">
                <table className="w-full border border-gray-200 rounded-lg overflow-hidden">

                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-left">Type</th>
                            <th className="p-3 text-left">Start</th>
                            <th className="p-3 text-left">End</th>
                            <th className="p-3 text-left">Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {leaves.map((leave) => (

                            <tr key={leave.id} className="border-t">

                                <td className="p-3 capitalize">
                                    {leave.leave_type}
                                </td>

                                <td className="p-3">
                                    {leave.start_date}
                                </td>

                                <td className="p-3">
                                    {leave.end_date}
                                </td>

                                <td className="p-3">
                                    <span
                                        className={`px-2 py-1 rounded text-sm
                                        ${leave.status === 'approved' && 'bg-green-100 text-green-700'}
                                        ${leave.status === 'rejected' && 'bg-red-100 text-red-700'}
                                        ${leave.status === 'pending' && 'bg-yellow-100 text-yellow-700'}
                                        `}
                                    >
                                        {leave.status}
                                    </span>
                                </td>

                            </tr>

                        ))}
                    </tbody>

                </table>
            </div>


            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col gap-3">

                {leaves.map((leave) => (

                    <div
                        key={leave.id}
                        className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white"
                    >

                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold capitalize">
                                {leave.leave_type}
                            </h3>

                            <span
                                className={`px-2 py-1 rounded text-xs
                                ${leave.status === 'approved' && 'bg-green-100 text-green-700'}
                                ${leave.status === 'rejected' && 'bg-red-100 text-red-700'}
                                ${leave.status === 'pending' && 'bg-yellow-100 text-yellow-700'}
                                `}
                            >
                                {leave.status}
                            </span>
                        </div>

                        <div className="text-sm text-gray-600 flex flex-col gap-1">
                            <p><span className="font-medium">Start:</span> {leave.start_date}</p>
                            <p><span className="font-medium">End:</span> {leave.end_date}</p>
                        </div>

                    </div>

                ))}

            </div>

        </>
    )}

</div>
            <h1 className="text-xl font-semibold mb-6">
                Ask Leave Request Below
            </h1>

            <div className="flex flex-col gap-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                    <div className="flex flex-col gap-2">
                        <h1 className="text-md font-semibold text-gray-900">Leave Type</h1>

                        <select
                            value={form.leave_type}
                            onChange={(e) =>
                                setForm(prev => ({
                                    ...prev,
                                    leave_type: e.target.value
                                }))
                            }
                            className="p-2 rounded-lg w-full border border-gray-500"
                        >
                            <option value="">Select</option>
                            <option value="annual">Annual</option>
                            <option value="vacation">Vacation</option>
                            <option value="emergency">Emergency</option>
                            <option value="maternity">Maternity</option>
                        </select>
                    </div>


                    <div className="flex flex-col gap-2">
                        <h1 className="text-md font-semibold text-gray-900">Start Date</h1>

                        <input
                            value={form.start_date}
                            onChange={(e) =>
                                setForm(prev => ({
                                    ...prev,
                                    start_date: e.target.value
                                }))
                            }
                            className="p-2 rounded-lg border border-gray-400 w-full"
                            type="date"
                        />
                    </div>


                    <div className="flex flex-col gap-2">
                        <h1 className="text-md font-semibold text-gray-900">End Date</h1>

                        <input
                            value={form.end_date}
                            onChange={(e) =>
                                setForm(prev => ({
                                    ...prev,
                                    end_date: e.target.value
                                }))
                            }
                            className="p-2 rounded-lg border border-gray-400 w-full"
                            type="date"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <h1 className="text-md font-semibold text-gray-900">Reason</h1>

                        <textarea
                            value={form.reason}
                            onChange={(e) =>
                                setForm(prev => ({
                                    ...prev,
                                    reason: e.target.value
                                }))
                            }
                            className="p-2 rounded-lg border border-gray-400 w-full"
                        />
                    </div>

                </div>





                <div className="flex gap-10 mx-auto">

                    <button
                        onClick={handleCancel}
                        className="rounded-lg bg-white border py-2 px-8 cursor-pointer"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-blue-600 py-2 px-8 rounded-lg text-white  cursor-pointer"
                    >
                        {loading ? "Saving..." : "Save"}
                    </button>

                </div>

            </div>

        </div>
    )
}