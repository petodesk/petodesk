'use client'

import { useState, useEffect } from "react"
import { createClient } from "@/app/utils/supabase/client"
import { toast } from "react-toastify"
import { ClipLoader } from "react-spinners"

export default function AddReportModal({
    open,
    onClose,
    taskId
}: {
    open: boolean
    onClose: () => void
    taskId: string
}) {
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        work_summary: "",
        challenges: "",
        time_spent: ""
    })
    const [employeeId, setEmployeeId] = useState<string>("")

    // Get current employee id
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) setEmployeeId(user.id)
        }
        getUser()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        if (!employeeId) return;

        const { error } = await supabase
            .from('task_reports')
            .insert([{
                task_id: taskId,
                employee_id: employeeId,
                title: formData.title,
                work_summary: formData.work_summary,
                challenges: formData.challenges,
                time_spent: formData.time_spent
            }])

        if (error) {
            toast.error(error.message)
            setLoading(false)
            return
        }

        toast.success("Report submitted successfully!")
        setFormData({
            title: "",
            work_summary: "",
            challenges: "",
            time_spent: ""
        })
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
                className="relative bg-white p-6 rounded-lg w-full max-w-lg shadow-lg"
            >
                <h2 className="text-lg font-semibold mb-4">Report This Task</h2>

                <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                        required
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full p-2 border rounded-md"
                    />
                </div>

                <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Work Summary</label>
                    <textarea
                        required
                        value={formData.work_summary}
                        onChange={(e) => setFormData({ ...formData, work_summary: e.target.value })}
                        className="w-full p-2 border rounded-md h-20"
                        placeholder="What you did..."
                    />
                </div>

                <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Challenges</label>
                    <textarea
                        value={formData.challenges}
                        onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                        className="w-full p-2 border rounded-md h-20"
                        placeholder="Any challenges faced"
                    />
                </div>

                <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Time Spent (hours)</label>
                    <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={formData.time_spent}
                        onChange={(e) => setFormData({ ...formData, time_spent: e.target.value })}
                        className="w-full p-2 border rounded-md"
                        placeholder="e.g., 3.5"
                    />
                </div>

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
                        {loading ? <ClipLoader size={16} color="#fff" /> : "Submit Report"}
                    </button>
                </div>
            </form>
        </div>
    )
}