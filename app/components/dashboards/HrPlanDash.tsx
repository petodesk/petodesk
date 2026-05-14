'use client'

import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/app/utils/supabase/client"
import { useCompany } from "@/app/context/CompanyContext"
import { Loading } from "../Loading"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import OfficeLocationPage from "../LocationButton"

type Range =
    | 'today'
    | 'yesterday'
    | 'this_week'
    | 'last_week'
    | 'this_month'
    | 'last_month'
    | 'this_year'
    | 'last_year'

export default function HrDashboard() {
    const supabase = createClient()
    const { company, currency } = useCompany()
    const [salesTotal, setSalesTotal] = useState(0)
    const [expenseTotal, setExpenseTotal] = useState(0)
  
    const [range, setRange] = useState<Range>('this_month')
    const [stats, setStats] = useState({
        profit: 0,
        salesTotal: 0,
        expenseTotal: 0,
        employees: { active: 0, inactive: 0, admin: 0, users: 0 },
        tasks: { completed: 0, pending: 0 },
        hr: { attendance: 0, birthdays: 0, hires: 0, leave: 0, reviews: 0, absent: 0 }
    })

    const [loading, setLoading] = useState(true)



    const getRangeDates = (range: Range) => {

        const now = new Date()
        let from = new Date()
        let to = new Date()

        switch (range) {
            case 'today':
                from = new Date(now.getFullYear(), now.getMonth(), now.getDate())
                to = new Date(now.getFullYear(), now.getMonth(), now.getDate())
                to.setHours(23, 59, 59, 999)
                break
            case 'yesterday':
                from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
                to = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
                to.setHours(23, 59, 59, 999)
                break
            case 'this_week':
                const dayOfWeek = now.getDay() || 7
                from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek + 1)
                to = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (7 - dayOfWeek))
                to.setHours(23, 59, 59, 999)
                break
            case 'last_week':
                const lastWeekDayOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).getDay() || 7
                from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7 - lastWeekDayOfWeek + 1)
                to = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7 + (7 - lastWeekDayOfWeek))
                to.setHours(23, 59, 59, 999)
                break


            case 'this_month':
                from = new Date(now.getFullYear(), now.getMonth(), 1)
                to = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                to.setHours(23, 59, 59, 999)
                break

            case 'last_month':
                from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
                to = new Date(now.getFullYear(), now.getMonth(), 0)
                to.setHours(23, 59, 59, 999)
                break

            case 'this_year':
                from = new Date(now.getFullYear(), 0, 1)
                to = new Date(now.getFullYear(), 11, 31)
                to.setHours(23, 59, 59, 999)
                break

            case 'last_year':
                from = new Date(now.getFullYear() - 1, 0, 1)
                to = new Date(now.getFullYear() - 1, 11, 31)
                to.setHours(23, 59, 59, 999)
                break
        }

        return { from, to }
    }



    const fetchDashboardData = useCallback(async () => {
        if (!company?.id) return

        setLoading(true)

        try {
            const { from, to } = getRangeDates(range)

            const { data, error } = await supabase.rpc('get_dashboard_full', {
                p_company_id: company.id,
                p_from: from.toISOString(),
                p_to: to.toISOString()
            })

            if (error) throw error
            console.log('Dashboard RPC data:', data)
            // ✅ CORE METRICS
            setSalesTotal(data.salesTotal || 0)
            setExpenseTotal(data.expenseTotal || 0)
            console.log("data", data)
            // ✅ STATS
            setStats(prev => ({
                ...prev,
                tasks: data.tasks || { completed: 0, pending: 0 },
                employees: data.employees || { active: 0, inactive: 0, admin: 0, users: 0 },
               
                hr: data.hr
            }))


        } catch (err) {
            console.error('Dashboard RPC error:', err)
        } finally {
            setLoading(false)
        }

    }, [range, company?.id])

    useEffect(() => {
        fetchDashboardData()
    }, [fetchDashboardData])

    if (loading) return <div className="p-8 text-center"><Loading /></div>

    return (
        <div className="py-2 my-10 md:p-2 bg-gray-50 max-h-[95vh] overflow-auto space-y-6 text-gray-800 ">
            {/* TOP ROW */}
            <div className="flex justify-content-end">
                <OfficeLocationPage />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                    onClick={(value: Range) => setRange(value)}
                    option
                    show
                    range={range}
                    title="Expenses" subtitle={`Expense For ${range}`} value={`${currency} ${expenseTotal.toLocaleString()}`}>
                    
                </MetricCard>

                <MetricCard
                    onClick={(value: Range) => setRange(value)}
                    title="Number of Employees">
                    <div className="flex flex-col  items-center ">
                        <div className="flex gap-2">
                            <div className="flex flex-col  gap-1 items-center">
                                <p className="text-xs text-gray-500 font-medium">Active Employee</p>
                                <p className="text-xl font-bold text-blue-600">{stats.employees.active}</p>

                            </div>
                            <div className="flex flex-col  gap-1 items-center">
                                <p className="text-xs text-gray-500 font-medium">Inactive Employee</p>
                                <p className="text-xl font-bold text-green-600">{stats.employees.inactive}</p>

                            </div>
                        </div>

                        {/* Status Circle */}
                        <div className="flex gap-4 items-center mt-4">

                            <StatusCircle percentage={stats.employees.active > 0 ? (stats.employees.active / (stats.employees.active + stats.employees.inactive)) * 100 : 0} color="text-blue-600" />
                            <div className="flex flex-col items-center justify-center text-[10px]">
                                <span className="text-gray-700">Admin: {stats.employees.admin}</span>
                                <span className="text-gray-700">Employee's: {stats.employees.users}</span>
                            </div>

                        </div>


                    </div>
                </MetricCard>

                <MetricCard
                    onClick={(value: Range) => setRange(value)}
                    option
                    range={range}
                    title="Tasks">
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                            <p className="text-xs text-gray-400 uppercase font-bold">Completed</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.tasks.completed}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase font-bold">Pending</p>
                            <p className="text-2xl font-bold text-green-600">{stats.tasks.pending}</p>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-center">
                        <StatusCircle percentage={stats.tasks.completed > 0 ? (stats.tasks.completed / (stats.tasks.completed + stats.tasks.pending)) * 100 : 0} color="text-blue-600" />
                    </div>
                </MetricCard>
            </div>

          
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                    <h3 className="font-bold text-lg text-gray-700">HR Suite Stats</h3>
                    <div className="md:space-y-5">
                        <StatLine label="Attendance Today " value={`${stats.hr.attendance} present`} subValue={`${stats.hr.absent} absent`} />
                        <StatLine label="Upcoming Birthdays" value={`${stats.hr.birthdays} this week`} />
                        <StatLine label="Recent Hires" value={`${stats.hr.hires} this month`} />
                        <StatLine label="Leave Requests" value={`${stats.hr.leave} pending`} />
                        <StatLine label="Performance Reviews" value={`${stats.hr.reviews} pending`} />
                    </div>
                </div>

                
            </div>
        </div>
    )
}

/* --- REUSABLE COMPONENTs --- */

function MetricCard({ title, subtitle, value, children, onClick, range, option, show }: any) {
    const [showValue, setShowValue] = useState<boolean>(true)
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between md:items-start">
                <div>
                    <h3 className="font-bold text-gray-600">{title}</h3>
                    {subtitle && <p className="text-[9px] text-blue-500 font-extrabold tracking-widest mt-1 uppercase">{subtitle}</p>}
                </div>
                {
                    option &&
                    <select
                        onChange={(e) => onClick && onClick(e.target.value)}
                        className="text-xs font-bold text-gray-400 bg-gray-100 rounded-lg p-1 outline-none">

                        <option value="today">{range || 'Today'}</option>
                        <option value="yesterday">Yesterday</option>
                        <option value="this_week">This Week</option>
                        <option value="last_week">Last Week</option>
                        <option value="this_month">This Month</option>
                        <option value="last_month">Last Month</option>
                        <option value="this_year">This Year</option>
                        <option value="last_year">Last Year</option>
                    </select>
                }

            </div>
            {
                show ? (
                    <div className="flex items-center justify-between">

                        {showValue ? (
                            <p className="text-md font-black mt-3 text-gray-800">{value}</p>
                        ) : (
                            <p className="text-md font-black mt-3 text-gray-800">...</p>
                        )}
                        <span>
                            {showValue ? (
                                <FaEye onClick={() => setShowValue(false)} className="text-gray-400 cursor-pointer" size={14} />
                            ) : (
                                <FaEyeSlash onClick={() => setShowValue(true)} className="text-gray-400 cursor-pointer" size={14} />
                            )}
                        </span>
                    </div>
                ) : (
                    <p className="text-3xl font-black mt-3 text-gray-800">{value}</p>

                )
            }


            {children}
        </div>
    )
}

function StatLine({ label, value, subValue, col }: any) {
    return (
        <div className={`${col ? 'flex-col gap-2 md:flex-row' : ""} flex justify-between md:items-end border-b border-green-200 pb-2`}>
            <span className="text-sm text-gray-400 font-medium">{label}:</span>
            <div className="md:text-right">
                <span className="text-sm font-bold text-gray-700">{value}</span>
                {subValue && <p className="text-[10px] text-red-400 font-bold mt-0.5">{subValue}</p>}
            </div>
        </div>
    )
}



function StatusCircle({ percentage, color }: any) {
    return (
        <div className="w-20 h-20">
            <svg className="w-full h-full" viewBox="0 0 36 36">
                <path className="text-green-600" strokeDasharray="100, 100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className={color} strokeDasharray={`${percentage}, 100`} strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155   15.9155 0 0 1 0 -31.831" />
            </svg>

        </div>
    )
}   