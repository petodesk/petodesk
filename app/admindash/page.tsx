'use client'

import { useEffect, useState } from "react"
import { createClient } from "@/app/utils/supabase/client"

export default function AdminDash() {

    const supabase = createClient()
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
        const { data: companiesData, count: businesses, error } = await supabase
            .from("companies")
            .select(`
                id,
    created_at,
    name,
    service_type,
    industry,
    profiles!profiles_company_id_fkey (
      email,
      full_name,
      phone,
      status,
      acquisition
    ),
    status
    
                ` ,
                { count: "exact" })

        if (error) {
            console.error("Error fetching companies:", error)
            return
        }


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
        console.log(companies)

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




    return (
        <>
            
              

                    <div className=" w-full min-h-screen p-2 md:p-6 rounded-lg border-2 border-green-200">
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