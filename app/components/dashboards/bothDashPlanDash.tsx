'use client'

import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/app/utils/supabase/client"
import { useCompany } from "@/app/context/CompanyContext"
import { Loading } from "../Loading"
import RevenueSummary from "../DashChart"
import RevenueSummaryChart from "../RevenueSummary"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import { formatNumber } from "@/app/utils/numberFormatter"

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
        inventory: { total: 0, outOfStock: 0, categories: 0, lowStock: 3, value: 0 },
        hr: { attendance: 0, birthdays: 0, hires: 0, leave: 0, reviews: 0 }
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

    // const fetchDashboardData = useCallback(async () => {

    //     setLoading(true)

    //     const { from, to } = getRangeDates(range)



    //     /* SALES */

    //     const { data: sales } = await supabase
    //         .from('sales')
    //         .select('total_amount, created_at, sale_items (quantity, selling_price, cost_price, discount, subtotal, status)')
    //         .eq('company_id', company?.id)
    //         .gte('created_at', from.toISOString())
    //         .lte('created_at', to.toISOString())

    //     let salesTotal = 0
    //     let profitTotal = 0

    //     sales?.forEach((sale) => {
    //         const activeItems = sale.sale_items.filter(
    //             item => item.status !== 'Cancelled'
    //         )

    //         activeItems.forEach(item => {
    //             salesTotal += item.subtotal
    //             profitTotal +=
    //                 (item.selling_price - item.cost_price) *
    //                 item.quantity -
    //                 item.discount
    //         })
    //     })



    //     setSalesTotal(salesTotal)
    //     setProfitTotal(profitTotal)

    //     /* EXPENSES */

    //     const { data: expenses } = await supabase
    //         .from('expenses')
    //         .select('amount, created_at')
    //         .eq('company_id', company?.id)
    //         .gte('created_at', from.toISOString())
    //         .lte('created_at', to.toISOString())

    //     const totalExpenses =
    //         expenses?.reduce((sum, e) => sum + Number(e.amount || 0), 0) || 0

    //     setExpenseTotal(totalExpenses)

    //     /* PROFIT */

    //     setNetProfit(profitTotal - totalExpenses)

    //     /* INVENTORY */

    //     const { data: productsData } = await supabase
    //         .from('products')
    //         .select(`
    //         id,
    //         category,
    //         product_stock (
    //           quantity,
    //           status
    //         ),
    //         product_prices (
    //           selling_price
    //         )
    //       `)
    //         .eq('company_id', company?.id)

    //     if (productsData) {

    //         setProducts(productsData)

    //         const uniqueCategories = new Set(
    //             productsData.map((p) => p.category)
    //         )

    //         setCategories(uniqueCategories.size)
    //     }
    //     // employee//
    //     const { data: profiles } = await supabase.from('profiles').select('status, role').eq('company_id', company?.id)
    //     const activeEmps = profiles?.filter(e => e.status === 'active').length || 0
    //     const inactiveEmps = profiles?.filter(e => e.status === 'inactive').length || 0
    //     const admins = profiles?.filter(e => e.role === 'admin').length || 0
    //     const employees = profiles?.filter(e => e.role === 'employee').length || 0
    //     setStats((prev) => ({
    //         ...prev,
    //         employees: { active: activeEmps, inactive: inactiveEmps, admin: admins, users: employees }
    //     }))
    //     const { data: tasks } = await supabase.from('tasks').select('status').eq('company_id', company?.id)
    //     .eq('created_at', from.toISOString()).lte('created_at', to.toISOString())

    //     const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0
    //     const pendingTasks = tasks?.filter(t => t.status === 'pending').length || 0
    //     setStats((prev) => ({
    //         ...prev,
    //         tasks: { completed: completedTasks, pending: pendingTasks }
    //     }))
    //     console.log("Fetched Tasks:", tasks)
    //     /* REVENUE CHART */
    //     const months = [
    //         'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    //         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    //     ]

    //     const monthly = months.map((m) => ({
    //         month: m,
    //         sales: 0,
    //         expenses: 0
    //     }))

    //     sales?.forEach((s) => {
    //         const month = new Date(s.created_at).getMonth()
    //         monthly[month].sales += Number(s.total_amount || 0)
    //     })

    //     expenses?.forEach((e) => {
    //         const month = new Date(e.created_at).getMonth()
    //         monthly[month].expenses += Number(e.amount || 0)
    //     })

    //     setChartData(monthly)

    //     setLoading(false)

    // }, [supabase, range])

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
            console.log('Dashboard RPC data:', data.inventory)
            // ✅ CORE METRICS
            setSalesTotal(data.salesTotal || 0)
            setProfitTotal(data.profitTotal || 0)
            setExpenseTotal(data.expenseTotal || 0)
            setNetProfit(data.profitTotal - data.expenseTotal || 0)

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
                }
            }))

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
            {/* TOP ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                    onClick={(value: Range) => setRange(value)}
                    option
                    show
                    range={range}
                    title="Profit & Loss" subtitle={`NET FOR ${range}`} value={`${currency} ${formatNumber(netProfit)}`}>
                    <div className="mt-4 space-y-2">

                        <ProgressBar
                            label="Sales" value={`${salesTotal}`} total={total} color="bg-blue-600" currency={currency} />
                        <ProgressBar label="Expense" value={`${expenseTotal}`} total={total} color="bg-green-400" currency={currency} />
                    </div>
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
                                <p className="text-xl font-bold text-gray-500">{stats.employees.inactive}</p>

                            </div>
                        </div>

                        {/* Status Circle */}
                        <div className="flex gap-4 items-center mt-4">

                            <StatusCircle percentage={stats.employees.active > 0 ? (stats.employees.active / (stats.employees.active + stats.employees.inactive)) * 100 : 0} color="text-blue-600" />
                            <div className="flex flex-col items-center justify-center text-[10px]">
                                <span className="text-gray-400">Admin: {stats.employees.admin}</span>
                                <span className="text-gray-400">Employee's: {stats.employees.users}</span>
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
                            <p className="text-2xl font-bold text-gray-300">{stats.tasks.pending}</p>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-center">
                        <StatusCircle percentage={stats.tasks.completed > 0 ? (stats.tasks.completed / (stats.tasks.completed + stats.tasks.pending)) * 100 : 0} color="text-blue-600" />

                    </div>
                </MetricCard>
            </div>

            {/* INVENTORY ROW */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex justify-between mb-6">
                    <h3 className="font-bold text-lg text-gray-700">Inventory Stats</h3>
                    <select className="text-xs font-bold text-gray-400 bg-transparent border-none outline-none"><option>This Month</option></select>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-12">
                    <StatLine label="Total Products" value={`${stats.inventory.total} items`} />
                    <StatLine label="Out of Stock" value={`${stats.inventory.outOfStock} items`} />
                    <StatLine label="Categories" value={stats.inventory.categories} />
                    <StatLine label="Low Stock Items" value={`${stats.inventory.lowStock} items`} />
                    <StatLine label="Stock Value" value={`${currency} ${stats.inventory.value.toLocaleString()}`} />
                    <StatLine label="Recently Updated" value="Dynamic Soon" />
                </div>
            </div>

            {/* HR AND CHART ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                    <h3 className="font-bold text-lg text-gray-700">HR Suite Stats</h3>
                    <div className="space-y-5">
                        <StatLine label="Attendance Today" value={`${stats.hr.attendance} present`} subValue="2 absent" />
                        <StatLine label="Upcoming Birthdays" value={`${stats.hr.birthdays} this week`} />
                        <StatLine label="Recent Hires" value={`${stats.hr.hires} this month`} />
                        <StatLine label="Leave Requests" value={`${stats.hr.leave} pending`} />
                        <StatLine label="Performance Reviews" value={`${stats.hr.reviews} pending`} />
                    </div>
                </div>

                <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between mb-8">
                        <h3 className="font-bold text-lg text-gray-700">Revenue Summary</h3>
                        <select className="text-xs font-bold text-gray-400 bg-transparent outline-none"><option>This Year</option></select>
                    </div>
                    {/* Visual Chart Placeholder */}
                    <div className="h-64 w-full bg-gray-50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200">
                        <RevenueSummaryChart data={chartData} />
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
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-gray-600">{title}</h3>
                    {subtitle && <p className="text-[9px] text-blue-500 font-extrabold tracking-widest mt-1 uppercase">{subtitle}</p>}
                </div>
                {
                    option &&
                    <select
                        onChange={(e) => onClick && onClick(e.target.value)}
                        className="text-[10px] font-bold text-gray-400 bg-transparent outline-none">

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
                            <p className="text-3xl font-black mt-3 text-gray-800">{value}</p>
                        ) : (
                            <p className="text-3xl font-black mt-3 text-gray-800">...</p>
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

function StatLine({ label, value, subValue }: any) {
    return (
        <div className="flex justify-between items-end border-b border-gray-50 pb-2">
            <span className="text-sm text-gray-400 font-medium">{label}:</span>
            <div className="text-right">
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
                <path className="text-gray-200" strokeDasharray="100, 100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className={color} strokeDasharray={`${percentage}, 100`} strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155   15.9155 0 0 1 0 -31.831" />
            </svg>

        </div>
    )
}   