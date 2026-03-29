'use client'

import { useEffect, useState } from "react"
import { HiSearch } from "react-icons/hi"
import { createClient } from "@/app/utils/supabase/client"
import OnlineUsers from "../components/OnlineUsers"
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
export default function AdminDash() {

    const supabase = createClient()
    const [viewMore, setViewMore] = useState(false)
    const [SelectedCompany, setSelectedCompany] = useState<any[]>([])

    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        suspendedUsers: 0,
        businesses: 0,
        simpleHr: 0,
        simpleinv: 0,
        both: 0,
        premium: 0
    })

    const [companies, setCompanies] = useState<any[]>([])

    useEffect(() => {
        fetchDashboard()
    }, [])

    async function fetchDashboard() {

        /* -------- USERS -------- */
        const { count: totalUsers } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })

        const { count: activeUsers } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .eq("status", "active")

        const { count: suspendedUsers } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .eq("status", "suspended")

        /* -------- BUSINESSES -------- */
        const { data: companiesData, count: businesses } = await supabase
            .from("companies")
            .select(`
                id,
    created_at,
    name,
    service_type,
    industry,
    profiles(email),
    status
                ` ,
                { count: "exact" })


        /* -------- EMPLOYEE COUNTS -------- */
        const { data: employeeData } = await supabase
            .from("profiles")
            .select("company_id")

        const employeeMap: Record<string, number> = {}

        employeeData?.forEach((p: any) => {
            if (!employeeMap[p.company_id]) {
                employeeMap[p.company_id] = 0
            }
            employeeMap[p.company_id]++
        })

        const companiesWithEmployees =
            companiesData?.map((c: any) => ({
                ...c,
                employee_count: employeeMap[c.id] || 0
            })) || []

        /* -------- PLAN COUNTS -------- */
        const simpleHr = companiesData?.filter(c => c.service_type === "hr").length || 0
        const simpleinv = companiesData?.filter(c => c.service_type === "inventory").length || 0
        const both = companiesData?.filter(c => c.service_type === "both").length || 0
        const premium = companiesData?.filter(c => c.service_type === "premium").length || 0

        setCompanies(companiesWithEmployees)

        setStats({
            totalUsers: totalUsers || 0,
            activeUsers: activeUsers || 0,
            suspendedUsers: suspendedUsers || 0,
            businesses: businesses || 0,
            simpleHr,
            simpleinv,
            both,
            premium
        })
    }
    console.log(SelectedCompany)

    const [actionLoading, setActionLoading] = useState<string | null>(null)

const updateCompanyStatus = async (companyId: string, status: string) => {
    setActionLoading(companyId + status)

    const { error } = await supabase
        .from('companies')
        .update({ status })
        .eq('id', companyId)

    if (error) {
        console.error(error)
        alert('Failed to update status')
        setActionLoading(null)
        return
    }

    // update UI instantly
    setCompanies(prev =>
        prev.map(c =>
            c.id === companyId ? { ...c, status } : c
        )
    )

    setActionLoading(null)
}

   function ActionMenu({ company }: { company: any }) {

    const [open, setOpen] = useState(false)

    // close on outside click
    useEffect(() => {
        const handleClick = () => setOpen(false)
        if (open) {
            window.addEventListener('click', handleClick)
        }
        return () => window.removeEventListener('click', handleClick)
    }, [open])

    const stopPropagation = (e: any) => e.stopPropagation()

    const fetchMoreAboutCompany = async (companyId: any) => {

        const { data, error } = await supabase
            .from('companies')
            .select(`
                id,
                created_at,
                name,
                service_type,
                industry,
                location,
                profiles(email, full_name, phone, status, acquisition),
                status
            `)
            .eq('id', companyId)

        if (error) {
            console.error(error)
            return
        }

        setSelectedCompany(data ?? [])
        setViewMore(true)
    }

    return (
        <div className="relative" onClick={stopPropagation}>

            {/* BUTTON */}
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    setOpen(!open)
                }}
                className="px-2 py-1 text-gray-600 hover:text-gray-900"
            >
                ⋮
            </button>

            {/* MENU */}
            {open && (
                <div className="absolute right-0 z-20 w-44 rounded-lg border bg-white shadow-lg">

                    <ul className="py-2 text-sm">

                        <li
                            onClick={() => fetchMoreAboutCompany(company.id)}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                            View
                        </li>

                        {company.status === 'suspended' ? (
                            <li
                                onClick={() => {
                                    if (confirm('Reactivate this company?')) {
                                        updateCompanyStatus(company.id, 'active')
                                    }
                                }}
                                className="px-3 py-2 hover:bg-green-100 text-green-700 cursor-pointer"
                            >
                                Reactivate
                            </li>
                        ) : (
                            <li
                                onClick={() => {
                                    if (confirm('Suspend this company?')) {
                                        updateCompanyStatus(company.id, 'suspended')
                                    }
                                }}
                                className="px-3 py-2 hover:bg-red-100 text-red-600 cursor-pointer"
                            >
                                Suspend
                            </li>
                        )}

                        <li className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                            Edit (coming soon)
                        </li>

                        <li className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                            Reset Password (coming soon)
                        </li>

                    </ul>

                </div>
            )}
        </div>
    )
}

    return (
        <>
            {
                viewMore ? (
                    <div className="w-full min-h-screen p-3 md:p-6 rounded-lg border-2 border-green-200 bg-white">

                        {SelectedCompany.length > 0 && (
                            <>
                                {/* HEADER */}
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800">
                                            {SelectedCompany[0].name}
                                        </h2>
                                        <p className="text-gray-500 text-sm">
                                            Joined {new Date(SelectedCompany[0].created_at).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => setViewMore(false)}
                                        className="px-4 py-2 rounded-lg border bg-gray-100 hover:bg-gray-200 text-sm"
                                    >
                                        Back
                                    </button>
                                </div>

                                {/* COMPANY INFO */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    {/* BUSINESS INFO */}
                                    <div className="rounded-xl border p-5 shadow-sm space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                                            Business Information
                                        </h3>

                                        <InfoRow label="Business Name" value={SelectedCompany[0].name} />
                                        <InfoRow label="Industry" value={SelectedCompany[0].industry} />
                                        <InfoRow label="Service Type" value={SelectedCompany[0].service_type} />
                                        <InfoRow label="Location" value={SelectedCompany[0].location} />
                                        <InfoRow label="Employees" value={SelectedCompany[0].profiles?.length || 0} />

                                        <InfoRow
                                            label="Status"
                                            value={
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize
                                             ${SelectedCompany[0].status === "suspended"
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-green-100 text-green-700"}`}>
                                                    {SelectedCompany[0].status}
                                                </span>
                                            }
                                        />
                                    </div>

                                    {/* OWNER INFO */}
                                    <div className="rounded-xl border p-5 shadow-sm space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                                            Owner Information
                                        </h3>

                                        <InfoRow label="Email" value={SelectedCompany[0].profiles?.[0]?.email} />
                                        <InfoRow label="Full Name" value={SelectedCompany[0].profiles?.[0]?.full_name} />
                                        <InfoRow label="Phone" value={SelectedCompany[0].profiles?.[0]?.phone} />
                                        <InfoRow label="Account Status" value={SelectedCompany[0].profiles?.[0]?.status} />
                                        <InfoRow label="Where did they hear about us " value={SelectedCompany[0].profiles?.[0]?.acquisition} />
                                    </div>

                                </div>


                            </>
                        )}

                    </div>
                ) : (

                    <div className=" w-full minh-screen p-2 md:p-6 rounded-lg border-2 border-green-200">
                        <div className=" flex text-center max-sm:justify-center my-3">
                            <button className="btn-primary rounded-lg py-3 px-6 text-white">Export Data (CSV)</button>
                        </div>

                        {/* -------- SUMMARY CARDS -------- */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                            <SummaryCard label="Total Businesses" value={stats.businesses.toString()} />

                            <SummaryCard label="Total Users" value={stats.totalUsers.toString()} />
                            <SummaryCard label="Active Users" value={stats.activeUsers.toString()} />
                            <SummaryCard label="Suspended Users" value={stats.suspendedUsers.toString()} />
                            <SummaryCard label="Inventory – Simple Start" value={stats.simpleinv.toString()} />
                            <SummaryCard label="Simple Start – HR Users" value={stats.simpleHr.toString()} />
                            <SummaryCard label="Business Plus Users" value={stats.both.toString()} />
                            <SummaryCard label="Premium Users" value={stats.premium.toString()} />

                        </div>
                        <div className="p-6">
                            <OnlineUsers />
                        </div>


                    </div>
                )
            }

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
        <div className="flex flex-col items-center justify-center rounded-xl bg-white p-4 shadow-sm">
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