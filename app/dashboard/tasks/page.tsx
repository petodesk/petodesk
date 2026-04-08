'use client'

import { useEffect, useState } from "react"
import { HiSearch } from "react-icons/hi"
import { createClient } from "@/app/utils/supabase/client"
import AddTaskModal from "@/app/components/AddTaskModal"
import AddCommentModal from "@/app/components/AddCommentModal"
import Reports from "@/app/components/Reports"

export default function Tasks() {
    const supabase = createClient()

    const [viewMore, setViewMore] = useState<boolean>(false)
    const [selectedTask, setSelectedTask] = useState<any>(null)
    const [addTaskOpen, setAddTaskOpen] = useState<boolean>(false)
    const [editTask, setEditTask] = useState<boolean>(false)
    const [task, setTask] = useState()
    const [openComment, setOpenComment] = useState<boolean>(false)
    const [role, setRole] = useState()
    const [openReports, setOpenReports] = useState<boolean>(false)
    // Updated stats for Tasks
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
            .channel('realtime-comments')
            .on(
                'postgres_changes',
                {
                    event: '*', // listen to INSERT, UPDATE, DELETE
                    schema: 'public',
                    table: 'task_comments',
                },
                async (payload) => {
                    console.log('Realtime comment change:', payload)

                    // 🔥 REFETCH TASKS (simple + safe)
                    await fetchTasks()

                    // OPTIONAL (better UX): update selected task live
                    if (selectedTask) {
                        const { data } = await supabase
                            .from("tasks")
                            .select(`
                            *,
                            employees (name, email),
                            task_comments (
                                id,
                                comment,
                                created_at,
                                profiles (full_name, role)
                            )
                        `)
                            .eq("id", selectedTask.id)
                            .single()

                        setSelectedTask(data)
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [selectedTask])

    async function fetchTasks() {
        // Fetch tasks and join with employee profile to get the name

        const { data, error } = await supabase
            .from("tasks")
            .select(`
        *,
        employees (name, email, department, role),
        task_comments (
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

        // Calculate Stats
        const inProgress = tasksData.filter(t => t.status === "in_progress").length
        const completed = tasksData.filter(t => t.status === "completed").length
        const dueToday = tasksData.filter(t => t.end_date === today).length
        const overdue = tasksData.filter(t => t.end_date < today && t.status !== "completed").length

        setTasks(tasksData)
        setStats({
            in_progress: inProgress,
            overdue: overdue,
            due_today: dueToday,
            completed: completed
        })
    }

    /* ---------------- ACTION MENU ---------------- */
    async function getProfileId() {
        const { data: { user } } = await supabase.auth.getUser()
        return user?.id
    }

    const fetchUser = async () => {
        const userId = await getProfileId()
        try {
            const { data: profiles } = await supabase.from('profiles')
                .select('role')
                .eq('id', userId)
                .single()
            setRole(profiles?.role)
        } catch (error) {

        }
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

    function ActionMenu({ task }: { task: any }) {
        const [open, setOpen] = useState(false)

        async function updateStatus(newStatus: string) {
            const profileId = await getProfileId()
            await supabase
                .from("tasks")
                .update({
                    status: newStatus,
                    updated_at: new Date(),
                    updated_by: profileId
                })
                .eq("id", task.id)

            setOpen(false)
            fetchTasks()
        }

        function viewTask() {
            setSelectedTask(task)
            setViewMore(true)
        }

        const editTaskHandler = () => {
            setEditTask(true)
            setTask(task)

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
                                View Details
                            </li>
                            <li onClick={() => updateStatus("completed")} className="px-3 py-2 hover:bg-green-50 text-green-700 cursor-pointer">
                                Mark Completed
                            </li>
                            <li onClick={() => updateStatus("in_progress")} className="px-3 py-2 hover:bg-blue-50 text-blue-700 cursor-pointer">
                                Set In Progress
                            </li>
                            {
                                role === 'owner' && (
                                    <li onClick={editTaskHandler}
                                        className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-gray-800">
                                        Edit Task
                                    </li>
                                )
                            }

                            <li
                                onClick={() => {
                                    setSelectedTask(task)
                                    setOpenComment(true)
                                }}
                                className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-gray-800">
                                Add Comment
                            </li>
                        </ul>
                    </div>
                )}
                {
                    openComment && (
                        <AddCommentModal
                            open={openComment}
                            onClose={() => { setOpenComment(false), fetchTasks() }}
                            type="task"
                            entityId={task.id}
                            title={task.title}
                        />
                    )
                }
           

                {editTask && <AddTaskModal task={task} open={editTask} onClose={() => { setEditTask(false), fetchTasks() }} />}
            </div>
        )
    }

    return (
        <>
            {viewMore ? (
                /* ---------------- VIEW TASK PAGE ---------------- */
                <div className="w-full min-h-screen p-2 md:p-6 rounded-lg border bg-white">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold">Task Details</h2>
                            <p className="text-sm text-gray-500">
                                Assigned on {new Date(selectedTask.created_at).toLocaleDateString()}
                            </p>
                        </div>
                        <button
                            onClick={() => setViewMore(false)}
                            className="px-4 py-2 border rounded-lg bg-gray-100 cursor-pointer"
                        >
                            Back
                        </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="border rounded-xl p-5 space-y-4">
                            <h3 className="font-semibold border-b pb-2">Assignment Info</h3>
                            <InfoRow label="Assigned To" value={selectedTask.employees?.name} />
                            <InfoRow label="Email" value={selectedTask.employees?.email} />
                            <InfoRow label="Priority" value={selectedTask.priority} />
                            <InfoRow label="Status" value={selectedTask.status} />
                        </div>

                        <div className="border rounded-xl p-5 space-y-4">
                            <h3 className="font-semibold border-b pb-2">Task Content</h3>
                            <InfoRow label="Title" value={selectedTask.title} />
                            <InfoRow label="Start Date" value={new Date(selectedTask.start_date).toLocaleDateString()} />
                            <InfoRow label="End Date" value={new Date(selectedTask.end_date).toLocaleDateString()} />
                            <div className="flex flex-col gap-1">
                                <span className="text-gray-600 text-sm">Description</span>
                                <p className="text-sm bg-gray-50 p-2 rounded">{selectedTask.description || "No description provided."}</p>
                            </div>
                        </div>

                    </div>
                    <div className="border rounded-xl p-2 md:p-5 space-y-4 mt-2 md:mt-4">
                        <h3 className="font-semibold border-b pb-2">Comments</h3>

                        {selectedTask?.task_comments?.length > 0 ? (
                            <div className="space-y-3">
                                {selectedTask.task_comments.map((c: any) => (
                                    <div key={c.id} className="bg-gray-50 p-3 rounded-lg border">

                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <div className="flex gap-10">
                                                <span >{c.profiles?.full_name || "Unknown"} </span>

                                                <p className="hidden md:flex text-sm text-gray-900">Role:{' '}{c.profiles?.role}</p>
                                            </div>
                                            <span className="text-xs text-gray-500">
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
                /* ---------------- DASHBOARD ---------------- */
                <div className="w-full p-2 md:p-6 rounded-lg border-2 border-green-200">
                    {
                        openReports ? (
                            <Reports open={openReports} onClose={() => setOpenReports(false)} />
                        ) : (
                            <div>


                                <div className="gap-2">
                                    <h1 className="text-md md:text-xl font-semibold">Tasks & Daily Activities</h1>
                                    <p className="text-gray-600">Assign tasks, track progress, and submit daily work reports</p>
                                </div>

                                <div className="flex gap-4 my-6">
                                    {
                                        role !== 'employee' &&
                                        <button
                                            onClick={() => setAddTaskOpen(true)}
                                            className="btn-primary rounded-lg py-3 px-6 text-white"
                                        >
                                            + Assign Task
                                        </button>
                                    }

                                    <button
                                        onClick={() => setOpenReports(true)}
                                        className="bg-white rounded-lg py-3 px-6 border cursor-pointer">
                                        Daily Reports
                                    </button>
                                </div>

                                {/* -------- SUMMARY CARDS -------- */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                                    <SummaryCard label="In Progress" value={stats.in_progress.toString()} />
                                    <SummaryCard label="Overdue" value={stats.overdue.toString()} />
                                    <SummaryCard label="Due Today" value={stats.due_today.toString()} />
                                    <SummaryCard label="Completed" value={stats.completed.toString()} />
                                </div>

                                {/* SEARCH */}
                                <div className="flex items-center gap-2 rounded-lg bg-gray-100 w-full p-2 my-4 border">
                                    <HiSearch size={25} className="text-gray-400" />
                                    <input type="text" placeholder="Search tasks or employees..." className="w-full outline-none bg-transparent" />
                                </div>

                                {/* TABLE */}
                                <div>
                                    <h1 className="font-bold mb-4">All Tasks</h1>
                                </div>

                                {/* -------- MOBILE CARDS -------- */}
                                <div className="space-y-4 md:hidden">
                                    {tasks.map((task) => (
                                        <div key={task.id} className="rounded-xl bg-white p-4 shadow-sm border space-y-3">
                                            <div className="flex items-center justify-between">
                                                <p className="text-md font-semibold text-gray-700">
                                                    {task.title}
                                                </p>
                                                <ActionMenu task={task} />
                                            </div>
                                            <hr />
                                            <InfoRow label="Assignee" value={task.employees?.name} />
                                            <InfoRow label="Due Date" value={new Date(task.end_date).toLocaleDateString()} />
                                            <InfoRow label="Priority" value={task.priority} />
                                            <InfoRow label="Status" value={task.status} />
                                        </div>
                                    ))}
                                </div>

                                {/* -------- DESKTOP TABLE -------- */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 text-gray-600">
                                            <tr>
                                                <th className="px-4 py-3 text-left">Created Date</th>
                                                <th className="px-4 py-3 text-left">Task Title</th>
                                                <th className="px-4 py-3 text-left">Assigned to</th>
                                                <th className="px-4 py-3 text-left">Due Date</th>
                                                <th className="px-4 py-3 text-left">Priority</th>
                                                <th className="px-4 py-3 text-left">Status</th>
                                                <th className="px-4 py-3 text-left">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tasks.map((task) => (
                                                <tr key={task.id} className="border-t hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-gray-500">
                                                        {new Date(task.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-3 max-w-[250px]">
                                                        <p className="line-clamp-2 break-words">
                                                            {task.title}
                                                        </p>
                                                    </td>
                                                    <td className="px-4 py-3">{task.employees?.name}</td>
                                                    <td className="px-4 py-3">{new Date(task.end_date).toLocaleDateString()}</td>
                                                    <td className="px-4 py-3 capitalize">{task.priority}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize
                                                ${task.status === "completed" ? "bg-green-100 text-green-700" :
                                                                task.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                                                                    "bg-yellow-100 text-yellow-700"}`}>
                                                            {task.status?.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <ActionMenu task={task} />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {tasks.length === 0 && (
                                        <p className="px-4 py-10 text-center text-gray-400">No tasks found.</p>
                                    )}
                                </div>

                                {addTaskOpen && (
                                    <AddTaskModal
                                        open={addTaskOpen}
                                        onClose={() => {
                                            setAddTaskOpen(false);
                                            fetchTasks();
                                        }}
                                    />
                                )}
                            </div>
                        )
                    }

                </div>
            )}
        </>
    )
}

function SummaryCard({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl bg-white p-4 shadow-sm ">
            <p className="text-sm text-gray-500 uppercase tracking-wider">{label}</p>
            <p className="mt-2 text-2xl font-bold text-gray-800">{value}</p>
        </div>
    )
}

function InfoRow({ label, value }: { label: string, value: any }) {
    return (
        <div className="flex justify-between items-center border-b border-gray-50 pb-2">
            <span className="text-gray-500 text-sm">{label}</span>
            <span className="text-gray-900 text-sm font-medium">{value || "-"}</span>
        </div>
    )
}