'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import { toast } from 'react-toastify'
import { ClipLoader } from 'react-spinners'

export default function CandidateFormModal({ open, onClose }: { open: boolean, onClose: () => void}) {
    const supabase = createClient()
    // Form States
    const [loading, setLoading] = useState(false)
    const[assignedBy, setAssignedBy] = useState<string>()
    const[userCompanyId, setUserCompanyId] = useState<string>()
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
        birthdate:  'medium',
        gender: "",
        nationality: "",
        currentLocation:"",
        position:"",
        expectedSalary:"",
        highestQualification:"",
        experience:"",
        portfolioLink:"",
    })

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


const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
    const { error: insertError } = await supabase
        .from('candidates')
        .insert([{
            company_id: userCompanyId,
            name: formData.fullName,
            email: formData.email,
            phone: formData.phoneNumber,
            birthdate: formData.birthdate,
            gender: formData.gender,
            nationality: formData.nationality,
            location: formData.currentLocation,
            position: formData.position,
            salary: formData.expectedSalary,
            qualification: formData.highestQualification,
            experience: formData.experience,
            portfolio: formData.portfolioLink,
            added_by: assignedBy,
           
        }])

   
        if (insertError) {  
            toast.error('Failed to create task. Please try again.')
            setLoading(false)
            console.error('Insert Error:', insertError)
        }

    }

        
    if (!open) return null
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <form onSubmit={handleSubmit} className="relative z-50 w-full mt-20 rounded-lg bg-white max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col shadow-lg">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
                    <h2 className="text-lg font-semibold"> Add Candidate</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                {/* Body */}
                <div className="px-6 py-4 flex-1 space-y-4">
                   <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <Input label="Candidate Name" name="fullName" value={formData.fullName} onChange={handleInputChange} type='text' />
                    <Input label="Email" name="email" value={formData.email} onChange={handleInputChange} type='email' />
                    <Input label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} type='text' />
                    <Input label="Birthdate" name="birthdate" value={formData.birthdate} onChange={handleInputChange} type='date' />
                    <Input label="Gender" name="gender" value={formData.gender} onChange={handleInputChange} type='text' />
                    <Input label="Nationality" name="nationality" value={formData.nationality} onChange={handleInputChange} type='text' />
                    <Input label="Current Location" name="currentLocation" value={formData.currentLocation} onChange={handleInputChange} type='text' />
                    <Input label="Position" name="position" value={formData.position} onChange={handleInputChange} type='text' />
                    <Input label="Expected Salary" name="expectedSalary" value={formData.expectedSalary} onChange={handleInputChange} type='text' />
                    <Input label="Highest Qualification" name="highestQualification" value={formData.highestQualification} onChange={handleInputChange} type='text' />
                    <Input label="Experience" name="experience" value={formData.experience} onChange={handleInputChange} type='text' />
                    <Input label="Portfolio Link" name="portfolioLink" value={formData.portfolioLink} onChange={handleInputChange} type='url' />

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
                        {loading ? <ClipLoader size={18} color="#fff" />:  'Create'}
                    </button>
                </div>
            </form>
        </div>
    )
}

function Input ({ label, name, type = "text", value, onChange }: { label: string, name: string, type?: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
    return (
        <div className="flex flex-col"> 
            <label htmlFor={name} className="mb-1 text-sm font-medium text-gray-700">{label}</label>
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
        </div>
    )
}