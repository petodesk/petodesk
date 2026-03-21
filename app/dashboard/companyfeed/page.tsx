'use client'

import { useEffect, useState } from "react"
import { createClient } from "@/app/utils/supabase/client"
import Reports from "@/app/components/Reports"
import AddAnnounceModal from "@/app/components/AddAnnounceModal"

export default function AnnouncePage() {
    const supabase = createClient()

    const [selectedTask, setSelectedTask] = useState<any>(null)
    const [addAnnounceOpen, setAddAnnounceOpen] = useState<boolean>(false)
    const [editTask, setEditTask] = useState<boolean>(false)
    const [task, setTask] = useState<any>()
    const [role, setRole] = useState<any>()
    const [openReports, setOpenReports] = useState<boolean>(false)

    const [tasks, setTasks] = useState<any[]>([])

    useEffect(() => {
        fetchTasks()
        fetchUser()
    }, [])

    async function fetchTasks() {
        const { data, error } = await supabase
            .from("announcements")
            .select(`created_at,
                title,
                description,
                profiles(name)
                `)
            .order("created_at", { ascending: false })

        if (error) {
            console.error(error)
            return
        }

        setTasks(data || [])
    }

    /* ---------------- USER ---------------- */
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
        } catch (error) { }
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

    function ActionMenu({ announce }: { announce: any }) {
        const [open, setOpen] = useState(false)

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
                            <li className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                                Delete
                            </li>
                            <li className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                                Edit
                            </li>
                        </ul>
                    </div>
                )}

                {editTask && (
                    <AddAnnounceModal
                        announce={task}
                        open={editTask}
                        onClose={() => {
                            setEditTask(false)
                            fetchTasks()
                        }}
                    />
                )}
            </div>
        )
    }

    return (
        <>
            <div className="w-full p-2 md:p-6 rounded-lg border-2 border-green-200">
                {
                    openReports ? (
                        <Reports open={openReports} onClose={() => setOpenReports(false)} />
                    ) : (
                        <div>

                            <div className="flex flex-col md:flex-row gap-4 my-6">
                                <button
                                    onClick={() => setAddAnnounceOpen(true)}
                                    className="btn-primary rounded-lg py-3 px-6 text-white"
                                >
                                    + Add announcement
                                </button>

                                <button className="bg-white rounded-lg py-3 px-6 border cursor-pointer">
                                    Issue & Complaints
                                </button>
                            </div>

                            {/* SUMMARY */}
                            <SummaryCard label="Announcements" value={tasks.length.toString()} />

                            {/* TITLE */}
                            <div className="my-5">
                                <h1 className="font-bold mb-4">Announcements</h1>
                            </div>

                            {/* MOBILE */}
                            <div className="space-y-4 md:hidden">
                                {tasks.map((task) => (
                                    <div key={task.id} className="rounded-xl bg-white p-4 shadow-sm border space-y-3">
                                        <div className="flex items-center justify-between">
                                            <p className="text-md font-semibold text-gray-700">
                                                {timeAgo(task.created_at)}
                                            </p>
                                            <ActionMenu announce={task} />
                                        </div>
                                        <hr />
                                        <InfoRow label="Title" value={task.title} />
                                        <InfoRow label="Description" value={task.description} />
                                        <InfoRow label="Author" value={task.author} />
                                    </div>
                                ))}
                            </div>

                            {/* DESKTOP */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-gray-600">
                                        <tr>
                                            <th className="px-4 py-3 text-left">Created Date</th>
                                            <th className="px-4 py-3 text-left">Title</th>
                                            <th className="px-4 py-3 text-left">Author</th>
                                            <th className="px-4 py-3 text-left">Description</th>
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

                                                <td className="px-4 py-3">
                                                    {task.author}
                                                </td>

                                                <td className="px-4 py-3 max-w-[300px]">
                                                    <p className="break-words line-clamp-2">
                                                        {task.description}
                                                    </p>
                                                </td>

                                                <td className="px-4 py-3">
                                                    <ActionMenu announce={task} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {tasks.length === 0 && (
                                    <p className="px-4 py-10 text-center text-gray-400">
                                        No announcements found.
                                    </p>
                                )}
                            </div>

                            {addAnnounceOpen && (
                                <AddAnnounceModal
                                    open={addAnnounceOpen}
                                    onClose={() => {
                                        setAddAnnounceOpen(false)
                                        fetchTasks()
                                    }}
                                />
                            )}
                        </div>
                    )
                }
            </div>
        </>
    )
}

/* ---------------- COMPONENTS ---------------- */

function SummaryCard({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl bg-white p-4 shadow-sm border w-full md:w-54">
            <p className="text-sm text-gray-500 tracking-wider">{label}</p>
            <p className="mt-2 text-2xl font-bold text-gray-800">{value}</p>
        </div>
    )
}

function InfoRow({ label, value }: { label: string, value: any }) {
    return (
        <div className="flex flex-col border-b border-green-200 pb-2">
            <span className="text-gray-500 text-sm">{label}</span>
            <span className="text-gray-900 text-sm font-medium break-words whitespace-pre-wrap">
                {value || "-"}
            </span>
        </div>
    )
}