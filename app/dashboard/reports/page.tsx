'use client'

import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/app/utils/supabase/client"
import { useCompany } from "@/app/context/CompanyContext"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import { formatNumber } from "@/app/utils/numberFormatter"
import { Loading } from "@/app/components/Loading"

type Range =
    | 'today'
    | 'yesterday'
    | 'this_week'
    | 'last_week'
    | 'this_month'
    | 'last_month'
    | 'this_year'
    | 'last_year'

export default function Dashboard() {
    const supabase = createClient()
    const { company, currency } = useCompany()
    const [salesTotal, setSalesTotal] = useState(0)
    const [expenseTotal, setExpenseTotal] = useState(0)
    const [netProfit, setNetProfit] = useState(0)
    const [profitTotal, setProfitTotal] = useState(0)
    const [products, setProducts] = useState<any[]>([])
    const [categories, setCategories] = useState(0)
    const [chartData, setChartData] = useState<any[]>([])
    const [range, setRange] = useState<Range>('this_month')
    const [show, setShow] = useState(true)
    const [stats, setStats] = useState({
        profit: 0,
        salesTotal: 0,
        expenseTotal: 0,
        employees: { active: 0, inactive: 0, admin: 0, users: 0 },
        tasks: { completed: 0, pending: 0 },
        inventory: { total: 0, outOfStock: 0, categories: 0, lowStock: 0, value: 0 },
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
            setProfitTotal(data.profitTotal || 0)
            setExpenseTotal(data.expenseTotal || 0)
            setNetProfit(data.profitTotal)
            console.log("data", data)
            // ✅ STATS
            setStats(prev => ({
                ...prev,
                tasks: data.tasks || { completed: 0, pending: 0 },
                employees: data.employees || { active: 0, inactive: 0, admin: 0, users: 0 },
                inventory: data.inventory || {
                    total: 0,
                    outOfStock: 0,
                    categories: 0,
                    lowStock: 0,
                    value: 0
                },
                hr: data.hr
            }))
            console.log('hr', stats.hr)

            // ✅ CHART
            setChartData(data.monthly || [])

        } catch (err) {
            console.error('Dashboard RPC error:', err)
        } finally {
            setLoading(false)
        }

    }, [range, company?.id])

    const total = salesTotal + expenseTotal || 1
    useEffect(() => {
        fetchDashboardData()
    }, [fetchDashboardData])

    if (loading) return <div className="p-8 text-center"><Loading /></div>

    return (
        <div className="py-2  md:p-2 bg-gray-50 max-h-[95vh] overflow-auto space-y-6 text-gray-800 ">
            <div className="flex justify-end my-3">
                <div className="flex gap-2 items-center">
                    <select
                        className="w-full p-2 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        name="reportType"
                        id="reportSelect"
                        aria-label="Select report period"
                    >
                        <option value="monthly">Monthly Performance Overview</option>
                    </select>
                    <button
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="button"
                    >
                        Export
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1.8fr_1.2fr] gap-2 w-full">
                <MetricCard
                    onClick={(value: Range) => setRange(value)}
                    option
                    show
                    range={range}
                    title="Profit & Loss" subtitle={`NET FOR ${range}`} value={`${currency} ${(netProfit.toLocaleString())}`}>
                    <div className="mt-4 space-y-6">

                        <ProgressBar
                            label="Sales" value={`${salesTotal}`} total={total} color="bg-blue-600" currency={currency} />
                        <ProgressBar label="Expense" value={`${expenseTotal}`} total={total} color="bg-green-400" currency={currency} />
                    </div>
                </MetricCard>

                <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col gap-4 flex-1">
                    <h2 className="text-lg font-semibold text-gray-800">Sales & Expenses</h2>

                    <div className="flex justify-between gap-2">
                        {/* Sales Section */}
                        <div className="flex flex-col gap-1 flex-1">
                            <h3 className="text-sm font-medium text-gray-500">Sales</h3>
                            <p className="text-2xl font-bold text-gray-900">2000</p>
                            <p className="text-sm text-green-600 flex items-center gap-1">
                                <span>↑</span> 10% up vs last period
                            </p>
                        </div>

                        {/* Expenses Section */}
                        <div className="flex flex-col gap-1 flex-1">
                            <h3 className="text-sm font-medium text-gray-500">Expenses</h3>
                            <p className="text-2xl font-bold text-gray-900">1000</p>
                            <p className="text-sm text-red-600 flex items-center gap-1">
                                <span>↓</span> 1% down vs last period
                            </p>
                        </div>
                    </div>
                </div>


                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm ">
                    <div className="flex justify-between mb-6">
                        <h3 className="font-bold text-lg text-gray-700">Inventory</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-1 gap-y-2 gap-x-12">
                        <StatLine
                            col
                            label="Total Items" value={`${stats.inventory.total} items`} />
                        <StatLine col label="Out of Stock" value={`${stats.inventory.outOfStock} items`} />
                        <StatLine col label="Low Stock Items" value={`${stats.inventory.lowStock} items`} />
                    </div>
                </div>

            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full">


                <SummaryCard
                    title='Employees'
                    label1="Active Employee" value1="0"
                    label2="In Active Employee" value2="0"
                    label3="Recent Hires " value3="0"
                    label4="Propogation Employee" value4="0"
                    label5="Contract Expiring soon" value5="0"
                    label6="OnLeave" value6="0"
                    label7="Top Performance" value7="0"


                />
                <SummaryCard
                    title='HR ANALYTICS'
                    label1="Attendance Rate" value1="90%"
                    label2="Employee TurnOver" value2="10%"
                    label3="AVG Performance Score " value3="95%"
                    label4="On Time Arrival Rate " value4="90%"
                    label5="Late Submission Rate " value5="40%"
                    label6="Leave Approval Rate" value6="6%"
                    label7="Employee Satisfication Score " value7="90%"


                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 my-10">
                <SummaryCard
                    title='HR ANALYTICS'
                    label1="Attendance Rate" value1="90%"
                    label2="Employee TurnOver" value2="10%"
                    label3="AVG Performance Score " value3="95%"
                    label4="On Time Arrival Rate " value4="90%"


                /><SummaryCard
                    title='HR ANALYTICS'
                    label1="Attendance Rate" value1="90%"
                    label2="Employee TurnOver" value2="10%"
                    label3="AVG Performance Score " value3="95%"



                /><SummaryCard
                    title='HR ANALYTICS'
                    label1="Attendance Rate" value1="90%"
                    label2="Employee TurnOver" value2="10%"
                    label3="AVG Performance Score " value3="95%"



                />
            </div>

            {/* chart here */}

            <div className="space-y-10">
                <SummaryCard
                    title='Employee Growth'
                    label1="Salary Increase due" value1="3"
                    label2="Promotion Eligibility" value2="1"
                    label3="Contract Renewal " value3="9"
                    label4="Probation Ending Soon " value4="9"
                    label5="Performance Review Scheduled " value5="4"
                    label6="Recognition / Awards Due" value6="1"
                    label7="Training / Development Needed " value7="9"


                /><SummaryCard
                    title='Disciplinary Overview'
                    label1="First Warning" value1="9"
                    label2="Second Warning" value2="1"
                    label3="Final Warning " value3="9"
                    label4="At Risk of Termination " value4="9"
                    label5="Active Disciplinary Cases " value5="4"
                    label6="Pending Disciplinary Review" value6="6%"
                    label7="Unresolved Disciplinary Issues " value7="9"


                />
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
        <div className={`${col ? 'flex-col gap-2 md:flex-row' : ""} flex justify-between md:items-end border-b border-gray-50 pb-2`}>
            <span className="text-sm text-gray-400 font-medium">{label}:</span>
            <div className="md:text-right">
                <span className="text-sm font-bold text-gray-700">{value}</span>
                {subValue && <p className="text-[10px] text-red-400 font-bold mt-0.5">{subValue}</p>}
            </div>
        </div>
    )
}

function ProgressBar({ label, value, total, color, currency, show }: { label: string, value: any, total: number, color: string, currency?: any, show?: boolean }) {
    const [showValue, setShowValue] = useState<boolean>(true)
    const width = total > 0 ? (value / total) * 100 : 0
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-black text-gray-500">
                <span>{label.toUpperCase()}</span>
                {
                    showValue ? (
                        <span>
                            {currency ? `${currency} ${formatNumber(value)}` : `${formatNumber(value)}`}
                        </span>
                    ) : (
                        <span>...</span>
                    )
                }
                {
                    showValue ? (
                        <FaEye onClick={() => setShowValue(false)} className="text-gray-400 cursor-pointer" size={12} />
                    ) : (
                        <FaEyeSlash onClick={() => setShowValue(true)} className="text-gray-400 cursor-pointer" size={12} />
                    )
                }
            </div>
            <div className="w-full bg-gray-100 h-3.5 rounded-full overflow-hidden shadow-inner">
                <div className={`${color} h-full transition-all duration-500`} style={{ width: `${width}%` }}></div>
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


function SummaryCard({ label1, label2, label3, label4, label5, label6, label7, value1, value2, value3, value4, value7, value5, value6, title, onclick1, onclick2, onclick3, onclick4 }: any) {
    return (
        <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
            <p className="text-lg font-medium text-gray-900 pb-2 border-b mb-3">{title}</p>
            {[
                { l: label1, v: value1, onclick: onclick1 },
                { l: label2, v: value2, onclick: onclick2 },
                { l: label3, v: value3, onclick: onclick3 },
                { l: label4, v: value4, onclick: onclick4 },
                { l: label5, v: value5, onclick: onclick4 },
                { l: label6, v: value6, onclick: onclick4 },
                { l: label7, v: value7, onclick: onclick4 }
            ].map((item, i) => item.l && (

                <div key={i} className='flex items-center justify-between p-2 shadow-sm cursor-pointer rounded-md hover:bg-gray-50' onClick={item.onclick}>
                    <p className="text-sm text-gray-600">{item.l}</p>
                    <p className="text-sm font-semibold">{item.v}</p>
                </div>
            ))}
        </div>
    )
}