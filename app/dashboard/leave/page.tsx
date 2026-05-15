// 'use client'

// import { createClient } from "@/app/utils/supabase/client"
// import { set } from "date-fns"
// import { useEffect, useState } from "react"
// import { toast } from "react-toastify"
// import { InfoRow } from "../leave-management/page"

// export default function LeavePage() {

//     const supabase = createClient()

//     const [userProfile, setUserProfile] = useState<any>(null)
//     const [companyId, setCompanyId] = useState<string | null>(null)
//     const [loading, setLoading] = useState(true)
//     const [open, setOpen] = useState(false)
//     const [actionOpen, setActionOpen] = useState(false)
//     const [leaves, setLeaves] = useState<any[]>([])

//     const [viewMoreLeave, setViewMoreLeave] = useState<any>(null)
//     const [viewMoreOpen, setViewMoreOpen] = useState(false)

//     const [form, setForm] = useState({
//         leave_type: '',
//         start_date: '',
//         end_date: '',
//         reason: ''
//     })

//     useEffect(() => {
//         async function getRole() {

//             const { data: { user } } = await supabase.auth.getUser()

//             if (!user) return

//             const { data: profile, error } = await supabase
//                 .from('employees')
//                 .select('id, company_id, employee_id_slug, department, email, role, name')
//                 .eq('auth_user_id', user.id)
//                 .single()

//             if (error) {
//                 console.error(error)
//             }

//             setUserProfile(profile)
//             setCompanyId(profile?.company_id)
//             setLoading(false)
//         }

//         getRole()
//     }, [supabase])

//     async function getLeaves() {

//         if (!userProfile) return

//         const { data, error } = await supabase
//             .from('leaves')
//             .select('id, leave_type, start_date, end_date, status, leave_comments(id, comment, created_at, profiles(name))')
//             .eq('employee_id', userProfile.id)
//             .order('start_date', { ascending: false })

//         if (error) {
//             console.error(error)
//             return
//         }

//         setLeaves(data || [])
//     }

//     useEffect(() => {
//         getLeaves()

//         const channel = supabase
//             .channel('realtime-leaves')
//             .on(
//                 'postgres_changes',
//                 { event: '*', schema: 'public', table: 'leave_comments' },
//                 () => getLeaves()
//             )
//             .subscribe()

//         return () => {
//             supabase.removeChannel(channel)
//         }






//     }, [userProfile, supabase])

//     const handleSave = async () => {

//         if (!form.leave_type || !form.start_date || !form.end_date || !form.reason) {
//             alert("Please fill all fields")
//             return
//         }

//         if (!userProfile) return

//         setLoading(true)

//         try {

//             const { error } = await supabase
//                 .from('leaves')
//                 .insert({
//                     employee_id: userProfile.id,
//                     company_id: companyId,
//                     employee_name: userProfile.name,
//                     employee_department: userProfile.department,
//                     employee_role: userProfile.role,
//                     employee_email: userProfile.email,
//                     leave_type: form.leave_type,
//                     start_date: form.start_date,
//                     end_date: form.end_date,
//                     reason: form.reason
//                 })

//             if (error) throw error

//             toast.success("Leave request submitted")

//             setForm({
//                 leave_type: '',
//                 start_date: '',
//                 end_date: '',
//                 reason: ''
//             })
//             setOpen(false)
//             getLeaves()


//         } catch (error) {
//             console.error(error)
//             toast.error("Something went wrong")
//         } finally {
//             setLoading(false)
//         }
//     }


//     const handleCancel = () => {
//         setForm({
//             leave_type: '',
//             start_date: '',
//             end_date: '',
//             reason: ''
//         })
//         setOpen(false)
//     }


//     function ActionMenu(leave: any) {


//         return (
//             <div className="relative">
//                 <button
//                     onClick={() => setActionOpen(!actionOpen)}
//                     className="text-lg font-bold text-gray-600 cursor-pointer"
//                 >
//                     ⋮
//                 </button>
//                 {
//                     actionOpen && (
//                         <div className="absolute right-0 z-20 mt-2 w-44 h-44 rounded-lg border bg-white shadow-lg">
//                             <ul className="py-2 flex flex-col text-sm text-gray-700">
//                                 <li
//                                     onClick={() => {
//                                         setViewMoreLeave(leave)
//                                         setViewMoreOpen(true)
//                                     }}

//                                     className="text-blue-600 hover:underline text-sm px-4 py-2">View More</li>
//                                 <li className="text-blue-600 hover:underline text-sm px-4 py-2">Edit</li>
//                                 <li className="text-red-600 hover:underline text-sm px-4 py-2">Cancel</li>
//                             </ul>

//                         </div>
//                     )
//                 }



//             </div>
//         )
//     }



//     return (
//         <>

//             {
//                 viewMoreOpen ? (
//                     <div className="w-full min-h-screen p-6 rounded-lg border bg-white">

//                         <div className="flex justify-between items-center mb-6">

//                             <div>
//                                 <h2 className="text-2xl font-bold">
//                                     Leave Request
//                                 </h2>

//                                 <p className="text-sm text-gray-500">
//                                     Requested on {new Date(viewMoreLeave.created_at).toLocaleDateString()}
//                                 </p>
//                             </div>

//                             <button
//                                 onClick={() => setViewMoreOpen(false)}
//                                 className="px-4 py-2 border rounded-lg bg-gray-100"
//                             >
//                                 Back
//                             </button>
//                         </div>

//                         <div className="grid md:grid-cols-2 gap-6">



//                             <div className="border rounded-xl p-5 space-y-4">

//                                 <h3 className="font-semibold border-b pb-2">
//                                     Leave Details
//                                 </h3>

//                                 <InfoRow label="Leave Type" value={viewMoreLeave.leave_type} />
//                                 <InfoRow label="Start Date" value={viewMoreLeave.start_date} />
//                                 <InfoRow label="End Date" value={viewMoreLeave.end_date} />
//                                 {/* <InfoRow label="Days" value={calculateLeaveDays(viewMoreLeave.start_date, viewMoreLeave.end_date)} /> */}
//                                 <InfoRow label="Reason" value={viewMoreLeave.reason} />

//                                    <InfoRow
//                                     label="Status"
//                                     value={
//                                         <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize
//                                         ${viewMoreLeave.status === "approved"
//                                                 ? "bg-green-100 text-green-700"
//                                                 : viewMoreLeave.status === "rejected"
//                                                     ? "bg-red-100 text-red-700"
//                                                     : "bg-yellow-100 text-yellow-700"}`}>
//                                             {viewMoreLeave.status}
//                                         </span>
//                                     }
//                                 />

//                             </div>

//                         </div>
//                         /// Comments Section
//                         <div className="mt-6">
//                             <h3 className="font-semibold border-b pb-2 mb-4">
//                                 Comments
//                             </h3>
//                             {viewMoreLeave.leave_comments.length === 0 ? (
//                                 <p className="text-gray-500">No comments yet</p>
//                             ) : (
//                                 <div className="space-y-4">
//                                     {viewMoreLeave.leave_comments.map((comment: any) => (
//                                         <div key={comment.id} className="border rounded-lg p-3">
//                                             <p className="text-gray-700">{comment.text}</p>
//                                             <p className="text-xs text-gray-500 mt-2">
//                                                 Commented by {comment.author} on {new Date(comment.created_at).toLocaleDateString()}
//                                             </p>
//                                         </div>
//                                     ))}
//                                 </div>
//                             )}
//                         </div>

//                     </div>) : (
//                     <div className="justify-center rounded-lg mt-1 bg-white p-3 md:p-10 font-poppins max-h-[85vh] overflow-hidden overflow-y-auto">
//                         <div className="mb-10">
//                             <button onClick={() => setOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700">
//                                 Request Leave
//                             </button>

//                         </div>

//                         <div className="mb-8">


//                             <h2 className="text-lg font-semibold mb-3">My Leave Requests</h2>

//                             {leaves.length === 0 ? (
//                                 <p className="text-gray-500">No leave requests yet</p>
//                             ) : (
//                                 <>

//                                     {/* Desktop Table */}
//                                     <div className="hidden md:block">
//                                         <table className="w-full border border-gray-200 rounded-lg overflow-hidden">

//                                             <thead className="bg-gray-100">
//                                                 <tr>
//                                                     <th className="p-3 text-left">Type</th>
//                                                     <th className="p-3 text-left">Start</th>
//                                                     <th className="p-3 text-left">End</th>
//                                                     <th className="p-3 text-left">Status</th>
//                                                     <th className="p-3 text-left">action</th>
//                                                 </tr>
//                                             </thead>

//                                             <tbody>
//                                                 {leaves.map((leave) => (

//                                                     <tr key={leave.id} className="border-t">

//                                                         <td className="p-3 capitalize">
//                                                             {leave.leave_type}
//                                                         </td>

//                                                         <td className="p-3">
//                                                             {leave.start_date}
//                                                         </td>

//                                                         <td className="p-3">
//                                                             {leave.end_date}
//                                                         </td>

//                                                         <td className="p-3">
//                                                             <span
//                                                                 className={`px-2 py-1 rounded text-sm
//                                         ${leave.status === 'approved' && 'bg-green-100 text-green-700'}
//                                         ${leave.status === 'rejected' && 'bg-red-100 text-red-700'}
//                                         ${leave.status === 'pending' && 'bg-yellow-100 text-yellow-700'}
//                                         `}
//                                                             >
//                                                                 {leave.status}
//                                                             </span>
//                                                         </td>
//                                                         <td className="p-3">
//                                                             {<ActionMenu leave={leave} />}
//                                                         </td>

//                                                     </tr>

//                                                 ))}
//                                             </tbody>

//                                         </table>
//                                     </div>


//                                     {/* Mobile Cards */}
//                                     <div className="md:hidden flex flex-col gap-3">

//                                         {leaves.map((leave) => (

//                                             <div
//                                                 key={leave.id}
//                                                 className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white"
//                                             >

//                                                 <div className="flex justify-between items-center mb-2">
//                                                     <h3 className="font-semibold capitalize">
//                                                         {leave.leave_type}
//                                                     </h3>

//                                                     <span
//                                                         className={`px-2 py-1 rounded text-xs
//                                 ${leave.status === 'approved' && 'bg-green-100 text-green-700'}
//                                 ${leave.status === 'rejected' && 'bg-red-100 text-red-700'}
//                                 ${leave.status === 'pending' && 'bg-yellow-100 text-yellow-700'}
//                                 `}
//                                                     >
//                                                         {leave.status}
//                                                     </span>
//                                                 </div>

//                                                 <div className="text-sm text-gray-600 flex flex-col gap-1">
//                                                     <p><span className="font-medium">Start:</span> {leave.start_date}</p>
//                                                     <p><span className="font-medium">End:</span> {leave.end_date}</p>
//                                                 </div>

//                                             </div>

//                                         ))}

//                                     </div>

//                                 </>
//                             )}

//                         </div>



//                         {
//                             open && (
//                                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                                     <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
//                                         <h2 className="text-lg font-semibold mb-4">Request Leave</h2>
//                                         <div className="flex flex-col gap-6">

//                                             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

//                                                 <div className="flex flex-col gap-2">
//                                                     <h1 className="text-md font-semibold text-gray-900">Leave Type</h1>

//                                                     <select
//                                                         value={form.leave_type}
//                                                         onChange={(e) =>
//                                                             setForm(prev => ({
//                                                                 ...prev,
//                                                                 leave_type: e.target.value
//                                                             }))
//                                                         }
//                                                         className="p-2 rounded-lg w-full border border-gray-500"
//                                                     >
//                                                         <option value="">Select</option>
//                                                         <option value="annual">Annual</option>
//                                                         <option value="vacation">Vacation</option>
//                                                         <option value="emergency">Emergency</option>
//                                                         <option value="maternity">Maternity</option>
//                                                     </select>
//                                                 </div>


//                                                 <div className="flex flex-col gap-2">
//                                                     <h1 className="text-md font-semibold text-gray-900">Start Date</h1>

//                                                     <input
//                                                         value={form.start_date}
//                                                         onChange={(e) =>
//                                                             setForm(prev => ({
//                                                                 ...prev,
//                                                                 start_date: e.target.value
//                                                             }))
//                                                         }
//                                                         className="p-2 rounded-lg border border-gray-400 w-full"
//                                                         type="date"
//                                                     />
//                                                 </div>


//                                                 <div className="flex flex-col gap-2">
//                                                     <h1 className="text-md font-semibold text-gray-900">End Date</h1>

//                                                     <input
//                                                         value={form.end_date}
//                                                         onChange={(e) =>
//                                                             setForm(prev => ({
//                                                                 ...prev,
//                                                                 end_date: e.target.value
//                                                             }))
//                                                         }
//                                                         className="p-2 rounded-lg border border-gray-400 w-full"
//                                                         type="date"
//                                                     />
//                                                 </div>
//                                                 <div className="flex flex-col gap-2">
//                                                     <h1 className="text-md font-semibold text-gray-900">Reason</h1>

//                                                     <textarea
//                                                         value={form.reason}
//                                                         onChange={(e) =>
//                                                             setForm(prev => ({
//                                                                 ...prev,
//                                                                 reason: e.target.value
//                                                             }))
//                                                         }
//                                                         className="p-2 rounded-lg border border-gray-400 w-full"
//                                                     />
//                                                 </div>

//                                             </div>





//                                             <div className="flex gap-10 mx-auto">

//                                                 <button
//                                                     onClick={handleCancel}
//                                                     className="rounded-lg bg-white border py-2 px-8 cursor-pointer"
//                                                 >
//                                                     Cancel
//                                                 </button>

//                                                 <button
//                                                     onClick={handleSave}
//                                                     disabled={loading}
//                                                     className="bg-blue-600 py-2 px-8 rounded-lg text-white  cursor-pointer"
//                                                 >
//                                                     {loading ? "Saving..." : "Save"}
//                                                 </button>

//                                             </div>

//                                         </div>

//                                     </div>
//                                 </div>
//                             )
//                         }


//                     </div>

//                 )
//             }


//         </>
//     )
// }


'use client'

import { createClient } from "@/app/utils/supabase/client"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { InfoRow } from "../leave-management/page"
import { formatDate } from "@/app/utils/dateFormatter"

export default function LeavePage() {

    const supabase = createClient()

    const [userProfile, setUserProfile] = useState<any>(null)
    const [companyId, setCompanyId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)

    // ✅ FIX: track per row
    const [actionOpenId, setActionOpenId] = useState<string | null>(null)

    const [leaves, setLeaves] = useState<any[]>([])

    const [viewMoreLeave, setViewMoreLeave] = useState<any>(null)
    const [viewMoreOpen, setViewMoreOpen] = useState(false)

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

            if (error) console.error(error)

            setUserProfile(profile)
            setCompanyId(profile?.company_id)
            setLoading(false)
        }

        getRole()
    }, [supabase])

    async function getLeaves() {

        if (!userProfile) return

        const { data, error } = await supabase
            .from('leaves')
            .select(`
    id,
    leave_type,
    start_date,
    end_date,
    status,
    created_at,
    approved_at,
    rejected_at,
    approved_by,
    rejected_by,
    approved_profile:profiles!leaves_approved_by_fkey(
        full_name,
        email
    ),
  rejected_profile:profiles!leaves_rejected_by_fkey(
        full_name,
        email
    ),
  reason,
    leave_comments(
        id,
        comment,
        created_at,
        profiles(full_name)
    )
`)
            .eq('employee_id', userProfile.id)
            .order('start_date', { ascending: false })

        if (error) {
            console.error(error)
            return
        }

        setLeaves(data || [])
    }

    useEffect(() => {
        getLeaves()

        const channel = supabase
            .channel('realtime-leaves')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'leave_comments' },
                () => getLeaves()
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userProfile])

    const handleSave = async () => {

        if (!form.leave_type || !form.start_date || !form.end_date || !form.reason.trim()) {
            toast.error("Please fill all fields")
            return
        }

        // ✅ FIX: date validation
        if (form.end_date < form.start_date) {
            toast.error("End date cannot be before start date")
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
            setOpen(false)

            // ✅ optional: keep or remove (realtime will update anyway)
            getLeaves()

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
        setOpen(false)
    }

    function ActionMenu({ leave }: any) {

        return (
            <div className="relative">
                <button
                    onClick={() =>
                        setActionOpenId(prev => prev === leave.id ? null : leave.id)
                    }
                    className="text-lg font-bold text-gray-600 cursor-pointer"
                >
                    ⋮
                </button>

                {
                    actionOpenId === leave.id && (
                        <div className="absolute right-0 z-50 mt-2 w-40 rounded-lg border bg-white shadow-lg">
                            <ul className="py-2 text-sm text-gray-700">
                                <li
                                    onClick={() => {
                                        setViewMoreLeave(leave)
                                        setViewMoreOpen(true)
                                        setActionOpenId(null)
                                    }}
                                    className="text-blue-600 hover:underline px-4 py-2 cursor-pointer text-sm"
                                >
                                    View More
                                </li>

                            </ul>
                        </div>
                    )
                }
            </div>
        )
    }

    return (
        <>
            {
                viewMoreOpen && viewMoreLeave ? (
                    <div className="w-full max-h-[85vh] overflow-y-auto p-6 rounded-lg border bg-white">

                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold">Leave Request</h2>
                                <p className="text-sm text-gray-500">
                                    Requested on {new Date(viewMoreLeave.created_at).toLocaleDateString()}
                                </p>
                            </div>

                            <button
                                onClick={() => setViewMoreOpen(false)}
                                className="px-4 py-2 border rounded-lg bg-gray-100"
                            >
                                Back
                            </button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">

                            <div className="border rounded-xl p-5 space-y-4">

                                <h3 className="font-semibold border-b pb-2">
                                    Leave Details
                                </h3>

                                <InfoRow label="Leave Type" value={viewMoreLeave.leave_type} />
                                <InfoRow label="Start Date" value={viewMoreLeave.start_date} />
                                <InfoRow label="End Date" value={viewMoreLeave.end_date} />
                                <InfoRow label="Reason" value={viewMoreLeave.reason} />

                                <InfoRow
                                    label="Status"
                                    value={
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize
                                        ${viewMoreLeave.status === "approved"
                                                ? "bg-green-100 text-green-700"
                                                : viewMoreLeave.status === "rejected"
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-yellow-100 text-yellow-700"}`}>
                                            {viewMoreLeave.status}
                                        </span>
                                    }
                                />
                            </div>

                        </div>

                        {/*COMMENTS */}
                        <div className="mt-6">
                            <h3 className="font-semibold border-b pb-2 mb-4">
                                Comments
                            </h3>

                            {viewMoreLeave.leave_comments?.length === 0 ? (
                                <p className="text-gray-500">No comments yet</p>
                            ) : (
                                <div className="space-y-4">
                                    {viewMoreLeave.leave_comments?.map((comment: any) => (
                                        <div key={comment.id} className="border rounded-lg p-3">
                                            <p className="text-gray-700">{comment.comment}</p>
                                            <p className="text-xs text-gray-500 mt-2">
                                                Commented by {comment.profiles?.full_name} on{" "}
                                                {formatDate(comment.created_at)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                ) : (
                    <div className="justify-center rounded-lg mt-1 bg-white p-3 md:p-5 font-poppins max-h-[85vh] overflow-hidden overflow-y-auto">

                        <div className="mb-10">
                            <button onClick={() => setOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700">
                                Request Leave
                            </button>
                        </div>

                        {/* -------- MOBILE CARD -------- */}
                        <div className="space-y-4 md:hidden">
                            {leaves.slice(0, 4).map((leave) => (
                                <div
                                    key={leave.id}
                                    className="rounded-xl bg-white p-4 shadow-sm border space-y-3"
                                >

                                    <div className="flex items-center justify-between">
                                        <p className="text-md font-semibold text-gray-700 mb-1">
                                            {formatDate(leave.created_at)}
                                        </p>
                                        {leave.status !== "Cancelled" && (
                                            <ActionMenu leave={leave} />
                                        )}
                                    </div>

                                    <hr />

                                    <InfoRow label="Leave Type" value={leave.leave_type} />
                                    <InfoRow label="Start Date" value={leave.start_date} />
                                    <InfoRow label="End Date" value={leave.end_date} />
                                    <InfoRow label="Status" value={
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize
                                               ${leave.status === "rejected"
                                                ? "bg-red-100 text-red-700"
                                                : leave.status === "approved"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-yellow-100 text-yellow-700"}`}>
                                            {leave.status}
                                        </span>
                                    } />
                                    {viewMoreLeave.approved_at && (
                                        <>
                                            <InfoRow label="Approved At" value={formatDate(viewMoreLeave.approved_at)} />
                                            <InfoRow label="Approved By" value={viewMoreLeave.approved_profile?.full_name} />
                                        </>
                                    )}
                                    {viewMoreLeave.rejected_at && (
                                        <>
                                            <InfoRow label="Rejected At" value={formatDate(viewMoreLeave.rejected_at)} />
                                            <InfoRow label="Rejected By" value={viewMoreLeave.rejected_profile?.full_name} />
                                        </>
                                    )}



                                </div>
                            ))}

                            {leaves.length === 0 && (
                                <p className="px-4 py-10 text-center text-gray-400">
                                    No user/company info.
                                </p>
                            )}
                        </div>

                        <div className="mb-8">

                            <h2 className="text-lg font-semibold mb-3">My Leave Requests</h2>

                            {leaves.length === 0 ? (
                                <p className="text-gray-500">No leave requests yet</p>
                            ) : (
                                <>
                                    <div className="hidden md:block overflow-x-auto">

                                        <table className="w-full border border-gray-200 rounded-lg overflow-hidden">

                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="p-3 text-left">Type</th>
                                                    <th className="p-3 text-left">Start</th>
                                                    <th className="p-3 text-left">End</th>
                                                    <th className="p-3 text-left">Status</th>
                                                    <th className="p-3 text-left">action</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {leaves.map((leave) => (
                                                    <tr key={leave.id} className="border-t">

                                                        <td className="p-3 capitalize">{leave.leave_type}</td>
                                                        <td className="p-3">{formatDate(leave.start_date)}</td>
                                                        <td className="p-3">{formatDate(leave.end_date)}</td>

                                                        <td className="p-3">
                                                            <span className={`px-2 py-1 rounded text-sm
                                                                ${leave.status === 'approved' && 'bg-green-100 text-green-700'}
                                                                ${leave.status === 'rejected' && 'bg-red-100 text-red-700'}
                                                                ${leave.status === 'pending' && 'bg-yellow-100 text-yellow-700'}
                                                            `}>
                                                                {leave.status}
                                                            </span>
                                                        </td>

                                                        <td className="px-4 py-3">
                                                            <ActionMenu leave={leave} />
                                                        </td>

                                                    </tr>
                                                ))}
                                            </tbody>

                                        </table>
                                    </div>
                                </>
                            )}

                        </div>

                        {
                            open && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                    <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
                                        <h2 className="text-lg font-semibold mb-4">Request Leave</h2>
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
                                </div>
                            )
                        }


                    </div>
                )
            }
        </>
    )
}