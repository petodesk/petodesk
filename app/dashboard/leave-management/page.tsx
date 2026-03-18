'use client'

import { useEffect, useState } from "react"
import { HiSearch } from "react-icons/hi"
import { createClient } from "@/app/utils/supabase/client"
import AddCommentModal from "@/app/components/AddCommentModal"

export default function AdminDash() {

    const supabase = createClient()

    const [viewMore, setViewMore] = useState(false)
    const [selectedLeave, setSelectedLeave] = useState<any>(null)
    const [openComment, setOpenComment] = useState(false)
    const [stats, setStats] = useState({
        approved_leaves: 0,
        pending_leaves: 0,
        regected_leaves: 0,
        employee_onleave_today: 0,
    })

    const [leaves, setLeaves] = useState<any[]>([])

    useEffect(() => {
        fetchDashboard()
    }, [])

    async function fetchDashboard() {

        const { data } = await supabase
            .from("leaves")
            .select("*")

        const leavesData = data || []

        const approved = leavesData.filter(l => l.status === "approved").length
        const pending = leavesData.filter(l => l.status === "pending").length
        const rejected = leavesData.filter(l => l.status === "rejected").length

        const today = new Date().toISOString().split("T")[0]

        const onLeaveToday = leavesData.filter(l =>
            l.start_date <= today && l.end_date >= today
        ).length

        setLeaves(leavesData)

        setStats({
            approved_leaves: approved,
            pending_leaves: pending,
            regected_leaves: rejected,
            employee_onleave_today: onLeaveToday
        })
    }
    function calculateLeaveDays(start: string, end: string) {
        const startDate = new Date(start)
        const endDate = new Date(end)

        const diff = endDate.getTime() - startDate.getTime()

        const days = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1

        return days
    }
    /* ---------------- ACTION MENU ---------------- */
    async function getProfileId() {

        const { data: { user } } = await supabase.auth.getUser()

        const { data } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", user?.id)
            .single()

        return data?.id
    }
    function ActionMenu({ leave }: { leave: any }) {

        const [open, setOpen] = useState(false)

        async function approveLeave(leaveId: string) {

            const profileId = await getProfileId()

            await supabase
                .from("leaves")
                .update({
                    status: "approved",
                    approved_by: profileId,
                    approved_at: new Date()
                })
                .eq("id", leaveId)

            fetchDashboard()
        }

        async function rejectLeave(leaveId: string) {

            const profileId = await getProfileId()

            await supabase
                .from("leaves")
                .update({
                    status: "rejected",
                    rejected_by: profileId,
                    rejected_at: new Date()
                })
                .eq("id", leaveId)

            fetchDashboard()
        }

        function viewLeave() {
            setSelectedLeave(leave)
            setViewMore(true)
        }


        return (
            <div className="relative">
                <button
                    onClick={() => setOpen(!open)}
                    className="px-2 py-1 text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                    ⋮
                </button>

                {open && (
                    <div className="absolute right-0 z-20 w-40 rounded-lg border bg-white shadow-lg">
                        <ul className="py-2 flex flex-col text-sm">

                            <li
                                onClick={viewLeave}
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            >
                                View
                            </li>

                            <li
                                onClick={() => approveLeave(leave.id)}
                                className="px-3 py-2 hover:bg-green-50 text-green-700 cursor-pointer"
                            >
                                Approve
                            </li>

                            <li
                                onClick={() => rejectLeave(leave.id)}
                                className="px-3 py-2 hover:bg-red-50 text-red-700 cursor-pointer"
                            >
                                Reject
                            </li>
                            <li
                                onClick={() => setOpenComment(true)}
                                className='text-md p-1 text-blue-700 cursor-pointer hover:bg-blue-100'
                            >
                                Add Comment
                            </li>

                        </ul>
                    </div>
                )}
                <AddCommentModal
                    open={openComment}
                    onClose={() => setOpenComment(false)}
                    type="leave"
                    entityId={leave.id}
                    title={leave.leave_type}
                />
            </div>
        )
    }

    return (
        <>
            {
                viewMore ? (

                    /* ---------------- VIEW LEAVE PAGE ---------------- */

                    <div className="w-full min-h-screen p-6 rounded-lg border bg-white">

                        <div className="flex justify-between items-center mb-6">

                            <div>
                                <h2 className="text-2xl font-bold">
                                    Leave Request
                                </h2>

                                <p className="text-sm text-gray-500">
                                    Requested on {new Date(selectedLeave.created_at).toLocaleDateString()}
                                </p>
                            </div>

                            <button
                                onClick={() => setViewMore(false)}
                                className="px-4 py-2 border rounded-lg bg-gray-100"
                            >
                                Back
                            </button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">

                            <div className="border rounded-xl p-5 space-y-4">

                                <h3 className="font-semibold border-b pb-2">
                                    Employee Information
                                </h3>

                                <InfoRow label="Employee Name" value={selectedLeave.employee_name} />
                                <InfoRow label="Email" value={selectedLeave.employee_email} />
                                <InfoRow label="Department" value={selectedLeave.employee_department} />
                                <InfoRow label="Role" value={selectedLeave.employee_role} />

                            </div>

                            <div className="border rounded-xl p-5 space-y-4">

                                <h3 className="font-semibold border-b pb-2">
                                    Leave Details
                                </h3>

                                <InfoRow label="Leave Type" value={selectedLeave.leave_type} />
                                <InfoRow label="Start Date" value={selectedLeave.start_date} />
                                <InfoRow label="End Date" value={selectedLeave.end_date} />
                                <InfoRow label="Days" value={calculateLeaveDays(selectedLeave.start_date, selectedLeave.end_date)} />
                                <InfoRow label="Reason" value={selectedLeave.reason} />

                                <InfoRow
                                    label="Status"
                                    value={
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize
                                        ${selectedLeave.status === "approved"
                                                ? "bg-green-100 text-green-700"
                                                : selectedLeave.status === "rejected"
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-yellow-100 text-yellow-700"}`}>
                                            {selectedLeave.status}
                                        </span>
                                    }
                                />

                            </div>

                        </div>

                    </div>

                ) : (

                    /* ---------------- DASHBOARD ---------------- */

                    <div className="w-full p-2 md:p-6 rounded-lg border-2 border-green-200">

                        <div className="text-center my-3">
                            <button className="btn-primary rounded-lg py-3 px-6 text-white">
                                Manage Employee Leave Requests
                            </button>
                        </div>

                        {/* -------- SUMMARY CARDS -------- */}

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">

                            <SummaryCard label="Approved Leave" value={stats.approved_leaves.toString()} />
                            <SummaryCard label="Pending Leave" value={stats.pending_leaves.toString()} />
                            <SummaryCard label="Rejected Leave" value={stats.regected_leaves.toString()} />
                            <SummaryCard label="Employees on Leave Today" value={stats.employee_onleave_today.toString()} />

                        </div>

                        {/* SEARCH */}

                        <div className="flex items-center gap-2 rounded-lg bg-gray-300 w-full p-2 my-4">
                            <HiSearch size={25} />
                            <input type="text" placeholder="Search employee" className="w-full outline-none bg-transparent" />
                        </div>

                        {/* TABLE */}

                        {/* -------- MOBILE CARD -------- */}
                        <div className="space-y-4 md:hidden">
                            {leaves.slice(0, 4).map((leave) => (
                                <div
                                    key={leave.id}
                                    className="rounded-xl bg-white p-4 shadow-sm border space-y-3"
                                >

                                    <div className="flex items-center justify-between">
                                        <p className="text-md font-semibold text-gray-700 mb-1">
                                            {new Date(leave.created_at).toLocaleDateString()}
                                        </p>
                                        {leave.status !== "Cancelled" && (
                                            <ActionMenu leave={leave} />
                                        )}
                                    </div>

                                    <hr />

                                    <InfoRow label="Employee" value={leave.employee_name} />
                                    <InfoRow label="Leave Type" value={leave.leave_type} />
                                    <InfoRow label="Start Date" value={leave.start_date} />
                                    <InfoRow label="End Date" value={leave.end_date} />
                                    <InfoRow label="Days" value={calculateLeaveDays(leave.start_date, leave.end_date)} />
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



                                </div>
                            ))}

                            {leaves.length === 0 && (
                                <p className="px-4 py-10 text-center text-gray-400">
                                    No user/company info.
                                </p>
                            )}
                        </div>

                        <div className="hidden md:block overflow-x-auto">

                            <table className="w-full text-sm">

                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Employee</th>
                                        <th className="px-4 py-3 text-left">Leave Type</th>
                                        <th className="px-4 py-3 text-left">Start Date</th>
                                        <th className="px-4 py-3 text-left">End Date</th>
                                        <th className="px-4 py-3 text-left">Days</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                        <th className="px-4 py-3 text-left">Action</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {leaves.map((leave) => (

                                        <tr key={leave.id} className="border-t">

                                            <td className="px-4 py-3">{leave.employee_name}</td>
                                            <td className="px-4 py-3">{leave.leave_type}</td>
                                            <td className="px-4 py-3">{leave.start_date}</td>
                                            <td className="px-4 py-3">{leave.end_date}</td>
                                            <td className="px-4 py-3">
                                                {calculateLeaveDays(leave.start_date, leave.end_date)}
                                            </td>

                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded text-xs
                                                ${leave.status === "approved"
                                                        ? "bg-green-100 text-green-700"
                                                        : leave.status === "rejected"
                                                            ? "bg-red-100 text-red-700"
                                                            : "bg-yellow-100 text-yellow-700"}`}>
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

                    </div>

                )
            }
        </>
    )
}


/* ---------------- SUMMARY CARD ---------------- */

function SummaryCard({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl bg-white p-4 shadow-sm">
            <p className="text-md text-gray-900">{label}</p>
            <p className="mt-2 text-2xl font-bold text-gray-800">{value}</p>
        </div>
    )
}

function InfoRow({ label, value }: { label: string, value: any }) {
    return (
        <div className="flex justify-between items-center border-b pb-2">
            <span className="text-gray-600 text-sm">{label}</span>
            <span className="text-gray-900 text-sm font-medium">{value || "-"}</span>
        </div>
    )
}