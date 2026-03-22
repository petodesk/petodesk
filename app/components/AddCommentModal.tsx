'use client'

import { useState } from "react"
import { createClient } from "@/app/utils/supabase/client"
import { toast } from "react-toastify"
import { ClipLoader } from "react-spinners"

export default function AddCommentModal({
    open,
    onClose,
    type,       
    entityId,   
    title
}: {
    open: boolean
    onClose: () => void
    type: 'task' | 'report' | 'leave' | 'issue'
    entityId: string
    title?: string
}) {

    const supabase = createClient()
    const [comment, setComment] = useState("")
    const [loading, setLoading] = useState(false)

    async function getProfileId() {
        const { data: { user } } = await supabase.auth.getUser()
        return user?.id
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const userId = await getProfileId()

        let table = ''
        let payload: any = {
            comment,
            commented_by: userId,

        }

        // dynamic logic
        if (type === 'task') {
            table = 'task_comments'
            payload.task_id = entityId
        }

        if (type === 'report') {
            table = 'report_comments'
            payload.report_id = entityId
        }

        if (type === 'leave') {
            table = 'leave_comments'
            payload.leave_id = entityId
        }
        if (type === 'issue') {
            table = 'issue_comments'
            payload.issue_id = entityId
        }
        const { error } = await supabase.from(table).insert(payload)

        if (error) {
            toast.error(error.message)
            setLoading(false)
            return
        }

        toast.success(`${type} Comment added`);
        setComment("")
        setLoading(false)
        onClose()
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">

            <div
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
            />

            <form
                onSubmit={handleSubmit}
                className="relative bg-white p-6 rounded-lg w-full max-w-md shadow-lg"
            >

                <h2 className="text-lg font-semibold mb-4">
                    Add Comment {title ? `for ${title}` : ""}
                </h2>

                <textarea
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full border rounded-md p-2 h-28"
                    placeholder="Write your comment..."
                />

                <div className="flex justify-end gap-3 mt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border rounded-md"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2"
                    >
                        {loading ? <ClipLoader size={16} color="#fff" /> : "Add Comment"}
                    </button>
                </div>

            </form>
        </div>
    )
}