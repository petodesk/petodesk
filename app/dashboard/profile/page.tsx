'use client'

import { useCompany } from "@/app/context/CompanyContext"

export default function profiles() {
    const { profile, company } = useCompany()
    return (
        <div className="bg-white rounded-lg p-6 my-4 font-poppins">
            <div className="flex justify-between my-3">
                <h1 className="text-xl font-bold text-gray-900">Profile page</h1>
                <button className="text-md text-blue-600 cursor-pointer">Edit profile</button>
            </div>
            <div className="flex flex-col gap-2">
                <ProfileSection label='Full Name' value={profile?.full_name} />
                <ProfileSection label='Company Name' value={company?.name} />
                <ProfileSection label='Email' value={profile?.email} />
                <ProfileSection label='Role' value={profile?.role} />
                <ProfileSection label='Plan' value={company?.service_type} />
            </div>

        </div>
    )
}


function ProfileSection({ label, value }: { label: string, value: any }) {
    return (
        <div className="flex flex-col gap-1 shadow-md p-3 pb-2">
            <h1 className="text-md text-gray-700">{label}:</h1>
            <h1>{value}</h1>
        </div>
    )
}