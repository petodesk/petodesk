'use client'

import { useEffect, useState } from "react"
import { HiSearch } from "react-icons/hi"
import { createClient } from "@/app/utils/supabase/client"
import AddCommentModal from "@/app/components/AddCommentModal"
import AddIssueModal from "@/app/components/AddIssueModal"
import { formatDate, formatDateForAnnouncements } from "@/app/utils/dateFormatter"

export default function Issues() {
    const supabase = createClient()

    const [viewMore, setViewMore] = useState<boolean>(false)
    const [selectedIssue, setSelectedIssue] = useState<any>(null)
    const [addTaskOpen, setAddTaskOpen] = useState<boolean>(false)
    const [openComment, setOpenComment] = useState<boolean>(false)
    const [role, setRole] = useState<string | undefined>()
    const [searchTerm, setSearchTerm] = useState<string>("")

    const [issues, setIssues] = useState<any[]>([])
useEffect(() => {
        fetchTasks()
        fetchUser()

        // 1. Create the channel for the Issues table
        const issueChannel = supabase
            .channel('issue-updates')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen for INSERT, UPDATE, and DELETE
                    schema: 'public',
                    table: 'issue_complaints',
                },
                async (payload) => {
                    console.log('Change received!', payload)
                    // Refresh the list
                    await fetchTasks()
                    
                    // If the user is currently looking at a specific issue, refresh that data too
                    if (selectedIssue && payload.new && (payload.new as any).id === selectedIssue.id) {
                        refreshSelectedIssue(selectedIssue.id)
                    }
                }
            )
            .subscribe()

        // 2. Create a channel for Comments (Optional but recommended)
        const commentChannel = supabase
            .channel('comment-updates')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'issue_comments',
                },
                async () => {
                    // Only need to refresh if we are inside the detail view
                    if (selectedIssue) {
                        refreshSelectedIssue(selectedIssue.id)
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(issueChannel)
            supabase.removeChannel(commentChannel)
        }
    }, [selectedIssue?.id]) // Dependency on ID ensures we refresh the correct context

    // Refetches selected issue data when viewMore is opened to ensure up-to-date values.
    useEffect(() => {
        if (viewMore && selectedIssue) {
            refreshSelectedIssue(selectedIssue.id)
        }
    }, [viewMore])

    async function fetchTasks() {
        const { data, error } = await supabase
            .from("issue_complaints")
            .select(`
                id,
                created_at,
                title,
                status,
                action_taken,
                description,
                profiles(full_name, role),
                issue_comments(
                    id,
                    comment,
                    created_at,
                    profiles(full_name, role)
                )
            `)
            .order('created_at', { ascending: false })

        if (error) return;

        setIssues(data || [])
    }

    async function refreshSelectedIssue(issueId: string) {
        const { data, error } = await supabase
            .from("issue_complaints")
            .select(`
                id,
                created_at,
                title,
                status,
                action_taken,
                description,
                profiles(full_name, role),
                issue_comments(
                    id,
                    comment,
                    created_at,
                    profiles(full_name, role)
                )
            `)
            .eq("id", issueId)
            .single()

        if (!error && data) {
            setSelectedIssue(data)
        }
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
            console.error(error)
        }
    }

    // HANDLER: Update Issue Status
    async function updateStatus(newStatus: string) {
        if (!selectedIssue) return
        const { error } = await supabase
            .from("issue_complaints")
            .update({ status: newStatus })
            .eq("id", selectedIssue.id)

        if (!error) {
            refreshSelectedIssue(selectedIssue.id)
            fetchTasks()
        }
    }

    // HANDLER: Update Action Taken
    async function updateActionTaken(action: string) {
        if (!selectedIssue) return
        const { error } = await supabase
            .from("issue_complaints")
            .update({ action_taken: action })
            .eq("id", selectedIssue.id)

        if (!error) {
            refreshSelectedIssue(selectedIssue.id)
            fetchTasks()
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

        function viewIssue() {
            setSelectedIssue(task)
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
                            <li onClick={viewIssue} className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                                View Details
                            </li>
                        </ul>
                    </div>
                )}

            </div>
        )
    }

    // Dynamic summary computations
    const pendingCount = issues.filter(issue => issue.status === 'pending').length.toString()
    const resolvedCount = issues.filter(issue => issue.status === 'resolved').length.toString()
    const inProgressCount = issues.filter(issue => issue.status === 'in progress' || issue.status === 'inp rogress').length.toString()

    // Dynamic client filtering
    const filteredIssues = issues.filter(issue =>
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <>
            {viewMore && selectedIssue ? (
                /* ---------------- VIEW TASK (ISSUE) PAGE ---------------- */
                <div className="w-full min-h-screen p-2 md:p-6 rounded-lg border bg-white">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold">Issue Details</h2>
                            <p className="text-sm text-gray-500">
                                Added Date {formatDate(selectedIssue.created_at)}
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
                            <h3 className="font-semibold border-b pb-2">Issues details</h3>
                            <InfoRow label="issue title" value={selectedIssue.title} />
                            <InfoRow label="Raised by" value={selectedIssue.profiles?.full_name} />
                            <InfoRow label="Role" value={selectedIssue.profiles?.role} />
                            <InfoRow label="Status" value={selectedIssue.status} />
                            <InfoRow label="Action Taken" value={selectedIssue.action_taken || "-"} />
                        </div>

                        <div className="border rounded-xl p-5 space-y-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-gray-600 text-sm">Description</span>
                                <p className="text-sm bg-gray-50 p-2 rounded">{selectedIssue.description || "No description provided."}</p>
                            </div>
                        </div>

                        {/* Visible only if user is admin or owner */}
                        {(role === 'admin' || role === 'owner' && selectedIssue.status !== 'resolved') &&  (
                            <div className="border rounded-xl p-5 space-y-4">
                                <h3 className="font-semibold border-b pb-2">Actions</h3>
                                <div className="flex justify-between border-b pb-4 items-center">
                                    <h1 className="text-sm font-medium">Update status</h1>
                                    <select
                                        name="status"
                                        id="status"
                                        className="border rounded px-2 py-1 text-sm outline-none"
                                        value={selectedIssue.status}
                                        onChange={(e) => updateStatus(e.target.value)}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="in progress">In progress</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>

                                {/* Active IF and only IF status is resolved OR was already resolved */}
                                {(selectedIssue.status === 'resolved') && (
                                    <div className="flex justify-between border-b pb-4 items-center">
                                        <h1 className="text-sm font-medium">Action Taken</h1>
                                        <select
                                            name="action_taken"
                                            id="action_taken"
                                            className="border rounded px-2 py-1 text-sm outline-none"
                                            value={selectedIssue.action_taken || ""}
                                            onChange={(e) => updateActionTaken(e.target.value)}
                                        >
                                            <option value="">Select action</option>
                                            <option value="warning">Warning</option>
                                            <option value="suspension">Suspension</option>
                                            <option value="leave reject">Leave Reject</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="border rounded-xl p-5 h-fit">
                            <button
                                onClick={() => setOpenComment(true)}
                                className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                            >
                                Add Comments
                            </button>
                        </div>
                    </div>

                    {/* Comments Section using issue_comments */}
                    <div className="border rounded-xl p-2 md:p-5 space-y-4 mt-2 md:mt-4">
                        <h3 className="font-semibold border-b pb-2">Comments</h3>

                        {selectedIssue?.issue_comments?.length > 0 ? (
                            <div className="space-y-3">
                                {selectedIssue.issue_comments.map((c: any) => (
                                    <div key={c.id} className="bg-gray-50 p-3 rounded-lg border">
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <div className="flex gap-10">
                                                <span>{c.profiles?.full_name || "Unknown"}</span>
                                                <p className="hidden md:flex text-sm text-gray-900">Role: {c.profiles?.role}</p>
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {timeAgo(c.created_at)}
                                            </span>
                                        </div>
                                        <p className="break-words text-sm text-gray-800">
                                            {c.comment}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400">No comments yet.</p>
                        )}
                    </div>

                    {openComment && (
                        <AddCommentModal
                            open={openComment}
                            onClose={() => { setOpenComment(false); refreshSelectedIssue(selectedIssue.id); }}
                            type="issue"
                            entityId={selectedIssue.id}
                            title={selectedIssue.title}
                        />
                    )}
                </div>
            ) : (
                /* ---------------- DASHBOARD ---------------- */
                <div className="w-full p-2 md:p-6 rounded-lg border-2 border-green-200">
                    <div>
                        <div className="flex gap-4 my-6 max-sm:justify-center w-full">
                            <button
                                onClick={() => setAddTaskOpen(true)}
                                className="btn-primary rounded-lg py-3 px-6 text-white bg-blue-600 hover:bg-green-700 w-60"
                            >
                                Raise Issue
                            </button>
                        </div>

                        {/* -------- SUMMARY CARDS -------- */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                            <SummaryCard label="Pending Issue" value={pendingCount} />
                            <SummaryCard label="Resolved Issue" value={resolvedCount} />
                            <SummaryCard label="In progress Issue" value={inProgressCount} />
                        </div>

                        {/* SEARCH */}
                        <div className="flex items-center gap-2 rounded-lg bg-gray-100 w-full p-2 my-4 border">
                            <HiSearch size={25} className="text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search issues or users..."
                                className="w-full outline-none bg-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* TABLE */}
                        <div>
                            <h1 className="font-bold mb-4">Issues</h1>
                        </div>

                        {/* -------- MOBILE CARDS -------- */}
                        <div className="space-y-4 md:hidden">
                            {filteredIssues.map((task) => (
                                <div key={task.id} className="rounded-xl bg-white p-4 shadow-sm border space-y-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-md font-semibold text-gray-700">
                                            {formatDateForAnnouncements(task.created_at)}
                                        </p>
                                        <ActionMenu task={task} />
                                    </div>
                                    <hr />
                                    <InfoRow label="Title" value={task.title} />
                                    <InfoRow label="Raised by" value={task.profiles?.full_name} />
                                    <InfoRow label="Role" value={task.profiles?.role} />
                                    <InfoRow label="Status" value={task.status} />
                                    <InfoRow label="Action Taken" value={task.action_taken || "-"} />
                                </div>
                            ))}
                        </div>

                        {/* -------- DESKTOP TABLE -------- */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-600">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Created Date</th>
                                        <th className="px-4 py-3 text-left">Issue Title</th>
                                        <th className="px-4 py-3 text-left">Raised by</th>
                                        <th className="px-4 py-3 text-left">Role</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                        <th className="px-4 py-3 text-left">Action Taken</th>
                                        <th className="px-4 py-3 text-left">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredIssues.map((issue) => (
                                        <tr key={issue.id} className="border-t hover:bg-gray-50">
                                            <td className="px-4 py-3 text-gray-500">
                                                {formatDateForAnnouncements(issue.created_at)}
                                            </td>
                                            <td className="px-4 py-3 max-w-[250px]">
                                                <p className="line-clamp-2 break-words">
                                                    {issue.title}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3">{issue.profiles?.full_name}</td>
                                            <td className="px-4 py-3">{issue.profiles?.role}</td>
                                            <td className="px-4 py-3 capitalize">{issue.status}</td>
                                            <td className="px-4 py-3 capitalize">{issue.action_taken || "-"}</td>
                                            <td className="px-4 py-3">
                                                <ActionMenu task={issue} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredIssues.length === 0 && (
                                <p className="px-4 py-10 text-center text-gray-400">No issues found.</p>
                            )}
                        </div>

                        {addTaskOpen && (
                            <AddIssueModal
                                open={addTaskOpen}
                                onClose={() => {
                                    setAddTaskOpen(false);
                                    fetchTasks();
                                }}
                            />
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

function SummaryCard({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl bg-white p-4 shadow-sm border">
            <p className="text-sm text-gray-500 tracking-wider">{label}</p>
            <p className="mt-2 text-2xl font-bold text-gray-800">{value}</p>
        </div>
    )
}

function InfoRow({ label, value }: { label: string, value: any }) {
    return (
        <div className="flex justify-between items-center border-b border-green-200 pb-2">
            <span className="text-gray-500 text-sm capitalize">{label}</span>
            <span className="text-gray-900 text-sm font-medium">{value || "-"}</span>
        </div>
    )
}