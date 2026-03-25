'use client'

import { useEffect, useState } from "react"
import { createClient } from "@/app/utils/supabase/client"
import Reports from "@/app/components/Reports"
import AddAnnounceModal from "@/app/components/AddAnnounceModal"
import { formatDateForAnnouncements } from "@/app/utils/dateFormatter"

export default function AnnouncePage() {
    const supabase = createClient()

    const [addAnnounceOpen, setAddAnnounceOpen] = useState<boolean>(false)
    const [editAnnonce, setEditAnounce] = useState<boolean>(false)
    const [selectedAnnounce, setSelectedAnnounce] = useState<any>()
    const [role, setRole] = useState<any>()

    const [tasks, setTasks] = useState<any[]>([])

    useEffect(() => {
        fetchTasks()
        fetchUser()
    }, [])





    async function fetchTasks() {
        const { data, error } = await supabase
            .from("announcements")
            .select(`
                id,
                created_at,
                title,
                description,
                profiles(full_name, role)
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

    async function deleteAnnouncement(id: string) {
        const confirmDelete = confirm("Are you sure you want to delete this announcement?")
        if (!confirmDelete) return

        const { error } = await supabase
            .from("announcements")
            .delete()
            .eq("id", id)

        if (error) {
            console.error(error)
            alert("Failed to delete")
        } else {
            fetchTasks()
        }
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




    return (
        <>
            <div className="w-full p-2 md:p-6 rounded-lg border-2 border-green-200">

                <div className="max-h-[90vh] overflow-y-auto pr-2 scrollbar-hide">


                    <div className="flex flex-col md:flex-row gap-5 md:gap-10 my-6">
                        <button
                            onClick={() => setAddAnnounceOpen(true)}
                            className="btn-primary rounded-lg py-3 px-6 text-white"
                        >
                            + Add announcement
                        </button>
                       {/* SUMMARY */}
                    <SummaryCard label="Announcements" value={tasks.length.toString()} />
                       
                    </div>

                   

                    {/* TITLE */}
                    <div className="my-5">
                        <h1 className="font-bold mb-4">Announcements</h1>
                    </div>

                    {
                        tasks.map((task) => (


                            <div
                                key={task.id}
                                className="bg-white rounded-xl shadow-sm p-4 md:p-5 my-4
                                            flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-6 overflow-y-auto "
                            >

                                {/* LEFT SIDE */}
                                <div className="space-y-3">

                                    <div>
                                        <p className="text-xs font-bold text-gray-900">Title</p>
                                        <p className="text-xs font-semibold text-gray-800 break-words">
                                            {task.title}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-bold text-gray-900">Date</p>
                                        <p className="text-xs text-gray-600">
                                            {formatDateForAnnouncements(task.created_at)}
                                        </p>
                                    </div>

                                </div>

                                {/* RIGHT SIDE */}
                                <div className="space-y-3">

                                    <div>
                                        <p className="text-xs font-bold text-gray-900">Author</p>
                                        <div className="flex gap-3 items-center">
                                            <p className="text-sm font-medium text-gray-700">
                                                {task.profiles?.full_name || "-"}

                                            </p>
                                           <p className="text-sm text-gray-900"> role : {task.profiles?.role}</p>
                                        </div>

                                    </div>

                                    <div>
                                        <p className="text-xs font-bold text-gray-900">Description</p>
                                        <p className="text-sm text-gray-700 break-words whitespace-pre-wrap ">
                                            {task.description}
                                        </p>
                                    </div>

                                </div>
                                {
                                    role === 'owner' && (
                                        <div className="flex gap-20">
                                            <button
                                                onClick={() => {
                                                    setSelectedAnnounce(task)
                                                    setEditAnounce(true)
                                                }}
                                                className="text-white bg-blue-600 rounded-lg p-2 w-40 cursor-pointer hover:bg-blue-400"
                                            >Edit</button>
                                            <button
                                                onClick={() => deleteAnnouncement(task.id)}
                                                className="text-white bg-red-300 rounded-lg p-2 w-40 cursor-pointer hover:bg-red-400"
                                            >Delete</button>
                                        </div>

                                    )
                                }


                            </div>

                        ))
                    }


                    {addAnnounceOpen && (
                        <AddAnnounceModal
                            open={addAnnounceOpen}
                            onClose={() => {
                                setAddAnnounceOpen(false)
                                fetchTasks()
                            }}
                        />
                    )}
                    {
                        editAnnonce && selectedAnnounce && (
                            <AddAnnounceModal open={editAnnonce} onClose={() => setEditAnounce(false)} announce={selectedAnnounce} />
                        )
                    }
                </div>

            </div>
        </>
    )
}

/* ---------------- COMPONENTS ---------------- */

function SummaryCard({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex items-center gap-4 rounded-xl bg-white px-10 md:px-2 shadow-sm border w-full md:w-54">
            <p className="text-sm text-gray-500 tracking-wider">{label}:</p>
            <p className="mt-2 text-2xl font-semibold text-gray-800">{value}</p>
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