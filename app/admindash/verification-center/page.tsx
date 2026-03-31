'use client'

import { useEffect, useState } from "react"
import { HiSearch } from "react-icons/hi"
import { createClient } from "@/app/utils/supabase/client"
import { formatDate, formatDateForAnnouncements } from "@/app/utils/dateFormatter"
import { FaEllipsisV } from "react-icons/fa"
interface CompanyData {
    id: string,
    created_at: string,
    name: string,
    service_type: string,
    industry: string,
    profiles: {
        email: string,

    },
    status: string,
    employee_count: number



}
export default function VerificationCenter() {

    const supabase = createClient()
    const [SelectedCompany, setSelectedCompany] = useState<any[]>([])
    const [companies, setCompanies] = useState<any[]>([])


    const [stats, setStats] = useState({
        PaidUsers: 0,
        ExpiredUsers: 0,

    })


    useEffect(() => {
        fetchDashboard()
    }, [])



    async function fetchDashboard() {

        // 🔹 get payments with company
        const { data, error } = await supabase
            .from('payments')
            .select(`
            *,
            companies (
                id,
                name,
                service_type,
                status,
                profiles(email)
            )
        `)
            .order('created_at', { ascending: false })

        if (error) {
            console.error(error)
            return
        }

        setCompanies(data || [])

        // 🔹 stats
        const paid = data?.filter(p => p.status === 'paid').length || 0
        const expired = data?.filter(p => p.status === 'expired').length || 0

        setStats({
            PaidUsers: paid,
            ExpiredUsers: expired
        })
    }

    /* ---------------- ACTION MENU ---------------- */
    function ActionMenu({ company }: { company: any }) {

        const [open, setOpen] = useState(false)

        const updatePayment = async (status: string, verified?: boolean) => {

            const { error } = await supabase
                .from('payments')
                .update({
                    status,
                    verified: verified ?? false,
                    payment_date: status === 'paid' ? new Date() : null
                })
                .eq('id', company.id)

            if (error) {
                console.error(error)
                alert('Failed')
                return
            }

            fetchDashboard()
        }

        return (
            <div className="relative">
                <button onClick={() => setOpen(!open)}>
                    <FaEllipsisV />
                </button>

                {open && (
                    <div className="absolute right-0 w-44 bg-white shadow rounded-lg">

                        <ul className="py-2 text-sm">

                            <li
                                onClick={() => updatePayment('paid', true)}
                                className="px-3 py-2 hover:bg-green-100 text-green-700 cursor-pointer"
                            >
                                Mark as Paid
                            </li>

                            <li
                                onClick={() => updatePayment('expired')}
                                className="px-3 py-2 hover:bg-yellow-100 text-yellow-700 cursor-pointer"
                            >
                                Mark as Expired
                            </li>

                            <li
                                onClick={() => updatePayment('failed')}
                                className="px-3 py-2 hover:bg-red-100 text-red-600 cursor-pointer"
                            >
                                Failed
                            </li>

                            <li
                                onClick={() => updatePayment('paid', false)}
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            >
                                Unverify
                            </li>

                        </ul>

                    </div>
                )}
            </div>
        )
    }

    return (
        <>


            <div className=" w-full minh-screen p-2 md:p-6 rounded-lg border-2 border-green-200">
                <div className="flex gap-30 mb-6 w-full">
                    <SummaryCard label="Paid Users" value={stats.PaidUsers.toString()} />
                    <SummaryCard label="Expired Users" value={stats.ExpiredUsers.toString()} />

                </div>


                {/* -------- SEARCH -------- */}
                <div className="flex items-center gap-2 rounded-lg bg-gray-300 w-full p-4 my-8">
                    <HiSearch size={25} />
                    <input type="text" placeholder="Search" className="w-full outline-none" />
                </div>
                <div>
                    <h1>Users</h1>
                </div>
                {/* -------- MOBILE CARD -------- */}
                <div className="space-y-4 md:hidden">
                    {companies.slice(0, 4).map((ex) => (
                        <div
                            key={ex.id}
                            className="rounded-xl bg-white p-4 shadow-sm border space-y-3"
                        >

                            <div className="flex items-center justify-between">
                                <p className="text-md font-semibold text-gray-700 mb-1">
                                    {formatDate(ex.created_at)}
                                </p>
                                {ex.status !== "Cancelled" && (
                                    <ActionMenu company={ex} />
                                )}
                            </div>

                            <hr />

                            <InfoRow label="Business Name" value={ex.name} />
                            <InfoRow label="Plan" value={ex.service_type} />

                            <InfoRow label="Document Status" value={ex.profiles[0]?.email} />
                            <InfoRow label="Status" value={

                                <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize
                                             ${ex.status === "suspended"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-green-100 text-green-700"}`}>
                                    {ex.status}
                                </span>} />



                        </div>
                    ))}

                    {companies.length === 0 && (
                        <p className="px-4 py-10 text-center text-gray-400">
                            No user/company info.
                        </p>
                    )}
                </div>

                {/* -------- TABLE -------- */}
                <div className="hidden md:block overflow-x-auto">

                    <table className="hidden md:table w-full text-sm">
                        <thead className="bg-gray-50 text-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Payment Date</th>
                                <th className="px-4 py-3 text-left font-medium">Business Name</th>
                                <th className="px-4 py-3 text-left font-medium">Document Status</th>
                                <th className="px-4 py-3 text-left font-medium">Plan</th>
                                <th className="px-4 py-3 text-left font-medium">Status</th>
                                <th className="px-4 py-3 text-left font-medium">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {companies.map((company) => (
                                <tr key={company.id} className="border-t hover:bg-gray-50">

                                    <td className="px-4 py-1">
                                        {new Date(company.created_at).toLocaleDateString()}
                                    </td>

                                    <td className="px-4 py-1">
                                        {company.name}
                                    </td>
                                    <td className="px-4 py-1">
                                        {company.profiles[0]?.email}
                                    </td>



                                    <td className="px-4 py-1">
                                        {company.service_type}
                                    </td>

                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
    ${company.status === 'paid' && 'bg-green-100 text-green-700'}
    ${company.status === 'pending' && 'bg-yellow-100 text-yellow-700'}
    ${company.status === 'expired' && 'bg-gray-200 text-gray-600'}
    ${company.status === 'failed' && 'bg-red-100 text-red-700'}
`}>
                                        {company.status}
                                    </span>

                                    <td className="px-4 py-1">
                                        <ActionMenu company={company} />
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>

                </div>
            </div>


        </>
    )
}


/* ---------------- SUMMARY CARD ---------------- */

function SummaryCard({
    label,
    value,
}: {
    label: string
    value: string
}) {
    return (
        <div className="flex w-60 flex-col items-center justify-center rounded-xl bg-white p-4 shadow-sm">
            <p className="text-md text-gray-900">{label}</p>
            <p className="mt-2 text-2xl font-bold text-gray-800">{value}</p>
        </div>
    )
}

function InfoRow({
    label,
    value
}: {
    label: string
    value: any
}) {
    return (
        <div className="flex justify-between items-center border-b pb-2">
            <span className="text-gray-600 text-sm">{label}</span>
            <span className="text-gray-900 text-sm font-medium">
                {value || "-"}
            </span>
        </div>
    )
}