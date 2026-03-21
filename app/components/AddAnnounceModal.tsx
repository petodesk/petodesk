'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import { toast } from 'react-toastify'
import { ClipLoader } from 'react-spinners'


export default function AddAnnounceModal({ open, onClose , announce}: { open: boolean, onClose: () => void, announce?:any }) {
    const supabase = createClient()
    const isEdit = !!announce
    // Form States
    const [loading, setLoading] = useState(false)
    const[author, setAuthor] = useState<string>()
    const[userCompanyId, setUserCompanyId] = useState<string>()
    const [formData, setFormData] = useState({
        title: "",
        description: ""
    
    })



useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            setAuthor(user.id)

            const { data: profile } = await supabase
                .from('profiles')
                .select('company_id')
                .eq('id', user.id)
                .single()

            setUserCompanyId(profile?.company_id ?? null)
        }

        getUser()
    }, [])
useEffect(() => {
    if (announce) {
        setFormData({
            title: announce.title ?? "",
            description: announce.description ?? "",
           
        })
    }
}, [announce])

    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        if(!userCompanyId){
            return;
        }
        // Find the full employee object so we can get their email
      
        let error

if (isEdit) {
    const { error: updateError } = await supabase
        .from('announcements')
        .update({
            title: formData.title,
            description: formData.description
          
        })
        .eq('id', announce?.id)

    error = updateError

} else {

    const { error: insertError } = await supabase
        .from('announcements')
        .insert({
            company_id: userCompanyId,
            title: formData.title,
            description: formData.description,
            author: author
          
        })

    error = insertError
   
}


        setLoading(false)
       toast.success(isEdit ? "Announce updated successfully!" : "Announce created successfully!")
        onClose()
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <form onSubmit={handleSubmit} className="relative z-50 w-full mt-20 rounded-lg bg-white max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col shadow-lg">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
                    <h2 className="text-lg font-semibold"> {`${isEdit ? "Edit Announce" : "Add New Announce"}`}</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
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
                        {loading ? <ClipLoader size={18} color="#fff" /> : isEdit ? 'Update ' : 'Create '}
                    </button>
                </div>
            </form>
        </div>
    )
}