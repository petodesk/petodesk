'use client'

import { useEffect, useState } from "react"
import { createClient } from "@/app/utils/supabase/client"
import AddCommentModal from "@/app/components/AddCommentModal"

export default function Reports({ onClose, open }: { onClose: () => void, open: boolean }) {
    if (!open) return null;
    const supabase = createClient()

    const [viewMore, setViewMore] = useState<boolean>(false)
    const [selectedReport, setSelectedReport] = useState<any>(null)
    const [openComment, setOpenComment] = useState<boolean>(false)
    const [role, setRole] = useState()

    const [stats, setStats] = useState({
        in_progress: 0,
        overdue: 0,
        due_today: 0,
        completed: 0,
    })

    const [tasks, setTasks] = useState<any[]>([])

    useEffect(() => {
        fetchTasks()
        fetchUser()

        const channel = supabase
            .channel('realtime-reports')

            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'task_reports' },
                () => fetchTasks()
            )

            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'report_comments' },
                () => fetchTasks()
            )

            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    async function fetchTasks() {

        const { data, error } = await supabase
            .from("task_reports")
            .select(`
                *,
                tasks (
                    id,
                    title,
                    start_date,
                    end_date,
                    priority,
                    employees (name, email)
                ),
                profiles (full_name, role),
                  report_comments (
            id,
            comment,
            created_at,
            commented_by,
            profiles (full_name, role)
        )
            `)
            .order('created_at', { ascending: false })

        if (error) return;

        const tasksData = data || []
        const today = new Date().toISOString().split("T")[0]

        // Stats based on report status
        const inProgress = tasksData.filter(t => t.status === "in_progress").length
        const completed = tasksData.filter(t => t.status === "completed").length
        const dueToday = tasksData.filter(t => t.tasks?.end_date === today).length
        const overdue = tasksData.filter(t => t.tasks?.end_date < today && t.status !== "completed").length

        setTasks(tasksData)
        setStats({
            in_progress: inProgress,
            overdue: overdue,
            due_today: dueToday,
            completed: completed
        })
    }
    console.log(tasks)
    async function getProfileId() {
        const { data: { user } } = await supabase.auth.getUser()
        return user?.id
    }

    const fetchUser = async () => {
        const userId = await getProfileId()
        const { data } = await supabase.from('profiles')
            .select('role')
            .eq('id', userId)
            .single()

        setRole(data?.role)
    }

    function timeAgo(dateString: string) {
    const now = new Date()
    const past = new Date(dateString)
    const diff = Math.floor((now.getTime() - past.getTime()) / 1000)

    if (diff < 60) return "now"

    const minutes = Math.floor(diff / 60)
    if (minutes < 60) return `${minutes} min ago`

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} h ago`

    const days = Math.floor(hours / 24)
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`

    const weeks = Math.floor(days / 7)
    if (weeks < 4) return `${weeks} week${weeks > 1 ? "s" : ""} ago`

    const months = Math.floor(days / 30)
    return `${months} month${months > 1 ? "s" : ""} ago`
}

    function ActionMenu({ report }: { report: any }) {
        const [open, setOpen] = useState(false)

        function viewTask() {
            setSelectedReport(report)
            setViewMore(true)
        }

        async function updateStatus(newStatus: string) {
            const profileId = await getProfileId()
            await supabase
                .from("task_reports")
                .update({
                    status: newStatus,
                })
                .eq("id", report.id)

            setOpen(false)
            fetchTasks()
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
                            <li onClick={viewTask} className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                                View Full Report
                            </li>
                            <li
                                onClick={() => updateStatus('reviewed')}
                                className="px-3 py-2 hover:bg-gray-50 cursor-pointer">

                                Mark as reviewed</li>

                            <li
                                onClick={() => {
                                    setSelectedReport(report)
                                    setOpenComment(true)
                                }}
                                className="px-3 py-2 hover:bg-gray-50 cursor-pointer">
                                Add Comment
                            </li>
                        </ul>
                    </div>
                )}


            </div>
        )
    }

    return (
        <>
            {viewMore ? (
                <div className="w-full min-h-screen p-2 md:p-6 rounded-lg border bg-white">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Full Report</h2>
                        <button onClick={() => setViewMore(false)} className="px-4 py-2 border rounded-lg bg-gray-100 cursor-pointer">
                            Back
                        </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="border rounded-xl p-5 space-y-4">
                            <h3 className="font-semibold border-b pb-2">Employee Info</h3>
                            <InfoRow label="Name" value={selectedReport.profiles?.full_name} />
                            <InfoRow label="Role" value={selectedReport.profiles?.role} />
                        </div>

                        <div className="border rounded-xl p-5 space-y-4">
                            <h3 className="font-semibold border-b pb-2">Task Info</h3>
                            <InfoRow label="Title" value={selectedReport.tasks?.title} />
                            <InfoRow label="Start Date" value={new Date(selectedReport.tasks?.start_date).toLocaleDateString()} />
                            <InfoRow label="End Date" value={new Date(selectedReport.tasks?.end_date).toLocaleDateString()} />
                        </div>
                    </div>

                    <div className="border rounded-xl p-5 mt-4 space-y-3">
                        <InfoRow label="Work Summary" value={selectedReport.summary} />
                        <InfoRow label="Challenges" value={selectedReport.challenges} />
                        <InfoRow label="Time Spent" value={selectedReport.time_spent} />
                    </div>
                    <div className="border rounded-xl p-2 md:p-5 space-y-4 mt-2 md:mt-4">
                        <h3 className="font-semibold border-b pb-2">Comments</h3>

                        {selectedReport?.report_comments?.length > 0 ? (
                            <div className="space-y-3">
                                {selectedReport.report_comments.map((c: any) => (
                                    <div key={c.id} className="bg-gray-50 p-3 rounded-lg border">

                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <div className="flex gap-10">
                                                <span >{c.profiles?.full_name || "Unknown"} </span>

                                                <p className="hidden md:flex text-sm text-gray-900">Role:{' '}{c.profiles?.role}</p>
                                            </div>
                                            <span>
                                              {timeAgo(c.created_at)}
                                            </span>
                                        </div>

                                        <p className="break-words">
                                            {c.comment}
                                        </p>

                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400">No comments yet.</p>
                        )}
                    </div>

                </div>
            ) : (
                <div className="w-full p-2 md:p-6 font-poppins">
                    <div className="flex flex-col gap-5">

                        <div className="gap-2">
                            <h1 className="text-md md:text-xl font-semibold">Tasks & Daily Activities</h1>
                            <p className="text-gray-600">Assign tasks, track progress, and submit daily work reports</p>
                        </div>


                        <button className="rounded-lg border bg-white p-2 w-40 cursor-pointer"
                            onClick={onClose}
                        > Go Back</button>

                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-4 gap-5 my-4">
                        <SummaryCard label="In Progress" value={stats.in_progress.toString()} />
                        <SummaryCard label="Overdue" value={stats.overdue.toString()} />
                        <SummaryCard label="Due Today" value={stats.due_today.toString()} />
                        <SummaryCard label="Completed" value={stats.completed.toString()} />
                    </div>

                    {/* -------- MOBILE CARDS -------- */}
                    <div className="space-y-4 md:hidden">
                        <h1>Activity Reports</h1>
                        {tasks.map((task) => (
                            <div key={task.id} className="rounded-xl bg-white p-4 shadow-sm border space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-md font-semibold text-gray-700">
                                        {task.title}
                                    </p>
                                    <ActionMenu report={task} />
                                </div>
                                <hr />
                                <InfoRow label="Task worked on" value={task.tasks?.title} />
                                <InfoRow label="Employee name" value={task.profiles?.full_name} />
                                <InfoRow label="Summary" value={task.summary} />
                                <InfoRow label="Status" value={task.status} />
                            </div>
                        ))}
                    </div>
                    <div className="hidden md:block overflow-x-auto">
                    <h1 className="text-md text-gray-900 py-4 font-semibold">Activity Reports</h1>

                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Task worked on</th>
                                    <th className="px-4 py-3">Employee name</th>
                                    <th className="px-4 py-3">Summary</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map((task) => (
                                    <tr key={task.id} className="border-t">
                                        <td className="px-4 py-3">{new Date(task.created_at).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 max-w-[250px]">
                                            <p className="line-clamp-2 break-words">
                                                {task.tasks?.title}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">{task.profiles?.full_name}</td>
                                        <td className="px-4 py-3 max-w-[250px]">
                                            <p className="line-clamp-2 break-words">
                                                {task.summary}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">{task.status}</td>
                                        <td className="px-4 py-3">
                                            <ActionMenu report={task} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {openComment && selectedReport && (
                <AddCommentModal
                    open={openComment}
                    onClose={() => setOpenComment(false)}
                    type="report"
                    entityId={selectedReport.id}
                    title={selectedReport.tasks?.title}
                />
            )}
        </>
    )
}

function SummaryCard({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl bg-white p-4 shadow-sm border">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    )
}


function InfoRow({ label, value }: { label: string, value: any }) {
    return (
        <div className="flex flex-col md:flex-row md:justify-between border-b pb-2 gap-1">
            <span className="text-gray-500 text-sm">{label}</span>

            <span className="text-gray-900 text-sm font-medium break-words whitespace-pre-wrap max-w-full md:max-w-[60%]">
                {value || "-"}
            </span>
        </div>
    )
}