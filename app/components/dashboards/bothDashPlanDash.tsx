'use client'

import { useEffect, useState } from "react"
import { createClient } from "@/app/utils/supabase/client"
import { useCompany } from "@/app/context/CompanyContext"

export default function Dashboard() {
    const supabase = createClient()
    const { company, currency } = useCompany()
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

    useEffect(() => {
        fetchDashboardData()
    }, [])

    async function fetchDashboardData() {
        setLoading(true)
        try {
            // 1. Fetch Sales and Expenses for Profit & Loss
            const { data: sales } = await supabase.from('sale_items').select('subtotal')
            const { data: expenses } = await supabase.from('expenses').select('amount')

            const totalSales = sales?.reduce((acc, curr) => acc + (curr.subtotal || 0), 0) || 0
            const totalExpenses = expenses?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0

            // 2. Fetch Employee counts by status
            const { data: employees } = await supabase.from('profiles').select('status, role').eq('company_id', company?.id)
            const activeEmps = employees?.filter(e => e.status === 'active').length || 0
            const inactiveEmps = employees?.filter(e => e.status === 'inactive').length || 0
            const admins = employees?.filter(e => e.role === 'admin').length || 0
            const users = employees?.filter(e => e.role === 'employee').length || 0
            console.log("Employee Data:", employees)
            // 3. Fetch Task counts by status
            const { data: tasks } = await supabase.from('tasks').select('status')
            const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0
            const pendingTasks = tasks?.filter(t => t.status === 'pending').length || 0
            // 4. Fetch Inventory Stats
            const { data: inventory } = await supabase.from('products').select('*, product_stock(quantity), product_prices(cost_price)').eq('company_id', company?.id)
            const totalProducts = inventory?.length || 0
            const outOfStock = inventory?.filter(i => i.product_stock[0].quantity <= 0).length || 0
            const uniqueCategories = new Set(inventory?.map(i => i.category)).size
            const stockValue = inventory?.reduce((acc, curr) => acc + (curr.product_stock[0].quantity * curr.product_prices[0].cost_price), 0) || 0
            console.log("Inventory Data:", inventory)
            setStats({
                profit: totalSales - totalExpenses,
                salesTotal: totalSales,
                expenseTotal: totalExpenses,
                employees: { active: activeEmps, inactive: 4, admin: admins, users: users },
                tasks: { completed: 3, pending: pendingTasks },
                inventory: {
                    total: totalProducts,
                    outOfStock: outOfStock,
                    categories: uniqueCategories,
                    lowStock: inventory?.filter(i => i.product_stock[0].quantity > 0 && i.product_stock[0].quantity < 5).length || 0,
                    value: stockValue
                },
                hr: { ...stats.hr } // Placeholder for HR specific logic
            })
        } catch (error) {
            console.error("Error fetching dashboard data:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="p-8 text-center">Updating Dashboard...</div>

    return (
        <div className="py-2  md:p-2 bg-gray-50 min-h-screen space-y-6 text-gray-800">
            {/* TOP ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard title="Profit & Loss" subtitle={`NET FOR ${new Date().toLocaleString('default', { month: 'long' })}`} value={`${currency} ${stats.profit.toLocaleString()}`}>
                    <div className="mt-4 space-y-2">
                        <ProgressBar label="Sales" value={stats.salesTotal} total={stats.salesTotal + stats.expenseTotal} color="bg-blue-600" />
                        <ProgressBar label="Expense" value={stats.expenseTotal} total={stats.salesTotal + stats.expenseTotal} color="bg-green-400" />
                    </div>
                </MetricCard>

                <MetricCard title="Number of Employees">
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
                        <div className="flex gap-4 ">

                            <StatusCircle percentage={stats.employees.active > 0 ? (stats.employees.active / (stats.employees.active + stats.employees.inactive)) * 100 : 0} color="text-blue-600" />
                            <div className="flex flex-col items-center justify-center text-[10px]">
                                <span className="text-gray-400">Admin: {stats.employees.admin}</span>
                                <span className="text-gray-400">Employee's: {stats.employees.users}</span>
                            </div>

                        </div>


                    </div>
                </MetricCard>

                <MetricCard title="Tasks">
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
                        <p className="text-gray-400 font-medium">Chart visualization will be added here</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

/* --- REUSABLE COMPONENTS (Updated for dynamic usage) --- */

function MetricCard({ title, subtitle, value, children }: any) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-gray-600">{title}</h3>
                    {subtitle && <p className="text-[9px] text-blue-500 font-extrabold tracking-widest mt-1 uppercase">{subtitle}</p>}
                </div>
                <select className="text-[10px] font-bold text-gray-400 bg-transparent outline-none"><option>This Month</option></select>
            </div>
            {value && <p className="text-3xl font-black mt-3 text-gray-800">{value}</p>}
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

function ProgressBar({ label, value, total, color }: any) {
    const width = total > 0 ? (value / total) * 100 : 0
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-black text-gray-500">
                <span>{label.toUpperCase()}</span>
                <span>N{value.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden shadow-inner">
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