'use client'

import { useEffect, useState } from "react"
import { HiSearch } from "react-icons/hi"
import { createClient } from "@/app/utils/supabase/client"
import { FaEllipsisV } from "react-icons/fa"
import { formatDate } from "@/app/utils/dateFormatter"
import { toast } from "react-toastify"
import { useCompany } from "@/app/context/CompanyContext"
import { logActivity } from "@/app/utils/activitylog"

interface CompanyData {
    id: string,
    created_at: string,
    name: string,
    location: string,
    service_type: string,
    industry: string,
    profiles: {
        email: string,
        full_name?: string,
        phone?: string,
        status?: string,
        acquisition?: string
    }[],
    status: string,
    employee_count: number
}

export default function AdminDash() {

    const supabase = createClient()

    const [viewMore, setViewMore] = useState(false)
    const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(null)
    const [newPlan, setNwPlan] = useState(selectedCompany?.service_type)
    const [loading, setLoading] = useState(false)
    const { profile } = useCompany()
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0
    })

    const [companyMetrics, setCompanyMetrics] = useState({
        sales: 0,
        invoices: 0,
        inventory: 0
    })
    console.log('profile in users page', profile)

    const [companies, setCompanies] = useState<CompanyData[]>([])

    useEffect(() => {
        fetchDashboard()
    }, [])

    async function fetchDashboard() {
        try {
            const { count: totalUsers } = await supabase
                .from("profiles")
                .select("*", { count: "exact", head: true })

            const { count: activeUsers } = await supabase
                .from("profiles")
                .select("*", { count: "exact", head: true })
                .eq("status", "active")

            const { data: companiesData } = await supabase
                .from("companies")
                .select(`
    id,
    created_at,
    name,
    service_type,
    industry,
    status,
    profiles!inner (
      email,
      full_name,
      role
    )
  `)
    .eq("profiles.role", "owner")

            const { data: employeeData } = await supabase
                .from("profiles")
                .select("company_id")

            const employeeMap: Record<string, number> = {}

            employeeData?.forEach((p: any) => {
                employeeMap[p.company_id] = (employeeMap[p.company_id] || 0) + 1
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

        } catch (error) {
            toast.error("Failed to load dashboard")
            console.error(error)
        }
    }

    const fetchCompanyMetrics = async (companyId: string) => {
        const supabase = createClient()

        const [
            salesRes,
            invoiceRes,
            inventoryRes
        ] = await Promise.all([
            supabase
                .from("sales")
                .select("id", { count: "exact", head: true })
                .eq("company_id", companyId),

            supabase
                .from("invoices")
                .select("id", { count: "exact", head: true })
                .eq("company_id", companyId),

            supabase
                .from("products")
                .select("id", { count: "exact", head: true })
                .eq("company_id", companyId)
        ])

        setCompanyMetrics({
            sales: salesRes.count || 0,
            invoices: invoiceRes.count || 0,
            inventory: inventoryRes.count || 0
        })
    }







    const updatePlan = async ({
        companyId,
        newPlan
    }: {
        companyId: string
        newPlan: string
    }) => {
        if (!companyId || !newPlan) return

        try {
            setLoading(true)

            const { error } = await supabase.rpc("switch_company_plan", {
                p_company_id: companyId,
                p_plan_name: newPlan
            })
            await logActivity({
                supabase,
                company_id: companyId,
                user_id: profile?.id || "",
                action_type: "plan_change",
                module: "company",
                description: `Plan changed to ${newPlan} for  : ${selectedCompany?.name || companyId} company by :- ${profile?.full_name || "Unknown User"}`,
            })

            if (error) {
                toast.error(error.message || "Failed to update plan")
                return
            }

            toast.success("Plan updated successfully ✅")
            fetchDashboard()
        } catch (err) {
            toast.error("Something went wrong")
        } finally {
            setLoading(false)
        }
    }
    const isAdminOrOwner =
        profile?.role === "peto_owner" || profile?.role === "peto_admin"
    const isOwner = profile?.role === "peto_owner"



    function ActionMenu({ company }: { company: CompanyData }) {
        const [open, setOpen] = useState(false)
        const [isDeleting, setIsDeleting] = useState(false)

        const isActive = company.status === "active"

        // ✅ Role helpers (FIXED)
        const isAdminOrOwner =
            profile?.role === "peto_owner" || profile?.role === "peto_admin"

        const isOwner = profile?.role === "peto_owner"

        // ✅ Close on outside click
        useEffect(() => {
            const handleClickOutside = () => setOpen(false)

            if (open) {
                document.addEventListener("click", handleClickOutside)
            }

            return () => {
                document.removeEventListener("click", handleClickOutside)
            }
        }, [open])

        const fetchMoreAboutCompany = async (companyId: string) => {
            const { data, error } = await supabase
                .from("companies")
                .select(`
                id,
                created_at,
                name,
                service_type,
                industry,
                location,
                profiles!inner(email, full_name, phone, status, acquisition),
                status
            `)
                .eq("profiles.role", "owner")
                .eq("id", companyId)

            if (error) {
                console.error(error)
                toast.error("Failed to fetch company")
                return
            }

            const company = data?.[0]

            if (company) {
                setSelectedCompany({
                    ...company,
                    employee_count: Array.isArray(company.profiles)
                        ? company.profiles.length
                        : 0,
                })
                fetchCompanyMetrics(company.id)
            } else {
                setSelectedCompany(null)
            }

            setViewMore(true)
        }

        const handleResetPassword = async (email: string | undefined) => {
            if (!email) {
                toast.error("No email found")
                return
            }

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            })

            if (error) {
                toast.error(error.message)
            } else {
                toast.success("Password reset link sent!")
            }
        }

        const updateCompanyStatus = async (status: string) => {
            const { error } = await supabase
                .from("companies")
                .update({ status })
                .eq("id", company.id)

            if (error) {
                toast.error("Failed to update status")
                return
            }

            // ✅ SEND EMAIL ONLY IF SUSPENDED
            if (status === "suspended") {
                try {
                    await fetch("/api/send-suspension-email", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            email: company.profiles?.[0]?.email,
                            companyName: company.name
                        })
                    })
                    await logActivity({
                        supabase,
                        company_id: company.id,
                        user_id: profile?.id || "",
                        action_type: "suspend",
                        module: "company",
                        description: ` ${company.name} company suspended by :- ${profile?.full_name || "Unknown User"}`,
                    })
                } catch (err) {
                    console.error("Email failed")
                }
            }

            toast.success(
                status === "suspended"
                    ? "Company suspended & notified 📩"
                    : "Company reactivated"
            )

            fetchDashboard()
            setOpen(false)
        }

        const deleteCompany = async (companyId: string) => {
            try {
                // better order (avoid FK issues)
                await supabase.from("profiles").delete().eq("company_id", companyId)

                const { error } = await supabase
                    .from("companies")
                    .delete()
                    .eq("id", companyId)

                if (error) {
                    toast.error("Failed to delete company")
                    return
                }

                toast.success("Company deleted")
                fetchDashboard()
            } catch (err) {
                toast.error("Something went wrong")
            } finally {
                setIsDeleting(false)
            }
        }

        return (
            <div className="relative">
                {/* BUTTON */}
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        setOpen(!open)
                    }}
                    className="px-2 py-1 text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                    <FaEllipsisV className="text-gray-400" />
                </button>

                {/* DROPDOWN */}
                {open && (
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 z-20 w-40 rounded-lg border bg-white shadow-lg"
                    >
                        <ul className="p-3 flex flex-col gap-2">

                            {/* VIEW */}
                            <li
                                className="text-md p-1 cursor-pointer hover:bg-gray-200"
                                onClick={() => {
                                    fetchMoreAboutCompany(company.id)
                                    setOpen(false)
                                }}
                            >
                                View
                            </li>

                            {/* ADMIN / OWNER */}
                            {isAdminOrOwner && (
                                <>
                                    <li
                                        onClick={() => {
                                            updateCompanyStatus(
                                                isActive ? "suspended" : "active"
                                            )
                                            setOpen(false)
                                        }}
                                        className="text-md p-1 hover:bg-gray-200 cursor-pointer"
                                    >
                                        {isActive ? "Suspend" : "Reactivate"}
                                    </li>

                                    <li
                                        onClick={() => {
                                            handleResetPassword(
                                                company.profiles?.[0]?.email
                                            )
                                            setOpen(false)
                                        }}
                                        className="text-md p-1 cursor-pointer hover:bg-gray-200"
                                    >
                                        Reset Password
                                    </li>
                                </>
                            )}

                            {/* OWNER ONLY  */}
                            {isOwner && (
                                <li
                                    onClick={() => {
                                        setIsDeleting(true)
                                        setOpen(false)
                                    }}
                                    className="text-md p-1 cursor-pointer hover:bg-gray-200 text-red-600"
                                >
                                    Delete Company
                                </li>
                            )}
                        </ul>
                    </div>
                )}

                {/* DELETE MODAL */}
                {isDeleting && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">

                        <div
                            onClick={() => setIsDeleting(false)}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        />

                        <div className="relative bg-white w-full max-w-md mx-4 rounded-2xl shadow-xl p-6">

                            <h2 className="text-lg font-semibold text-gray-900">
                                Delete Company
                            </h2>

                            <p className="mt-2 text-sm text-gray-600">
                                Are you sure you want to delete{" "}
                                <span className="font-semibold">
                                    {company.name}
                                </span>{" "}
                                company?
                                <span className="block mt-1 text-red-500 font-medium">
                                    This action cannot be undone.
                                </span>
                            </p>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => setIsDeleting(false)}
                                    className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100 transition"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={() => deleteCompany(company.id)}
                                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }


    return (
        <>
            {
                viewMore ? (
                    <div className="w-full min-h-screen p-3 md:p-6 rounded-lg border-2 border-green-200 bg-white font-poppins">

                        {selectedCompany && (
                            <>
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800">
                                            {selectedCompany.name}
                                        </h2>
                                        <p className="text-gray-500 text-sm">
                                            Joined {formatDate(selectedCompany.created_at)}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => setViewMore(false)}
                                        className="px-4 py-2 rounded-lg border bg-gray-100 hover:bg-gray-200 text-sm"
                                    >
                                        Back
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    <div className="rounded-xl border p-5 shadow-sm space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                                            Business Information
                                        </h3>

                                        <InfoRow label="Business Name" value={selectedCompany.name} />
                                        <InfoRow label="Industry" value={selectedCompany.industry} />
                                        <InfoRow label="Service Type" value={selectedCompany.service_type} />
                                        <InfoRow label="Location" value={selectedCompany.location || 0} />
                                        <InfoRow label="Employees" value={selectedCompany.profiles?.length || 0} />

                                        <InfoRow
                                            label="Status"
                                            value={
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize
                                                ${selectedCompany.status === "suspended"
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-green-100 text-green-700"}`}>
                                                    {selectedCompany.status}
                                                </span>
                                            }
                                        />
                                    </div>

                                    <div className="rounded-xl border p-5 shadow-sm space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                                            Owner Information
                                        </h3>

                                        <InfoRow label="Email" value={selectedCompany.profiles?.[0]?.email} />
                                        <InfoRow label="Full Name" value={selectedCompany.profiles?.[0]?.full_name} />
                                        <InfoRow label="Phone" value={selectedCompany.profiles?.[0]?.phone} />
                                        <InfoRow label="Account Status" value={selectedCompany.profiles?.[0]?.status} />
                                        <InfoRow label="Where did they hear about us" value={selectedCompany.profiles?.[0]?.acquisition} />
                                    </div>

                                    {
                                        isAdminOrOwner && (
                                            <div className="rounded-xl border p-5 shadow-sm space-y-4">
                                                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 flex justify-between">
                                                    <span>Switch Plan</span>
                                                    <span className="text-sm text-gray-500">
                                                        Current: {selectedCompany.service_type}
                                                    </span>
                                                </h3>

                                                <select
                                                    value={selectedCompany.service_type}
                                                    onChange={(e) => {
                                                        updatePlan({
                                                            companyId: selectedCompany.id,
                                                            newPlan: e.target.value
                                                        })
                                                    }}
                                                    className="w-full border rounded-lg p-2"
                                                >
                                                    <option value="hr">HR Only</option>
                                                    <option value="inventory">Inventory Only</option>
                                                    <option value="business_plus">Business Plus</option>
                                                    <option value="premium">Premium</option>
                                                </select>
                                            </div>)
                                    }

                                    <div className="rounded-xl border p-5 shadow-sm space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                                            Business Activity
                                        </h3>


                                        <InfoRow label="Sales Recorded" value={companyMetrics.sales} />
                                        <InfoRow label="Invoice Generated" value={companyMetrics.invoices} />
                                        <InfoRow label="Inventory Added" value={companyMetrics.inventory} />


                                    </div>


                                </div>
                            </>
                        )}


                    </div>
                ) : (

                    <div className="w-full max-h-[90vh] overflow-y-auto p-2 md:p-6 rounded-lg border-2 border-green-200">

                        <div className="flex items-center gap-2 rounded-lg bg-gray-300 w-full p-4 my-8">
                            <HiSearch size={25} />
                            <input type="text" placeholder="Search" className="w-full outline-none bg-transparent" />
                        </div>

                        <div>
                            <h1>Users</h1>
                        </div>

                        {/* MOBILE CARD */}
                        <div className="space-y-4 md:hidden">
                            {companies.slice(0, 4).map((ex) => (
                                <div key={ex.id} className="rounded-xl bg-white p-4 shadow-sm border space-y-3">

                                    <div className="flex items-center justify-between">
                                        <p className="text-md font-semibold text-gray-700 mb-1">
                                            {formatDate(ex.created_at)}
                                        </p>
                                        {ex.status !== "deleted" && (
                                            <ActionMenu company={ex} />
                                        )}
                                    </div>

                                    <hr />

                                    <InfoRow label="Business" value={ex.name} />
                                    <InfoRow label="No.of Employee" value={ex.employee_count} />
                                    <InfoRow label="Plan" value={ex.service_type} />
                                    <InfoRow label="payment" value={'Later'} />

                                    <InfoRow label="Status" value={
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize
                                        ${ex.status === "suspended"
                                                ? "bg-red-100 text-red-700"
                                                : "bg-green-100 text-green-700"}`}>
                                            {ex.status}
                                        </span>
                                    } />
                                </div>
                            ))}
                        </div>

                        {/* TABLE */}
                        <div className="hidden md:block overflow-x-auto">

                            <table className="hidden md:table w-full text-sm">
                                <thead className="bg-gray-50 text-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Date Joined</th>
                                        <th className="px-4 py-3 text-left font-medium">Business/ User</th>
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

                                            <td className="px-4 py-1">
                                                {company.employee_count}
                                            </td>

                                            <td className="px-4 py-1">
                                                {company.service_type}
                                            </td>

                                            <td className="px-4 py-1">
                                                {'Later'}
                                            </td>

                                            <td className="px-4 py-1">
                                                <span className={`px-2 py-1 rounded-full text-xs ${company.status === "suspended"
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-green-100 text-green-700"
                                                    }`}>
                                                    {company.status}
                                                </span>
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

/* INFO ROW */
function InfoRow({ label, value }: { label: string, value: any }) {
    return (
        <div className="flex justify-between items-center border-b pb-2">
            <span className="text-gray-600 text-sm">{label}</span>
            <span className="text-gray-900 text-sm font-medium">
                {value || "-"}
            </span>
        </div>
    )
}