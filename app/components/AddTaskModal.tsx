'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import { toast } from 'react-toastify'
import { ClipLoader } from 'react-spinners'
import { sendTaskEmail } from '@/app/actions/sendEmail'
interface Employee {
    id: string,
    name: string,
    email: string
}
export default function AddTaskModal({ open, onClose }: { open: boolean, onClose: () => void }) {
    const supabase = createClient()

    // Form States
    const [loading, setLoading] = useState(false)
    const [employees, setEmployees] = useState<Employee[]>([])
    const[assignedBy, setAssignedBy] = useState<string>()
    const[userCompanyId, setUserCompanyId] = useState<string>()
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assigned_to: '',
        priority: 'medium',
        start_date: '',
        end_date: '',
        notify: false
    })

    // Fetch Employees for the dropdown
    useEffect(() => {
        if (open) {
            const fetchEmployees = async () => {
                const { data, error } = await supabase
                    .from('employees')
                    .select('id, name, email')
                    .order('name', { ascending: true })

                if (error) {
                    toast.error("Failed to load employees")
                } else {
                    setEmployees(data || [])
                }
            }
            fetchEmployees()
        }
    }, [open, supabase])

useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            setAssignedBy(user.id)

            const { data: profile } = await supabase
                .from('profiles')
                .select('company_id')
                .eq('id', user.id)
                .single()

            setUserCompanyId(profile?.company_id ?? null)
        }

        getUser()
    }, [])

    // 1. Import the action at the top

    // 2. Inside your handleSubmit function:
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        if(!assignedBy || !userCompanyId){
            return;
        }
        // Find the full employee object so we can get their email
        const selectedEmployee = employees.find(emp => emp.id === formData.assigned_to)

        // Save to Supabase
        const { error } = await supabase
            .from('tasks')
            .insert([{
                company_id:userCompanyId,
                title: formData.title,
                description: formData.description,
                assigned_to: formData.assigned_to,
                assigned_by:assignedBy,
                priority: formData.priority,
                start_date: formData.start_date,
                end_date: formData.end_date,
                notify: formData.notify
            }])

        if (error) {
            toast.error(error.message)
            setLoading(false)
            return
        }

        // 3. IF "Notify" is checked, send the email!
        if (formData.notify && selectedEmployee) {
            await sendTaskEmail(
                selectedEmployee.email,
                formData.title,
                selectedEmployee.name
            )
        }

        setLoading(false)
        toast.success("Task created and employee notified!")
        onClose()
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <form onSubmit={handleSubmit} className="relative z-50 w-full mt-20 rounded-lg bg-white max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col shadow-lg">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
                    <h2 className="text-lg font-semibold">Assign New Task</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Task Title</label>
                        <input
                            required
                            type="text"
                            className="w-full p-2 border rounded-md"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            className="w-full p-2 border rounded-md h-24"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Assign To</label>
                            <select
                                required
                                className="w-full p-2 border rounded-md"
                                value={formData.assigned_to}
                                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                            >
                                <option value="">Select Employee</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Priority</label>
                            <select
                                className="w-full p-2 border rounded-md"
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Start Date</label>
                            <input
                                type="date"
                                className="w-full p-2 border rounded-md"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">End Date</label>
                            <input
                                type="date"
                                className="w-full p-2 border rounded-md"
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="notify"
                            checked={formData.notify}
                            onChange={(e) => setFormData({ ...formData, notify: e.target.checked })}
                            className="w-4 h-4 cursor-pointer"
                        />
                        <label htmlFor="notify" className="text-sm cursor-pointer">Notify Employee via Email</label>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border rounded-md hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2"
                    >
                        {loading ? <ClipLoader size={18} color="#fff" /> : 'Create Task'}
                    </button>
                </div>
            </form>
        </div>
    )
}