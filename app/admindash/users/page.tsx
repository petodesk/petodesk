'use client'

import { useEffect, useState } from "react"
import { HiSearch } from "react-icons/hi"
import { createClient } from "@/app/utils/supabase/client"
import { FaEllipsisV } from "react-icons/fa"
import { formatDate } from "@/app/utils/dateFormatter"

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
        activeUsers: 0

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


        setCompanies(companiesWithEmployees)

        setStats({
            totalUsers: totalUsers || 0,
            activeUsers: activeUsers || 0,

        })
    }
    console.log(SelectedCompany)

    /* ---------------- ACTION MENU ---------------- */
    function ActionMenu({ company }: { company: any }) {
        const [open, setOpen] = useState(false)

        const fetchMoreAboutCompany = async (companyId: any) => {

            const { data: company, error } = await supabase.from('companies').select(`
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
            setSelectedCompany(company ?? [])
            if (error) {
                console.error(error)
                return
            }
            setViewMore(true)

        }

        const updateCompanyStatus = async (companyId: string, status: string) => {
            const { error } = await supabase
                .from("companies")
                .update({ status })
                .eq("id", companyId)

            if (error) {
                console.error(error)
                return
            }

            // refresh UI
            fetchDashboard()
            setOpen(false)
        }

        const deleteCompany = async (companyId: string) => {
    const { error } = await supabase
        .from("companies")
        .update({ status: "deleted" })
        .eq("id", companyId)

    if (error) {
        console.error(error)
        return
    }

    fetchDashboard()
    setOpen(false)
}

const deleteCompany1 = async (companyId: string) => {
    await supabase.from("profiles").delete().eq("company_id", companyId)
    await supabase.from("companies").delete().eq("id", companyId)

    fetchDashboard()
}

        return (
            <div className="relative">
                <button
                    onClick={() => setOpen(!open)}
                    className="px-2 py-1 text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                    <p className="p-4 text-gray-400">
                        <FaEllipsisV />
                    </p>
                </button>
                {
                    open && (
                        <div className="absolute right-0 z-20 w-40 rounded-lg border bg-white shadow-lg">
                            <ul className="py-3 flex flex-col gap-2">
                                <li className='text-md p-1 text-gray-800 cursor-pointer hover:bg-gray-200'
                                    onClick={() => fetchMoreAboutCompany(company.id)}
                                >View</li>

            
                                <li
                                    onClick={() => updateCompanyStatus(company.id, "active")}
                                    className="text-md p-1 hover:bg-gray-200 cursor-pointer"
                                >
                                    Reactivate
                                </li>

                                <li
                                    onClick={() => updateCompanyStatus(company.id, "suspended")}
                                    className="text-md p-1 hover:bg-gray-200 cursor-pointer"
                                >
                                    Suspend
                                </li>
            
                                <li className='text-md p-1 text-gray-800 cursor-pointer hover:bg-gray-200'>Reset Password</li>
                                <li className='text-md p-1 text-gray-800 cursor-pointer hover:bg-gray-200'>Delete</li>

                            </ul>
                        </div>
                    )
                }

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
                                            Joined {formatDate(SelectedCompany[0].created_at)}
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

                                    <InfoRow label="Business" value={ex.name} />
                                    <InfoRow label="Email" value={ex.profiles[0]?.email} />
                                    <InfoRow label="No.of Employee" value={ex.employee_count} />
                                    <InfoRow label="Plan" value={ex.service_type} />
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
                                        <th className="px-4 py-3 text-left font-medium">Date Joined</th>
                                        <th className="px-4 py-3 text-left font-medium">Business/ User</th>
                                        {/* <th className="px-4 py-3 text-left font-medium">Email</th> */}
                                        <th className="px-4 py-3 text-left font-medium">No.of <br /> employee</th>
                                        <th className="px-4 py-3 text-left font-medium">Plan</th>
                                        <th className="px-4 py-3 text-left font-medium">payment</th>
                                        <th className="px-4 py-3 text-left font-medium">Status</th>
                                        <th className="px-4 py-3 text-left font-medium">Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {companies.map((company) => (
                                        <tr key={company.id} className="border-t hover:bg-gray-50">

                                            <td className="px-4 py-1">
                                                {formatDate(company.created_at)}
                                            </td>

                                            <td className="px-4 py-1">
                                                {company.name}
                                            </td>
                                            {/* <td className="px-4 py-1">
                                                {company.profiles[0]?.email}
                                            </td> */}
                                            <td className="px-4 py-1">
                                                {company.employee_count}
                                            </td>


                                            <td className="px-4 py-1">
                                                {company.service_type}
                                            </td>
                                            <td className="px-4 py-1">
                                                {company.service_type}
                                            </td>
                                            <td className="px-4 py-1">
                                                {company.status || "active"}
                                            </td>

                                            <td className="px-4 py-1">
                                                <ActionMenu company={company} />
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>

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