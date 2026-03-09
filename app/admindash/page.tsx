'use client'

import { useEffect, useState } from "react"
import { HiSearch } from "react-icons/hi"
import { createClient } from "@/app/utils/supabase/client"

export default function AdminDash() {

    const supabase = createClient()

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
            .select("*", { count: "exact" })

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

    /* ---------------- ACTION MENU ---------------- */
    function ActionMenu({ company }: { company: any }) {
        return (
            <div className="relative">
                <button
                    className="px-2 py-1 text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                    ⋮
                </button>
            </div>
        )
    }

    return (
        <div className="p-6 rounded-lg border-2 border-green-200">

            {/* -------- SUMMARY CARDS -------- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">

                <SummaryCard label="Total Users" value={stats.totalUsers.toString()} />
                <SummaryCard label="Active Users" value={stats.activeUsers.toString()} />
                <SummaryCard label="Total Businesses" value={stats.businesses.toString()} />
                <SummaryCard label="Suspended Users" value={stats.suspendedUsers.toString()} />
                <SummaryCard label="Inventory – Simple Start" value={stats.simpleinv.toString()} />
                <SummaryCard label="Simple Start – HR Users" value={stats.simpleHr.toString()} />
                <SummaryCard label="Business Plus Users" value={stats.both.toString()} />
                <SummaryCard label="Premium Users" value={stats.premium.toString()} />

            </div>

            {/* -------- SEARCH -------- */}
            <div className="flex items-center gap-2 rounded-lg bg-gray-300 w-full p-2 my-4">
                <HiSearch size={25} />
                <input type="text" placeholder="Search" className="w-full outline-none" />
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
                                {new Date(ex.created_at).toLocaleDateString()}
                            </p>
                            {ex.status !== "Cancelled" && (
                                <ActionMenu company={ex} />
                            )}
                        </div>

                        <hr />

                        <div className="flex items-center justify-between">
                            <p className="text-md font-semibold text-gray-700 mb-1">Business/User</p>
                            <p className="text-base font-semibold text-gray-900">
                                {ex.name}
                            </p>
                        </div>

                        <div className="flex items-center justify-between">
                            <p className="text-md font-semibold text-gray-700 mb-1">No. of Employee</p>
                            <p className="font-medium text-gray-800">
                                {ex.employee_count}
                            </p>
                        </div>

                        <div className="flex items-center justify-between">
                            <p className="text-md font-semibold text-gray-700 mb-1">Plan</p>
                            <p className="font-medium text-gray-800">
                                {ex.service_type}
                            </p>
                        </div>

                        <div className="flex items-center justify-between">
                            <p className="text-md font-semibold text-gray-700 mb-1">Status</p>
                            <span
                                className={`inline-block rounded-full px-3 py-1 text-xs font-semibold
                                ${ex.status === 'Cancelled'
                                        ? 'bg-red-100 text-red-700'
                                        : ex.status === 'paid'
                                            ? 'bg-green-100 text-green-700'
                                            : ex.status === 'pending'
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : ''}`}
                            >
                                {ex.status}
                            </span>
                        </div>

                    </div>
                ))}

                {companies.length === 0 && (
                    <p className="px-4 py-10 text-center text-gray-400">
                        No user/company info.
                    </p>
                )}
            </div>

            {/* -------- TABLE -------- */}
            <table className="hidden md:table w-full text-sm">
                <thead className="bg-gray-50 text-gray-700">
                    <tr>
                        <th className="px-4 py-3 text-left font-medium">Date Joined</th>
                        <th className="px-4 py-3 text-left font-medium">Business</th>
                        <th className="px-4 py-3 text-left font-medium">No.of employee</th>
                        <th className="px-4 py-3 text-left font-medium">Plan</th>
                        <th className="px-4 py-3 text-left font-medium">Status</th>
                        <th className="px-4 py-3 text-left font-medium">Action</th>
                    </tr>
                </thead>

                <tbody>
                    {companies.map((company) => (
                        <tr key={company.id} className="border-t hover:bg-gray-50">

                            <td className="px-4 py-3">
                                {new Date(company.created_at).toLocaleDateString()}
                            </td>

                            <td className="px-4 py-3">
                                {company.name}
                            </td>

                            <td className="px-4 py-3">
                                {company.employee_count}
                            </td>

                            <td className="px-4 py-3">
                                {company.service_type}
                            </td>

                            <td className="px-4 py-3">
                                {company.status || "active"}
                            </td>

                            <td className="px-4 py-3">
                                <ActionMenu company={company} />
                            </td>

                        </tr>
                    ))}
                </tbody>
            </table>

        </div>
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